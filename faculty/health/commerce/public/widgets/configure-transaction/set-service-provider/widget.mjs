/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget is part of the configure-transaction widget, which allows a user to set the service provider responsible for handling the transaction
 */

import ServiceProviderItem from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { handle } from '/$/system/static/errors/error.mjs'
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import EHealthiArrowButton from "/$/web/html/widgets/arrow-button/widget.mjs";


export default class SetServiceProvider extends Widget {

    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecord} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: SetServiceProvider.classList,
            innerHTML: `
                <div class='container'>
                    <div class='float'></div>
                    <div class='search'><input placeholder='Search by name, or address'></div>
                    <div class='items'></div>
                </div>
            `
        });

        /** @type {ehealthi.health.commerce.service_provider.profile.ServiceProvider[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...ServiceProviderItem.classList].join('.'),
                parentSelector: ':scope >.container >.items',
                transforms: {
                    set: (item) => {
                        const widget = new ServiceProviderItem(item, transaction.commodities);
                        widget.checkbox.addEventListener('change', () => {
                            computeButtonState()
                            this.itemWidgets.forEach(x => {
                                if (x != widget) {
                                    widget.checkbox.silent_value = x.data.userid == widget.data.userid
                                }

                            })
                        }, { signal: this.destroySignal })
                        return widget.html
                    },
                    get: ({ widgetObject: widget }) => widget.data
                }
            },
            'items'
        );

         /** @type {ServiceProviderItem[]} */ this.itemWidgets
        this.pluralWidgetProperty(
            {
                selector: ['', ...ServiceProviderItem.classList].join('.'),
                parentSelector: ':scope >.container >.items',
                childType: 'widget'
            },
            'itemWidgets'
        );


        const btnAdd = new EHealthiArrowButton({
            content: `Continue`,
            onclick: async () => {
                try {
                    await hcRpc.health.commerce.transaction.update({
                        id: transaction.id,
                        data: {
                            service_provider: this.value.userid
                        }
                    });

                    transaction.service_provider = this.value.userid

                    this.dispatchEvent(new CustomEvent('complete'));
                } catch (e) {
                    handle(e);
                }
            },
            state: 'disabled'
        });
        /** @type {(event: 'complete', cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=> void} */ this.addEventListener



        this.html.$(':scope >.container >.float').appendChild(
            btnAdd.html
        );

        const computeButtonState = new DelayedAction(() => {
            btnAdd.state = !!this.value ? 'initial' : 'disabled'
        }, 450, 2500)

        this.blockWithAction(async () => {
            const items = await hcRpc.health.commerce.service_provider.profile.getServiceProviders()
            for await (const item of items) {
                this.items.push({
                    ...item,
                })

            }
            this.itemWidgets.forEach(x => x.checkbox.value = x.data.userid == transaction.service_provider)
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
     * @returns {Pick<ehealthi.health.commerce.service_provider.profile.ServiceProvider, "userid">}
     */
    get value() {
        /** @type {ServiceProviderItem[]} */
        const selected = [...this.html.$$(`:scope >.container >.items >.${ServiceProviderItem.classList.join('.')}`)].map(x => x.widgetObject)
        return selected.find(x => x.checkbox.value)?.data
    }

    clear() {
        [...this.html.$$(`:scope >.container >.items >.${ServiceProviderItem.classList.join('.')}`)].forEach(
            /**
             * 
             * @param {HTMLElement<ServiceProviderItem>} x 
             */
            x => {
                x.widgetObject.checkbox.silent_value = false
            })
        this.html.$(':scope >.container >.search >input').value = ''
    }

    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-configure-transaction-set-service-provider']

}