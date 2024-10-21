/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module (appointment/chat), controls the aspect of consultations, that deal with messaging.
 */

import WorkerWorld from "../../../system/util/worker-world/main.mjs";
import { CollectionProxy } from "../../../system/database/collection-proxy.js";



/** @type {ehealthi.health.appointment.chat.Collections} */
const collections = new CollectionProxy({
    'chats': 'appointment.chats',
    'control': 'appointments.chat.control',
})

const worker = Symbol()


export default class AppointmentChatController {

    /**
     * 
     * @param {ehealthi.health.appointment.chat.ControllerArgs} params 
     */
    constructor(params) {
        this[worker] = new WorkerWorld(
            {
                stages: [
                    {
                        label: `Default`,
                        name: 'default',
                        collection: collections.control,
                    }
                ],
                width: 8,
                execute: async (task) => {

                    const appointment = (await params.controllers.appointment.getAppointment({ id: task.appointment }))
                    
                    // In case it's time to lock, or unlock a chat that doesn't exist...
                    if (!task.chat && !appointment.doctor) {
                        // If there's still no doctor assigned to the appointment, well, let's leave it like that.
                        return {
                            ignored: task.time < Date.now() ? Date.now() + 20_000 : task.time - 2000
                        }
                    }

                    if (appointment.doctor) {
                        // If after all this time, there's a doctor, let's go ahead and create the chat
                        await this.ensureChat(appointment)

                    }



                    if (task.time < Date.now()) {
                        return {
                            // Keep the task away till it's almost time to process it
                            ignored: task.time - 2000
                        }
                    }
                    const chat = await FacultyPlatform.get().connectionManager.overload.chat()
                    
                    await chat.management.toggleChatState({ chat: task.chat, state: task.action == 'open' })

                    return {
                        delete: true,
                    }
                }
            }
        )
    }

    /**
     * This method schedules the tasks for activating, and deactivating chats 
     * @param {ehealthi.health.appointment.Appointment} appointment 
     */
    async scheduleChatControls(appointment) {
        // First things first, let's make sure the chat with the given doctor and patient exists

        let chat = await this.ensureChat(appointment);

        // Let's cancel other jobs to that were meant to activate, or deactivate chats for this appointment
        await this[worker].deleteMany({ chat })

        // Let's schedule a task for activating the chat, 5 mins before appointment time
        this[worker].insertOne(
            {
                time: appointment.time - (5 * 60 * 1000),
                chat,
                action: 'open',
                appointment: appointment.id
            }
        );

        // Let's schedule another job for disabling the chat, 3 hours after the appointment time, in case the doctor doesn't close the appointment
        this[worker].insertOne(
            {
                time: appointment.time + (3 * 60 * 60 * 1000),
                action: 'close',
                chat,
                appointment: appointment.id
            }
        )
    }


    /**
     * This method creates a chat, for the doctor, and patient of an appointment iff one doesn't already exist.
     * @param {ehealthi.health.appointment.Appointment} appointment 
     * @returns 
     */
    async ensureChat(appointment) {
        let chat;
        if (appointment.doctor) {
            chat = (await collections.chats.findOne({ doctor: appointment.doctor, patient: appointment.patient }))?.chat;
        }

        if (!chat && appointment.doctor) {
            const fChat = await FacultyPlatform.get().connectionManager.overload.chat();
            const chatId = await fChat.management.createChat({
                type: 'private',
                rules: {
                    call: {
                        voice: [appointment.doctor],
                        video: [appointment.doctor]
                    },
                    end: [appointment.doctor]
                },
                userid: appointment.doctor,
                recipients: [
                    appointment.doctor,
                    appointment.patient
                ],
                disabled: true
            });

            collections.chats.insertOne(
                {
                    chat: chatId,
                    doctor: appointment.doctor,
                    patient: appointment.patient,
                }
            );

            chat = chatId;

        }
        return chat;
    }

    /**
     * This method activates/deactivates the chat for an appointment, irrespective of set tasks to deactivate, or activate it at a later time.
     * @param {object} param0 
     * @param {ehealthi.health.appointment.Appointment} param0.appointment
     * @param {boolean} param0.state
     */
    async toggleActiveState({ appointment, state }) {
        const chat = (await collections.chats.findOne({
            doctor: appointment.doctor,
            patient: appointment.patient,
        }))?.chat
        if (!chat) {
            throw new Exception(`A command to ${state ? 'activate' : 'deactivate'} communication between the doctor and the patient, of appointment ${appointment.id} failed, because we have no records about the doctor, and patient.`)
        }

        // Some things are illegal
        // Like, scheduling a job to activate a chat, more than three hours after the desired time.
        if (Date.now() > (appointment.time - 3 * 60 * 60 * 1000) && state) {
            throw new Exception(`You cannot activate communications at this time, because it's more than 3 hours after the appointment time.`)
        }

        // Schedule the normal jobs the normal way, so that other jobs can be canceled, as well as schedule the closing/opening actions
        await this.scheduleChatControls(appointment)


        // And now,
        // Cancel all jobs to activate the chat, because we're already forcefully activating it.
        // Or, cancel all jobs to deactivate the chat, because that's what we're already doing.
        this[worker].deleteMany(
            {
                chat,
                action: state ? 'open' : 'close',
            }
        );

    }

}