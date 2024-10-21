/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The Web Faculty
 * This module allows content to be pulled from social media and displayed on the app
 */

import { ProviderLoader } from "../../../system/lib/libFaculty/provider-driver.mjs";
import collections from "./collections.mjs";
import FeedsProviderModel from "./provider/model.mjs";

const providers = Symbol()


export default class FeedsController {


    constructor() {

        /** @type {FeedsProviderModel[]} */
        this[providers] = []

        this.init()

    }

    async init() {
        const loader = new ProviderLoader({
            fileStructure: [
                "./provider.mjs",
                "public/widget.mjs"
            ],
            credentials_collection: collections.providers.credentials,
            model: "./provider/model.mjs",
            providers: "./provider/providers/",
            relModulePath: "./provider.mjs"
        })

        const results = await loader.load()

        this[providers] = results.providers

        for (const error of results.errors || []) {
            console.error(error)
        }

        const http = await HTTPServer.new()

        const strict = new StrictFileServer(
            {
                http,
                urlPath: `/`,
                refFolder: './provider/providers/',
            },
            import.meta.url
        )

        await FacultyPlatform.get().base.shortcutMethods.http.claim(
            {
                remotePath: `${FacultyPlatform.get().standard.httpPath}feeds/providers/`,
                localPath: '/',
                http
            }
        )

        for (const provider of loader.providerNamesNonLoaded) {
            strict.add(`./provider/providers/${provider}/public/`)

        }
    }


    /**
     * This method returns data about publicly available credentials of a provider
     * @param {object} param0 
     * @param {string} param0.provider
     */
    async getProviderCredentials({ provider } = {}) {
        const obj = this[providers].find(x => x.$data.name == provider)
        if (!obj) {
            throw new Exception(`The system doesn't know any provider of social media feeds called '${provider}'`)
        }
        const results = {}
        for (const field of obj.$data.class.client_credential_fields) {
            results[field] = obj.$data.credentials[field]
        }
        return results

    }

    /**
     * This method returns data about feeds that's to be populated on the UI
     * @returns {AsyncGenerator<telep.web.feeds.Feed, void, unknown>}
     */
    async* getFeeds() {
        const promises = [
            (async function* () {
                // Fetch feeds that were designated by the admin, to be featured
                for (const item of (await FacultyPlatform.get().settings.get({ name: 'social_media_feeds', namespace: 'widgets' })) || []) {
                    yield {
                        feedData: {
                            href: item.href
                        },
                        provider: item.provider
                    }
                }
            })(),
            ...this[providers].map(provider => provider.fetch({ limit: 10 }))
        ]

        let status = promises.map(() => false)

        function done() {
            return status.every(x => x);
        }

        const accumulator = []

        while (!done()) {
            const curr = promises.map((promise, index) => {

                // At this point, we need the first provider that would return a non-null value
                // If none is found, we would wait till others are done
                return new Promise((resolve, reject) => {

                    Promise.resolve(
                        // Just in case the provider used a regular generator, instead of an async generator.
                        promise.next?.() || promise
                    ).then(next => {
                        // Once the value is available, let's update the status
                        status[index] = next.done
                        if (next.value) {
                            // And of course, we want the promise to resolve if this is the first available value
                            accumulator.push({ data: next.value.feedData || next.value, provider: this[providers][index - 1]?.$data?.name || next.value.provider }) // But whether or not it is the first value, let's store that in the accumulator
                            resolve()
                        }
                        // But again, if that was no first available value, and the providers are done producing values, let's just break continue
                        if (done()) {
                            resolve()
                        }
                    })
                })
            })

            await Promise.race(curr)

            // Yield the values that we've been getting from the providers
            // Perhaps by this time, other providers would have returned something
            while (accumulator.length > 0) {
                yield accumulator.shift()
            }

        }

    }


}