/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget (section) is part of the footer widget
 * It represents a column with a title and links
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class FooterSection extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.title
     * @param {[import("./types.js").FooterLink]} param0.links
     */
    constructor({ title, links } = {}) {
        super();

        this.html = hc.spawn({
            classes: ['hc-donorforms-footer-section'],
            innerHTML: `
                <div class='container'>
                    <div class='title'>About Us</div>
                    <div class='links'></div>
                </div>
            `
        });

        /** @type {string} */ this.title
        this.htmlProperty('.container >.title', 'title', 'innerHTML')

        /** @type {[import("./types.js").FooterLink]} */ this.links
        this.pluralWidgetProperty({
            parentSelector: '.container >.links',
            selector: 'a',
            property: 'links',
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FooterLink} data 
                 */
                set: (data) => {
                    let a = hc.spawn({
                        tag: 'a',
                        innerHTML: data.label,
                        attributes: {
                            href: data.href || '#'
                        }
                    })
                    return a;
                },
                get: (a) => {
                    return {
                        label: a?.innerHTML,
                        href: a?.getAttribute('href')
                    }
                }
            }
        });

        this.links = [
            {
                label: `Some Link`,
                href: '#'
            },
            {
                label: `Some Other Link`,
                href: '#'
            },
            {
                label: `Link Example`,
                href: '#'
            },
        ];

        Object.assign(this, arguments[0]);

    }

}