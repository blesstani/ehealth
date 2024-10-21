/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget is the view where the user gets to pay before completing an appointment
 */

import InlinePaymentSettle from "/$/finance/payment/static/widgets/inline-payment-settle/debit.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class AppointmentPaymentView extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: AppointmentPaymentView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='top'>
                            <div class='caption'>Just one more step...</div>
                            <div class='image'></div>
                        </div>

                        <div class='main'>
                            <div class='title'>Payment for appointment</div>
                            <div class='info'>
                                <div class='pre'>Please make a payment of</div>
                                <div class='amount'></div>
                                <div class='post'>to complete your request.</div>
                            </div>
                            <div class='payment'></div>
                        </div>
                        
                    </div>
                `
            }
        );

        const inlinePayment = new InlinePaymentSettle();
        this.html.$(".container >.main >.payment").appendChild(inlinePayment.html)

        inlinePayment.state_data.$0.addEventListener('payment_data.amount-change', () => {
            this.html.$('.container >.main >.info >.amount').innerHTML = `${inlinePayment.state_data.payment_data.amount.value} ${inlinePayment.state_data.payment_data.amount.currency}`
        });

        /** @type {(event: "complete", cb: (event: CustomEvent)=> void, opts: AddEventListenerOptions)} */ this.addEventListener
        inlinePayment.state_data.$0.addEventListener('stage-change', () => {
            if (inlinePayment.state_data.stage == 'success') {
                this.dispatchEvent(new CustomEvent('complete'))
            }
        })

        /** @type {string} */ this.payment
        Reflect.defineProperty(this, 'payment', {
            set: (payment) => inlinePayment.state_data.payment_data.id = payment,
            get: () => inlinePayment.state_data.payment_data.id,
            configurable: true,
            enumerable: true
        })

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-appointment-payment-view']
    }

}