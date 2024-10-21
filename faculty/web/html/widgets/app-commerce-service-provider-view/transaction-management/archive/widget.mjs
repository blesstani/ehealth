/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (archive), allows a service provider (laboratory) to manage past transactions
 */

import Item from "./item.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class ArchiveTransactions extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ArchiveTransactions.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                </div>
            `
        });

        /** @type {ehealthi.health.commerce.transaction.TransactionRecordExtra[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: ':scope >.container >.items',
                transforms: {
                    set: (input) => new Item(input).html,
                    get: ({ widgetObject: { statedata } }) => statedata.$0data
                }

            },

            'items'
        );

        this.blockWithAction(async () => {

            const pull = async () => {
                const stream = await hcRpc.health.commerce.transaction.getMyTransactions({ role: 'provider', type: 'current', since: this.items.map(x => x.$modified || 0).sort((a, b) => a > b ? 1 : a < b ? -1 : 0).at(-1) });

                (async () => {
                    for await (const item of stream) {
                        this.items.push(item)
                    }
                })();

                hcRpc.health.$jsonrpc.stub.healthLabsTest = () => {
                    window.confirm(`Wowwwww! The test works`)
                }

            }


            await pull();

            const eventClient = await ModernuserEventClient.get();

            eventClient.events.addEventListener('init', pull)
            eventClient.events.addEventListener('ehealthi-health-commerce-transaction-changed', (event) => {
                /** @type {ehealthi.health.commerce.transaction.TransactionRecord} */
                const transaction = event.detail
                const existing = this.items.find(x => x.id == transaction.id);

                if (!existing) {
                    pull()
                } else {
                    const nw = { ...existing };
                    Object.assign(nw, transaction)
                    this.items = [
                        nw,
                        ...this.items.filter(x => x.id != transaction.id)
                    ]
                }

            })


        })
    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-archive']


}