/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (image), is part of the transaction-management editor widget.
 * This widget allows a service provider to include photographic data in lab results.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";



export default class ImageInput extends Widget {

    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionResult} value 
     */
    constructor(value) {
        super();

        super.html = hc.spawn({
            classes: ImageInput.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title' contentEditable=true></div>
                    <div class='image'></div>
                    <div class='actions'>
                        <div class='edit'></div>
                    </div>
                </div>
            `
        });

        /** @type {string} */ this.url

        this.defineImageProperty({
            selector: ":scope >.container >.image",
            property: 'url',
            mode: 'background',
            cwd: import.meta.url,
            fallback: './no-image.svg'
        });



        /** @type {string} */ this.title
        const titleSelector = ':scope >.container >.title';
        this.htmlProperty(titleSelector, 'title', 'innerHTML')


        this.html.$(titleSelector).addEventListener('input', () => {
            this.dispatchEvent(new CustomEvent('change'))
        });


        /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=>void} */ this.addEventListener


        const btnEdit = new ActionButton({
            content: 'Change Image',
            hoverAnimate: false,
            onclick: async () => {
                const popup = new PopupForm({
                    title: `Change Image`,
                    caption: `Upload another image to take its place`,
                    form: [
                        [
                            {
                                type: 'uniqueFileUpload',
                                url: '/$/uniqueFileUpload/upload',
                                name: 'url',
                                label: `Image`,
                                value: this.url
                            }
                        ]
                    ],
                    execute: async () => {
                        if (!popup.value.url) {
                            throw new Error(`Please, check that you selected an image, and selected confirm`)
                        }
                        this.value = {
                            title: this.title,
                            data: {
                                url: popup.value.url
                            }
                        };
                        this.dispatchEvent(new CustomEvent('change'))
                        setTimeout(() => popup.hide(), 400)
                    },
                    positive: `Confirm`
                });

                popup.show()
            }
        });

        this.html.$(`:scope >.container >.actions >.edit`).appendChild(btnEdit.html);

        this.value = value;


    }

    /**
     * @param {ehealthi.health.commerce.transaction.TransactionResult} value
     */
    set value(value) {
        this.url = value?.data?.url
        this.title = value?.title
    }


    /**
     * @returns {ehealthi.health.commerce.transaction.TransactionResult}
     */
    get value() {
        return {
            type: 'image',
            data: {
                url: this.url,
            },
            title: this.title
        }
    }



    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-servicing-editor-image-input']

}