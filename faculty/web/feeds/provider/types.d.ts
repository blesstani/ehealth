/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * This module contains type definitions for the feeds feature, that are particularly related to providers
 */


import { Collection } from "mongodb"

global {
    namespace telep.web.feeds.providers {
        interface Credential {
            name: string
            data: object
        }

        type CredentialsCollection = Collection<Credential>

    }
}