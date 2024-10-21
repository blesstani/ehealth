/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the medical-records feature on the frontend
 */


import ''

global {
    namespace ehealthi.health.records.ui {
        type MedicalRecord_frontend = Omit<ehealthi.health.records.MedicalRecord, "doctor"> & {
            doctor: modernuser.profile.UserProfileData
        }
    }
}