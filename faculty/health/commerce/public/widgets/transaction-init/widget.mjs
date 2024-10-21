/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget allows a doctor to initiate a transaction, for a patient
 */

// TODO: Stop relying on a widget in the app domain. A Faculty must be self-sufficient
import InventoryItem from "/$/web/html/widgets/app-commerce-service-provider-view/settings-view/inventory/item.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import EHealthiArrowButton from "/$/web/html/widgets/arrow-button/widget.mjs";
import { handle } from "/$/system/static/errors/error.mjs";



export default class TransactionInit extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {Pick<modernuser.profile.UserProfileData, "id">} param0.patient
     */
    constructor({ patient }) {
        super();

        super.html = hc.spawn({
            classes: TransactionInit.classList,
            innerHTML: `
                <div class='container'>
                    <div class='commodities-input'>
                        <div class='top'>
                            <div class='search'>
                                <input>
                            </div>
                        </div>

                        <div class='values'>
                            <div class='listings'></div>
                            <div class='total'>
                                <div class='prefix'>Total: </div>
                                <div class='value'></div>
                            </div>
                        </div>

                        <div class='select'>
                            <div class='listings'></div>
                        </div>
                        
                    </div>


                    <div class='confirm'></div>
                    
                </div>
            `
        });


        // The logic of listing different items for selection

        /** @type {("inventory"|"selection")[]} */
        const properties = ['inventory', 'selection']
        /** @type {ehealthi.health.commerce.inventory.CommodityDatabaseInfo[]} */ this.inventory
        /** @type {ehealthi.health.commerce.inventory.CommodityDatabaseInfo[]} */ this.selection
        /** @type {InventoryItem[]} */ this.inventoryWidgets
        /** @type {InventoryItem[]} */ this.selectionWidgets


        for (const _property of properties) {

            ((property) => {

                const parentSelector = `:scope >.container >.commodities-input >.${property == 'inventory' ? 'select' : 'values'} >.listings`;
                const selector = ['', ...InventoryItem.classList].join('.');


                this.pluralWidgetProperty({
                    parentSelector,
                    selector,
                    transforms: {
                        set: (input) => {
                            const widget = new InventoryItem(input);
                            widget.html.addEventListener('click', () => {
                                // Hide it from this input list, and show in the values list

                                // So, in the input list
                                if (property == 'inventory') {
                                    widget.html.classList.add('hidden-by-select')
                                    if (!this.selection.find(x => x.id == input.id)) {
                                        this.selection.push(input)
                                    }
                                }

                                // And now, what about the values list?
                                if (property == 'selection' && this.selection.find(x => x.id == input.id)) {
                                    // If it is already in the selection list ... and the click came from the selection list itself
                                    // Then, remove from the selection list, and restore the view in the inventory list
                                    widget.destroy()
                                    this.inventoryWidgets.find(x => x.data.id == input.id).html.classList.remove('hidden-by-select')
                                }
                            })
                            return widget.html
                        },
                        get: ({ widgetObject: wid }) => wid.data
                    }
                }, property)


                this.pluralWidgetProperty({
                    parentSelector,
                    selector,
                    childType: 'widget'
                }, `${property}Widgets`)




            })(_property)
        }


        const observer = new MutationObserver(new DelayedAction(() => {
            this.html.$(':scope >.container >.commodities-input >.values >.total >.value').innerText = `${((price) =>
                `${price.value} ${price.currency || 'XAF'}`
            )([...this.selection.map(x => ({ value: x.price.value, currency: x.price.currency })), { value: 0 }].reduce((acc, curr) =>
                ({ value: acc.value += curr.value, currency: curr.currency || acc.currency })
            ))}`

            btnConfirm.state = this.selection.length > 0 ? 'initial' : 'disabled'
        }, 750, 3000))
        observer.observe(this.html.$(':scope >.container >.commodities-input >.values >.listings'), { childList: true })


        let readyDone;
        this.ready = new Promise((resolve) => readyDone = resolve)
        this.blockWithAction(async () => {
            const items = await hcRpc.health.commerce.inventory.getInventory()
            for await (const item of items) {
                this.inventory.push(item)
            }
            readyDone()
        })



        // The logic of actually confirming the prescription, and commencing the transaction
        const btnConfirm = new EHealthiArrowButton({
            content: `Confirm Tests`,
            state: 'disabled',
            onclick: async () => {
                // Since there's a latency between selection of items, and updation of this button's state, let's check to see that all is well.
                if (this.selection.length == 0) {
                    btnConfirm.state = 'disabled'
                    return
                }

                try {

                    if (!this.value) {


                        this.value = await hcRpc.health.commerce.transaction.create({
                            data: {
                                patient: patient.id,
                                commodities: this.selection.map(x => x.id)
                            }
                        });
                    } else {
                        console.log(`this.value is `, this.value)

                        await hcRpc.health.commerce.transaction.update({
                            id: this.value,
                            data: {
                                commodities: this.selection.map(x => x.id)
                            }
                        })
                    }


                    this.dispatchEvent(
                        new CustomEvent('complete')
                    )

                    setTimeout(() => btnConfirm.state = 'success', 250)

                } catch (e) {
                    handle(e)
                }
            }
        });


        /** @type {(event:'complete', cb: (event: CustomEvent)=>void, opts?: AddEventListenerOptions)=>void} */ this.addEventListener

        this.html.$(':scope >.container >.confirm').appendChild(btnConfirm.html)


    }


    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-transaction-init']

}