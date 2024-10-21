/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget is meant for doctors and patients to see appointments that are upcoming, as well as schedule new appointments
 */


import PatientConsultationInit from "../app-patient-health/consultation/init.mjs";
import EHealthiArrowButton from "../arrow-button/widget.mjs";
import AppointmentListings from "./listings/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class AppAppointsmentView extends Widget {


    constructor() {
        super()

        super.html = hc.spawn({
            classes: AppAppointsmentView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='action'></div>
                    <div class='listings'></div>
                </div>
            `
        });

        const listings = new AppointmentListings();
        this.html.$(".container >.listings").appendChild(
            listings.html
        )


        let bookAppointment;
        this.html.$(':scope >.container >.action').appendChild(
            new EHealthiArrowButton(
                {
                    content: `See the doctor`,
                    onclick: async () => {
                        this.html.dispatchEvent(
                            new WidgetEvent('backforth-goto', {
                                detail: {
                                    title: `Consultation`,
                                    view: (
                                        bookAppointment ||= (() => {
                                            const widget = new PatientConsultationInit()
                                            widget.addEventListener('dismiss', () => {
                                                bookAppointment = null
                                                listings.download()
                                            })
                                            return widget
                                        })()
                                    ).html,
                                },
                                bubbles: true
                            })
                        )
                    }
                }
            ).html
        );

    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-appointments-view']

}