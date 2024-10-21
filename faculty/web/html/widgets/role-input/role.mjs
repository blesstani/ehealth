/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget is part of the custom role-input widget, and represents a single
 * role that can be selected
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { AnimatedTick } from "/$/system/static/html-hc/widgets/animated-tick/index.mjs";



/**
 * @extends Widget<Role>
 */
export default class Role extends Widget {


    /**
     * 
     * @param {modernuser.role.data.Role} data 
     */
    constructor(data) {
        super();

        super.html = hc.spawn(
            {
                classes: Role.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='tick'></div>
                        <div class='image'></div>
                        <div class='label'></div>
                    </div>
                `
            }
        );

        const tick = new AnimatedTick({ activated: true })
        this.html.$('.container >.tick').appendChild(tick.html)

        /** @type {string} */ this.id

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {string} */ this.icon
        this.defineImageProperty(
            {
                selector: '.container >.image',
                property: 'icon',
                mode: 'background'
            }
        );
        /** @type {boolean} */ this.selected
        this.htmlProperty(undefined, 'selected', 'class')

        this.html.addEventListener('click', () => {
            this.selected = !this.selected
            tick.value = this.selected;
        })

        Object.assign(this, data)

    }

    static get classList() {
        return ['hc-ehealthi-inline-role-input-item']
    }

}