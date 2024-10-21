/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The app-patient-health widget
 * This widget (appointment), represents a single confirmed appointment
 */

import TimetableItemView from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";


export default class AppointmentView extends TimetableItemView {

    /**
     * 
     * @param {ehealthi.health.timetable.TimetableEntry} data 
     */
    constructor(data) {
        const correspondent = data["@timetable-entry"].extra?.user?.label || 'someone';
        super(
            {
                title: `Appointment with ${correspondent}`,
                caption: `Appointment scheduled for ${hc.toTimeString(new Date(data?.time))}`,
                image: data["@timetable-entry"].extra?.user?.icon || '/$/shared/static/logo.png',
                time: data.time
            }
        );

        this.html.classList.add(...AppointmentView.classList)

        this.blockWithAction(async () => {
            const me = await hcRpc.modernuser.authentication.whoami()
            this.caption += `, by ${(me.id == data.userid ? 'you' : correspondent)}.`
        });

        this.actions = [
            new ActionButton(
                {
                    content: `Get Started`,
                    // Disable this button, untill 10 mins to appointment time.
                    state: data.time >= (Date.now() - (10 * 60 * 1000)) ? 'disabled' : 'initial'
                }
            ).html
        ]
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-main-view-appointment-item']
    }
}