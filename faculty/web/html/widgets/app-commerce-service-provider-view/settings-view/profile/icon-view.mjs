/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (icon-view), allows a service provider to view, and manage his profile icon
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export default class IconView extends Widget {
    /**
     * 
     * @param {string} value 
     */
    constructor(value) {
        super();

        super.html = hc.spawn({
            classes: IconView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='icon'></div>
                    <div class='actions'>
                        <div class='edit'></div>
                    </div>
                </div>
            `
        });

        this.html.$(':scope >.container >.actions >.edit').appendChild(
            new ActionButton({
                content: `Edit`,
                onclick: async () => {
                    const popup = new PopupForm(
                        {
                            title: `Update logo`,
                            caption: `Upload an image of <5MB in size.`,
                            form: [
                                [
                                    {
                                        label: `Icon`,
                                        name: 'icon',
                                        type: 'uniqueFileUpload',
                                        url: '/$/uniqueFileUpload/upload',
                                        value
                                    }
                                ]
                            ],
                            execute: async (form) => {
                                const nwIcon = form.value.icon;
                                await hcRpc.health.commerce.service_provider.profile.updateProfile({
                                    data: {
                                        icon: nwIcon
                                    }
                                });

                                this.value = nwIcon;
                                setTimeout(() => form.hide(), 1000);

                                this.dispatchEvent(new CustomEvent('change'));
                            },
                            positive: `Update`,
                            negative: `Cancel`
                        }
                    );
                    popup.waitTillDOMAttached().then(() => popup.value = { icon: this.value })
                    popup.show()
                },
                hoverAnimate: false
            }).html
        );

        /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=> void} */ this.addEventListener

        let value0 = value

        /** @type {string} */ this.value
        this[
            this.defineImageProperty({
                selector: ':scope >.container >.icon',
                property: 'value',
                mode: 'inline'
            })
        ] = value0

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-settings-profile-icon']

}