/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (pending), is part of the app-commerce-service-provider-view/transaction-management widget.
 * This widget allows a service provider to manage pending transactions that concern them.
 */

import utils from "../utils.mjs";
import TransactionDetails from "./details/widget.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";


export default class PendingTransactions extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: PendingTransactions.classList,
            innerHTML: `
                <div class='container'>
                    <div class='listings'></div>
                </div>
            `
        });

        /** @type {ehealthi.health.commerce.transaction.TransactionRecordExtra[]} */ this.items
        this.pluralWidgetProperty({
            selector: ['', ...PendingTransactions.Item.classList].join('.'),
            parentSelector: ':scope >.container >.listings',
            transforms: {
                set: (input) => new PendingTransactions.Item(input).html,
                get: ({ widgetObject: { data } }) => data
            }
        }, 'items');

        const pullContent = async (blockView, waitForAll) => {

            const main = async () => {
                const stream = await hcRpc.health.commerce.transaction.getMyTransactions({ role: 'provider', type: 'current', since: [...this.items].sort((a, b) => a.$modified > b.$modified ? 1 : a.$modified < b.$modified ? -1 : 0).at(-1)?.$modified || 0 });

                // Stop the spinner, only after the first transaction is drawn
                let good, bad;
                const promise = new Promise((resolve, reject) => {
                    good = resolve
                    bad = reject
                });

                (async () => {
                    try {
                        for await (const item of stream) {
                            this.items.push(item)
                            if (!waitForAll) good()
                        }
                        good()
                    } catch (e) {
                        bad(e)
                    }
                })()

                await promise
            }

            if (blockView) {
                await this.blockWithAction(main)
            } else {
                await main()
            }
            setupRefresh()
        }

        let refreshActive

        const setupRefresh = async () => {
            await this.blockWithAction(async () => {
                if (refreshActive) return;
                const client = await ModernuserEventClient.get()
                const pull = async () => {


                    const count = this.items.length;

                    const notify = async () => {
                        const diff = this.items.length - count

                        if (globalThis.AppFrameAPI && diff > 0) {
                            await (await AppFrameAPI.notification()).notify(
                                {
                                    title: `New Lab Tests`,
                                    content: `You have ${diff} new lab test(s) sent to your laboratory`,
                                    groupId: 'labs',
                                    id: 'labs-multiple-provider',
                                }
                            )
                        }
                    }

                    try {
                        await pullContent(false, true)
                        notify()
                    } catch (e) {
                        notify()
                        throw e
                    }

                };
                client.events.addEventListener('init', pull)
                client.events.addEventListener('modernuser-authentication-login-complete', pull)
                client.events.addEventListener('ehealthi-health-commerce-transaction-changed', async (event) => {
                    // Here, were checking for transactions that are just recently paid, that have to be added to the list
                    /** @type {ehealthi.health.commerce.transaction.TransactionRecord} */
                    const transaction = event.detail.data

                    console.log(`Dealing with `, event.detail)

                    if (transaction.paid) {
                        const transactionFullData = await hcRpc.health.commerce.transaction.getTransaction({ id: transaction.id });
                        this.items = [
                            transactionFullData,
                            ...this.items.filter(x => x.id != transaction.id),
                        ];

                        // Notify the user
                        if (globalThis.AppFrameAPI) {
                            await (await AppFrameAPI.notification()).notify(
                                {
                                    title: `New Lab Test from ${transactionFullData.$profiles.find(x => x.id == transactionFullData.doctor)?.label || 'Some Doctor'}`,
                                    content: `${transactionFullData.$profiles.find(x => x.id == transactionFullData.patient)?.label} has been sent to do a test with your laboratory`,
                                    groupId: 'labs',
                                    id: transaction.id,
                                }
                            )
                        }
                    }

                })
                refreshActive = true
            })
        }

        pullContent(true);

    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending']


    static Item = class extends Widget {


        /**
         * 
         * @param {ehealthi.health.commerce.transaction.TransactionRecordExtra} transaction 
         */
        constructor(transaction) {
            super();

            super.html = hc.spawn({
                classes: PendingTransactions.Item.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='icon'></div>
                            <div class='details'>
                                <div class='label'></div>
                                <div class='transaction-id'>
                                    <div class='label'>Transaction ID: </div>
                                    <div class='content'></div>
                                </div>
                                <div class='summary'>
                                    <div class='commodities'></div>
                                    <div class='date'></div>
                                    <div class='doctor-info'>
                                        <div class='label'>From</div>
                                        <div class='content'></div>
                                    </div>
                                </div>
                                <div class='actions'></div>
                            </div>
                        </div>
                    </div>
                `
            });

            this.blockWithAction(async () => {
                const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect()
                this.html.$(':scope >.container >.main >.details >.summary >.commodities').innerHTML = `${transaction.commodities.length} tests: <data>${transaction.commodities.map(
                    commo => inventory.find(x => x.id == commo)?.label || `#${comm}`
                ).join(',')}</data>`
            });

            const profile = transaction.$profiles.find(x => x.id == transaction.patient);

            this.html.$(':scope >.container >.main >.details >.label').innerText = profile.label

            this[
                this.defineImageProperty({
                    selector: (':scope >.container >.main >.icon'),
                    property: Symbol(),
                    mode: 'inline',
                    fallback: '/$/shared/static/logo.png',
                    cwd: import.meta.url
                })
            ] = profile.icon

            hc.watchToCSS({
                source: this.html.$(':scope >.container >.main >.details'),
                watch: {
                    dimension: 'height'
                },
                target: this.html.$(':scope >.container >.main >.icon'),
                apply: '--min-height',
                signal: this.destroySignal
            })

            this.html.$(':scope >.container >.main >.details >.summary >.date').innerHTML = `Since <data>${utils.dateString(transaction.created)}</data>`

            this.html.$(':scope >.container >.main >.details >.transaction-id >.content').innerText = transaction.id

            this.html.$(':scope >.container >.main >.details >.actions').appendChild(
                new ActionButton({
                    content: `Manage`,
                    hoverAnimate: false,
                    onclick: async () => {
                        this.html.dispatchEvent(
                            new WidgetEvent(
                                'backforth-goto',
                                {
                                    detail: {
                                        view: new TransactionDetails(transaction).html,
                                        title: `Lab Test details`,
                                    }
                                }
                            )
                        )
                    }
                }).html
            );


            this.html.$(':scope >.container >.main >.details >.summary >.doctor-info >.content').appendChild(
                new InlineUserProfile({
                    ...transaction.$profiles.find(x => x.id == transaction.doctor)
                }).html
            )


            this.data = transaction
        }

        /** @readonly */
        static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-item']

    }
}