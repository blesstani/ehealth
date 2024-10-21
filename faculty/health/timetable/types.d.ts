/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions for the timetable controller module
 */



import ''


global {
    namespace ehealthi.health.timetable {
        type TimetableEntry = (
            {
                ['@timetable-entry']: {
                    priority: 'important' | 'regular'
                    date: {
                        start: number
                        end: number
                    }
                    extra: {
                        user: modernuser.profile.UserProfileData
                    }
                }
            } & (TimetableAppointmentMeta & TimetablePrescriptionMeta & TimetablePaymentMeta)
        )

        interface TimetablePaymentMeta {
            ['@timetable-entry']: {
                type: 'payment'
            }
        }

        interface TimetableAppointmentMeta extends ehealthi.health.appointment.Appointment {
            ['@timetable-entry']: {
                type: 'appointment'
            }
        }

        interface TimetablePrescriptionMeta extends ehealthi.health.prescription.Prescription {
            ['@timetable-entry']: {
                type: 'prescription'
            }
        }

        interface StartParam {
            modified: number
            time: number
            created: number
        }


    }

    namespace modernuser.ui.notification {
        interface ClientFrontendEvents {
            'ehealthi-health-new-timetable-entry': {
                data: ehealthi.health.timetable.TimetableEntry
            }
            'ehealthi-health-appointment-changed': {
                data: Pick<ehealthi.health.timetable.TimetableEntry, keyof ehealthi.health.appointment.AppointmentMutableData | "@timetable-entry">
            }
        }
    }

}