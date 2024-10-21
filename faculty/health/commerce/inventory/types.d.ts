/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains type definitions that deal with how data about commodities are stored.
 */


import { Collection } from "mongodb"

global {
    namespace ehealthi.health.commerce.inventory {
        interface Commodity {
            label: string
            description: string
            price: finance.Amount
            commission: number

        }

        interface CommodityDatabaseInfo extends Commodity {
            id: string
            created: number
        }

        type InventoryCollection = Collection<CommodityDatabaseInfo>

        interface Collections {
            inventory: InventoryCollection
        }
    }

    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.health.commerce.inventory.modify': true
        }
    }
}