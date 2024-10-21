/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget allows an authorized personnel to manage the inventory of the system
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import ListDataManager from "/$/system/static/html-hc/widgets/list-data-manager/widget.mjs";


/**
 * @extends ListDataManager<ehealthi.health.commerce.inventory.CommodityDatabaseInfo>
 */
export default class InventoryManager extends ListDataManager {

    constructor() {

        super({
            title: `Inventory`,
            config: {
                display: [

                    {
                        label: `Name`,
                        name: 'label',
                        view: '::text',
                    },
                    {
                        name: 'description',
                        label: `Description`,
                        view: '::text',
                    },
                    {
                        name: 'price',
                        label: `Price`,
                        view: (input) => `${input.value} ${input.currency}`
                    },
                    {
                        name: 'commission',
                        label: `Commission`,
                        view: (input) => `${input}%`,
                    }

                ],
                fetch: () => hcRpc.health.commerce.inventory.getInventory(),
                create: async (input) => {
                    return await Promise.all(
                        input.map(
                            async x => {
                                x.price.currency = 'XAF'
                                return {
                                    id: await hcRpc.health.commerce.inventory.addItem({ data: x, }),
                                    ...x
                                }
                            }
                        )
                    )
                },
                input: [
                    [
                        {
                            label: `Name`,
                            name: 'label',
                        }
                    ],
                    [
                        {
                            label: `Description`,
                            name: 'description',
                            type: 'textarea'
                        }
                    ],
                    [
                        {
                            label: `Price (XAF)`,
                            name: 'price.value',
                            type: 'number',
                            valueProperty: 'valueAsNumber'
                        }
                    ],
                    [
                        {
                            label: `Commission (%)`,
                            name: 'commission',
                            type: 'number',
                            valueProperty: 'valueAsNumber'
                        }
                    ]

                ],
                edit: {

                    execute: async (input) => {
                        const copy = JSON.parse(JSON.stringify(input))
                        delete copy.id
                        await hcRpc.health.commerce.inventory.modifyItem({ id: input.id, data: copy })
                        return copy
                    },
                }
            },
        })

    }

}