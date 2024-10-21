/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module makes it easy to access database records concerned with transactions of lab tests
 */

import { CollectionProxy } from "../../../../system/database/collection-proxy.js";


/**
 * @type {{pending: ehealthi.health.commerce.transaction.TransactionsCollection, ready: ehealthi.health.commerce.transaction.TransactionsCollection, archive: ehealthi.health.commerce.transaction.TransactionsCollection}}
 */
const collections = new CollectionProxy({
    'pending': 'commerce.transactions.pending',
    'ready': 'commerce.transactions.ready',
    'archive': 'commerce.transactions.archive',
})

export default collections