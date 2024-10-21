/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget (item), represents a single item on the info-team widget. Or, more humanly speaking, a doctor in the organization.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


/**
 * @extends Widget<Item>
 */
export default class Item extends Widget {

    /**
     * 
     * @param {ehealthi.ui.info_team.Item} data 
     */
    constructor(data = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: Item.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='icon'></div>
                        <div class='text'>
                            <div class='label'></div>
                            <div class='role-label'></div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.icon
        this.defineImageProperty(
            {
                selector: '.container >.icon',
                property: 'icon',
                mode: 'inline'
            }
        );

        /** @type {string} */ this.label
        this.htmlProperty('.container >.text >.label', 'label', 'innerHTML')

        /** @type {string} */ this.roleLabel
        this.htmlProperty('.container >.text >.role-label', 'roleLabel', 'innerHTML')

        Object.assign(this, data)
    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-info-team-item']
    }
}