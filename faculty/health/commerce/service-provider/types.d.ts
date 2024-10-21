/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions for the service-provider module
 */

import { Collection } from "mongodb"


global {
    namespace ehealthi.health.commerce.service_provider {



        interface Collections {
            profiles: profile.ServiceProvidersCollection
            inventory: inventory.InventoryCollection
        }

    }

    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.health.commerce.service_provider.manage': true
        }
    }
}