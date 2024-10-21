/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The feeds feature
 * This provider allows the system to pull data from Facebook
 */

import FeedsProviderModel from "../../model.mjs";



export default class FacebookFeedsProvider extends FeedsProviderModel {


    init() {

    }

    async* fetch({ limit } = {}) {
        const results = await fetch(
            `https://graph.facebook.com/v19.0/${this.$data.credentials.pageID}/feed`,
            {
                headers: {
                    Authorization: `Bearer ${this.$data.credentials.pageAccessToken}`
                }
            }
        );

        const body = await results.json()

        if ((results.status > 299) || (body.error)) {
            console.warn(`Could not get feeds from Facebook\n`, body.error || body)
            throw new Exception(`Error contacting Facebook`)
        }

        for (let i = 0; i < Math.min(body.data.length, limit || 10); i++) {
            yield { id: body.data[i].id }
        }

    }

    static client_credential_fields = ["pageID"]
    static credential_fields = ["pageAccessToken", "pageID"]



}