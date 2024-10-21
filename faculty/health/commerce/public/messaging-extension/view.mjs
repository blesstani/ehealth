/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module makes it possible for doctors and patients to view a message in which a lab prescription was made
 */

import configureTransaction from "../widgets/configure-transaction/function.mjs";
import TransactionInit from "../widgets/transaction-init/widget.mjs";
import ViewResults from "./results-view/widget.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";



export default class LabTestMessageView extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {telep.chat.messaging.Message} param0.message
     * @param {modernuser.profile.UserProfileData} param0.me
     */
    constructor({ message, me }) {
        super();

        super.html = hc.spawn({
            classes: LabTestMessageView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='icon'></div>
                    <div class='caption'></div>
                    <ul class='items'></ul>
                    <div class='amount'>
                        <div class='label'>Total:</div>
                        <div class='data'></div>
                        <div class='status'></div>
                    </div>
                    <div class='service-provider'></div>
                    <div class='actions'>
                        <div class='edit'></div>
                        <div class='cancel'></div>
                        <div class='manage'></div>
                        <div class='view-results'></div>
                        <div class='allow-patient-view'></div>
                    </div>
                </div>
            `
        });



        // Let's put some necessary icons
        for (const item of [
            [':scope >.container >.icon', './icon.svg'],
            [':scope >.container >.amount >.status', './payment-done.svg'],
        ]) {
            this[
                this.defineImageProperty({
                    selector: item[0],
                    property: Symbol(),
                    mode: 'inline',
                    cwd: import.meta.url
                })
            ] = item[1]
        }


        /** @type {htmlhc.lib.alarm.AlarmObject<ehealthi.health.commerce.transaction.TransactionRecord>} */
        this.statedata = new AlarmObject({ abortSignal: this.destroySignal })


        /** @type {string[]} */ this.items
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: ':scope >.container >.items',
            transforms: {
                set: (input) => {
                    return hc.spawn({
                        tag: 'li',
                        innerHTML: input,
                    })
                },
                get: html => html.innerText
            }
        }, 'items')


        this.statedata.$0.addEventListener('commodities-change', async () => {

            const commodities = this.statedata.$0data.commodities;
            if (!commodities) {
                return
            }

            this.html.$(':scope >.container >.caption').innerText = `${commodities.length} Lab Test(s)`
            const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect()

            this.items = commodities.map(x => inventory.find(it => it.id == x)?.label || x)
        })


        if (me.id == message.sender) {

            const editAction = new ActionButton({
                content: `Edit`,
                onclick: async () => {
                    if (this.statedata.canceled || this.statedata.completed) return;

                    // Only the lab tests can be edited, not the doctor, nor the patient
                    try {
                        const initView = new TransactionInit({
                            patient: {
                                id: this.statedata.patient
                            }
                        });

                        initView.value = this.statedata.$0data.id

                        const selection = (await hcRpc.health.commerce.inventory.getInventoryDirect()).filter(x => (this.statedata.$0data.commodities || []).find(c => c == x.id))

                        this.html.dispatchEvent(
                            new WidgetEvent('backforth-goto', {
                                detail: {
                                    view: initView.html,
                                    title: `Modify Tests`,
                                }
                            })
                        );

                        initView.ready.then(() => {
                            for (const item of selection) {
                                initView.inventoryWidgets.find(x => x.data.id == item.id)?.html.click()
                            }
                        })

                        initView.addEventListener('complete', () => {
                            initView.html.dispatchEvent(
                                new WidgetEvent('backforth-goback')
                            );

                            load()
                        })

                    } catch (e) {
                        handle(e)
                    }
                },
                hoverAnimate: false
            });


            const viewResults = new ActionButton({
                content: `View Results`,
                hoverAnimate: false,
                onclick: async () => {
                    this.html.dispatchEvent(
                        new WidgetEvent(
                            'backforth-goto',
                            {
                                detail: {
                                    view: new ViewResults(this.statedata).html,
                                    title: `Test Results`
                                }
                            }
                        )
                    )
                }
            })

            const onStateChange = new DelayedAction(() => {
                if (this.statedata.paid) {
                    this.html.classList.add('paid')
                    if (!this.statedata.completed) {
                        viewResults.state = 'disabled'
                        viewResults.content = 'Waiting For Results'
                    }
                }

                if (this.statedata.completed) {
                    this.html.classList.add('completed')
                    viewResults.content = `View Results`
                    viewResults.state = 'initial'
                }


                if (this.statedata.canceled) {
                    terminateAction.state = 'disabled'
                    terminateAction.content = `Canceled`
                    editAction.destroy()
                    this.html.classList.add('canceled')
                }

                this.html.classList.toggle('patient-can-view', !!this.statedata.patientCanView)

            }, 500, 2000)


            const terminateAction = new ActionButton({
                content: `Cancel`,
                hoverAnimate: false,
                onclick: async () => {
                    const className = 'cancel-action-pending';

                    const pendingStateContent = `Tap again to Cancel`;
                    if (!this.html.classList.contains(className)) {
                        setTimeout(() => {
                            if (terminateAction.content.innerText == pendingStateContent) {
                                terminateAction.content = `Cancel`
                            }
                            setTimeout(() => {
                                this.html.classList.remove(className)
                            }, 500)
                        }, 4500)
                        setTimeout(() => terminateAction.content = pendingStateContent, 200)
                        return this.html.classList.add(className)
                    }
                    try {
                        await hcRpc.health.commerce.transaction.cancel({ id: this.statedata.$0data.id })
                        setTimeout(() => this.statedata.canceled = Date.now(), 250)
                    } catch (e) {
                        handle(e)
                    }
                }
            });

            const allowPatientView = new ActionButton({
                content: `Show to Patient`,
                hoverAnimate: false,
                onclick: async () => {


                    const className = 'allow-patient-view-action-pending';

                    const pendingStateContent = `Tap to allow patient view`;
                    if (!this.html.classList.contains(className)) {
                        setTimeout(() => {
                            // if (terminateAction.content.innerText == pendingStateContent) {
                            allowPatientView.content = `Show to Patient`
                            // }
                            setTimeout(() => {
                                this.html.classList.remove(className)
                            }, 500)
                        }, 4500)
                        setTimeout(() => allowPatientView.content = pendingStateContent, 200)
                        return this.html.classList.add(className)
                    }
                    try {
                        await hcRpc.health.commerce.transaction.update({ id: this.statedata.id, data: { patientCanView: true } });
                        this.statedata.patientCanView = true
                    } catch (e) {
                        handle(e)
                    }
                }
            });


            onStateChange()

            this.statedata.$0.addEventListener('canceled-change', onStateChange)
            this.statedata.$0.addEventListener('completed-change', onStateChange)
            this.statedata.$0.addEventListener('paid-change', onStateChange)
            this.statedata.$0.addEventListener('patientCanView-change', onStateChange)

            this.html.$(':scope >.container >.actions >.edit').appendChild(editAction.html)
            this.html.$(':scope >.container >.actions >.cancel').appendChild(terminateAction.html)
            this.html.$(':scope >.container >.actions >.view-results').appendChild(viewResults.html)
            this.html.$(':scope >.container >.actions >.allow-patient-view').appendChild(allowPatientView.html)

        } else {

            const onStateChange = () => {
                const { completed, canceled, paid } = this.statedata.$0data

                if (paid) {
                    btnConfigure.content = `Visit the Lab`
                }

                if (!(completed || canceled)) return

                btnConfigure.content = completed ? `Done` : `Canceled`
                this.html.classList.add(completed ? 'completed' : 'canceled')

                btnConfigure.state = 'disabled'
            }

            const btnConfigure = new ActionButton({
                content: `Get Started`,
                hoverAnimate: false,
                onclick: async () => {
                    // Go to the view for managing a single lab transaction
                    if (this.statedata.canceled) return;
                    configureTransaction(this.statedata, this.html)
                }
            })


            this.html.$(':scope >.container >.actions >.manage').appendChild(btnConfigure.html)

            this.statedata.$0.addEventListener('canceled-change', onStateChange)
            this.statedata.$0.addEventListener('completed-change', onStateChange)
            this.statedata.$0.addEventListener('paid-change', onStateChange)
            onStateChange()
        }

        /** @type {ehealthi.health.commerce.service_provider.profile.ServiceProvider} */ this.serviceProvider
        this.widgetProperty({
            parentSelector: ':scope >.container >.service-provider',
            selector: ['', ...InlineUserProfile.classList].join("."),
            transforms: {
                set: (input) => {
                    return new InlineUserProfile({
                        label: input.label || input.$profile.label,
                        icon: input.icon || input.$profile.icon,
                        id: input.userid,
                    }).html
                },
                get: (html) => {
                    const w = html.widgetObject;
                    return {
                        ...html.widgetObject,
                        label: w.label,
                        id: w.id,
                        icon: w.icon
                    }
                }
            }
        }, 'serviceProvider')


        const onServiceProviderChange = async () => {
            if (this.statedata.service_provider) {
                this.serviceProvider = await hcRpc.health.commerce.service_provider.profile.getProvider({ provider: this.statedata.service_provider })
            }
        }

        const onPaymentChange = async () => {
            this.html.$(':scope >.container >.amount >.data').innerText = ((i) => `${i.value} ${i.currency}`)(
                await (async () => {
                    // Trying to calculate the total price of the transaction, from the price of commodities
                    const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect()
                    return ([...this.statedata.$0data.commodities.map(x => inventory.find(i => i.id == x)).map(x => ({ value: x.price.value, currency: x.price.currency })), { value: 0 }].reduce((acc, curr) =>
                        ({ value: acc.value += curr.value, currency: curr.currency || acc.currency })
                    ))

                })()
            )
        }



        const load = () => this.blockWithAction(async () => {
            const id = message.data.meta.data["ehealthi-health-commerce-transaction"].id;
            Object.assign(this.statedata, { ...await hcRpc.health.commerce.transaction.getTransaction({ id }), id })
        })

        load().then(async () => {
            const client = await ModernuserEventClient.get();
            client.events.addEventListener('ehealthi-health-commerce-transaction-changed', (event) => {
                if (event.detail.data.id == this.statedata.id) {
                    Object.assign(this.statedata, event.detail.data)
                }
            }, { signal: this.destroySignal })
            client.events.addEventListener('init', () => load(), { signal: this.destroySignal })
        })

        this.statedata.$0.addEventListener('service_provider-change', onServiceProviderChange)
        this.statedata.$0.addEventListener('payment-change', onPaymentChange)
        this.statedata.$0.addEventListener('paid-change', () => {
            this.html.classList.toggle('paid', this.statedata.paid > 0)
        })




    }


    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-view-extension']

}