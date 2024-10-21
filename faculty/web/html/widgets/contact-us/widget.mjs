/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget (contact-us) allows a user to leave a message to the business
 */

import FilledButton from "/$/shared/static/widgets/filled-button/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";


/**
 * @extends Widget<ContactUs>
 */
export default class ContactUs extends Widget {

    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: ContactUs.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='image'></div>
                            <div class='form'>
                                <img src='/$/shared/static/logo.png' class='logo'>
                                <div class='title'>Contact Us</div>
                                <div class='form'></div>
                                <div class='action'></div>
                                <div class='social-media'></div>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {MultiFlexForm} */ this.form
        this.widgetProperty(
            {
                selector: ['', ...MultiFlexForm.classList].join('.'),
                parentSelector: '.container >.main >.form >.form',
                property: 'form',
                childType: 'widget'
            }
        );
        this.form = new MultiFlexForm()

        this.form.quickStructure = [
            [
                {
                    label: `Names`,
                    name: 'names',
                    type: 'text'
                }
            ],
            [
                {
                    label: `Email / WhatsApp`,
                    name: 'contact',
                    type: 'text'
                }
            ],
            [
                {
                    label: `Leave a Message`,
                    name: 'message',
                    type: 'textarea'
                }
            ]
        ]

        /** @type {FilledButton} */ this.action
        this.widgetProperty(
            {
                selector: ['', ...FilledButton.classList].join('.'),
                parentSelector: '.container >.main >.form >.action',
                childType: 'widget',
                property: 'action'
            }
        );
        this.action = new FilledButton({
            content: `Contact Us`,
            onclick: async () => {
                try {
                    await hcRpc.web.requestSupport(this.form.value)
                    setTimeout(() => this.form.values = {}, 2000)
                    this.action.state = 'success'
                } catch (e) {
                    handle(e)
                }
            }
        });

        /** @type {ehealthi.ui.contact_us.SocialContact[]} */ this.social
        this.pluralWidgetProperty({
            parentSelector: '.container >.main >.form >.social-media',
            selector: '.social',
            property: 'social',
            transforms: {
                set: (input) => {
                    return hc.spawn(
                        {
                            tag: 'a',
                            classes: ['social'],
                            attributes: {
                                href: input.href,
                                target: '_blank'
                            },
                            innerHTML: `
                                <img src='${input.icon}'>
                            `
                        }
                    )
                },
                get: html => {
                    return {
                        href: html.getAttribute('href'),
                        icon: html.querySelector('img')?.getAttribute('src')
                    }
                }
            }
        });


        this.social = [
            {
                icon: new URL('./facebook.svg', import.meta.url).href,
                href: '#'
            },
            {
                icon: new URL('./whatsapp.svg', import.meta.url).href,
                href: '#'
            },
            {
                icon: new URL('./email.svg', import.meta.url).href,
                href: '#'
            },
        ];

        this.blockWithAction(async () => {
            this.social = (await hcRpc.system.settings.get({ faculty: 'web', name: 'organization_contacts', namespace: 'widgets' })) || []
        })



    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-contact-us']
    }

}