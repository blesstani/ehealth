/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This controller deals with aspects of paying for, and conducting lab tests
 */

import muser_common from "muser_common";
import shortUUID from "short-uuid";
import InventoryController from "../inventory/controller.mjs";
import collections from "./collections.mjs";
import WorkerWorld from "../../../../system/util/worker-world/main.mjs";
import TransactionNotificationController from "./notification.mjs";


const controllers = Symbol()
const taskProcessor = Symbol()
const hidden = Symbol()


export default class TransactionController {


    /**
     * 
     * @param {object} _controllers 
     * @param {InventoryController} _controllers.inventory
     */
    constructor(_controllers) {
        this[controllers] = _controllers;

        this[taskProcessor] = new WorkerWorld(
            {
                width: 3,
                stages: [
                    {
                        name: 'pending',
                        collection: collections.pending,
                        label: `Pending Transactions`
                    },
                    {
                        name: 'ready',
                        label: `Paid Transactions`,
                        collection: collections.ready
                    },
                    {
                        name: 'archive',
                        label: `Archives`,
                        collection: collections.archive
                    }
                ],
                execute: async (task) => {
                    // We only want to do three (3) things here
                    // Move old unpaid transactions to the archives (>7 days)
                    // Send notifications to the service provider when a payment is complete
                    // Move long-finalized transactions to the archives (>8 hours finality)

                    const finalizeDelay = 8 * 60 * 60 * 1000;

                    const _7daysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

                    if (!task.paid && task.created < _7daysAgo) {
                        return {
                            newStage: 'archive',
                        }
                    }

                    // And by the way, pending tasks should not over-use our CPU
                    if (task["@worker-world-task"].stage == 'pending' && !task.paid) {
                        const payment = await (await FacultyPlatform.get().connectionManager.overload.finance()).payment.getPayment({ id: task.payment })
                        if (payment?.done && payment?.settled_amount?.value) {
                            task.paid = payment.settled_time || Date.now()
                        }
                        await this[hidden].notification.processor.insertOne({
                            role: 'provider',
                            target: task.service_provider,
                            transaction: task.id,
                        });

                        return {
                            ignored: 30 * 1000 // 30s delay
                        }
                    }

                    if (task.paid && task["@worker-world-task"].stage != 'ready' && task.service_provider && !task.completed) {
                        // TODO: Work out details of the notification
                        console.log(`Moving to the "ready" section, from "${task['@worker-world-task'].stage} `, task.id)

                        return {
                            newStage: 'ready',
                            ignored: finalizeDelay, // We won't have much to do with this task in a long time, so let's just hibernate
                        }
                    }

                    // And now, if the patient has been served more than 8 hours ago, let's move this to the archives
                    if (task.completed) {


                        if (task.completed < (Date.now() - finalizeDelay)) {
                            return {
                                newStage: 'archive',
                            }
                        }
                        // And if was completed, but not up to 8 hours ago, then there's no point of taking a look at the task frequently
                        // Let's hibernate it till it's almost 8 hours
                        return {
                            ignored: Date.now() + (finalizeDelay * 0.75)
                        }

                    }
                }
            }
        )

        // Whenever someone makes a payment, let's check to see that it corresponds to transaction, and then mark as complete
        const init = async () => {
            const finance = await FacultyPlatform.get().connectionManager.overload.finance();

            const processPayment = async (paymentId) => {
                finance.payment.getPayment({ id: paymentId }).then(async payment => {
                    try {
                        if (payment?.done && payment?.settled_amount?.value) {
                            const paid = payment.settled_time || Date.now();
                            this[taskProcessor].updateOne({ payment: paymentId, $stages: ['pending'] }, { $set: { paid } });
                            const data = await this[taskProcessor].findOne({ payment: paymentId })
                            console.log(`Payment done, notifying the concerned stakeholders...`)

                            await this[hidden].notifyChange({
                                id: data.id,
                                paid,
                            }, [data.patient, data.doctor, data.service_provider])
                        }
                    } catch (e) {
                        console.error(e, `\nBecause data was `, payment, `\nfor payment `, paymentId)
                    }
                })
            }

            // First things first, check the transactions we have, to see the transactions that were completed, while the system was, "asleep"
            for await (const item of this[taskProcessor].find({ $stages: ['pending'], paid: { $exists: false } })) {
                processPayment(item.payment)
            }

            FacultyPlatform.get().connectionManager.events.addListener('finance.payment-complete', async (id) => {
                const transaction = await this[taskProcessor].findOne({ payment: id, $stages: ['pending'] })
                if (transaction) {
                    processPayment(transaction.payment)
                }
            });

            this[taskProcessor].start()
        }

        init()

        this.notificationsPub = this[hidden].notification.public
    }


