/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module (profile), deals with the features that allow us to manage profiles of service providers, as well as decide who becomes a service provider
 * These profiles contain additional info aside those found on the user profile.
 * For example, service centers, frequently asked questions
 */

import muser_common from "muser_common";
import collections from "../collections.mjs";

export default class ServiceProviderProfileController {


    static async permissionCheck({ userid }) {
        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.service_provider.manage'],
        })
    }


    /**
     * This method makes an account become a service provider account
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.accountId The account we want to make a service provider
     */
    async add({ userid, accountId }) {
        await ServiceProviderProfileController.permissionCheck({ userid })
        soulUtils.checkArgs(accountId, 'string', 'accountId')
        const profile = await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.get_profile({ id: accountId });
        delete profile.id
        delete profile.time
        await collections.profiles.updateOne(
            {
                userid: accountId
            },
            {
                $setOnInsert: {
                    created: Date.now(),
                },
                $set: {
                    enabled: true
                }
            },
            { upsert: true }
        )

        return {
            $profile: profile
        }
    }

    /**
     * This method removes a service provider's account profile
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.accountId
     */
    async remove({ userid, accountId }) {
        await ServiceProviderProfileController.permissionCheck({ userid })
        await collections.profiles.deleteOne({ userid: accountId })
        soulUtils.checkArgs(accountId, 'string', 'accountId')
    }

    /**
     * This method enables/disables a service provider's account
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.accountId
     * @param {boolean} param0.state
     */
    async toggleState({ userid, accountId, state }) {
        await ServiceProviderProfileController.permissionCheck({ userid })
        soulUtils.checkArgs(accountId, 'string', 'accountId')
        await collections.profiles.updateOne({ userid: accountId }, { $set: { enabled: !!state } })
    }

    async *getServiceProviders({ userid }) {
        for await (const item of collections.profiles.find()) {
            const data = await touchProfile(item);

            yield data

        }
    }

    /**
     * This method checks if a service provider's account is active, and that the given userid can make changes to the given provider.
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.provider
     */
    async checkAccountAction({ userid, provider }) {

        await muser_common.whitelisted_permission_check({
            userid,
            permissions: ['permissions.health.commerce.service_provider.manage'],
            whitelist: [provider]
        });

        const profile = await collections.profiles.findOne({ userid: provider })

        if (!profile) {
            throw new Exception(`Sorry, the account of service provider was not found.`)
        }

        if (!(profile.enabled ?? true)) {
            throw new Exception(`Sorry, this service provider account is still disabled.`)
        }

    }

    /**
     * This method checks if a given user is a service provider
     * @param {object} param0 
     * @param {string} param0.userid
     */
    async isServiceProvider({ userid }) {
        const isProvider = (await collections.profiles.countDocuments({ userid })) > 0
        return new JSONRPC.MetaObject(isProvider, {
            cache: {
                tag: 'health.commerce.service_provider.isProvider',
                expiry:
                    // It's hard for someone to suddenly not become a service provider, so let's cache this well
                    isProvider ? 1.5 * 60 * 60 * 100 // 1.5 hrs
                        // On the contrary, if someone is not a service provider, he might become one, and when he does, we don't want the cache to hold him back too long
                        : 10 * 60 * 1000, // 10 mins
            }
        })
    }

    /**
     * This method gets the profile of a particular service provider
     * @param {object} param0 
     * @param {string} param0.provider
     * @param {string} param0.userid
     * @returns {Promise<ehealthi.health.commerce.service_provider.profile.ServiceProvider & {$profile: modernuser.profile.UserProfileData}>}
     */
    async getProvider({ provider, userid }) {
        return new JSONRPC.MetaObject(
            await touchProfile(
                (
                    (x) => {
                        if (!x) throw new Exception(`The laboratory you are looking for, was not found.`)
                        return x
                    }
                )(await collections.profiles.findOne({ userid: provider || userid }))
            ),
            {
                cache: {
                    expiry: 30 * 60 * 1000,
                    tag: 'health.commerce.service_provider.single_profile'
                }
            }
        )
    }

    /**
     * This method is used by a service provider to update his profile
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.provider
     * @param {ehealthi.health.commerce.service_provider.profile.Mutable} param0.data
     */
    async updateProfile({ userid, provider, data }) {
        const id = provider || userid;

        const providerData = await this.getProvider({ provider: id })

        await muser_common.whitelisted_permission_check({
            userid,
            whitelist: [providerData.userid],
            permissions: ['permissions.health.commerce.service_provider.manage']
        });

        /** @type {ehealthi.health.commerce.service_provider.profile.Mutable} */
        const final = {}

        soulUtils.checkArgs(data, { address: 'string', label: 'string', icon: 'string', description: 'string' }, 'data', undefined, ['definite'])

        /** @type {(keyof (typeof final))[]} */
        const keys = ['address', 'label', 'icon', 'description']

        for (const key of keys) {
            if (typeof data[key] != 'undefined') {
                final[key] = data[key]
            }
        }

        await collections.profiles.updateOne({ userid: id }, {
            $set: {
                ...final
            }
        })

        return new JSONRPC.MetaObject(
            {},
            {
                rmCache: ['health.commerce.service_provider.single_profile']
            }
        )
    }

}

/**
 * 
 * @param {ehealthi.health.commerce.service_provider.profile.ServiceProvider} item 
 * @returns 
 */
async function touchProfile(item) {
    const data = {
        ...item,
        $profile: await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.get_profile({ id: item.userid })
    };
    delete data._id;
    delete data.$profile.id;
    delete data.$profile.time;
    return data;
}
