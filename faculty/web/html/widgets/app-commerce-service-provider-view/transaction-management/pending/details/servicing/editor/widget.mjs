/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (editor), allows a service provider to add information to a transaction. 
 */

import ImageInput from "./items/image.mjs";
import TextInput from "./items/text.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import ListPopup from "/$/system/static/html-hc/widgets/list-popup/widget.mjs";


export default class Editor extends Widget {


    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecord} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: Editor.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                    <div class='append'></div>
                    <div class='actions'></div>
                </div>
            `
        });


        /** @type {ehealthi.health.commerce.transaction.TransactionResult[]} */ this.items
        this.pluralWidgetProperty({
            selector: ['', ...Editor.InputWrapper.classList].join('.'),
            parentSelector: ':scope >.container >.items',
            transforms: {
                set: (input) => {
                    const widget = new Editor.InputWrapper(input);
                    widget.addEventListener('change', () => {
                        if (!this.html.contains(widget.html)) {
                            return
                        }
                        dispatchChange();

                    }, { signal: this.destroySignal })
                    widget.html.addEventListener('destroyed', dispatchChange)
                    return widget.html
                },
                get: ({ widgetObject: { value } }) => value
            },
            sticky: true,
            onchange: () => dispatchChange()
        }, 'items')


        const dispatchChange = new DelayedAction(() => {
            this.dispatchEvent(new CustomEvent('change'));
        }, 250, 1000)
        /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=>void} */ this.addEventListener


        this.html.$(':scope >.container >.append').appendChild(
            new ActionButton({
                content: `Add Info`,
                hoverAnimate: false,
                onclick: () => {
                    // For testing purposes, just directly append a TextInput

                    const choose = new ListPopup({
                        title: `Type of Content`,
                        caption: `What type of lab results data are you adding?`,
                        actionText: `Add`,
                        selectionSize: { min: 1, max: 1 },
                        options: [
                            {
                                label: `Text`,
                                caption: `This is the most recommended, especially because it can be searched.`,
                                value: 'text',
                            },
                            {
                                label: `Image`,
                                caption: `Useful for X-Ray photographs, and other imaging results`,
                                value: 'image'
                            }
                        ]
                    });

                    choose.waitTillSelect().then(([choice]) => {

                        switch (choice) {
                            case 'text': {
                                this.items.push({
                                    type: 'text',
                                    title: `Blood Cell count - Tap to change this title`,
                                    data: {
                                        text: `
                                            20 Red blood cells were found.
                                            This is not really a diagnosis, because the patient was found to have too much red blood cells.
                                            This could be due to relationship stress. Tap here to modify this piece of text, and replace with the real results.
                                        `
                                    }
                                })
                                break;
                            }

                            case 'image': {
                                this.items.push({
                                    type: 'image',
                                    title: `X-Ray Results`,
                                    data: {
                                        url: new URL('./items/no-image.svg', import.meta.url).href
                                    }
                                })
                            }
                        }

                    })

                }
            }).html
        )

        this.blockWithAction(async () => {
            this.items = transaction.results || []
        });


    }

    get value() {
        return [...this.items]
    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-servicing-editor']

    static InputWrapper = class extends Widget {

        /**
         * 
         * @param {Editor['items'][number]} input 
         * @returns 
         */
        constructor(input) {
            super();

            super.html = hc.spawn({
                classes: Editor.InputWrapper.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='actions'></div>
                            <div class='view'></div>
                        </div>
                    </div>
                `
            });


            const actionIcon = Symbol()
            /** @type {{icon: string, onclick: ()=> void}[]} */ this.actions
            this.pluralWidgetProperty({
                selector: '.action',
                parentSelector: ':scope >.container >.main >.actions',
                sticky: true,
                transforms: {
                    set: (input) => {
                        const action = new Widget();
                        action.html = hc.spawn({ classes: ['action'], innerHTML: '<div class="container"></div>' })
                        action[
                            action.defineImageProperty({
                                selector: ':scope >.container',
                                mode: 'inline',
                                cwd: import.meta.url,
                                property: actionIcon,
                            })
                        ] = input.icon
                        action.html.onclick = input.onclick
                        return action.html
                    },
                    get: (html) => {
                        return {
                            onclick: html.onclick,
                            icon: html.widgetObject?.[actionIcon]
                        }
                    }
                }
            }, 'actions');

            this.actions = [
                {
                    icon: './delete.svg',
                    onclick: () => {
                        new BrandedBinaryPopup({
                            title: `Delete`,
                            question: `Do you really want to remove this piece of information from the lab results?`,
                            positive: `Remove it`,
                            negative: `No, go back`,
                            execute: async () => {
                                setTimeout(() => this.destroy(), 1800)
                            }
                        }).show()
                    }
                }
            ];



            const onChange = Symbol();

            /** @type {Widget} */ this.view
            this.widgetProperty({
                selector: '.hc-widget',
                parentSelector: ':scope >.container >.main >.view',
                childType: 'widget',
                /**
                 * 
                 * @param {Widget} value 
                 */
                onchange: (value) => {
                    value.addEventListener('change', value[onChange] ||= () => {
                        if (!this.html.contains(value.html)) {
                            return
                        }
                        this.dispatchEvent(new CustomEvent('change'))
                    }, { signal: this.destroySignal })
                }
            }, 'view');

            /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=>void} */ this.addEventListener


            this.view = (
                (() => {
                    console.log(`The input type is `, input.type)
                    switch (input.type) {
                        case 'image':
                            return new ImageInput(input);
                        case 'text':
                        default:
                            return new TextInput(input)
                    }
                })()
            );
        }

        get value() {
            return this.view?.value
        }
        set value(value) {
            const widget = this.view
            if (widget) {
                widget.value = value
            }
        }

        /** @readonly */
        static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-servicing-editor-input-wrapper']


    }

}