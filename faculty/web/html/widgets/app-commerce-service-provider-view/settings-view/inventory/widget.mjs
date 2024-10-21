/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget is part of the app-commerce-service-provider-view widget
 * This widget (inventory), allows a service provider to manage the inventory of his organization
 */

import AddItemsView from "./add.mjs";
import InventoryItem from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";


export default class InventoryManager extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: InventoryManager.classList,
            innerHTML: `
                <div class='container'>
                    <div class='actions'></div>
                    <div class='listings'></div>
                </div>
            `
        });

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty({
            parentSelector: ':scope >.container >.actions',
            selector: '*',
            childType: 'html',
        }, 'actions')

        /** @type {AddItemsView} */
        let addView;

        const btnAdd = new ActionButton({
            content: `Add`,
            onclick: () => {
                // Navigate to the add view
                this.html.dispatchEvent(
                    new WidgetEvent(
                        'backforth-goto',
                        {
                            detail: {
                                view: (addView ||= (() => {
                                    const widget = new AddItemsView()
                                    widget.addEventListener('complete', () => {
                                        // Add the items that came from this view
                                        Promise.allSettled(
                                            widget.value.map(item =>
                                                transformItem(item).then(x => {
                                                    this.items = [
                                                        ...this.items.filter(ex => ex.commodity != x.commodity),
                                                        x
                                                    ]

                                                })
                                            )
                                        ).then(() => {
                                            // After adding all these items to the view
                                            // Clear the widget
                                            widget.clear()
                                        });
                                    })

                                    let interval = setInterval(() => {
                                        if (!addView.html.isConnected) {
                                            addView.destroy()
                                            clearInterval(interval)
                                            addView = null
                                        }
                                    }, 1500)
                                    return widget
                                })()).html,
                                title: `Add Items`
                            }
                        }
                    )
                )
            },
            hoverAnimate: false
        });

        this.actions.push(btnAdd.html)

        /** @type {(ehealthi.health.commerce.service_provider.inventory.InventoryItem & {commodity_data: ehealthi.health.commerce.inventory.Commodity})[]} */ this.items
        this.pluralWidgetProperty({
            selector: ['', ...InventoryItem.classList].join('.'),
            parentSelector: ':scope >.container >.listings',
            transforms: {
                set: input => {
                    const widget = new InventoryItem(input.commodity_data);
                    widget.raw = input

                    return widget.html
                },
                get: ({ widgetObject: wid }) => wid.raw,
            }
        }, 'items');

        /**
         * 
         * @param {ehealthi.health.commerce.service_provider.inventory.InventoryItem} item 
         */
        const transformItem = async (item) => {
            item.commodity_data = (await hcRpc.health.commerce.inventory.getInventoryDirect()).find(x => x.id == item.commodity)
            return item

        }

        this.blockWithAction(async () => {
            const sysInventory = await hcRpc.health.commerce.inventory.getInventoryDirect();

            this.items = (await hcRpc.health.commerce.service_provider.inventory.getItems()).map(item => {
                item.commodity_data = sysInventory.find(x => x.id == item.commodity)
                return item
            })
        })

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-settings-inventory']

}