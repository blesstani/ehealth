/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The feeds feature
 * This module allows methods related to feeds provision to be available over public RPC.
 */

import FeedsController from "../controller.mjs";


const _controller = Symbol()

export default class FeedsPublicMethods {

    /**
     * 
     * @param {FeedsController} controller 
     */
    constructor(controller) {
        this[_controller] = controller
    }

    async getFeeds() {
        return await this[_controller].getFeeds()
    }


    /**
     * This method returns data about publicly available credentials of a provider
     * @param {object} param0 
     * @param {string} param0.provider
     */
    async getProviderCredentials({ provider } = {}) {
        return new JSONRPC.MetaObject(
            await this[_controller].getProviderCredentials({ provider: arguments[1]?.provider }),
            {
                cache: {
                    expiry: 30_000,
                    tag: 'web-feeds-provider-data'
                },
            }
        )
    }

}