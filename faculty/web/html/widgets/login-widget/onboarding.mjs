/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (onboarding), is part of the custom login-widget, and allows
 * a user to setup his profile
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";
/**
 * This widget allows a user to set up his profile 
 * @extends Widget<Onboarding>
 */
export default class Onboarding extends Widget {


    constructor() {

        super();

        super.html = hc.spawn({
            classes: Onboarding.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title'>Setup Account</div>
                    <div class='form'></div>
                    <div class='action'></div>
                </div>
            `
        });

        /** @type {MultiFlexForm} */ this.form
        this.widgetProperty(
            {
                selector: ['', ...MultiFlexForm.classList].join('.'),
                parentSelector: '.container >.form',
                property: 'form',
                childType: 'widget',
                onchange: () => {

                    this.form.quickStructure = [
                        [
                            {
                                label: `Names`,
                                name: 'label'
                            }
                        ],
                        [
                            {
                                label: `Photo`,
                                name: 'icon',
                                type: 'uniqueFileUpload',
                                url: '/$/uniqueFileUpload/upload'
                            }
                        ],
                        // [
                        //     {
                        //         name: 'contacts',
                        //         label: `How do we contact you?`,
                        //         type: 'customWidget',
                        //         customWidgetUrl: `/$/modernuser/notification/static/widgets/contact-input/widget.mjs`
                        //     }
                        // ],

                        [
                            {
                                name: 'roleRequest',
                                type: 'customWidget',
                                customWidgetUrl: new URL('../role-input/widget.mjs', import.meta.url).href,
                            }
                        ]
                    ]
                }
            }
        );
        /** @type {(event: "complete", cb: (event: CustomEvent)=> void, options: AddEventListenerOptions )=> void} */ this.addEventListener

        this.form = new MultiFlexForm();

        /** @type {ActionButton} */ this.action
        this.widgetProperty(
            {
                selector: ['', ...ActionButton.classList].join('.'),
                parentSelector: '.container >.action',
                property: 'action',
                childType: 'widget'
            }
        );
        this.action = new ActionButton(
            {
                content: `Update Account`,
                onclick: async () => {
                    this.action.loadWhilePromise(
                        (async () => {
                            await hcRpc.modernuser.onboarding.onboard(this.value)
                            setTimeout(() => this.action.state = 'success', 100)
                            setTimeout(() => {
                                if (this.action.state === 'success') {
                                    this.action.state = 'initial'
                                }
                            }, 5000);
                            this.dispatchEvent(new CustomEvent('complete'))
                        })()
                    ).catch(e => handle(e))
                }
            }
        )


    }

    /**
     * @returns {{profile: modernuser.profile.MutableUserProfileData, roles: modernuser.onboarding.OnboardingInputData['roles']}}
     */
    get value() {
        return {
            profile: {
                icon: this.form.value.icon,
                label: this.form.value.label,
            },
            // That's, whatever role the user is requesting for, is for to be granted
            // for the level of the root zone (0)
            roles: [...this.form.value.roleRequest].map(x => ({ role: x, zone: '0' })),
            // Just to get passed the notification input checks at the backend
            notification: []
        }
    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-onboarding'];
    }
}