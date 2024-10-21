/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget (coming-soon), informs the user that a mobile app is soon coming.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


/**
 * @extends Widget<ComingSoon>
 */
export default class ComingSoon extends Widget {

    /**
     * 
     * @param {ehealthi.ui.coming_soon.ComingSoon} data 
     */
    constructor(data) {
        super()

        this.html = hc.spawn(
            {
                classes: ComingSoon.classList,
                innerHTML: `
                    <a class='container' href='${new URL('./com.holycornsoftware.ehealthi.apk', import.meta.url).href}' target='_blank'>
                        <div class='title'>Coming Soon</div>
                        <div class='image'></div>
                        <div class='label'></div>
                    </a>
                `
            }
        );

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')
        /** @type {string} */ this.image
        this.defineImageProperty({
            selector: '.container >.image',
            mode: 'inline',
            property: 'image',
            cwd: import.meta.url
        });

        Object.assign(this, data)
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-coming-soon']
    }

}