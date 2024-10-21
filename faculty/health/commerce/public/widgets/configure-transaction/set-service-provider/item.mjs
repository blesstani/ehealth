/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget, represents a single service provider on the view where the user can configure 
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";


export default class ServiceProviderItem extends Widget {



    /**
     * 
     * @param {ehealthi.health.commerce.service_provider.profile.ServiceProvider} data 
     * @param {string[]} inventoryRequirement
     */
    constructor(data, inventoryRequirement) {
        super();

        super.html = hc.spawn({
            classes: ServiceProviderItem.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='icon'></div>
                        <div class='details'>
                            <div class='label'></div>
                            <div class='description'>
                                <div class='icon'></div>
                                <div class='content'></div>
                            </div>
                            <div class='address'>
                                <div class='icon'></div>
                                <div class='content'></div>
                            </div>
                            <div class='incapable'>This lab cannot provide all the required tests.</div>
                        </div>
                        <div class='checkbox'></div>
                        
                    </div>
                </div>
            `
        });

        this[this.defineImageProperty({
            selector: ':scope >.container >.main >.details >.address >.icon',
            cwd: import.meta.url,
            property: Symbol(),
            mode: 'inline',
        })] = './location.svg'


        this[this.defineImageProperty({
            selector: ':scope >.container >.main >.details >.description >.icon',
            cwd: import.meta.url,
            property: Symbol(),
            mode: 'inline',
        })] = './info.svg'

        const icon = Symbol();
        this.defineImageProperty({
            selector: ':scope >.container >.main >.icon',
            property: icon,
            mode: 'inline',
            fallback: '/$/shared/static/logo.png',
            cwd: import.meta.url
        });



        /** @type {ehealthi.health.commerce.service_provider.profile.ServiceProvider} */ this.data
        Reflect.defineProperty(this, 'data', {
            /**
             * 
             * @param {this['data']} data 
             */
            set: (data) => {
                if (!data) return;

                for (const field in data) {
                    dataTarget[field] = data[field]
                }
                dataTarget.label = data.label || data.$profile.label
                this[icon] = data.icon || data.$profile.icon
                dataTarget.description ||= "No description"
                dataTarget.address ||= "No address"
            },
            get: () => ({ ...dataTarget }),
            configurable: true,
            enumerable: true
        });

        const dataTarget = {}

        for (const property of ['label']) {
            Widget.__htmlProperty(dataTarget, this.html.$(`:scope >.container >.main >.details >.${property}`), property, 'innerText')
        }




        for (const property of ['address', 'description']) {
            Widget.__htmlProperty(dataTarget, this.html.$(`:scope >.container >.main >.details >.${property} >.content`), property, 'innerText')
        }




        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty({
            selector: ['', ...Checkbox.classList].join('.'),
            parentSelector: ':scope >.container >.main >.checkbox',
            childType: 'widget'
        }, 'checkbox')

        this.checkbox = new Checkbox()

        this.html.addEventListener('click', (event) => {
            if (this.checkbox.html.contains(event.target)) return
            this.checkbox.checked = !this.checkbox.checked
        })

        this.data = data

        this.blockWithAction(async () => {
            if (inventoryRequirement) {
                if (!await hcRpc.health.commerce.service_provider.inventory.canHandle({ commodities: inventoryRequirement, provider: this.data.userid })) {
                    this.html.classList.add('incapable')
                }
            }
        })


    }


    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-configure-transaction-set-service-provider-item']

}