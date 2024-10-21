/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (details), is part of the app-commerce-service-provider-view/transaction-management widget.
 * This widget allows a service provider to view information about a transaction involving them, and possibily service the transaction.
 */

import utils from "../../utils.mjs";
import TransactionServicing from "./servicing/widget.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class TransactionDetails extends Widget {


    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecordExtra} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: TransactionDetails.classList,
            innerHTML: `
                <div class='container'>
                    <div class='patient-info'></div>
                    <div class='summary'>
                        <div class='commodities'>
                            <div class='label'>Tests</div>
                            <ul class='content'></ul>
                        </div>
                        <div class='doctor-info'>
                            <div class='label'>Prescribed by</div>
                            <div class='content'></div>
                        </div>

                        <div class='payment-info'>
                            <div class='label'>Prescribed on</div>
                            <div class='content'></div>
                        </div>
                        
                    </div>
                    <div class='servicing'></div>
                </div>
            `
        });

        /** @type {ehealthi.health.commerce.inventory.Commodity[]} */ this.commodities
        this.pluralWidgetProperty({
            parentSelector: ':scope >.container >.summary >.commodities >.content',
            selector: 'li',
            transforms: {
                set: (input) => {
                    const li = hc.spawn({
                        tag: 'li',
                        innerHTML: input.label,
                    })
                    li.data = input;
                    return li
                },
                get: ({ data }) => data
            }
        }, 'commodities');

        this.html.$(':scope >.container >.servicing').appendChild(
            new TransactionServicing(transaction).html
        )

        this.blockWithAction(async () => {
            this.html.$(':scope >.container >.patient-info').appendChild(
                new InlineUserProfile({
                    ...transaction.$profiles.find(x => x.id == transaction.patient)
                }).html
            );

            this.html.$(':scope >.container >.summary >.doctor-info').appendChild(
                new InlineUserProfile({
                    ...transaction.$profiles.find(x => x.id == transaction.doctor)
                }).html
            );

            this.html.$(':scope >.container >.summary >.payment-info >.content').innerText = utils.dateString(transaction.created)

            const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect()

            this.commodities = transaction.commodities.map(x => inventory.find(xx => xx.id == x))

        })


    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-details']

}