/**
 * Copyright 2023 HolyCorn Software
 * The Tele-Epilepsy Project
 * This widget (edit) allows a user to edit on of his contacts. 
 * It is part of the manage-my-contacts widget.
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


/**
 * @extends PopupForm<modernuser.notification.ContactExtra>
 */
export default class EditContact extends PopupForm {

    /**
     * 
     * @param {modernuser.notification.ContactExtra} data 
     */
    constructor(data) {
        super(
            {
                title: `Edit Contact`,
                caption: ``,
                positive: 'Update',
                negative: 'Cancel',
                execute: async () => {
                    Object.assign(this.data, await hcRpc.modernuser.notification.updateContact({ id: this.data.id, data: this.value }))
                }
            }
        )

        super.html.classList.add(...EditContact.classList);

        this.data = data;

        this.load()

    }

    async load() {
        return await this.blockWithAction(async () => {
            this.form = (await getPlugins()).find(pl => pl.name == this.data.provider).contactForm
            setTimeout(() => this.value = this.data?.data, 1200)
        })
    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-telep-manage-my-contacts-item-actions-edit']
    }

}


/** @type {ReturnType<hcRpc['modernuser']['notification']['getProviders']>} */
let plugins
async function getPlugins() {
    return plugins ||= await hcRpc.modernuser.notification.getProviders()
}


