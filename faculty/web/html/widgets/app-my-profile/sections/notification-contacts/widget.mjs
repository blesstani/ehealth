/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, allows a user to manage the contact via which he receives notifications.
 */

import EditContact from "./edit.mjs";
import NewContact from "./new.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


/**
 * @extends Widget<NotificationContactsSection>
 */
export default class NotificationContactsSection extends Widget {

    constructor() {

        super();

        this.html = hc.spawn(
            {
                classes: NotificationContactsSection.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='items'></div>
                        <div class='bottom'>
                            <div class='btn-add-contact'>New Contact</div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {modernuser.notification.ContactExtra[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...NotificationContact.classList].join('.'),
                parentSelector: '.container >.items',
                property: 'items',
                transforms: {
                    set: (data) => {
                        const widget = new NotificationContact(data);
                        widget.addEventListener('delete', () => {
                            this.items = this.items.filter(x => x.id !== data.id)
                        })
                        return widget.html
                    },
                    /** @param {htmlhc.lib.widget.ExtendedHTML<NotificationContact>} html */
                    get: (html) => html.widgetObject?.statedata.$0data?.data
                }
            }
        );

        this.html.$('.container >.bottom >.btn-add-contact').addEventListener('click', () => {
            const popup = new NewContact()
            popup.show()
            popup.addEventListener('complete', () => {
                load()
            })
        })


        const load = () => this.blockWithAction(async () => this.items = await hcRpc.modernuser.notification.getContacts())

        load()

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-notification-contacts']
    }

}

let providers;
let callPromise;

/**
 * @type {DelayedAction<[], ReturnType<hcRpc['modernuser']['notification']['getProviders']>>}
 */
const getProviders = new DelayedAction(
    async () => {
        if (callPromise) {
            return await callPromise
        }
        if (providers) {
            return providers
        }
        try {
            let providers = await (callPromise = hcRpc.modernuser.notification.getProviders())
            return providers
        } finally {
            callPromise = undefined
        }
    }
)



class NotificationContact extends Widget {
    /**
     * 
     * @param {modernuser.notification.ContactExtra} data 
     */
    constructor(data) {
        super();
        this.html = hc.spawn(
            {
                classes: NotificationContact.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='icon'></div>
                            <div class='details'>
                                <div class='provider-label'></div>
                                <div class='contact-label'></div>
                                <div class='actions'></div>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {htmlhc.lib.alarm.AlarmObject<{data: modernuser.notification.ContactExtra}>} */ this.statedata = new AlarmObject()

        this.statedata.data = {}

        const icon = Symbol()
        this.defineImageProperty(
            {
                selector: '.container >.main >.icon',
                property: icon,
                mode: 'inline',
            }
        );

        /** @type {(event: "delete", cb: (event: CustomEvent)=> void, opts: AddEventListenerOptions))} */ this.addEventListener

        this.statedata.$0.addEventListener('change', new DelayedAction(async () => {
            if (this.statedata.data.caption) {
                this.html.$('.container >.main >.details >.contact-label').innerHTML = this.statedata.data.caption.html || this.statedata.data.caption.text
            }
            if (this.statedata.data.provider) {
                this.html.$('.container >.main >.details >.provider-label').innerHTML = (await getProviders()).find(x => x.name == this.statedata.data.provider)?.label || this.statedata.data.provider
                this[icon] = `/$/modernuser/$plugins/${this.statedata.data.provider}/@public/icon.png`
            }

        }, 250, 2000));

        const btnDel = new ActionButton(
            {
                content: `Delete`,
                onclick: async () => {
                    new BrandedBinaryPopup(
                        {
                            title: `Delete`,
                            question: `Do you really want to delete this contact?<br>\nYou won't receive notifications via this contact anymore.`,
                            positive: `Delete`,
                            negative: `No`,
                            execute: async () => {
                                await hcRpc.modernuser.notification.deleteContact({ id: data.id })
                                this.dispatchEvent(new CustomEvent('delete'))
                            }
                        }
                    ).show()
                }
            }
        );

        const btnEdit = new ActionButton(
            {
                content: `Edit`,
                onclick: async () => {
                    new EditContact(this.statedata.data).show()
                }
            }
        );

        this.html.$('.container >.main >.details >.actions').appendChild(btnEdit.html)
        this.html.$('.container >.main >.details >.actions').appendChild(btnDel.html)

        this.blockWithAction(getProviders)

        Object.assign(this.statedata.data, data)
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-notification-contacts-item']
    }
}