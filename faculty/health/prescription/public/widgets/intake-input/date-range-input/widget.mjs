/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This sub-widget (range-input), allows the user to enter a date range.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class DateRangeInput extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: DateRangeInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='components'></div>
                    </div>
                `
            }
        );

        /** @type {RangeComponent[]} */ this.components
        this.pluralWidgetProperty(
            {
                parentSelector: '.container >.components',
                selector: ['', ...RangeComponent.classList].join('.'),
                childType: 'widget',
            },
            'components'
        );

        /** @type {(ConstructorParameters<typeof RangeComponent>['0'])[]} */ this.componentData
        this.pluralWidgetProperty(
            {
                selector: ['', ...RangeComponent.classList].join('.'),
                parentSelector: '.container >.components',
                transforms: {
                    set: (input) => {
                        return new RangeComponent(input).html
                    },
                    get: (html) => {
                        return {
                            label: html.widgetObject?.label,
                            value: html.widgetObject?.value,
                            name: html.widgetObject?.name
                        }
                    }
                }
            },
            'componentData'
        );

        this.componentData = [
            {
                label: `From`,
                name: 'from',
                value: Date.now()
            },
            {
                label: `To`,
                name: 'to',
                value: Date.now() + (30 * 24 * 60 * 60 * 1000)
            }
        ];

        /** @type {{from: number, to: number}} */ this.value
        Reflect.defineProperty(this, 'value', {
            set: (input = {}) => {
                if (typeof input !== 'object') {
                    throw new Error(`Invalid input ${input}`)
                }
                for (const component of this.components) {
                    component.value = input[component.name]
                }

            },

            get: () => {
                const value = {}
                this.components.forEach((item) => {
                    value[item.name] = item.value
                })
                return value
            },
            configurable: true,
            enumerable: true
        })



    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-health-date-range-input']
    }

}



class RangeComponent extends Widget {
    /**
     * 
     * @param {object} param0 
     * @param {string} param0.label
     * @param {number} param0.value
     * @param {string} param0.name
     */
    constructor({ label, value, name } = {}) {
        super();

        super.html = hc.spawn(
            {
                classes: RangeComponent.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'>From</div>
                        <input type='date'>
                    </div>
                `
            }
        );

        /** @type {number} */ this.value
        Reflect.defineProperty(this, 'value',
            {
                set: (v) => this.html.$('.container >input').valueAsNumber = v,
                get: () => this.html.$('.container >input').valueAsNumber,
                configurable: true,
                enumerable: true
            }
        );

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {string} */ this.name

        Object.assign(this, arguments[0])
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-date-range-input-component']
    }
}