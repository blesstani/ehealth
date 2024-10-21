/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This part of the commerce controller, that deals with data about the commodities that can be purchased.
 */

import muser_common from "muser_common";
import collections from "./collections.mjs";
import shortUUID from "short-uuid";




export default class InventoryController {


    constructor() {
    }

    static async permissionCheck({ userid }) {
        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.inventory.modify'],
        })
    }

    /**
     * This method returns a complete list of the system's inventory.
     * @param {object} param0 
     * @param {string} param0.userid
     */
    async *getInventory({ userid }) {

        for await (const item of collections.inventory.find({})) {
            delete item._id
            yield item
        }

    }

    /**
     * This method searches for an item in the inventory
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.filter
     */
    async *search({ userid, filter }) {
        const regexp = new RegExp(filter.replaceAll(/[^a-zA-Z0-9]/gi, '.*'))
        for await (const item of collections.inventory.find({ $or: [{ label: { $regex: regexp } }, { description: { $regex: regexp } }] }, 'gi')) {
            delete item._id
            yield item
        }
    }

    /**
     * This method fetches a single item from the inventory collection
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     */
    async getItem({ userid, id }) {
        const data = await collections.inventory.findOne({ id })
        delete data._id
        return data
    }

    /**
     * This method gets the system's inventory as an array.
     * This is mainly to aid caching.
     * @returns 
     */
    async getInventoryDirect() {
        const stream = await this.getInventory({})
        const array = []

        for await (const item of stream) {
            array.push(item)
        }

        return new JSONRPC.MetaObject(array, {
            cache: {
                expiry: 45 * 60 * 1000,
                tag: 'health.commerce.inventory'
            },
        })

    }


    /**
     * This method adds a commodity to the system's inventory list.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {ehealthi.health.commerce.inventory.Commodity} param0.data
     */
    async addItem({ userid, data }) {

        await InventoryController.permissionCheck({ userid })

        soulUtils.checkArgs(data, {
            commission: 'number',
            description: 'string',
            label: 'string',
            price: {
                value: 'number',
                currency: 'string'
            }
        }, 'data', undefined, ['exclusive'])


        const id = shortUUID.generate();

        await collections.inventory.insertOne({
            id,
            ...data,
            created: Date.now(),
        })

        return id
    }


    /**
     * This method is used to modify an item in the inventory
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     * @param {ehealthi.health.commerce.inventory.Commodity} param0.data
     */
    async modifyItem({ userid, id, data }) {

        await InventoryController.permissionCheck({ userid })

        soulUtils.checkArgs(data, {
            commission: 'number',
            description: 'string',
            label: 'string',
            price: {
                value: 'number',
                currency: 'string'
            }
        }, 'data', undefined, ['definite', 'exclusive'])

        await collections.inventory.updateOne({ id }, { $set: { ...data } })

    }

    /**
     * This method deletes an item in the inventory.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     */
    async deleteItem({ userid, id }) {
        // TODO: Inform other components that this item is being deleted
        // TODO: Implement refund for transactions, in case of deletion (at the level of the transaction module)
    }



}