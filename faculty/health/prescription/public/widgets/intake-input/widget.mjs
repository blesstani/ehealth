/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget (intake-input), allows the user (probably a doctor), to enter details of when, and how a prescription would consumed
 */

import DateRangeInput from "./date-range-input/widget.mjs";
import DosageInput from "./dosage-input/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class IntakeInput extends Widget {

    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: IntakeInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='duration'></div>
                        <div class='dosage-input'></div>
                    </div>
                `
            }
        );

        const range = new DateRangeInput()
        this.html.$('.container >.duration').appendChild(range.html)

        const dosageInput = new DosageInput()
        this.html.$('.container >.dosage-input').appendChild(dosageInput.html)

        /** @type {string} */ this.patient

        /** @type {ehealthi.health.prescription.Intake} */ this.value

        Reflect.defineProperty(this, 'value', {
            get: () => {
                /** @type {this['value']} */
                const val = {
                    dosage: dosageInput.dosages,
                    end: range.value.to,
                    start: range.value.from,
                }

                return val
            },

            /**
             * 
             * @param {this['value']} value 
             */
            set: (value) => {
                dosageInput.dosages = value.dosage;
                range.value = {
                    from: value.start,
                    to: value.end
                }
            }
        })

    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-health-intake-input']
    }
}