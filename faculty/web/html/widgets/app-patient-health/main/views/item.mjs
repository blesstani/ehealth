/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The app-patient-health widget
 * This sub widget (item), is part of the app-patient-health widget, where it represents a single interactable item on the calendar.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


const time = Symbol()


export default class TimetableItemView extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.image
     * @param {string} param0.title
     * @param {string} param0.caption
     * @param {number} param0.time
     * @param {HTMLElement[]} param0.actions
     */
    constructor({ image, title, caption, time, actions } = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: TimetableItemView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='left'>
                                <div class='image'></div>
                                <div class='time'></div>
                            </div>

                            <div class='right'>
                                <div class='title'></div>
                                <div class='caption'></div>
                                <div class='actions'></div>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.image
        this.defineImageProperty(
            {
                selector: '.container >.main >.left >.image',
                property: 'image',
                mode: 'inline'
            }
        );

        /** @type {string} */ this.title
        this.htmlProperty('.container >.main >.right >.title', 'title', 'innerHTML')

        /** @type {string} */ this.caption
        this.htmlProperty('.container >.main >.right >.caption', 'caption', 'innerHTML')

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.main >.right >.actions',
                childType: 'html',
            },
            'actions'
        );


        Object.assign(this, arguments[0])

    }
    set time(_time) {
        this.html.$('.container >.main >.left >.time').innerHTML = hc.toTimeString(new Date(_time))
        this[time] = _time
    }
    get time() {
        return this[time]
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-main-view-item']
    }
}