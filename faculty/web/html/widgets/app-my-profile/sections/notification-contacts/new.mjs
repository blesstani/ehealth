/**
 * Copyright 2023 HolyCorn Software
 * The Tele-Epilepsy Project
 * This widget (new), is part of the manage-my-contacts widget.
 * This widget allows the user to create a new contact
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import BackForth from "/$/system/static/html-hc/widgets/back-forth/widget.mjs";
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import FileExplorer from "/$/system/static/html-hc/widgets/file-explorer/widget.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";


export default class NewContact extends HCTSBrandedPopup {

    constructor() {
        super()

        const content = new Content();
        this.content = content.html;
        content.addEventListener('complete', () => {
            setTimeout(() => this.hide(), 600)
            this.dispatchEvent(new CustomEvent('complete'))
        })
        /** @type {(event: "complete", cb: (ev: CustomEvent)=> void, opts: AddEventListenerOptions)} */ this.addEventListener

    }
    get data() {
        return this.content.widgetObject.value
    }

}


/**
 * @extends Widget<Content>
 */
class Content extends Widget {

    constructor() {
        super()
        super.html = hc.spawn(
            {
                classes: Content.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='backforth'></div>
                    </div>
                `
            }
        );

        /** @type {BackForth} */ this.main
        this.widgetProperty(
            {
                selector: ['', ...BackForth.classList].join('.'),
                parentSelector: '.container >.backforth',
                property: 'main',
                childType: 'widget',
            }
        );

        const selectView = new SelectContactType();
        this.main = new BackForth(
            {
                view: selectView.html,
                title: `Type of Contact`,
            }
        );

        this.main.canQuit = true

        /** @type {(event: "complete", cb: (ev: CustomEvent)=> void, opts: AddEventListenerOptions)} */ this.addEventListener

        const input = new InputContactData()
        selectView.addEventListener('complete', () => {
            input.provider = selectView.value
            selectView.html.dispatchEvent(new CustomEvent('backforth-goto', {
                /** @type {htmlhc.widget.backforth.ViewData} */
                detail: {
                    view: input.html,
                    title: `Contact Details`,
                },
                bubbles: true
            }))
            input.load()
            input.addEventListener('complete', async () => {
                try {
                    await this.loadWhilePromise(
                        (async () => {
                            const results = await hcRpc.modernuser.notification.createContact({ provider: input.provider, data: input.value })
                            /** @type {modernuser.notification.Contact} */
                            this.value = results
                            this.dispatchEvent(
                                new CustomEvent('complete')
                            )
                        })()
                    )
                } catch (e) {
                    handle(e)
                }
            }, { once: true })
        })



    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-telep-manage-my-contacts-content']
    }

}


class SelectContactType extends FileExplorer {

    constructor() {
        super()

        // This widget allows us to select the notification plugin.
        /** @type {(event: "complete", cb: (ev: CustomEvent)=> void, opts: AddEventListenerOptions)} */ this.addEventListener

        this.blockWithAction(() => this.load())

        this.html.classList.add(...SelectContactType.classList)
    }
    async load() {
        const plugins = await getPlugins()
        this.statedata.items = [
            ...plugins.map(
                plugin => {
                    return {
                        id: `plugin-${plugin.name}`,
                        label: plugin.label,
                        icon: `/$/${plugin.faculty}/$plugins/${plugin.name}/@public/icon.png`,
                        parent: '',
                        navigable: false,
                        onselect: () => {
                            this.value = plugin.name
                            this.dispatchEvent(new CustomEvent('complete'))
                        }
                    }
                }
            ),
            {
                label: ` `,
                id: '',
            }
        ]
    }
    /** @readonly */
    static get classList() {
        return ['hc-telep-manage-my-contacts-content-select-contact-type']
    }

}

/** @type {ReturnType<hcRpc['modernuser']['notification']['getProviders']>} */
let plugins
async function getPlugins() {
    return plugins ||= await hcRpc.modernuser.notification.getProviders()
}

/**
 * @extends Widget<InputContactData>
 */
class InputContactData extends Widget {

    /**
     * 
     * @param {string} provider 
     */
    constructor(provider) {
        super()

        super.html = hc.spawn(
            {
                classes: InputContactData.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='form'></div>
                        <div class='action'></div>
                    </div>
                `
            }
        );

        /** @type {(event: "complete", cb: (ev: CustomEvent)=> void, opts: AddEventListenerOptions)} */ this.addEventListener

        /** @type {MultiFlexForm} */ this.form
        this.widgetProperty(
            {
                selector: ['', ...MultiFlexForm.classList].join('.'),
                property: 'form',
                parentSelector: '.container >.form',
                childType: 'widget',
            }
        );

        this.form = new MultiFlexForm()


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
                content: `Confirm`,
                onclick: () => {
                    this.dispatchEvent(new CustomEvent('complete'))
                }
            }
        )

        this.provider = provider;


    }
    get value() {
        return this.form.value
    }

    async load() {
        await this.blockWithAction(async () => {
            const plugins = await getPlugins();

            console.log(`plugins `, plugins)
            const provider = plugins.find(p => p.name == this.provider);
            if (!provider) {
                throw new Error(`Could not continue, because there's no information about '${this.provider}' contacts.`)
            }
            this.form.quickStructure = provider.contactForm
        })

    }

    /** @readonly */
    static get classList() {
        return ['hc-telep-manage-my-contacts-input-contact']
    }
}