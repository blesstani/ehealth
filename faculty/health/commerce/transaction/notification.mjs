/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This controller (notification), deals with notifications for laboratory features
 */

import { CollectionProxy } from "../../../../system/database/collection-proxy.js";
import WorkerWorld from "../../../../system/util/worker-world/main.mjs";
import TransactionController from "./controller.mjs";
import EventChannelServer from "../../../../system/public/comm/rpc/json-rpc/event-channel/server/sever.mjs";
import muser_common from "muser_common";



const controllers = Symbol()

/** @type {ehealthi.health.commerce.transaction.notification.Collections} */
const collections = new CollectionProxy({
    'pending': 'commerce.transaction.notification.jobs.pending',
    'processed': 'commerce.transaction.notification.jobs.processed',
})


export default class TransactionNotificationController extends EventChannelServer {


    /**
     * 
     * @param {object} _controllers 
     * @param {TransactionController} _controllers.transaction
     */
    constructor(_controllers) {

        super();


        this[controllers] = _controllers


        this.processor = new WorkerWorld({
            stages: [
                {
                    label: `Pending`,
                    collection: collections.pending,
                    name: 'pending'
                },
                {
                    label: `Complete`,
                    collection: collections.processed,
                    name: 'processed'
                }
            ],
            width: 1,
            execute: async (task) => {
                // Now, let's check if the client is online
                if (task.role != 'doctor' && (this.filterByActive([task.target]).length > 0)) {
                    console.log(`The client ${task.target.blue}, is online.\nWe'll wait for now. Normally, we should delete.`)
                    return {
                        ignored: Date.now() + 30_000
                    }
                }


                const fulldata = await this[controllers].transaction.getTransaction({ id: task.transaction })
                if (!fulldata) {
                    return {
                        delete: true,
                    }
                }
                if (task.role == 'provider' && !fulldata.service_provider) {
                    return {
                        ignored: Date.now() + (1.5 * 60_000)
                    }
                }

                const profiles = await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.getProfiles(
                    [fulldata.doctor, fulldata.patient, fulldata.service_provider]
                );

                const [doctor, patient, provider] = [fulldata.doctor, fulldata.patient, fulldata.service_provider].map(x => profiles.find(p => p.id == x))

                const templates = TransactionNotificationController.templates;

                // Okay, so the client is offline. Let's notify him
                try {
                    switch (task.role) {
                        case 'doctor':
                        case 'patient':

                            await (await FacultyPlatform.get().connectionManager.overload.modernuser()).notification.notifyUser({
                                userid: task.target,
                                language: 'en',
                                template: task.role == 'doctor' ? templates.results_available_doctor.name : templates.results_available_patient.name,
                                data: task.role == 'doctor' ? [doctor.label, patient.label] : [patient.label, doctor.label]
                            });
                            break;
                        case 'provider':

                            await (await FacultyPlatform.get().connectionManager.overload.modernuser()).notification.notifyUser({
                                userid: task.target,
                                language: 'en',
                                template: templates.nw_lab_test.name,
                                data: [provider.label, "lab test", doctor.label]
                            });

                            break;
                        default:
                            console.warn(`Unknown role '${task.role}', for lab notifications.`)
                            return {
                                ignored: Date.now() + 45_000
                            }
                    }
                } catch (e) {
                    console.log(e, `\nprovider `, provider, `\ndoctor `, doctor, `\npatient `, patient, `\naction `, task.role,);
                    throw e;
                }

                return {
                    delete: true,
                }
            },
        });

        this.processor.start()

    }

    /** @readonly */
    static templates = {
        /**
         * @type {modernuser.notification.Template}
         */
        nw_lab_test: {
            name: 'ehealthi_health_commerce_new_transaction',
            label: `New Lab Test`,
            fields: {
                en: {
                    text: `Hello {{1}}, you have a new {{2}} on the platform, given by {{3}}. Please log in to check.`,
                    whatsapp: {
                        category: 'UTILITY',
                        components: [
                            {
                                type: 'BODY',
                                text: `Hello {{1}}, you have a new {{2}} on the platform, given by {{3}}. Please log in to check.`,
                                example: {
                                    body_text: [
                                        [
                                            "John Ambe",
                                            "assignment",
                                            "Wonsi Ernest"
                                        ]
                                    ]
                                }

                            }
                        ]
                    },
                    html: `Hello {{1}}, you have a new {{2}} on the platform, given by {{3}}. Please log in to check.`,
                    inApp: `Hello {{1}}, you have a new {{2}}, from {{3}}.`,
                }
            }
        },
        /**
        * @type {modernuser.notification.Template}
        */
        results_available_doctor: {
            name: 'ehealthi_health_commerce_results_available_doctor',
            label: `Lab Results Available`,
            fields: {
                en: {
                    text: `Hello {{1}}, the results of the test you prescribed for {{2}}, are now available. Login to check`,
                    whatsapp: {
                        components: [
                            {
                                type: "BODY",
                                text: `Hello {{1}}, the results of the test you prescribed for {{2}}, are now available. Login to check`,
                                example: {
                                    body_text: [
                                        [
                                            "Gregory",
                                            "Mbe John",
                                        ]
                                    ]
                                }
                            }
                        ]
                    },
                    html: `Hello {{1}}, the results of the test you prescribed for {{2}}, are now available. Login to check`,
                    inApp: `Hello {{1}}, the results of the test you prescribed for {{2}}, are now available.`,
                }
            }
        },
        /**
        * @type {modernuser.notification.Template}
        */
        results_available_patient: {
            name: 'ehealthi_health_commerce_results_available_patient',
            label: `Lab Results Available`,
            fields: {
                en: {
                    text: `Hello {{1}}, the results of the test you took, prescribed by {{2}}, are now available. Login to continue discussing with the doctor.`,
                    whatsapp: {
                        category: 'UTILITY',
                        components: [
                            {
                                type: 'BODY',
                                text: `Hello {{1}}, the results of the test you took, prescribed by {{2}}, are now available. Login to continue discussing with the doctor.`,
                                example: {
                                    body_text: [
                                        [
                                            "Tambe James",
                                            "Nde John",
                                        ]
                                    ]
                                }
                            }
                        ]
                    },
                    html: `Hello {{1}}, the results of the test you took, prescribed by {{2}}, are now available. Login to continue discussing with the doctor.`,
                    inApp: `Hello {{1}}, the results of the test you took, prescribed by {{2}}, are now available.`,
                }
            }
        }
    }


    /**
     * @override
     * This method should be overridden, so that when a client registers, the client's
     * registration data is passed in. The method should return an array of ids, to be used
     * to identify the client with.
     * Subsequently, if events are dispatched for any of the ids, the client will receive it.
     * @param {object} param0
     * @param {RegistrationData} param0.data 
     * @param {JSONRPC} param0.client
     * @returns {Promise<string[]>}
     */
    async register({ data, client }) {
        return [(await muser_common.getUser(client)).id]
    }

}