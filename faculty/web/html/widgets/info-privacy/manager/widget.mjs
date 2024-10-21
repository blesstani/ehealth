/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget allows an admin to set the privacy policy of the system
 */


import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";



export default class SetPrivayPolicy extends Widget {

    constructor() {
        super()
        this.html = hc.spawn(
            {
                classes: SetPrivayPolicy.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='title'>Privacy Policy</div>
                        <div class='form'></div>
                        <div class='action'></div>
                    </div>
                `
            }
        );

        const form = new MultiFlexForm()
        this.html.$('.container >.form').appendChild(form.html)

        form.quickStructure = [

            [
                {
                    label: `Content`,
                    name: 'content',
                    type: 'textarea'
                }
            ]
        ];

        let resetButtonStateTimeout;
        const button = new ActionButton(
            {
                content: `Update`,
                onclick: async () => {
                    button.loadWhilePromise(
                        (async () => {
                            clearTimeout(resetButtonStateTimeout)
                            await hcRpc.engTerminal.faculty.settings.set('web', { name: 'privacy_policy', namespace: 'widgets', value: form.value });
                            setTimeout(() => button.state = 'success', 100)
                            resetButtonStateTimeout = setTimeout(() => {
                                if (button.state == 'success') {
                                    button.state = 'initial'
                                }
                            })
                        })()
                    )
                }
            }
        );

        this.html.$('.container >.action').appendChild(button.html)


        this.blockWithAction(
            async () => {
                form.values = (await hcRpc.system.settings.get({ faculty: 'web', namespace: 'widgets', name: 'community_info' })) || {}
            }
        )

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-set-community-link']
    }

}