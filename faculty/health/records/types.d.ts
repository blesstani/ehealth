/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions for the parent module (records)
 */


import { Collection } from "mongodb"

global {
    namespace ehealthi.health.records {
        interface MedicalRecord {
            title: string
            content: string | {
                id: string
                $transaction: ehealthi.health.commerce.transaction.TransactionRecordExtra
            }
            time: number
            created: number
            doctor: string
            patient: string
            type: RecordCategory
            severity: RecordSeverity
            id: string
        }
        type MedicalRecordInit = Omit<MedicalRecord, "doctor" | "id" | "created">
        type MedicalRecordMutable = Omit<MedicalRecordInit, "patient">

        type RecordCategory = "general" | "prescription" | "diagnosis" | "allergy"

        type MedicalRecordsCollection = Collection<MedicalRecord>

        type RecordSeverity = 1 | 2 | 3

        interface Collections {
            records: MedicalRecordsCollection
        }
    }



    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.health.records.view': true
            'permissions.health.records.write': true
            'permissions.health.records.modify': true
        }
    }
}