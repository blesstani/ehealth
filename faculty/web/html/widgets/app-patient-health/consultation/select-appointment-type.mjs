/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This view allows a patient to select the type of appointment he's going to make
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class SelectAppointmentType extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: SelectAppointmentType.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                </div>
            `
        });

        const dispatchChange = new DelayedAction(() => {
            this.dispatchEvent(new CustomEvent('change'))
        }, 250, 1000)
        /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?: AddEventListenerOptions)=>void} */ this.addEventListener



        /** @type {ehealthi.health.appointment.AppointmentType[]} */ this.items
        this.pluralWidgetProperty({
            selector: ['', ...SelectAppointmentType.Item.classList].join('.'),
            parentSelector: ':scope >.container >.items',
            transforms: {
                set: (input) => {
                    const widget = new SelectAppointmentType.Item(input);
                    widget.addEventListener('change', () => {
                        this.itemWidgets.forEach(x => {
                            if (x != widget) {
                                if (widget.html.classList.contains('selected')) {
                                    x.html.classList.remove('selected')
                                }
                            }
                        });

                        dispatchChange()


                    })
                    return widget.html
                },
                get: ({ widgetObject: widget }) => ({ id: widget.id, icon: widget.icon, description: widget.description, label: widget.label, price: widget.price })
            }
        }, 'items');


        /** @type {typeof SelectAppointmentType.Item['prototype'][]} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: ['', ...SelectAppointmentType.Item.classList].join('.'),
            parentSelector: ':scope >.container >.items',
            childType: 'widget'
        }, 'itemWidgets');

        this.blockWithAction(async () => {
            this.items = await hcRpc.health.appointment.getAppointmentTypes()
        })

    }
    get value() {
        return this.itemWidgets.find(x => x.html.classList.contains('selected'))?.id
    }

    static Item = class extends Widget {


        /**
         * 
         * @param {ehealthi.health.appointment.AppointmentType} data 
         */
        constructor(data) {
            super();

            super.html = hc.spawn({
                classes: SelectAppointmentType.Item.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='icon'></div>
                            <div class='details'>
                                <div class='label'></div>
                                <div class='description'></div>
                                <div class='price'></div>
                            </div>
                        </div>
                    </div>
                `
            });

            const icon = Symbol();
            this[
                this.defineImageProperty({
                    selector: ':scope >.container >.main >.icon',
                    property: icon,
                    mode: 'inline',
                    fallback: '/$/shared/static/logo.png'
                })
            ] = data.icon
            /** @type {string} */  this.id
            /** @type {string} */  this.label
            /** @type {string} */  this.description
            for (const property of ['label', 'description']) {
                this.htmlProperty(`:scope >.container >.main >.details >.${property}`, property, 'innerText')
            }

            let price
            /** @type {ehealthi.health.appointment.AppointmentType['price']} */ this.price
            Reflect.defineProperty(this, 'price', {
                set: (value) => {
                    price = value
                    this.html.$(`:scope >.container >.main >.details >.price`).innerText = `${value.value} ${value.currency}`
                },
                get: () => price,
                configurable: true,
                enumerable: true
            });


            Object.assign(this, data)

            this.html.addEventListener('click', () => this.html.classList.toggle('selected'));

            const observer = new MutationObserver(() => this.dispatchEvent(new CustomEvent('change')))
            observer.observe(this.html, { attributes: true })
            /** @type {(event: "change", cb: (event: CustomEvent)=> void, opts?: AddEventListenerOptions)=>void} */ this.addEventListener


        }


        /** @readonly */
        static classList = ['hc-ehealthi-app-patient-health-appointment-select-type-item']
    }



    /** @readonly */
    static classList = ['hc-ehealthi-app-patient-health-appointment-select-type']

}