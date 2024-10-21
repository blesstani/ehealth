/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The feed feature
 * This module allows easy access to the database collections related to feed providers
 */

import { CollectionProxy } from "../../../../system/database/collection-proxy.js";



/**
 * @type {telep.web.feeds.Collections}
 */
export const collections = new CollectionProxy(
    {
        "credentials": "feeds.providers.credentials"
    }
)