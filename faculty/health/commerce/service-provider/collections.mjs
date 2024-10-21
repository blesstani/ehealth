/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module makes it possible to easily access all database collections necessary for the service-provider module
 */

import { CollectionProxy } from "../../../../system/database/collection-proxy.js";




/**
 * @type {ehealthi.health.commerce.service_provider.Collections}
 */
const collections = new CollectionProxy(
    {
        inventory: 'commerce.service_provider.inventory',
        profiles: 'commerce.service_provider.profiles',

    }
)

export default collections