/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, allows a user to commence the process of booking an appointment with a doctor. 
 */

import EHealthiArrowButton from "../../arrow-button/widget.mjs";
import PatientConsultationExec from "./execute.mjs";
import SelectAppointmentType from "./select-appointment-type.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { NiceNumberInput } from "/$/system/static/html-hc/widgets/nice-number-input/input.mjs";
import SimpleCalendar from "/$/system/static/html-hc/widgets/simple-calendar/widget.mjs";


export default class PatientConsultationInit extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: PatientConsultationInit.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='btn-continue'></div>
                        <div class='sections'>
                            <div class='section date'>
                                <div class='title'>Choose a date</div>
                            </div>

                            <div class='section time'>
                                <div class='title'>What time ?</div>
                            </div>

                            <div class='section select-appointment-type'>
                                <div class='title'>What type of consultation?</div>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {PatientConsultationExec} */
        let exec;

        const btnContinue = new EHealthiArrowButton({
            content: `Continue`,
            state: 'disabled',
            onclick: async () => {
                this.html.dispatchEvent(
                    new WidgetEvent('backforth-goto', {
                        detail: {
                            title: `Consultation`,
                            view: (exec ||= new PatientConsultationExec({
                                time: dateSelect.selectedDate.setHours(timeSelect.value, 0, 0, 0),
                                type: selectAppointmentType.value
                            })).html
                        }
                    })
                )

                exec.addEventListener('dismiss', () => {
                    exec = null
                    this.dispatchEvent(new CustomEvent("dismiss"))
                }, { once: true })
            }
        });

        /** @type {(event: 'dismiss', cb: (event: CustomEvent)=>void, opts?: AddEventListenerOptions)} */ this.addEventListener

        this.html.$('.container >.btn-continue').appendChild(
            btnContinue.html
        );

        const dateSelect = new SimpleCalendar();

        this.html.$('.container >.sections >.section.date').appendChild(
            dateSelect.html
        );

        const timeSelect = new NiceNumberInput();
        this.html.$('.container >.sections >.section.time').appendChild(
            timeSelect.html
        );
        timeSelect.addEventListener('change', () => {
            if (timeSelect.value > 23) {
                timeSelect.value = 0
            }
            if (timeSelect.value < 0) {
                timeSelect.value = 23
            }
        })
        timeSelect.value = 10;

        const onchange = () => {
            if ((dateSelect.selectedDate < new Date().setHours(0, 0, 0, 0)) || !selectAppointmentType.value) {
                btnContinue.state = 'disabled'
                return;
            }

            btnContinue.state = 'initial'
        };

        const selectAppointmentType = new SelectAppointmentType()
        this.html.$(':scope >.container >.sections >.section.select-appointment-type').appendChild(
            selectAppointmentType.html
        )

        timeSelect.addEventListener('change', onchange)
        dateSelect.addEventListener('selectionchange', onchange)
        selectAppointmentType.addEventListener('change', onchange)
    }


    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-appointment-init']
    }

}