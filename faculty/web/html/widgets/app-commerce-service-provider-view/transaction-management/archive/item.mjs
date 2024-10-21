/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget, represents a single item on the view where the service provider manages past transactions.
 */

import utils from "../utils.mjs";
import TransactionDetails from "./details/widget.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class Item extends Widget {


    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecordExtra} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: Item.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='icon'></div>
                        <div class='details'>
                            <div class='label'></div>
                            <div class='transaction-id'>
                                <div class='label'>ID: </div>
                                <div class='content'></div>
                            </div>
                            <div class='table'>
                                <div class='amount'></div>
                                <div class='completed'>
                                    <div class='content'></div>
                                </div>
                            </div>
                        </div>
                        <div class='actions'></div>
                    </div>
                </div>
            `
        });


        /** @type {htmlhc.lib.alarm.AlarmObject<typeof transaction>} */
        this.statedata = new AlarmObject({ abortSignal: this.destroySignal });

        const icon = Symbol()
        this.defineImageProperty({
            selector: ":scope >.container >.main >.icon",
            property: icon,
            mode: 'inline',
            cwd: import.meta.url,
            fallback: '/$/shared/static/logo.png'
        })



        const drawPatientProfile = (profile) => {
            this.html.$(':scope >.container >.main >.details >.label').innerText = profile.label
            this[icon] = profile.icon

        }

        for (
            const property of [
                ['patient', drawPatientProfile]
            ]
        ) {

            ((property, callback) => {
                const draw = new DelayedAction(() => {
                    if (!this.statedata.$0data[property] || !this.statedata.$0data.$profiles) return;

                    const profile = this.statedata.$0data.$profiles.find(x => x.id == this.statedata.$0data[property]);

                    if (!profile) return;
                    callback(profile)


                }, 250, 1000)

                this.statedata.$0.addEventListener('$profiles-change', draw)
                this.statedata.$0.addEventListener(`${property}-change`, draw)
            })(property[0], property[1])
        }


        for (const property of ['completed']) {

            ((property) => {
                this.statedata.$0.addEventListener(`${property}-change`, new DelayedAction(() => {
                    this.html.$(`:scope >.container >.main >.details >.table >.${property} >.content`).innerText = utils.dateString(this.statedata.$0data[property])
                }, 250, 1000))
            })(property)
        }

        this.statedata.$0.addEventListener('commodities-change', new DelayedAction(() => {
            this.blockWithAction(async () => {
                const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect();
                const totalAmount = this.statedata.$0data.commodities.map(x => {
                    const item = inventory.find(i => i.id == x)
                    item.price.value = item.price.value * ((100 - item.commission) / 100)
                    return item.price
                }).reduce((a, b) => ({ currency: a.currency, value: a.value + b.value }));
                this.html.$(`:scope >.container >.main >.details >.table >.amount`).innerHTML = `${totalAmount.value} ${totalAmount.currency}`
            })
        }, 250, 1000));

        this.statedata.$0.addEventListener('id-change', () => {
            this.html.$(':scope >.container >.main >.details >.transaction-id >.content').innerText = this.statedata.$0data.id
        })


        this.waitTillDOMAttached().then(() => {
            Object.assign(this.statedata, transaction)
        });

        this.html.addEventListener('click', () => {
            this.html.dispatchEvent(
                new WidgetEvent(
                    'backforth-goto',
                    {
                        detail: {
                            view: new TransactionDetails(this.statedata).html,
                            title: `Details`
                        }
                    }
                )
            )
        })

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-archive-item']
}