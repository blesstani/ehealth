/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the app-appointments/listings widget, where users can view upcoming, and past appointments
 */


import ''

global {
    namespace ehealthi.ui.app.app_appointments.listings {
        type Statedata = htmlhc.lib.alarm.AlarmObject<{
            appointments: ehealthi.health.timetable.TimetableEntry[]
        }>
        interface DateRange {
            min: number
            max: number
        }
    }
}