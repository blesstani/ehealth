/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This controller deals with everything related to prescribing the commodities, as well as other things
 */

import muser_common from "muser_common";
import shortUUID from "short-uuid";
import CommerceController from "../commerce/controller.mjs";
import nodeUtil from 'node:util'

import { CollectionProxy } from "../../../system/database/collection-proxy.js";


const controllers = Symbol()
/**
 * @type {{prescriptions: ehealthi.health.prescription.PrescriptionsCollection}}
 */
const collections = new CollectionProxy(
    {
        'prescriptions': 'prescriptions'
    }
)




export default class PrescriptionController {
    /**
     * 
     * @param {object} param0 
     * @param {object} param0.controllers
     * @param {CommerceController} param0.controllers.commerce
     */
    constructor({ controllers: cont }) {
        this[controllers] = cont
    }

    /**
     * This method makes a prescription
     * @param {ehealthi.health.prescription.PrescriptionInit} prescription 
     * @returns {Promise<string>}
     */
    async prescribe(prescription) {

        // TODO: Make checks on the data

        // Let's always make sure the person performing this action, is legal.
        await muser_common.whitelisted_permission_check(
            {
                userid: prescription.userid,
                permissions: ['permissions.health.prescriptions.make'],
            }
        );

        const id = shortUUID.generate()

        delete prescription.started

        await collections.prescriptions.insertOne(
            {
                ...prescription,
                id,
                doctor: prescription.userid,
                userid: prescription.userid,
                created: Date.now(),
                modified: Date.now()
            }
        );

        return id

    }

    /**
     * This method retrieves prescriptions for a given user
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {active} param0.active If set to true, only prescriptions that are currently in the following, would be fetched, and if false, only out-of-use prescriptions would be fetched. If ignored, both would be fetched
     * @param {ehealthi.health.timetable.StartParam} param0.start If set, we'll only get prescriptions, that have been modified after a given time.
     */
    async *getPrescriptions({ userid, active, start } = {}) {

        /** @type {Parameters<collections['prescriptions']['find']>['0']} */
        const filter = { patient: userid }

        const todate = new Date().setHours(0, 0, 0, 0)

        /**
         * @type {Parameters<collections['prescriptions']['find']>['0']}
         */
        const timeQuery = {
            $or: [
                start.created ? {
                    created: { $gt: start?.created || 0 },
                } : undefined,
                start.modified ? {
                    modified: {
                        $gt: start?.modified || 0
                    }
                } : undefined,
            ].filter(x => typeof x != 'undefined')
        }

        if (timeQuery.$or.length == 0) {
            delete timeQuery.$or
        }

        if (typeof active !== 'undefined') {
            filter.$or =
                active ? [
                    {
                        started: { $gt: 0 },
                        ended: { $not: { $gt: 0 } },
                        intake: { $gte: { end: todate } },
                        ...timeQuery
                    }
                ] : [
                    {
                        ...timeQuery,
                        started: {
                            $not: { $gt: 0 }
                        },
                    },
                    {
                        ...timeQuery,
                        ended: { $gt: 0 },
                    }
                ]

        }



        for await (const item of collections.prescriptions.find(filter, { projection: { _id: 0 } })) {
            yield item
        }
    }

    /**
     * This method securely retrieves a prescription
     * @param {object} param0 
     * @param {active} param0.id
     * @param {string} param0.userid
     */
    async getPrescription({ userid, id } = {}) {
        const data = await this.getPrescriptionSecured({ id, userid });

        return data;
    }


    /**
     * This method retrieves a prescription in a way that ensures that the user owns it.
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     * @param {boolean} param0.doctorOnly If set, then only those with permissions, as well as the doctor. The patient would not be allowed here
     * @returns 
     */

    async getPrescriptionSecured({ id, userid, doctorOnly }) {
        const data = await collections.prescriptions.findOne({ id }, { projection: { _id: 0 } });
        if (!data) {
            throw new Exception(`The prescription with id '${id}', was not found.`);
        }

        if (doctorOnly && (userid !== data.doctor)) {
            throw new Exception(`Sorry, you don't have the privilege to do this.`)
        }
        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.prescriptions.make'],
                whitelist: [
                    data.patient,
                    data.doctor
                ].filter(x => (typeof x) !== 'undefined')
            }
        );
        return data;
    }

    /**
     * This method indicates that the user has started taking the prescription
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async start({ id, userid }) {
        await this.getPrescriptionSecured(
            {
                id,
                userid
            }
        );


        await collections.prescriptions.updateOne({ id }, { $set: { started: Date.now(), modified: Date.now() } })


    }


    /**
     * This method is used to modify a prescription
     * @param {object} param0 
     * @param {string} param0.id
     * @param {ehealthi.health.prescription.PrescriptionMutableData} param0.data
     * @param {string} param0.userid
     */
    async modify({ id, data, userid }) {
        const existing = await this.getPrescriptionSecured(
            {
                id,
                userid,
                doctorOnly: true
            }
        );

        const MAX_MODIFY_TIME_hrs = 24;

        if (Date.now() > (existing.created + (MAX_MODIFY_TIME_hrs * 60 * 60 * 1000))) {
            throw new Exception(`You can't modify this prescription again. It's been more than ${MAX_MODIFY_TIME_hrs} hours.`)
        }


        // Inform frontend components, that the prescription has changed
        this.informPrescriptionChanged(
            {
                ...data,
                notes: data.notes,
                label: data.label,
                intake: data.intake,
                modified: Date.now()

            }
        ).catch(e => { console.warn(`Failed to inform frontend components, that prescription has changed`, e) })


        await collections.prescriptions.updateOne({ id }, {
            $set: {
                intake: data.intake,
                notes: data.notes,
                label: data.label,
                modified: Date.now()
            }
        })

    }
    /**
     * This method is used to end a prescription, permanently
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async end({ id, userid }) {
        const data = await this.getPrescriptionSecured(
            {
                id,
                userid,
                doctorOnly: true
            }
        );

        // Inform frontend components, that the prescription has changed
        this.informPrescriptionChanged(
            {

                ...data,
                ended: Date.now(),
                modified: Date.now()
            }
        ).catch(e => { console.warn(`Failed to inform frontend components, that prescription has changed`, e) })

        await collections.prescriptions.updateOne({ id }, {
            $set: {
                ended: Date.now(),
                modified: Date.now()
            }
        })

    }


    /**
     * This method informs frontend components, that a prescription has changed.
     * @param {ehealthi.health.prescription.Prescription} prescription 
     */
    async informPrescriptionChanged(prescription) {

        // Inform frontend components, that the prescription has changed
        const modernuser = await muser_common.getConnection()
        await modernuser.notification.events.inform(
            {
                userids: [prescription.patient, prescription.doctor],
                event: 'ehealthi-health-prescription-changed',
                detail: {
                    data: prescription
                },
                options: {
                    exclude: [prescription.doctor],
                    aggregation: {
                        timeout: 20_000,
                        sameData: true,
                    },
                    precallWait: 1000,
                    timeout: 5000,
                    retries: 10,
                    retryDelay: 2000
                }
            }
        )
    }

}