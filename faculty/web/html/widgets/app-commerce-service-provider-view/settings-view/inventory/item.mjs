/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget, represents a single item on the inventory management view of a service provider.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import FlexReveal from "/$/system/static/html-hc/widgets/flex-reveal/widget.mjs";


export default class InventoryItem extends Widget {



    /**
     * 
     * @param {ehealthi.health.commerce.inventory.CommodityDatabaseInfo} data 
     */
    constructor(data) {
        super();

        super.html = hc.spawn({
            classes: InventoryItem.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='details'>
                            <div class='label'></div>
                            <div class='description'></div>
                            <div class='amount'></div>
                        </div>

                        <div class='options'></div>
                        
                    </div>
                </div>
            `
        });

        const reveal = new FlexReveal()

        const deleteView = new Widget();
        deleteView.html = hc.spawn({
            innerHTML: `
                <div class='container'></div>
            `,
            classes: ['hc-ehealthi-app-commerce-service-provider-view-settings-inventory-item-action']
        });

        deleteView[
            deleteView.defineImageProperty({
                selector: ":scope >.container",
                mode: 'inline',
                property: Symbol(),
                cwd: import.meta.url
            })
        ] = './delete.svg'


        deleteView.html.addEventListener('click', () => {
            new BrandedBinaryPopup({
                title: `Remove from inventory?`,
                question: `
                    This means that patients won't be able to come to you for ${this.data.label}.
                    Are you sure about this?
                `,
                positive: 'Remove',
                negative: 'Go back',
                execute: async () => {
                    await hcRpc.health.commerce.service_provider.inventory.deleteItem({ commodity: this.data.id })
                    this.destroy()
                }
            }).show()
        })


        reveal.content = deleteView.html

        this.html.$(':scope >.container >.main >.options').appendChild(reveal.html)


        /** @type {ehealthi.health.commerce.inventory.CommodityDatabaseInfo} */ this.data
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
            },
            get: () => ({ ...dataTarget }),
            configurable: true,
            enumerable: true
        });

        const dataTarget = {}

        for (const property of ['label', 'description']) {
            Widget.__htmlProperty(dataTarget, this.html.$(`:scope >.container >.main >.details >.${property}`), property, 'innerHTML')
        }


        const amountRaw = Symbol()
        Widget.__htmlProperty(dataTarget, this.html.$(`:scope >.container >.main >.details >.amount`), amountRaw, 'innerHTML')

        Reflect.defineProperty(dataTarget, 'price', {
            set: (v) => {
                dataTarget[amountRaw] = `${v.value} ${v.currency}`
            },
            get: () => {
                const chunks = dataTarget[amountRaw].split(' ')
                return {
                    value: Number(chunks.slice(0, chunks.length - 1)).valueOf(),
                    currency: chunks[chunks.length - 1]
                }
            },
            configurable: true,
            enumerable: true
        })

        this.data = data


    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-settings-inventory-item']

}