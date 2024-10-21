/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget allows an authorized personnel to manage the inventory of the system
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import ListDataManager from "/$/system/static/html-hc/widgets/list-data-manager/widget.mjs";


/**
 * @extends ListDataManager<ehealthi.health.appointment.AppointmentType>
 */
export default class InventoryManager extends ListDataManager {

    constructor() {

        super({
            title: `Consultation Prices`,
            config: {
                display: [
                    {
                        name: 'icon',
                        label: 'Icon',
                        view: '::image',

                    },
                    {
                        label: `Type of Consultation`,
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
                    }

                ],
                fetch: () => hcRpc.health.appointment.getAppointmentTypes(),
                create: async (input) => {
                    return await Promise.all(
                        input.map(
                            async x => {
                                x.price.currency = 'XAF'
                                return {
                                    id: await hcRpc.health.appointment.addAppointmentType({ data: x, }),
                                    ...x
                                }
                            }
                        )
                    )
                },
                input: [
                    [
                        {
                            label: `Icon`,
                            name: 'icon',
                            type: 'uniqueFileUpload',
                            url: `/$/uniqueFileUpload/upload`
                        }
                    ],
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
                    ]
                ],
                edit: {

                    execute: async (input) => {

                        if (input['price.value']) {
                            input.price = {
                                currency: 'XAF',
                                value: input['price.value']
                            }
                            delete input['price.value']
                        }

                        const copy = JSON.parse(JSON.stringify(input))
                        delete copy.id

                        await hcRpc.health.appointment.updateAppointmentType({ id: input.id, data: copy })
                        copy.id = input.id
                        
                        return copy
                    },
                },
                delete: async (input) => {
                    await Promise.all(input.map(x => hcRpc.health.appointment.deleteAppointmentType({ id: x.id })))
                }
            },
        })

    }

}