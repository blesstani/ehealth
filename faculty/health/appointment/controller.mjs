/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module deals with features, that are related to scheduling consultations
 */

import shortUUID from "short-uuid";
import { CollectionProxy } from "../../../system/database/collection-proxy.js";
import WorkerWorld from "../../../system/util/worker-world/main.mjs";
import { AppointmentNotificationController } from "./notification/controller.mjs";
import muser_common from "muser_common";
import AppointmentChatController from "./chat.mjs";


/** @type {ehealthi.health.appointment.Collections} */
const collections = new CollectionProxy({
    'recent': 'appointments.recent',
    'ready': 'appointments.ready',
    'archive': 'appointments.old',
    'types': 'appointment.types'
})

export default class AppointmentController {

    constructor() {
        this.events = new EventTarget();

        this.dbController = new WorkerWorld(
            {

                stages: [
                    {
                        collection: collections.recent,
                        name: 'recent',
                        label: 'New'
                    },
                    {
                        collection: collections.ready,
                        name: 'ready',
                        label: "Paid"
                    },
                    {
                        collection: collections.archive,
                        name: 'archive',
                        label: `Old`,
                    }
                ],
                width: 4,
                execute: async (data) => {
                    // The creteria for determining whether or not to archive an appointment record is simple:
                    // Is the appointment passed more than 3 days ago?

                    if ((Date.now() - (data.time || 0)) > 3 * 24 * 60 * 60 * 1000) {
                        return {
                            newStage: 'archive'
                        }
                    }

                    // Well, if the payment has been made, create a job for activating the chats on the day of consultation
                    if (data.paid > 0 && data["@worker-world-task"].stage != 'ready') {
                        const finance = await FacultyPlatform.get().connectionManager.overload.finance()

                        console.log(`Payment ${data.payment} complete, for appointment ${data.id.cyan}`)

                        if ((await finance.payment.getPayment({ id: data.payment })).done) {

                            // At this point, the task is paid, and it's not yet in the 'ready' stage, so let's create a task to issue a notification
                            // as well as create jobs to enable communication at the right time, and disable it after a while
                            // After that, the appointment would be 'ready'

                            await this.notification.scheduleNotifications(data)
                            await this.chat.scheduleChatControls(data)

                            this.events.dispatchEvent(new CustomEvent('appointment-ready', { detail: { id: data.id } }))

                            return {
                                newStage: 'ready'
                            }
                        } else {
                            // At this point, the appointment was claimed to have been paid, but when we checked at the faculty of finance,
                            // the payment was not done
                            data.paid = undefined
                            return {
                                ignored: Date.now() + (10 * 60 * 1000), // 10 mins delay for this attempt to defraud us.
                                newStage: 'ready',
                            }
                        }
                    }


                    if (data["@worker-world-task"].stage == 'archive') {
                        console.log(`How is an archive task processed?\n`, data)
                    }

                    // In case, the appointment is ready, or archived, we delay the next iteration, for 15s
                    return {
                        ignored: Date.now() + (15_000)
                    }

                }
            }
        );

        this.notification = new AppointmentNotificationController(this)
        this.chat = new AppointmentChatController()
    }

    async init() {


        const finance = await FacultyPlatform.get().connectionManager.overload.finance();

        // Now that we're connected to the Faculty of Finance, let's listen for cases of payments for appointments, that have been completed

        const processPayment = async (id) => {
            // Let's first verify that the payment was done.
            try {
                if (!id || !(await finance.payment.getPayment({ id })).done) {
                    console.log(`Payment ${id}, is not qualified to update an appointment as complete.`)
                    return;
                }
                // If so, remember that the appointment was paid
                await this.dbController.updateOne({ payment: id }, { $set: { paid: Date.now() } })
            } catch (e) {
                console.error(`Failed to automatically process appointment, for payment ${id}\n`, e)
            }
        }

        // But first, let's make provision for handling subsequent payments.
        FacultyPlatform.get().connectionManager.events.addListener('finance.payment-complete', async (id) => {
            // TODO: What if we have a suffix attached to payment ids, that can help us distinguish payments that are likely to have happened here.
            // This would prevent unnecessary query to our database
            processPayment(id)
        });

        // So, let's look at the unpaid appointments, and see which ones were paid for, when the faculty was offline
        // It's not something urgent. Let's wait for the system to complete boot
        FacultyPlatform.get().connectionManager.events.addListener('platform-ready', async () => {


            try {
                // The unpaid appointments, that coming after the end of the day before yesterday
                const today = new Date()
                const items = await this.dbController.find({
                    // All recent appointments,
                    $stages: ['recent'],
                    // that have not been paid
                    paid: { $not: { $gt: 0 } },
                    // that were supposed to be paid
                    payment: { $exists: true },
                    // since a day before yesterday ending
                    // The danger, is keeping the server off, for more than 48 hours, would risk certain payments going un-noticed.
                    time: { $gte: new Date(new Date().setMonth(today.getMonth(), today.getDate() - 2)).setHours(23, 59, 0, 0) },

                })

                for await (const appointment of items) {
                    try {
                        if ((await finance.payment.getPayment({ id: appointment.payment })).done) {
                            await this.dbController.updateOne({ id: appointment.id, $stages: ['recent'] }, { $set: { paid: Date.now(), modified: Date.now() } })
                        }
                    } catch (e) {
                        console.error(`Could not process likely past payment for appointment ${appointment.id}.\n`, e)
                    }
                }

            } catch (e) {
                console.error(`Could not process past appointment payments.\n`, e)
            }

            this.dbController.start()

        })

    }


