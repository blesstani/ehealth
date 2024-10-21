/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * This module provides basic structure to feeds providers
 */

import { BaseModel } from "../../../../system/lib/libFaculty/provider-driver.mjs";

export default class FeedsProviderModel extends BaseModel {

    constructor() {
        super()

    }


    init() {
        super.init()
    }


    /**
     * This method is called by the system when it wants to retrieve feeds
     * @param {object} param0 
     * @param {number} param0.limit
     * @returns {AsyncGenerator<any, undefined, any>}
     */
    async* fetch({ limit }) {
    }

    /**
     * This field should be overriden to declare the fields that must be present in credentials supplied to the provider
     */
    static get credential_fields() {

    }

    /**
     * This optional field denotes the fields in the credentials that are allowed to be passed to the public frontend client.
     */
    static get client_credential_fields() {

    }

}