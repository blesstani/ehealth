/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions related to managing appointments
 */



import { Collection } from "mongodb"
import AppointmentController from "./controller.mjs"

global {
    namespace ehealthi.health.appointment {
        interface Appointment {
            id: string
            /** The doctor who's responsible for this appointment. */
            doctor: string
            /** The user who's being a patient for this appointment. */
            patient: string
            /** The user who created this appointment. */
            userid: string
            /** If payment is required, this field is the id of the payment to be made. */
            payment: string
            /** This field indicates if the {@link payment} has been made. */
            paid: number
            /** This field is the time when the appointment is expected to happen. */
            time: number
            /** This field indicates if the doctor even started the appointment. */
            opened: number
            /** This field tells us when the appointment was created */
            created: number
            /** This field indicates the last time the appointment was modified */
            modified: number
            /** This field indicates if the doctor has marked the appointment over. */
            complete: boolean
            /** The type of appointment we're making. Linked to {@link AppointmentType.id} */
            type: string
        }

        type AppointmentInit = Pick<Appointment, "doctor" | "patient" | "userid" | "time" | "type">
        type AppointmentMutableData = Pick<Appointment, "doctor" | "time">

        type AppointmentCollection = soul.util.workerworld.TaskCollection<Appointment>

        interface Collections {
            recent: AppointmentCollection
            archive: AppointmentCollection
            ready: AppointmentCollection
            types: Collection<AppointmentType>
        }

        interface AppointmentType {
            id: string
            icon: string
            label: string
            description: string
            price: finance.Amount
        }

        namespace notification {

            interface NotificationJob {

                /** The id appointment we're notifying users about */
                appointment: string

                /** The time the notification is supposed to be sent */
                time: number

                /** Who is to be notified about the appointment */
                user: 'doctor' | 'patient' | 'admin'

                /**
                 * This tells us the type of notification we're sending.
                 * reminder notifications, just go to tell the user, that his appointment is upcoming.
                 * change notifications, indicate, that doctor, or the time for the appointment has been changed.
                 * 'initial' notifications, tell the doctor, and admin, that an appointment has just been booked.
                 */
                type: 'reminder' | 'change' | 'initial'

                /** 
                 * This field is set, if the appointment was transferred to another doctor. 
                 * In that case, this field would contain the id of the previous doctor.
                */
                oldDoctor: string

                /**
                 * This field is present when the time has changed.
                 */
                oldTime: number

            }

            type NotificationTasksCollection = soul.util.workerworld.TaskCollection<NotificationJob>

            interface Collections {
                main: NotificationTasksCollection
            }
        }

        namespace chat {
            interface ChatEntry {
                chat: string
                patient: string
                doctor: string
            }

            interface ChatControlJob {
                chat: string
                action: 'open' | 'close'
                time: string
                appointment: string
            }

            type ChatEntriesCollection = Collection<ChatEntry>

            type ChatControlJobsCollection = Collection<ChatControlJob>

            interface ControllerArgs {
                controllers: {
                    appointment: AppointmentController
                }
            }

            interface Collections {
                chats: ChatEntriesCollection
                control: ChatControlJobsCollection
            }

        }
    }

}