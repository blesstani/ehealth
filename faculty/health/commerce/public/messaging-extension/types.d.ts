/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions related to the capability of sending prescriptions as messages
 */


import ''

global {
    namespace telep.chat.messaging {
        interface AllMessageMetaTypes {
            /**
             * This refers to the type of message where the doctor sends a prescription to a patient.
             */
            'ehealthi-health-prescription': {
                /**
                 * id of the prescription that was made
                 */
                id: ehealthi.health.prescription.Prescription['id']
            }
        }
    }
    
}