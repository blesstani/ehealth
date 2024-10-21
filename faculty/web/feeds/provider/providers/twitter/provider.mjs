/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * This module is part of the feeds feature, and allows feeds to be pulled from Twitter
 */

import FeedsProviderModel from "../../model.mjs";

import { Client } from 'twitter-api-sdk'

const client = Symbol()


export default class TwitterFeedsProvider extends FeedsProviderModel {


    constructor() {
        super()

    }

    async init() {
        this[client] = new Client(this.$data.credentials.bearerToken)
    }

    /**
     * This method fetches feeds from Twitter
     * @param {object} param0 
     * @param {number} param0.limit
     */
    async* fetch({ limit } = {}) {

        if (this.$data.credentials.static_post_id) {
            for (let i = 0; i < Math.min(limit, 3); i++) {
                yield { id: this.$data.credentials.static_post_id }
                await new Promise(x => setTimeout(x, Math.random() * 100))
            }
            return
        }

        const data = await this[client].tweets.usersIdTweets(this.$data.credentials.src_username, {
            max_results: limit
        })


        for await (const tweet of data.data) {
            yield { id: tweet.id }

        }

    }

    static get credential_fields() {
        return ['bearerToken', 'src_username']
    }

    static get client_credential_fields() {
        return []
    }

}