/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget (dosage-input), is part of the intake-input, where the user enters the quantity, timing, and directions for
 * consuming the prescription at a given time during the day.
 */

import Dosage from "./item.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";



export default class DosageInput extends Widget {

    constructor() {
        super();
        super.html = hc.spawn(
            {
                classes: DosageInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='dosages'></div>
                        <div class='add-dosage'></div>
                    </div>
                `
            }
        );

        /** @type {ehealthi.health.prescription.IntakeDose[]} */ this.dosages;
        this.pluralWidgetProperty(
            {
                selector: ['', ...Dosage.classList].join('.'),
                parentSelector: '.container >.dosages',
                transforms: {
                    set: (input) => new Dosage(input).html,
                    get: html => html?.widgetObject?.value
                }
            },
            'dosages'
        );

        this.dosages = [
            {
                time: new Date().setHours(8, 0, 0, 0),
                quantity: {
                    label: `Tablet`,
                    value: 1
                },
            }
        ];

        const btnAdd = new ActionButton(
            {
                content: `Add another dosage`,
                onclick: async () => {
                    this.dosages.push(
                        {
                            time: (this.dosages.at(-1) || ({ time: new Date().setHours(8, 0, 0, 0) })).time + (4 * 60 * 60 * 1000),
                            quantity: {
                                label: `Tablet`,
                                value: 1
                            }
                        }
                    )
                },
                hoverAnimate: false
            }
        );

        this.html.$('.container >.add-dosage').appendChild(btnAdd.html)
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-intake-input-dosage-input']
    }

}