    [hidden] = {

        notification: new TransactionNotificationController({
            transaction: this
        }),

        /**
         * This method creates a payment for the laboratory transaction
         * @param {ehealthi.health.commerce.transaction.TransactionRecord} data 
         */
        initPayment: async (data, userid) => {

            const inventoryItems = await Promise.all(data.commodities.map(item => this[controllers].inventory.getItem({ id: item, userid })));
            // Check if the commodity being requested even exists
            if (inventoryItems.length != data.commodities.length) {
                const plural = inventinitView.selectionoryItems.length > 0;
                throw new Exception(`${plural ? "Some of the" : "The"}  lab test${plural ? 's' : ''} you're prescribing ${plural ? 'don\'t' : "doesn't"} even exist. Please, check again.`)
            }

            if (data.commodities.length == 0) {
                throw new Exception(`Select at least one lab test, please.`)
            }

            const finance = () => FacultyPlatform.get().connectionManager.overload.finance()

            if (data.payment) {
                await (await finance()).payment.deleteRecord({ id: data.payment })
            }


            return await (async () => {
                return await (await finance()).payment.create({
                    amount: inventoryItems.map(x => x.price).reduce((acc, curr) => {
                        if (curr.currency.toLocaleLowerCase() != acc.currency.toLowerCase()) {
                            throw new Exception(`Cannot continue, because the items are not priced in the same currency. (${acc.currency}, is different from ${curr.currency})`)
                        }
                        return { value: acc.value + curr.value, currency: curr.currency }
                    }),
                    type: 'invoice',
                    owners: [data.patient],
                    meta: {
                        product: {
                            type: 'virtual',
                            name: `Lab tests - ${new Date().toDateString()}`,
                            category: 'foodAndDrugs',
                            description: inventoryItems.map(x => x.label).join(', '),
                        },
                    },
                })
            })()
        },
        /**
         * This method informs the stakeholders of a change in data
         * @param {ehealthi.health.commerce.transaction.TransactionRecord} data 
         * @param {string[]} users
         */
        notifyChange: async (data, users) => {
            (await FacultyPlatform.get().connectionManager.overload.modernuser()).notification.events.inform({
                userids: users,
                event: 'ehealthi-health-commerce-transaction-changed',
                detail: {
                    data
                },
                options: {
                    precallWait: 0,
                    aggregation: {
                        timeout: 0,
                        sameData: true
                    },
                }
            });
        }
    }

