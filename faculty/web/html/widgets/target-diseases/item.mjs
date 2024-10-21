/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (item), represents a single item on the target-diseases widget
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


/**
 * @extends Widget<Item>
 */
export default class Item extends Widget {


    /**
     * 
     * @param {ehealthi.ui.target_diseases.TargetDisease} data 
     */
    constructor(data) {
        super()

        this.html = hc.spawn(
            {
                classes: Item.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='top'>
                            <div class='image'></div>
                            <div class='label'></div>
                        </div>
                        <div class='bottom'>
                            <div class='content'></div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {ehealthi.ui.target_diseases.TargetDisease['image']} */ this.image
        this.defineImageProperty({ selector: '.container >.top >.image', property: 'image', mode: 'inline' })
        /** @type {ehealthi.ui.target_diseases.TargetDisease['label']} */ this.label
        this.htmlProperty('.container >.top >.label', 'label', 'innerHTML')
        /** @type {ehealthi.ui.target_diseases.TargetDisease['content']} */ this.content
        this.htmlProperty('.container >.bottom >.content', 'content', 'innerHTML')

        Object.assign(this, data)

        this.waitTillDOMAttached(() => {
            this.image ||= '/$/shared/static/logo.png'
        })

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-target-diseases-item']
    }
}