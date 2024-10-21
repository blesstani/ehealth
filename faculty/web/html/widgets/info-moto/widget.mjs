/**
 * Copyright 2023 HolyCorn Software
 * The cayofedpeople Project
 * This widget shows the moto of the youth ministry
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


/**
 * @extends Widget<InfoMoto>
 */
export default class InfoMoto extends Widget {

    constructor() {
        super();
        super.html = hc.spawn(
            {
                classes: InfoMoto.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='quote-image'></div>
                            <div class='content'>God, love, medicine.</div>
                            <div class='label'>That's Our Moto</div>
                        </div>
                    </div>
                `
            }
        );
        const quoteImg = Symbol()

        this.defineImageProperty(
            {
                selector: '.container >.main >.quote-image',
                property: quoteImg,
                cwd: import.meta.url,
                mode: 'inline'
            }
        )
        /** @type {string} */ this[quoteImg] = './res/quote-left.svg'
    }
    static get classList() {
        return ['hc-cayofedpeople-moto']
    }

}