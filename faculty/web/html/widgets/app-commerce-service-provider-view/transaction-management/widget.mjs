/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (transaction-management), is part of the app-commerce-service-provider-view widget.
 * 
 * This widget allows a service provider to manage the transactions that concern them
 */

import ArchiveTransactions from "./archive/widget.mjs";
import PendingTransactions from "./pending/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class ServiceProviderTransactionManagement extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: ServiceProviderTransactionManagement.classList,
            innerHTML: `
                <div class='container'>
                    <div class='section pending'>
                        <div class='title'>Pending Transactions</div>
                        <div class='content'></div>
                    </div>

                    <div class='section archive'>
                        <div class='title'>Previous Transactions</div>
                        <div class='content'></div>
                    </div>
                    
                </div>
            `
        });

        this.html.$(":scope >.container >.section.pending >.content").appendChild(
            new PendingTransactions().html
        )
        this.html.$(":scope >.container >.section.archive >.content").appendChild(
            new ArchiveTransactions().html
        )
    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions']
}