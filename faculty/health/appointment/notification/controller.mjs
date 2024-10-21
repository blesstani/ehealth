/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows notifications to be sent, about appointments with doctor.
 */

import { CollectionProxy } from "../../../../system/database/collection-proxy.js";
import WorkerWorld from "../../../../system/util/worker-world/main.mjs"
import AppointmentNotificationTemplates from "./templates.mjs";


const processor = Symbol()


/** @type {ehealthi.health.appointment.notification.Collections} */
const collections = new CollectionProxy({
    'main': 'appointment.notifications.default',
});

export class AppointmentNotificationController {

    /**
     * 
     * @param {import("../controller.mjs").default} parent
     */
    constructor(parent) {
        this[processor] = new WorkerWorld(
            {
                width: 5,
                stages: [
                    {
                        label: `Default`,
                        name: 'default',
                        collection: collections.main,
                    }
                ],
                execute: async (task) => {

                    if (task.time > Date.now()) {
                        return {
                            ignored: task.time - 10
                        }
                    }

                    console.log(`Processing task `, task)

                    const appointment = await parent.getAppointment({ id: task.appointment })
                    switch (task.type) {
                        case 'initial': {
                            // Reaching this point, means the task was just created, and important people need to know
                            switch (task.user) {
                                case 'admin': {
                                    await AppointmentNotificationTemplates.adminNotify(appointment)
                                    break
                                }
                                case 'doctor': {
                                    await AppointmentNotificationTemplates.doctorNwNotify(appointment)
                                    break
                                }
                            }
                            break
                        }
                        case 'default': {
                            // Here, the task is a reminder to either doctor, or patient
                            await AppointmentNotificationTemplates.appointmentReminder(
                                {
                                    appointment,
                                    userType: task.user
                                }
                            )

                            break
                        }

                        case 'change': {
                            // If this point is reached, then we're just informing the doctor, or patient that the appointment has changed
                            if (task.user == 'doctor') {
                                if (task.oldDoctor) {
                                    // At this point, the doctor is being informed, that the appointment has been handed to another doctor
                                    await AppointmentNotificationTemplates.doctorRemovedNotify(
                                        {
                                            appointment,
                                            oldDoctor: task.oldDoctor,

                                        }
                                    )
                                }
                            }



                            if (!task.oldDoctor || task.user != 'doctor') {
                                // We can't inform the new doctor, that there's a change. He should have had a, "you have a new appointment" notification.

                                // Over here, we're informing both patient and doctor, that some things about the appointment has changed 
                                await AppointmentNotificationTemplates.changeNotify(
                                    {
                                        userType: task.user,
                                        appointment,
                                        oldDoctor: task.oldDoctor,
                                        oldTime: task.oldTime

                                    }
                                )
                            }
                            break;
                        }

                    }

                    return {
                        delete: true,
                    }
                }
            }
        );

        FacultyPlatform.get().connectionManager.events.addListener('platform-ready', async () => {
            await AppointmentNotificationTemplates.createTemplates()
            this[processor].start()
        })

    }

    /**
     * This method schedules important notifications for the stakeholders of a particular appointment (i.e, doctor, patient, admin)
     * @param {ehealthi.health.appointment.Appointment} appointment 
     * @param {object} param1
     * @param {boolean} param1.isFirst Some notifications are only sent when it's the first time anyone is hearing about an appointment.
     * @param {object} param1.change If specified, then we're scheduling notifications, because the appointment has changed. It has to be done differently.
     * @param {string} param1.change.prevDoctor If specified, then there was a previous doctor, who is no longer assigned to this appointment
     * @param {number} param1.change.prevTime
     * @returns {Promise<void>}
     */
    async scheduleNotifications(appointment, { isFirst, change } = {}) {
        // The notification to inform the admin, and ?doctor, that there's an appointment


        // First things first, we need to critically cancel other notification tasks.
        // Rule number one of cancelation...
        // We cancel initial notifications, if the doctor changed
        if (change?.prevDoctor) {
            await this[processor].deleteMany(
                {
                    appointment: appointment.id,
                    type: 'initial',
                    user: 'doctor',
                }
            )
        }

        // However, no matter the situation, cancel all non-initial notifications, and all notifications, that don't go to the doctor
        await this[processor].deleteMany(
            {
                appointment: appointment.id,
                $or: [
                    {
                        type: { $ne: 'initial' }
                    },
                    {
                        user: { $ne: 'doctor' }
                    }
                ]
            }
        );


        // After canceling similar notifications, let's go ahead to reschedule them.


        if (isFirst) {


            await this[processor].insertOne(
                {
                    appointment: appointment.id,
                    type: 'initial',
                    user: 'admin',
                    time: Date.now() // Just now
                }
            );

            if (appointment.doctor) {
                await this[processor].insertOne(
                    {
                        appointment: appointment.id,
                        type: 'initial',
                        user: 'doctor',
                        // Let's give the doctor up to 10 mins, so that if the appointment is re-scheduled, we'd have time to cancel the notification,
                        // However, if the doctor is just being told, that the time changed, then that's something urgent. Let's do it within 20s.
                        time: change && (!change.prevDoctor) ? Date.now() + (20_000) : Date.now() + (10 * 60 * 1000)
                    }
                );
            }

        }


        // If the appointment is three or more days in advance, let's place a notification to remind the important stakeholders one day beforehand
        if (appointment.time >= new Date().setHours(0, 0, 0, 0) + (3 * 24 * 60 * 60 * 1000)) {
            let eve = new Date(new Date(appointment.time).setDate(new Date(appointment.time).getDate() - 1))
            eve = new Date(eve).setHours(eve.getHours() - 1, 0, 0, 0)

            // For the doctor
            await this[processor].insertOne(
                {
                    appointment: appointment.id,
                    type: 'reminder',
                    user: 'doctor',
                    time: eve
                }
            );

            // And for the patient
            await this[processor].insertOne(
                {
                    appointment: appointment.id,
                    type: 'reminder',
                    user: 'patient',
                    time: eve
                }
            );
        }





        // In case the notification is being sent because something about the appointment changed, we have additional notifications to send
        if (change) {

            // For the patient, actually he could be informed of up to two things: change in doctor, and change in time
            await this[processor].insertOne(
                {
                    appointment: appointment.id,
                    type: 'change',
                    user: 'patient',
                    oldTime: change.prevTime,
                    oldDoctor: change.prevDoctor,
                    time: Date.now() + (10 * 60 * 1000) // 10mins delay. In case something changes again, we'd have sufficient time to cancel it
                }
            );


            //  And for the doctors


            if (change.prevDoctor) {
                // And if there's a new doctor, let's tell the old doctor he's off
                await this[processor].insertOne(
                    {
                        appointment: appointment.id,
                        type: 'change',
                        user: 'doctor',
                        oldDoctor: change.prevDoctor,
                        time: Date.now() + (10 * 60 * 1000) // Another 10mins to inform the doctor, to handle cases where the admin changes his mind.
                    }
                );

                // Then, let's tell the new doctor, that he has a new appointment
                await this[processor].insertOne(
                    {
                        appointment: appointment.id,
                        type: 'initial',
                        user: 'doctor',
                    }
                )
            } else {
                // This means, only the time of the appointment changed.
                // Let's inform the doctor
                await this[processor].insertOne(
                    {
                        appointment: appointment.id,
                        type: 'change',
                        user: 'doctor',
                        oldTime: change.prevTime,
                        time: Date.now() + (10 * 60 * 1000) // 10mins delay. In case something changes again, we'd have sufficient time to cancel it
                    }
                )
            }

        }




    }

}