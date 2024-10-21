/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget (time-input), allows time for appointments, prescriptions, and others, to be inputted in a consistent manner
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class TimeInput extends Widget {

    constructor() {
        super();

        super.html = hc.spawn(
            {
                classes: TimeInput.classList,
                innerHTML: `
                    <div class='container'>
                        <input type='time'>
                    </div>
                `
            }
        );

        /** @type {number} */ this.value
        Reflect.defineProperty(this, 'value', {
            get: () => this.html.$('.container >input').valueAsNumber,
            set: (value) => this.html.$('.container >input').valueAsNumber = value,
            configurable: true,
            enumerable: true
        })
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-time-input']
    }
}