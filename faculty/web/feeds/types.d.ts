/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * This module contains type definitions for the feeds feature
 */


import { Collection } from "mongodb"

global {
    namespace telep.web.feeds {

        interface Collections {
            credentials: telep.web.feeds.providers.CredentialsCollection
        }

        interface Feed {
            data: object
            provider: string
        }

    }
}