/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions related to managing the profiles of service providers
 */

import { Collection } from "mongodb"

global {
    namespace ehealthi.health.commerce.service_provider.profile {
        interface ServiceProvider {
            userid: string
            created: number
            icon: string
            label: string
            description: string
            address: string
            enabled: boolean
        }

        type Mutable = Pick<ServiceProvider, "icon" | "label" | "address" | "description">


        type ServiceProvidersCollection = Collection<ServiceProvider>


    }
}