    /**
     * This method creates a new appointment.
     * @param {ehealthi.health.appointment.AppointmentInit} init 
     * @returns {Promise<string>}
     */
    async create(init) {
        const id = shortUUID.generate()
        let payment;
        const user = await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.get_profile({ id: init.userid })
        if (!user.meta?.isDoctor) {
            const typeData = await collections.types.findOne({ id: init.type })
            if (!typeData) {
                throw new Exception(`Please, set the type of consultation.`)
            }
            payment = await (await FacultyPlatform.get().connectionManager.overload.finance()).payment.create({
                owners: [user.id],
                type: 'invoice',
                amount: typeData.price
            })
        }

        /** @type {Parameters<this['dbController']['insertOne']>[0]} */
        const nw = {
            ...init,
            id,
            modified: Date.now(),
            created: Date.now()
        }

        if (payment) {
            nw.payment = payment
        } else {
            nw.paid = Date.now()
        }

        await this.dbController.insertOne(nw);

        return id
    }


    /**
     * This method modifies an appointment
     * @param {object} param0 
     * @param {string} param0.id
     * @param {ehealthi.health.appointment.AppointmentMutableData} param0.data The new data
     * @param {string} param0.userid The user performing this modification
     * 
     */
    async modify({ id, data, userid }) {

        const realData = await this.dbController.findOne({ id })

        if (!realData) {
            throw new Exception(`The consultation you're trying to modify doesn't even exist.`)
        }

        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.appointment.supervise'],
                whitelist: [
                    realData.userid,
                    realData.doctor,
                    realData.patient
                ]
            }
        );

        /** @type {(keyof typeof data)[]} */
        const fields = ['doctor', 'time']
        /** @type {Set<keyof data>} */
        const changedFields = new Set()

        const nwData = {
            ...realData
        }

        for (const key of fields) {
            if (realData[key] != data[key]) {
                changedFields.add(key)
                nwData[key] = data[key]
            }
        }


        // If time changed, let's reschedule tasks 
        if (changedFields.has('time')) {
            await this.chat.scheduleChatControls(nwData)
        }

        await this.notification.scheduleNotifications(nwData, {
            change: {
                // If the doctor changed, let's isse an additional notification to inform him, that he's been taken off the appointment
                prevDoctor: changedFields.has('doctor') ? realData.doctor : undefined,
                prevTime: changedFields.has('time') ? realData.time : undefined
            }
        });


        // After issuing notifications, let's make the changes happen

        await this.dbController.updateOne(
            {
                id
            },
            {
                $set: {
                    doctor: data.doctor,
                    time: data.time
                }
            }
        );

        if (changedFields.size > 0) {
            this.events.dispatchEvent(new CustomEvent(
                'appointment-changed',
                {
                    detail: {
                        id,
                        doctor: nwData.doctor,
                        time: nwData.time,
                        patient: realData.patient
                    }
                }
            ))
        }


    }



    /**
     * This method retreives an appointment from the database
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid The id of the user wanting it. 
     */
    async getAppointment({ id, userid }) {
        const data = await this.dbController.findOne({ id }, { projection: { _id: 0 } })

        if (!data) {
            throw new Exception(`The appointment you're looking for, was not found.`)
        }

        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.appointment.view'],
                whitelist: [
                    data.userid,
                    data.doctor,
                    data.patient
                ]
            }
        );

        return data;
    }

    /**
     * This method adds 
     * @param {object} param0 
     * @param {ehealthi.health.appointment.AppointmentType} param0.data
     * @param {string} param0.userid
     */
    async addAppointmentType({ data, userid }) {


        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.appointment.supervise'],
            }
        );

        const id = shortUUID.generate();

        soulUtils.checkArgs(data, {
            label: 'string',
            description: 'string',
            icon: 'string',
            price: {
                currency: 'string',
                value: 'number'
            }
        }, 'data', undefined, ['exclusive']);

        await collections.types.insertOne({ ...data, id })

        return id


    }


    /**
     * This method returns the various types of appointments in the system
     */
    async getAppointmentTypes() {

        return await collections.types.find().toArray()

    }


    /**
     * This method adds 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {ehealthi.health.appointment.AppointmentType} param0.data
     * @param {string} param0.userid
     */
    async updateAppointmentType({ id, data, userid }) {


        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.appointment.supervise']
            }
        );


        soulUtils.checkArgs(data, {
            label: 'string',
            description: 'string',
            icon: 'string',
            price: {
                currency: 'string',
                value: 'number'
            }
        }, 'data', undefined, ['exclusive', 'definite']);

        delete data._id;

        await collections.types.updateOne({ id }, { $set: { ...data, id } });

        // TODO: Inform the client, that the types of appointments have changed




    }
    /**
     * This method adds 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async deleteAppointmentType({ id, userid }) {


        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.appointment.supervise'],
            }
        );

        await collections.types.deleteOne({ id });


    }



    /**
     * It returns all appointments that are ready (paid for), that haven't been started
     * @param {object} param0
     * @param {string} param0.userid
     * @param {number} param0.start Optional parameter to exclude appointments before a given time
     */
    async getReadyAppointments({ userid, start = 0 } = {}) {

        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.appointment.view'],
            }
        );


        return await this.dbController.find(
            {
                time: { $gte: start },
                $stages: ['ready']
            },
            {
                sort: {
                    time: 'asc'
                },
                projection: {
                    _id: 0
                }
            }
        );

    }



}