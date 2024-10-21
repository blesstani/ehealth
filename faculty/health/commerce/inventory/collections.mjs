/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module makes it possible to easily access all database collections necessary for the inventory module to function
 */

import { CollectionProxy } from "../../../../system/database/collection-proxy.js";




/**
 * @type {ehealthi.health.commerce.inventory.Collections}
 */
const collections = new CollectionProxy(
    {
        inventory: 'commerce.inventory',
    }
)

export default collections