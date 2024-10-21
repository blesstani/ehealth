/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the parts of the commerce feature, that deal with transactions.
 * Transactions have to do with paying for lab tests, and having lab results.
 */


import { Collection } from "mongodb"


global {
    namespace ehealthi.health.commerce.transaction {
        interface Transaction {
            commodities: string[]
            doctor: string
            patient: string
            service_provider: string
        }

        interface TransactionRecord extends Omit<soul.util.workerworld.Task<Transaction, {}>, "@worker-world-task"> {
            id: string
            created: number
            payment: string
            paid: number
            canceled: number
            completed: number
            results: TransactionResult[]
            patientCanView: boolean
        }

        interface TransactionRecordExtra extends TransactionRecord {
            $profiles: Pick<modernuser.profile.UserProfileData, "label" | "icon" | "id">[]
        }

        type TransactionsCollection = Collection<TransactionRecord>

        interface TransactionResult {
            title: string
            type: "text" | "image" | "video"
            data: {
                text?: string
                url?: string
            }
        }

        namespace notification {
            interface NotificationJob {
                transaction: string
                target: string
                role: 'provider' | 'doctor' | 'patient'
            }

            type NotificationJobsCollection = Collection<NotificationJob>

            interface Collections {
                pending: NotificationJobsCollection
                processed: NotificationJobsCollection
            }
        }
    }

    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.health.commerce.transaction.create': true // Permission to send someone to the lab
            'permissions.health.commerce.transaction.supervise': true // Permission to modify lab transactions
        }
    }

    namespace modernuser.ui.notification {
        interface ClientFrontendEvents {
            'ehealthi-health-commerce-transaction-changed': {
                data: ehealthi.health.commerce.transaction.TransactionRecord
            }
        }
    }

    namespace telep.chat.messaging {
        interface AllMessageMetaTypes {
            /**
             * This refers to the type of message where the doctor asks the patient to take lab tests.
             */
            'ehealthi-health-commerce-transaction': {
                /**
                 * id of the transaction
                 */
                id: ehealthi.health.commerce.transaction.Transaction['id']
            }
        }
    }

}