/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget (why-us) sits especially on the homepage featuring information on positive qualities of the organization.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



/**
 * @extends Widget<WhyUs>
 */
export default class WhyUs extends Widget {


    constructor() {
        super()
        this.html = hc.spawn(
            {
                classes: WhyUs.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='title'>Why Us</div>
                        <div class='content'></div>
                    </div>
                `
            }
        );

        /** @type {{text: string, image: string}[]} */ this.items
        this.pluralWidgetProperty({
            selector: '.item',
            parentSelector: '.container >.content',
            property: 'items',
            transforms: {
                set: (data) => {
                    return new Item(data).html
                },
                get: html => {
                    /** @type {Item} */
                    const widget = html.widgetObject
                    return {
                        image: widget.image,
                        text: widget.text
                    }
                }
            }
        });

        this.items = [
            {
                text: `24/7 Access to health care`,
                image: '24-7.svg'
            },
            {
                text: `Doctor's love & follow-up`,
                image: `doctor-love.png`
            },
            {
                text: `Vital Health Tips`,
                image: 'tips.png'
            }
        ]
    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-why-us']
    }

}


/**
 * @extends Widget<Item>
 */
class Item extends Widget {
    /**
     * 
     * @param {object} param0 
     * @param {string} param0.image
     * @param {string} param0.text
     */
    constructor({ image, text } = {}) {
        super()
        this.html = hc.spawn({
            classes: Item.classList,
            innerHTML: `
                <div class='container'>
                    <div class='image'></div>
                    <div class='text'></div>
                </div>
            `
        });

        /** @type {string} */ this.image
        this.defineImageProperty(
            {
                selector: '.container >.image',
                property: 'image',
                cwd: new URL('./res/', import.meta.url).href
            }
        );
        /** @type {string} */ this.text
        this.htmlProperty('.container >.text', 'text', 'innerHTML');

        Object.assign(this, arguments[0])
    }
    static get classList() {
        return ['hc-ehealthi-why-us-item']
    }
}