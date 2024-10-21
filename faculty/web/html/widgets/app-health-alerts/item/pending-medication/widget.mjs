/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, is part of the app-health-alerts widget.
 * This widget shows information about a medication that the user is yet to begin taking.
 */

import AlertItemView from "../item.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";



export default class PendingMedicationView extends AlertItemView {

    /**
     * 
     * @param {ehealthi.health.timetable.TimetableEntry} prescription 
     */
    constructor(prescription) {
        super(
            {
                image: new URL('./pending-medication.svg', import.meta.url).href,
                title: `New Prescription`,
                caption: `You've not yet started taking ${prescription.label}, prescribed by ${prescription['@timetable-entry']?.extra?.user?.label}`,
                time: prescription.created || Date.now(),
                actions: [
                    new ActionButton(
                        {
                            content: `Start`,
                            onclick: () => {
                                this.dispatchEvent(new CustomEvent('started'))
                            }
                        }
                    ).html
                ]
            }
        );

        /** @type {(event: 'started', cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=> void} */ this.addEventListener
    }
} 