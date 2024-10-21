/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This utility allows a user to, "configure", a transaction.
 * This means, setting the preferred service provider (laboratory), and making payments
 */

import MakePayment from "./make-payment/widget.mjs";
import PostTransactionPayment from "./post-payment-info/widget.mjs";
import SetServiceProvider from "./set-service-provider/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";



/**
 * This method walks the user through configuring a transaction 
 * @param {ehealthi.health.commerce.transaction.TransactionRecord} transaction
 * @param {HTMLElement} html 
 */
export default async function configureTransaction(transaction, html) {

    let navCount = 0;

    /**
     * 
     * @param {HTMLElement} html 
     */
    function setServiceProvider(html) {
        const widget = new SetServiceProvider(transaction);
        html.dispatchEvent(
            new WidgetEvent('backforth-goto', {
                detail: {
                    view: widget.html,
                    title: `Select a Laboratory`
                }
            })
        );
        navCount++

        widget.addEventListener('complete', () => {
            transaction.service_provider = widget.value.userid
            makePayment(widget.html)
        })
    }


    /**
     * 
     * @param {HTMLElement} html 
     */
    function makePayment(html) {
        const paymentView = new MakePayment(transaction);

        html.dispatchEvent(new WidgetEvent('backforth-goto', {
            detail: {
                title: `Make Payment`,
                view: paymentView.html
            }
        }))
        navCount++

        paymentView.addEventListener('complete', () => {
            setTimeout(() => goBack(paymentView.html), 1500)
        })

    }



    /**
     * 
     * @param {HTMLElement} html 
     */
    function postPayment(html) {
        const postPayment = new PostTransactionPayment(transaction);

        html.dispatchEvent(new WidgetEvent('backforth-goto', {
            detail: {
                title: `Make Payment`,
                view: postPayment.html
            }
        }))
        navCount++

        postPayment.addEventListener('complete', () => {
            goBack(postPayment.html)
        })

    }

    /**
     * 
     * @param {HTMLElement} html 
     */
    function goBack(html) {
        html.dispatchEvent(
            new WidgetEvent('backforth-goback', { detail: { offset: navCount } })
        )
    };



    if (
        !transaction.paid
        &&
        !(
            (transaction.created > (Date.now() - 2 * 60 * 1000)) && ((input) => input.done || (input.executed && !input.failed?.fatal))(await hcRpc.finance.payment.getPublicData({ id: transaction.payment }))
        )
    ) {
        setServiceProvider(html)
    } else {
        if (transaction.paid) {
            postPayment(html)
        } else {
            makePayment(html)
        }
    }

}