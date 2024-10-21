/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget displays an image that was added to the results of a lab test.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class ImageView extends Widget {

    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionResult} value 
     */
    constructor(value) {
        super();

        super.html = hc.spawn({
            classes: ImageView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title'></div>
                    <div class='image'></div>
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
        this.htmlProperty(':scope >.container >.title', 'title', 'innerHTML')

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
    static classList = ['hc-ehealthi-health-commerce-view-extension-results-view-image']

}