/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget allows a user to pay for a laboratory transaction.
 */

import InlinePaymentSettle from "/$/finance/payment/static/widgets/inline-payment-settle/debit.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class MakePayment extends Widget {


    /**
     * 
     * @param {htmlhc.lib.alarm.AlarmObject<ehealthi.health.commerce.transaction.TransactionRecord>} transaction 
     */
    constructor(transaction) {

        super();

        super.html = hc.spawn({
            classes: MakePayment.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title'>Pay for Lab Tests</div>
                    <div class='caption'>
                        <div class='text'>To continue, complete the payment of</div>
                        <div class='amount'></div>
                    </div>

                    <div class='payment-main'></div>
                    
                </div>
            `
        });

        const paymentMain = new InlinePaymentSettle();
        this.html.$(':scope >.container >.payment-main').appendChild(paymentMain.html)


        const setId = () => paymentMain.state_data.payment_data.id = transaction.payment
        setId()

        transaction.$0.addEventListener('payment-change', setId)

        paymentMain.state_data.$0.addEventListener('payment_data.amount-change', () => {
            this.html.$(':scope >.container >.caption >.amount').innerText = ((i) => `${i.value} ${i.currency}`)(paymentMain.state_data.$0data.payment_data.amount)
        });

        paymentMain.state_data.$0.addEventListener('payment_data.done-change', () => {
            if (paymentMain.state_data.payment_data.done) {
                this.dispatchEvent(new CustomEvent('complete'))
            }
        })
        /** @type {(event:'complete', cb: (event: CustomEvent)=>void, opts?: AddEventListenerOptions)=>void} */ this.addEventListener

    }


    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-configure-transaction-make-payment']


}