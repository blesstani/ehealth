/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The app-patient-health widget
 * This module contains type definitions for this widget
 */


import ''

global {
    namespace ehealthi.ui.app.app_patient_health {
        type Statedata = htmlhc.lib.alarm.AlarmObject<{
            items: ehealthi.health.timetable.TimetableEntry[]
        }>
    }
}