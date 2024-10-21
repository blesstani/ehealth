/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module (service-provider/inventory), deals with the features, that allow service providers to have inventories of their own,
 * according the system inventory.
 * 
 * Their inventory is simply a list of the commodities they provide (and a subset of the list of possible commodities)
 */

import collections from "../collections.mjs";
import ServiceProviderProfileController from "../profile/controller.mjs";



const controllers = Symbol()

export default class ServiceProviderInventoryController {

    /**
     * 
     * @param {object} _controllers 
     * @param {ServiceProviderProfileController} _controllers.profile
     */
    constructor(_controllers) {
        this[controllers] = _controllers
    }

    /**
     * This method adds items to the collection of the service provider's inventory
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.provider
     * @param {Omit<ehealthi.health.commerce.service_provider.inventory.InventoryItem, "serviceProvider">[]} param0.data
     */
    async add({ userid, provider, data }) {
        await this[controllers].profile.checkAccountAction({ userid, provider });

        data.forEach(item => {
            collections.inventory.updateOne({ serviceProvider: provider, commodity: item.commodity },
                {
                    $set: {
                        serviceProvider: provider,
                        commodity: item.commodity,
                        enabled: Date.now(),
                    }
                },
                { upsert: true }
            ).then(async () => {
                const modernuser = await FacultyPlatform.get().connectionManager.overload.modernuser()
                await modernuser.notification.events.inform({
                    userids: [provider, userid],
                    event: 'ehealthi-health-commerce-service-provider-inventory-new-item',
                    detail: {
                        commodity: item.commodity
                    },
                    options: {
                        aggregation: {
                            sameData: true,
                            timeout: 250
                        },
                    }
                })
            })
        });

        return new JSONRPC.MetaObject({}, {
            rmCache: ['health.commerce.service_provider.inventory']
        })


    }


    /**
     * This method gets items in the inventory of the stated service provider.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.provider
     */
    async getItems({ userid, provider }) {
        provider ||= userid
        return new JSONRPC.MetaObject(
            (await collections.inventory.find({ serviceProvider: provider }).toArray()).map(x => {
                delete x._id
                delete x.serviceProvider
                return x
            }),
            {
                cache: {
                    tag: 'health.commerce.service_provider.inventory.items',
                    expiry: 30 * 60 * 1000
                }
            }
        )
    }

    /**
     * This method tells us if a particular service provider can handle certain commodities
     * @param {object} param0 
     * @param {string[]} param0.commodities
     * @param {string} param0.provider
     */
    async canHandle({ commodities, provider } = {}) {

        return new JSONRPC.MetaObject(
            await (async () => {

                if (!await this[controllers].profile.isServiceProvider({ userid: provider })) {
                    return false
                }
                if (!Array.isArray(commodities)) {
                    throw new Exception(`'commodities', is supposed to be an array of strings.`)
                }
                commodities = [...new Set(commodities)]
                return (
                    await collections.inventory.countDocuments({
                        commodity: {
                            $in: commodities
                        },
                        serviceProvider: provider,
                        enabled: { $exists: true }

                    })
                ) >= commodities.length
            })(),
            {
                cache: {
                    expiry: 10 * 60 * 1000,
                    tag: 'health.commerce.service_provider.inventory.capability'
                },
            }
        )
    }

    /**
     * This method removes an items from the inventory of a service provider.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.provider
     * @param {string} param0.commodity
     */
    async deleteItem({ userid, provider, commodity }) {
        provider ||= userid

        await this[controllers].profile.checkAccountAction({ userid, provider });

        collections.inventory.deleteOne({ commodity, serviceProvider: provider })

        return new JSONRPC.MetaObject({}, {
            rmCache: ['health.commerce.service_provider.inventory']
        })
    }

}