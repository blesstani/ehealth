/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (post-payment-info), is the view that's presented to a user after he paid for a lab transaction.
 * This view contains vital information
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { AnimatedTick } from "/$/system/static/html-hc/widgets/animated-tick/index.mjs";
import EHealthiArrowButton from "/$/web/html/widgets/arrow-button/widget.mjs";




export default class PostTransactionPayment extends Widget {
    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecordExtra} transaction 
     */
    constructor(transaction) {
        super();


        this.html = hc.spawn(
            {
                classes: PostTransactionPayment.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='title'>Payment Done</div>
                        <div class='tick'></div>
                        <div class='text'>You have completed payment for the lab tests. You can simply visit the lab, because they already have your information. To check the status of this test, check the Labs tab. Once the results are available, they would be sent to your doctor. He/she would then send you a message.</div>
                        <div class='info'>
                            <div class='item label'>
                                <div class='title'>Name of Laboratory</div>
                                <div class='content'></div>
                            </div>

                            <div class='item address'>
                                <div class='title'>Address</div>
                                <div class='content'></div>
                            </div>
                        </div>
                        <div class='continue'></div>
                    </div>
                `
            }
        );

        const tick = new AnimatedTick({ activated: true })
        this.html.$('.container >.tick').appendChild(
            tick.html
        )
        this.waitTillDOMAttached().then(() => {
            setTimeout(() => tick.animate(), 1000)
        });

        this.html.$(':scope >.container >.continue').appendChild(
            new EHealthiArrowButton(
                {
                    content: `Continue`,
                    onclick: () => {
                        this.dispatchEvent(new CustomEvent('complete'))
                    }
                }
            ).html
        );

        this.blockWithAction(async () => {
            const profile = await hcRpc.health.commerce.service_provider.profile.getProvider({ provider: transaction.service_provider })

            for (const property of ['label', 'address']) {
                this.html.$(`:scope >.container >.info >.item.${property} >.content`).innerText = profile[property] || profile.$profile[property]
            }
        })

        /** @type {(event: "complete", cb: (event: CustomEvent)=> void, opts?: AddEventListenerOptions)=> void} */ this.addEventListener
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-commerce-configure-transaction-post-payment']
    }
}