    /**
     * This method cancels a laboratory tests transactions
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async cancel({ id, userid }) {
        const data = await this.getTransaction({ id, userid })

        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.transaction.supervise'],
            whitelist: [data.doctor]
        });

        const finance = () => FacultyPlatform.get().connectionManager.overload.finance()
        const paymentData = await ((await finance()).payment.getPayment({ id: data.payment }));
        // Now, check if this transaction is too old to be canceled
        if (data.paid || paymentData.done) {
            throw new Exception(`Sorry, you cannot cancel these tests anymore, because the patient has already paid for them.`)
        }

        await (await finance()).payment.userDismiss({ id: paymentData.id })

        await this[taskProcessor].updateOne({ id }, {
            $set: {
                canceled: Date.now()
            }
        });

        (await FacultyPlatform.get().connectionManager.overload.modernuser()).notification.events.inform({
            userids: [data.patient, data.doctor, data.service_provider].filter(x => x != userid),
            event: 'ehealthi-health-commerce-transaction-changed',
            detail: {
                data: {
                    canceled: Date.now(),
                    id
                }
            },
            options: {
                precallWait: 0,
                aggregation: {
                    timeout: 0
                },
            }
        });

    }


    /**
     * This method creates a transaction
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {ehealthi.health.commerce.transaction.Transaction} param0.data
     */
    async create({ userid, data }) {
        // Oh! Does the user have this right?
        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.transaction.create'],
        })
        const id = shortUUID.generate();

        soulUtils.checkArgs(data, {
            patient: 'string',
        });


        await this[taskProcessor].insertOne({
            id,
            commodities: data.commodities,
            patient: data.patient,
            doctor: userid,
            service_provider: data.service_provider,
            created: Date.now(),
            payment: await this[hidden].initPayment(data, userid)
        })

        return id

    }


    /**
     * This method modifies a transaction
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     * @param {Pick<ehealthi.health.commerce.transaction.TransactionRecord, 'commodities'|'service_provider'|'patientCanView'>} param0.data
     */
    async update({ userid, id, data }) {

        function notFound() {
            throw new Exception(`The transaction you're trying to edit, doesn't even exist`)
        }
        if (!id) {
            notFound()
        }
        const transaction = await this.getTransaction({ userid, id })

        if (!transaction) notFound();

        // Check if the user has not already paid for the previous ones.

        const paymentData = await (await FacultyPlatform.get().connectionManager.overload.finance()).payment.getPayment({ id: transaction.payment })


        // If the user tries to modify the commodities info, when payment has already been made, and there's a designated service provider
        if ((paymentData?.done || (paymentData?.executed && !paymentData?.failed)) && (transaction.service_provider && (data.commodities || data.service_provider))) {
            throw new Exception(`You can't edit this again, because payment has already been made.`)
        }

        if (data.commodities) {
            transaction.payment = await this[hidden].initPayment({ ...transaction, commodities: data.commodities }, transaction.patient);

        }

        data.commodities ||= undefined;
        data.service_provider ||= undefined;

        (await FacultyPlatform.get().connectionManager.overload.modernuser()).notification.events.inform({
            userids: [transaction.patient, transaction.doctor, transaction.service_provider].filter(x => x != userid),
            event: 'ehealthi-health-commerce-transaction-changed',
            detail: {
                data: {
                    commodities: data.commodities,
                    service_provider: data.service_provider,
                    payment: data.commodities ? transaction.payment : undefined,
                    patientCanView: data.patientCanView,
                    id
                }
            },
            options: {
                precallWait: 0,
                aggregation: {
                    timeout: 0
                },
            }
        });

        await this[taskProcessor].updateOne({ id: transaction.id }, {
            $set: {
                commodities: data.commodities || transaction.commodities,
                service_provider: data.service_provider || transaction.service_provider,
                payment: transaction.payment,
                patientCanView: data.patientCanView ?? transaction.patientCanView
            }
        });
    }

    /**
     * This method is used to set the results of a transaction.
     * 
     * It is only callable by:
     * 1. Service Provider
     * 2. Admin
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     * @param {ehealthi.health.commerce.transaction.TransactionResult[]} param0.results
     */
    async setResults({ userid, id, results }) {

        if (!Array.isArray(results)) {
            throw new Exception(`'results', is supposed to be an array containing results of the lab test.`)
        }

        results.forEach((item, index) => {
            soulUtils.checkArgs(item, {
                title: 'string',
                type: "'audio'|'video'|'text'|'image'",
            }, `results[${index}]`)
        })


        const data = await this[taskProcessor].findOne({ id })

        if (!data) {
            throw new Exception(`The transaction (lab test), you're trying to set results for, doesn't even exist.`)
        }

        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.transaction.supervise'],
            whitelist: [data.service_provider]
        });


        await this[taskProcessor].updateOne({ id }, {
            $set: {
                results: results,
                id
            }
        });

        // Inform the doctor, and the patient 

        this[hidden].notifyChange({
            id,
            results
        }, [data.doctor, data.patient])


    }

    /**
     * This method marks a transaction as complete
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     */
    async markComplete({ userid, id }) {
        const info = await this[taskProcessor].findOne({ id })
        if (!info) {
            throw new Exception(`The lab test you're marking as complete doesn't exist.`)
        }

        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.transaction.supervise'],
            whitelist: [info.service_provider]
        });

        if (!info.completed) {
            await this[hidden].notifyChange({
                id,
                completed: Date.now()
            }, [info.doctor, info.patient])
            await this[taskProcessor].updateOne({ id }, { $set: { completed: Date.now() } })
        }
    }

    /**
     * This method gets a single transaction, specified by its id.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     * @returns {Promise<ehealthi.health.commerce.transaction.TransactionRecordExtra>}
     */
    async getTransaction({ userid, id }) {
        /*
         * Only four (4) people should view a transaction
         * 1. The patient
         * 2. The doctor
         * 3. The service provider
         * 4. The admin
         */

        const data = await this[taskProcessor].findOne({ id })

        if (!data) {
            return
        }

        async function checkRights() {
            switch (userid) {
                case data.doctor:
                case data.patient:
                case data.service_provider || data.doctor:
                    break
                default:
                    await muser_common.whitelisted_permission_check({
                        userid,
                        permissions: ['permissions.health.commerce.transaction.supervise']
                    })
            }
        }

        if (userid) await checkRights();

        data.$profiles = (await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.getProfiles([data.doctor, data.patient].filter(x => x != userid))).map(x => {
            return {
                id: x.id,
                icon: x.icon,
                label: x.label,
            }
        })


        return data

    }

    /**
     * This method returns transactions that concern the given user.
     * 
     * The user can either be a patient, doctor, service provider, or admin
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {FacultyPublicJSONRPC} param0.$client
     * @param {"patient"|"doctor"|"provider"|"admin"} param0.role
     * @param {"current"|"archive"} param0.type
     * @param {number} param0.since
     * @returns {AsyncGenerator<ehealthi.health.commerce.transaction.TransactionRecordExtra}
     */
    async* getMyTransactions({ userid, $client, role, type, since }) {

        role = role == "patient" || role == "doctor" || role == "provider" ? role : "admin"


        /** @type {Parameters<this[taskProcessor]['find']>['0']} */
        const query = {
            // Service providers need not see pending (unpaid) transactions
            $stages: [(role != 'provider' && type == 'current') ? 'pending' : undefined, 'ready', type == 'archive' ? 'archive' : undefined].filter(x => typeof x == 'string'),
            $or: [
                {
                    $modified: { $gt: since || 0 }
                },
                {
                    $modified: { $exists: false }
                }
            ],
        }



        if (role == "admin") {
            await muser_common.whitelisted_permission_check({
                userid,
                permissions: ['permissions.health.commerce.transaction.supervise']
            })
        } else {
            query[role == "provider" ? "service_provider" : role] = userid
        }

        /** @type {{[id: string]: ehealthi.health.commerce.transaction.TransactionRecordExtra['$profiles'][number]}} */
        const userCache = {}

        /**
         * 
         * @param {ehealthi.health.commerce.transaction.TransactionRecord} item 
         */
        const getProfiles = async (item) => {
            const users = [item.patient, item.doctor,]
            const nwUsers = users.filter(x => typeof userCache[x] == 'undefined')

            if (nwUsers) {
                (await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.getProfiles(nwUsers)).map(x => {
                    userCache[x.id] = {
                        id: x.id,
                        icon: x.icon,
                        label: x.label,
                    }
                })
            }
            return users.map((id) => userCache[id])
        }

        $client.meta.health_commerce_transaction_watching = true



        for await (const item of await this[taskProcessor].find(query)) {

            yield {
                ...item,
                $profiles: await getProfiles(item),
            }
        }




    }


}