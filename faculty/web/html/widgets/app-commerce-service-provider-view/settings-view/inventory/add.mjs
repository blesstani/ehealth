/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (add), is part of the inventory section of the settings section of the app-commerce-service-provider-view widget.
 * 
 * This widget allows a service provider to add one or more items to their inventory
 */

import EHealthiArrowButton from "../../../arrow-button/widget.mjs";
import InventoryItem from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { handle } from '/$/system/static/errors/error.mjs'
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";


export default class AddItemsView extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: AddItemsView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='float'></div>
                    <div class='search'><input></div>
                    <div class='items'></div>
                </div>
            `
        });

        /** @type {ehealthi.health.commerce.inventory.Commodity[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...InventoryItem.classList].join('.'),
                parentSelector: ':scope >.container >.items',
                transforms: {
                    set: (item) => {
                        const widget = new InventoryItem(item);
                        widget.html.addEventListener('click', () => {
                            widget.html.classList.toggle('selected')
                            computeButtonState()
                        }, { signal: this.destroySignal })
                        return widget.html
                    },
                    get: ({ widgetObject: widget }) => widget.data
                }
            },
            'items'
        );

         /** @type {InventoryItem[]} */ this.itemWidgets
        this.pluralWidgetProperty(
            {
                selector: ['', ...InventoryItem.classList].join('.'),
                parentSelector: ':scope >.container >.items',
                childType: 'widget'
            },
            'itemWidgets'
        );


        const btnAdd = new EHealthiArrowButton({
            content: `Add`,
            onclick: async () => {
                try {
                    await hcRpc.health.commerce.service_provider.inventory.add({
                        data: this.value,
                        provider: (await hcRpc.modernuser.authentication.whoami()).id,
                    });

                    this.html.dispatchEvent(
                        new WidgetEvent('backforth-goback')
                    );

                    this.dispatchEvent(new CustomEvent('complete'));
                } catch (e) {
                    handle(e);
                }
            },
            state: 'disabled'
        });


        this.html.$(':scope >.container >.float').appendChild(
            btnAdd.html
        );

        hc.watchToCSS({
            source: this.html.$(':scope >.container'),
            target: this.html,
            apply: '--settings-view-width',
            signal: this.destroySignal,
            watch: {
                dimension: 'width'
            }
        })

        const computeButtonState = new DelayedAction(() => {
            btnAdd.state = this.value.length > 0 ? 'initial' : 'disabled'
        }, 250, 2500)

        /** @type {(event: 'complete', cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=> void} */ this.addEventListener

        this.blockWithAction(async () => {
            const items = await hcRpc.health.commerce.inventory.getInventoryDirect()
            for (const item of items) {
                this.items.push(item)
            }

        });

        this.html.$(':scope >.container >.search >input').addEventListener('keydown',
            new DelayedAction(() => {
                const regexp = new RegExp(this.html.$(':scope >.container >.search >input').value.replaceAll(/[^a-z0-9]/gi, '.*'), 'gi')
                this.itemWidgets.forEach(item => {
                    item.html.classList.toggle('hidden-by-search',
                        [item.data.label, item.data.description].every(content => !regexp.test(content))
                    )
                })
            }, 250, 1500)
        )
    }


    /**
     * @returns {Pick<ehealthi.health.commerce.service_provider.inventory.InventoryItem, "commodity">[]}
     */
    get value() {
        /** @type {InventoryItem[]} */
        const selected = [...this.html.$$(`:scope >.container >.items >.${InventoryItem.classList.join('.')}.selected`)].map(x => x.widgetObject)

        return selected.map(x => ({ commodity: x.data.id }))
    }

    clear() {
        [...this.html.$$(`:scope >.container >.items >.${InventoryItem.classList.join('.')}.selected`)].forEach(x => x.classList.remove('selected'))
        this.html.$(':scope >.container >.search >input').value = ''
    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-settings-inventory-add']
}