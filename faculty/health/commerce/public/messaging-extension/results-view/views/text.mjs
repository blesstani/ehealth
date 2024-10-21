/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (text), is specialized at allowing the doctor view lab results that are text-based
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class TextView extends Widget {


    /**
     * 
     * @param {TextView['value']} result 
     */
    constructor(result) {
        super();

        super.html = hc.spawn({
            classes: TextView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title'></div>
                    <div class='content'></div>
                </div>
            `
        });

        /** @type {string} */ this.title
        this.htmlProperty(':scope >.container >.title', 'title', 'innerHTML')

        /** @type {string} */ this.content
        this.htmlProperty(':scope >.container >.content', 'content', 'innerHTML')

        /** @type {ehealthi.health.commerce.transaction.TransactionResult} */ this.value
        Reflect.defineProperty(this, 'value', {
            /**
             * 
             * @param {this['value']} value 
             */
            set: (value) => {
                this.title = value.title
                this.content = value.data?.text || 'Nothing here'
            },
            /**
             * 
             * @returns {this['value']}
             */
            get: () => {
                return {
                    type: 'text',
                    title: this.title,
                    data: {
                        text: this.content
                    },
                }
            },
            configurable: true
        });

        this.value = result

    }


    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-view-extension-results-view-text']
}