/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The app-patient-health widget
 * This widget (appointment), represents a single confirmed appointment
 */

import AppointmentPaymentView from "../../app-patient-health/consultation/payment-view.mjs";
import timeUtils from "./util.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";


export default class AppointmentView extends Widget {

    /**
     * 
     * @param {ehealthi.health.timetable.TimetableEntry} data 
     */
    constructor(data) {

        super()

        const correspondent = data["@timetable-entry"]?.extra?.user?.label || 'someone';

        super.html = hc.spawn(
            {
                classes: AppointmentView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='left'>
                                <div class='image'></div>
                                <div class='time'></div>
                            </div>

                            <div class='right'>
                                <div class='title'></div>
                                <div class='caption'></div>
                                <div class='actions'></div>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.image
        this.defineImageProperty(
            {
                selector: '.container >.main >.left >.image',
                property: 'image',
                mode: 'inline'
            }
        );

        /** @type {string} */ this.title
        this.htmlProperty('.container >.main >.right >.title', 'title', 'innerHTML')

        /** @type {string} */ this.caption
        this.htmlProperty('.container >.main >.right >.caption', 'caption', 'innerHTML')

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.main >.right >.actions',
                childType: 'html',
            },
            'actions'
        );

        this.blockWithAction(async () => {
            const me = await hcRpc.modernuser.authentication.whoami()
            this.title = `Appointment with ${correspondent}`
            this.caption = `Appointment with someone, scheduled by ${(me.id == data.userid ? 'you' : correspondent)}${data.time > new Date().setHours(0, 0, 0, 0) + (7 * 24 * 60 * 60 * 1000) ? ' on ' + new Date(data.time).toDateString() : ''}.`
            this.image = data["@timetable-entry"]?.extra?.user.icon || '/$/shared/static/logo.png'
            this.html.$(":scope >.container >.main >.left >.time").innerText = timeUtils.timeString(data.time)
        });

        const drawActions = () => {



            this.actions = [


                !data.paid ? (() => {
                    let paymentUI;

                    const btn = new ActionButton({
                        content: `Complete Payment`,
                        onclick: async () => {
                            this.html.dispatchEvent(
                                new WidgetEvent('backforth-goto', {
                                    detail: {
                                        title: `Complete Payment`,
                                        view: (
                                            paymentUI ||= (() => {
                                                const widget = new AppointmentPaymentView()

                                                widget.addEventListener('complete', () => {
                                                    paymentUI = null
                                                    data.paid = Date.now()
                                                    // Remove the payment button, by redrawing all buttons
                                                    drawActions()
                                                })

                                                widget.payment = data.payment

                                                return widget
                                            })()
                                        ).html,
                                    },
                                    bubbles: true
                                })
                            )
                        }
                    })
                    return btn.html
                })() : undefined,


                data.paid && new ActionButton(
                    {
                        content: `Get Started`,
                        // Disable this button, untill 10 mins to appointment time.
                        state: data.time >= (Date.now() - (10 * 60 * 1000)) ? 'disabled' : 'initial'
                    }
                ).html,

            ].filter(x => x)

        }

        drawActions()
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-appointments-listings-item']
    }
}