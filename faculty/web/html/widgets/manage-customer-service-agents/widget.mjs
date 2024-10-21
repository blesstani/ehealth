/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget allows an authorized personel to determine which account becomes a service provider
 */


import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import UserAndRoleInput from "/$/modernuser/static/widgets/user-n-role-input/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import DualSwitch from "/$/system/static/html-hc/widgets/dual-switch/switch.mjs";
import ListDataManager from "/$/system/static/html-hc/widgets/list-data-manager/widget.mjs";



/**
 * @type {ListDataManager<ehealthi.health.commerce.service_provider.profile.ServiceProvider>}
 */
export default class ServiceProviderApprovalsManager extends ListDataManager {

    constructor() {
        super(
            {
                title: `Customer Service Agents`,
                config: {
                    fetch: async () => {
                        return await hcRpc.chat.management.getRoleMembers({ role: 'hc_eHealthi_customer_support' })
                    },
                    display: [
                        {
                            name: 'userid',
                            label: `Account`,
                            view: (input, data) => new InlineUserProfile(data.$profile).html
                        },
                    ],
                    create: (input) => Promise.all(
                        input.map(
                            async x => ({ ...await hcRpc.web.makeUserAnAgent({ accountId: x.userid }), userid: x.userid })
                        )
                    ),
                    input: [
                        [
                            {
                                label: 'Account',
                                name: 'userid',
                                type: 'customWidget',
                                customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                                valueProperty: 'idOnly',
                                mode: 'user',
                            }
                        ],
                    ],
                    delete: (input) => Promise.all(input.map(x => hcRpc.web.removeAgent({ accountId: x.userid }))),
                }
            }
        )
    }

}