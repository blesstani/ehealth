/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This part of the app-patient-health widget, is where the consultation is actually created
 */

import EHealthiArrowButton from "../../arrow-button/widget.mjs";
import AppointmentPaymentView from "./payment-view.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { AnimatedTick } from "/$/system/static/html-hc/widgets/animated-tick/tick.js";
import { SlideContainer } from "/$/system/static/html-hc/widgets/slide-container/container.mjs";

const slider = Symbol()

export default class PatientConsultationExec extends Widget {

    /**
     * 
     * @param {ehealthi.health.appointment.AppointmentInit} init 
     */
    constructor(init) {

        super();

        this.html = hc.spawn(
            {
                classes: PatientConsultationExec.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='stage'></div>
                        <div class='btn-continue'></div>
                    </div>
                `
            }
        );

        this[slider] = new SlideContainer();

        const paymentView = new AppointmentPaymentView()


        this[slider].screens.push(
            paymentView.html,
            new PostAppointmentScheduleMessage().html
        )

        this.html.$('.container >.stage').appendChild(this[slider].html)


        const actionBtn = new EHealthiArrowButton(
            {
                content: `Continue`,
                onclick: () => {
                    this.html.dispatchEvent(
                        new WidgetEvent(
                            'backforth-goback',
                            {
                                detail: {
                                    offset: 2
                                }
                            }
                        )

                    )
                    this.dispatchEvent(new CustomEvent('dismiss'));
                },
                state: 'disabled'
            }
        );
        /** @type {(event: 'dismiss', cb: (event: CustomEvent)=>void, opts?: AddEventListenerOptions)} */ this.addEventListener


        this.html.$('.container >.btn-continue').appendChild(
            actionBtn.html
        );


        this.blockWithAction(async () => {
            // Once this view becomes visible, create the appointment
            const id = await hcRpc.health.appointment.create(
                {
                    time: init.time,
                    type: init.type,
                }
            );

            const data = await hcRpc.health.appointment.getAppointment({ id });

            paymentView.payment = data.payment


            paymentView.addEventListener('complete', () => {
                // TODO: Make different view, for cases where the user cancels the payment. Perhaps he wants to pay later.
                setTimeout(() => this[slider].index = 1, 2500);
                actionBtn.state = 'initial'
            })

        })
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-appointment-exec']
    }

}



class PostAppointmentScheduleMessage extends Widget {
    constructor() {
        super();


        this.html = hc.spawn(
            {
                classes: PostAppointmentScheduleMessage.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='tick'></div>
                        <div class='text'>Your consultation has been created. In case the exact time, or doctor is changed, you'll be notified.</div>
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
        })
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-appointment-post-create']
    }
}