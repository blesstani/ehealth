/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This sub-widget (item), is part of the dosage-input, where it represents a single dosage of a prescription
 */

import TimeInput from "/$/health/static/widgets/time-input/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { NiceNumberInput } from "/$/system/static/html-hc/widgets/nice-number-input/input.mjs";


export default class Dosage extends Widget {

    /**
     * 
     * @param {Dosage['value']} value 
     */
    constructor(value) {
        super();

        super.html = hc.spawn(
            {
                classes: Dosage.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='text'>At</div>
                            <div class='time-input'></div>
                            <div class='text'>take</div>
                            <div class='quantity-input'>
                                <div class='value'></div>
                                <input class='quantity-label'>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        const timeInput = new TimeInput();
        this.html.$('.container >.main >.time-input').appendChild(timeInput.html);

        const valueInput = new NiceNumberInput();
        this.html.$('.container >.main >.quantity-input >.value').appendChild(valueInput.html)


        /** @type {ehealthi.health.prescription.IntakeDose['time']} */ this.time
        Reflect.defineProperty(this, 'time', {
            get: () => timeInput.value,
            set: value => timeInput.value = value,
            configurable: true,
            enumerable: true
        });


        /** @type {ehealthi.health.prescription.IntakeDose['quantity']} */ this.quantity
        Reflect.defineProperty(this, 'quantity', {
            get: () => ({ label: this.html.$('.container >.main >.quantity-input >.quantity-label').value, value: valueInput.value }),
            set: (data) => {
                this.html.$('.container >.main >.quantity-input >.quantity-label').value = data.label
                valueInput.value = data.value
            },
            configurable: true,
            enumerable: true
        });

        this.quantity = {
            value: 1,
            label: 'Tablets'
        }

        this.time = new Date().setHours(8, 0, 0, 0);

        /** @type {ehealthi.health.prescription.IntakeDose} */ this.value
        Reflect.defineProperty(this, 'value', {
            get: () => {
                /** @type {ehealthi.health.prescription.IntakeDose} */
                const val = {
                    time: this.time,
                    quantity: this.quantity
                }
                return val
            },
            set: (v) => {
                this.time = v.time
                this.quantity = v.quantity
            }
        });

        this.value = value
    }


    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-intake-input-dosage-input-item']
    }
}