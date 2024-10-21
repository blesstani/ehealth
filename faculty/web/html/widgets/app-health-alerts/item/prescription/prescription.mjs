/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, is part of the app-patient-health widget, where it represents an entry on the timetable to inform the user
 * to take a medication
 */

import AlertItemView from "../item.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";




export default class PrescriptionView extends AlertItemView {

    /**
     * 
     * @param {ehealthi.health.prescription.Prescription} prescription
     * @param {ehealthi.health.prescription.IntakeDose}  intakeDose
     * @param {number} time
     */
    constructor(prescription, intakeDose, time) {
        super(
            {
                image: new URL('./medication.svg', import.meta.url).href,
                title: `Take your medication`,
                caption: `Take ${intakeDose.quantity.value} ${intakeDose.quantity.label} of ${prescription.label}, at <i><b>${hc.toTimeString(new Date(intakeDose.time))}</b></i>.\n<br>Tap for more info.`,
                time,
                actions: [
                    new ActionButton(
                        {
                            content: `Info`,
                            onclick: () => {
                                const timePrefix = time == new Date().setHours(0, 0, 0, 0) ? 'Today' : new Date(time).toDateString()
                                // Show a popup with medication info.
                                new HCTSBrandedPopup(
                                    {
                                        content: hc.spawn(
                                            {
                                                classes: ['hc-ehealthi-health-app-patient-health-prescription-detail-view'],
                                                innerHTML: `
                                                    <div class='container'>
                                                        <div class='prescription-label'>${prescription.label}</div>
                                                        <div class='time-label'>
                                                            <div class='prefix'>${timePrefix},</div>
                                                            <div class='content'>${hc.toTimeString(new Date(intakeDose.time))}</div>
                                                        </div>
                                                        <div class='intake-label'>${intakeDose.quantity.value} ${intakeDose.quantity.label}</div>
                                                        <div class='notes'>${prescription.notes || ''}</div>
                                                    </div>
                                                `
                                            }
                                        )
                                    }
                                ).show()
                            }
                        }
                    ).html
                ]
            }
        );

        this.html.classList.add(...PrescriptionView.classList)
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-main-view-prescription-item']
    }
}


hc.importModuleCSS(import.meta.url)