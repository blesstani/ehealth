/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module allows access to generalized features by users over the public web
 */

import muser_common from "muser_common";
import FeedsPublicMethods from "../feeds/remote/public.mjs";
import FeedsController from "../feeds/controller.mjs";


/**
 * @type {modernuser.notification.Template}
 */
const SUPPORT_NOTIF_TEMPLATE = {
    label: `Customer Support Request`,
    name: 'ehealthi_customer_support_request',
    fields: {
        en: {
            text: `A customer left a request with the following details:\n\nCustomer Names: {{1}}\n\nContact: {{2}}\n\nMessage:\n{{3}}`,
            html: `A customer left a request with the following details:\n\nCustomer Names: {{1}}\n\nContact: {{2}}\n\nMessage:\n{{3}}`,
            whatsapp: {
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: `A customer left a request with the following details:\n\n*Customer Names*: {{1}}\n\n*Contact*: {{2}}\n\n*Message*:\n{{3}}\n\n.The request was created since: {{4}}.\nPlease, respond promptly.`,
                        example: {
                            body_text: [
                                [
                                    'Jean Paul',
                                    'jeanpaul15@gmail.com',
                                    "I have trouble logging into my account. Please, what do I do?",
                                    "April 7, 2024"
                                ]
                            ]
                        }
                    }
                ]
            }
        }
    }
}


export default class WebPublicMethods extends FacultyPublicMethods {

    /**
     * 
     * @param {object} controllers 
     * @param {FeedsController} controllers.feeds
     */
    constructor(controllers) {
        super();

        this.feeds = new FeedsPublicMethods(controllers.feeds)
    }



    /**
     * This method is called by the frontend, when an annonymous user wants to contact support.
     * @param {object} value 
     * @param {string} value.names
     * @param {string} value.contact
     * @param {string} value.message
     */
    async requestSupport(data) {
        data = arguments[1]

        /** @type {ehealthi.ui.contact_us.customer_support.CustomerSupportContact[]} */
        const entries = await FacultyPlatform.get().settings.get({ namespace: 'widgets', name: 'organization_support_contacts' });

        // Try reaching each of the support contacts
        // Only continue if one of them succeeds
        await Promise.any(entries.map(async entry => {
            await (await FacultyPlatform.get().connectionManager.overload.modernuser()).notification.notify(
                {
                    template: SUPPORT_NOTIF_TEMPLATE.name,
                    contact: entry.contact,
                    data: [
                        data.names || 'NO names',
                        data.contact || 'No contact',
                        data.message || 'Empty message'
                    ],
                    language: 'en',

                }
            )
        }))
    }

    /**
     * This method gets the chat that this user uses to speak with customer support.
     */
    async getCustomerSupportChat() {

        /** @type {string} */
        let defaultChat;

        const userid = (await muser_common.getUser(arguments[0])).id;
        const chatConnection = await connections.chat();

        for await (const item of await chatConnection.management.getUserChats({ userid: userid, type: 'roled' })) {
            if (item.role.data.name == 'hc_eHealthi_customer_support') {
                defaultChat = item.id
            }
        }

        return await chatConnection.management.getChatViewData({
            id: defaultChat ||= await (async () => {
                return await chatConnection.management.createChat({
                    type: 'roled',
                    role: 'hc_eHealthi_customer_support',
                    userid,
                    recipients: [userid],
                    rules: {
                        call: {
                            voice: ['role'],
                            video: ['role']
                        },
                        end: ['any']
                    },
                });
            })(),
            userid
        })

    }

    /**
     * This method tells the user if he's a customer service representative
     */
    async isCustomerServiceAgent() {
        const value = await (await connections.chat()).management.isMemberOfRole({ role: 'hc_eHealthi_customer_support', userid: (await muser_common.getUser(arguments[0])).id });
        return new JSONRPC.MetaObject(value, {
            cache: {
                expiry: value ? 30 * 60 * 1000 : 18 * 60 * 1000,
                tag: 'eHealthi.web.customerService.agentState',
            }
        })
    }

    /**
     * This method makes a particular user a customer service agent
     * @param {object} param0 
     * @param {string} param0.accountId
     */
    async makeUserAnAgent({ accountId }) {
        accountId = arguments[1]?.accountId

        await muser_common.whitelisted_permission_check({
            userid: (await muser_common.getUser(arguments[0])).id,
            permissions: ['permissions.web.customerService.manage'],
        });


        await (await connections.chat()).management.addUserToRole({
            role: 'hc_eHealthi_customer_support',
            member: accountId
        });

        const profile = await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.get_profile({ id: accountId })

        delete profile.meta
        delete profile.temporal

        return profile
    }


    /**
     * This method removes someone as a customer service agent
     * @param {object} param0 
     * @param {string} param0.accountId
     */
    async removeAgent({ accountId }) {
        accountId = arguments[1]?.accountId

        return await (await connections.chat()).management.removeUserFromRole({
            role: 'hc_eHealthi_customer_support',
            member: accountId
        })
    }

    static async init() {
        await (await connections.modernuser()).notification.createTemplate(SUPPORT_NOTIF_TEMPLATE);

        await (await connections.chat()).management.createChatRole({
            label: `Customer Support`,
            name: 'hc_eHealthi_customer_support',
        });
    }

}

const connections = FacultyPlatform.get().connectionManager.overload;