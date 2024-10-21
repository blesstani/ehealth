/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions that deal with prescriptions
 */




import { Collection } from "mongodb"

global {
    namespace ehealthi.health.prescription {
        interface Prescription {
            id: string

            /**
             * The doctor who made the prescription
             */
            doctor: string
            /**
             * The patient to follow the prescription
             */
            patient: string
            /**
             * The time the prescription was made
             */
            created: number
            /**
            * Contains the time the prescription was last modified
            */
            modified: number

            /**
             * How prescription would be consumed
             */
            intake: Intake[]

            /**
             * This is probably the name of the drug.
             */
            label: string

            /** This represents the date the user started taking the prescription */
            started: number

            /** Additional notes by the doctor */
            notes: string

            /** This field contains information about a prescription, if ended prematurely */
            ended: number

        }

        type PrescriptionMutableData = Pick<Prescription, "intake" | "notes" | "label">

        interface Intake {
            start: number
            end: number
            dosage: IntakeDose[]
        }

        interface IntakeDose {
            time: number
            quantity: {
                value: number
                label: string
            }
            directive: string
        }

        type PrescriptionsCollection = Collection<Prescription>

        type PrescriptionInit = Omit<Prescription, "id" | "created" | "doctor"> & {
            userid: string
        }
    }

    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.health.prescriptions.make': true
        }
    }

    namespace modernuser.ui.notification {
        interface ClientFrontendEvents {
            'ehealthi-health-prescription-changed': {
                data: ehealthi.health.prescription.Prescription
            }
        }
    }
}