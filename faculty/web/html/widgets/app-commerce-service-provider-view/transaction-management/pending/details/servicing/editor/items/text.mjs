/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (text), is part of the editor widget.
 * This widget allows a service provider to enter text to be added to a transaction being serviced.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

const data = Symbol()


export default class TextInput extends Widget {


    /**
     * 
     * @param {TextInput['value']} value 
     */
    constructor(value) {
        super();

        super.html = hc.spawn({
            classes: TextInput.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title' contentEditable='true'>The patient has bla bla bla</div>
                    <div class='content' contentEditable='true'>The patient has bla bla bla</div>
                </div>
            `
        });

        /** @type {{title: string, content: string}} */ this[data] = {};

        for (const property of ['title', 'content']) {
            const element = this.html.$(`:scope >.container >.${property}`);
            Widget.__htmlProperty(this[data], element, property, 'innerHTML')
            element.addEventListener('input', () => {
                this.dispatchEvent(new CustomEvent('change'))
            })
        }

        /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=>void} */ this.addEventListener


        this.value = value

    }

    /**
     * @returns {ehealthi.health.commerce.transaction.TransactionResult}
     */
    get value() {
        return {
            title: this[data].title,
            type: 'text',
            data: {
                text: this[data].content
            }
        }
    }

    /**
     * @param {this['value']} value
     */
    set value(value) {
        this[data].title = value.title
        this[data].content = value.data.text
    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-servicing-editor-text-input']

}