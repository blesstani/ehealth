/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget allows the patient to manage pending transactions with the laboratory
 */

import Item from "./item.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class LabPendingTransactions extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: LabPendingTransactions.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                </div>
            `
        });


        /** @type {ehealthi.health.commerce.transaction.TransactionRecordExtra[]} */ this.items

        this.pluralWidgetProperty({
            selector: ['', ...Item.classList].join('.'),
            parentSelector: ':scope >.container >.items',
            transforms: {
                set: (input) => {
                    return new Item(input).html
                },
                get: ({ widgetObject: { statedata } }) => statedata.$0data
            }
        }, 'items');


        this.blockWithAction(async () => {

            /**
             * @param {boolean} waitForAll
             */
            const pull = async (waitForAll) => {
                const stream = await hcRpc.health.commerce.transaction.getMyTransactions({ role: 'patient', type: 'current' });

                // Stop the spinner, only after the first transaction is drawn
                let good, bad;
                const promise = new Promise((resolve, reject) => {
                    good = resolve
                    bad = reject
                });

                (async () => {
                    try {
                        for await (const item of stream) {
                            this.items.push(item)
                            if (!waitForAll) good()
                        }
                        good()
                    } catch (e) {
                        bad(e)
                    }
                })()//

                await promise
            }

            await pull()

            const client = await ModernuserEventClient.get()

            client.events.addEventListener('ehealthi-health-commerce-transaction-changed', async (event) => {
                /** @type {ehealthi.health.commerce.transaction.TransactionRecord} */
                const transaction = event.detail

                if (!transaction.results) return;

                const transactionFullData = this.items.find(x => x.id == transaction.id)


                // Notify the user
                if (globalThis.AppFrameAPI) {
                    const provider = await hcRpc.health.commerce.service_provider.profile.getProvider({ provider: transactionFullData.service_provider })

                    await (await AppFrameAPI.notification()).notify(
                        {
                            title: `Lab Test Results available`,
                            content: `The results for the lab test you did at ${provider.label || provider.$profile.label}, prescribed by ${transactionFullData.$profiles.find(x => x.id == transactionFullData.doctor)} are available. Log in, and continue talking with your doctor.`,
                            groupId: 'labs',
                            id: `${transaction.id}-results`,
                        }
                    )
                }

            });

            client.events.addEventListener('init', async () => {

                const count = this.items.length;

                const notify = async () => {
                    const diff = this.items.length - count

                    if (globalThis.AppFrameAPI && diff > 0) {
                        await (await AppFrameAPI.notification()).notify(
                            {
                                title: `New Lab Tests`,
                                content: `You have ${diff} new lab test(s)`,
                                groupId: 'labs',
                                id: 'labs-multiple-patient',
                            }
                        )
                    }
                }

                try {
                    await pull(true)
                    notify()
                } catch (e) {
                    notify()
                    throw e
                }

            })




        })
    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-patient-lab-view-pending-transactions']
}