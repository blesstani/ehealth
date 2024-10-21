/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (date-section), is part of the app-appointments/listings widget
 * This widget groups appointments by date
 */

import Appointment from "./appointment.mjs";
import timeUtils from "./util.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class DateSection extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {ehealthi.ui.app.app_appointments.listings.Statedata} param0.statedata
     * @param {ehealthi.ui.app.app_appointments.listings.DateRange} param0.range
     */
    constructor({ statedata, range } = {}) {
        super()

        super.html = hc.spawn(
            {
                classes: DateSection.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='date-label'></div>
                        <div class='items'></div>
                    </div>
                `
            }
        );
        /** @type {ehealthi.ui.app.app_appointments.listings.Statedata} */ this.statedata
        /** @type {ehealthi.ui.app.app_appointments.listings.DateRange} */ this.range


        /** @type {ehealthi.health.appointment.Appointment[]} */ this.list
        const listDataSymbol = Symbol()
        this.pluralWidgetProperty(
            {
                selector: ['', ...Appointment.classList].join('.'),
                parentSelector: '.container >.items',
                property: 'list',
                transforms: {
                    set: (v) => {
                        const widget = new Appointment(v);

                        widget[listDataSymbol] = v
                        return widget.html
                    },
                    get: (html) => {
                        return html.widgetObject[listDataSymbol]
                    }
                }
            }
        );

        const doLoad = new DelayedAction(() => {
            this.list = this.statedata.$0data.appointments.filter(x => {
                const time = timeUtils.trueTime(x)
                return (this.range.max >= timeUtils.dayStart(time)) && (this.range.min <= time)
            }).sort((a, b) => {
                // In every section, the items should be sorted in order of increasing date
                return a.time > b.time ? -1 : a.time == b.time ? 0 : 1
            });
        }, 50)

        this.waitTillDOMAttached().then(() => {
            this.statedata.$0.addEventListener('appointments-change', doLoad, {}, true)
            this.html.$('.container >.date-label').innerHTML = improviseDateLabel(this.range)
            doLoad()
        })

        Object.assign(this, arguments[0])

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-appointments-listing-date-section']
    }

}


/**
 * This method improvises a title for a range of dates
 * @param {import("./types.js").DateRange} range 
 * @returns {string}
 */
const improviseDateLabel = (range) => {
    const str = numb => new Date(numb).toDateString()

    if (range.max === range.min) {
        return str(range.max)
    }
    if (range.min === Number.NEGATIVE_INFINITY) {
        return `${str(range.max)}, and earlier`
    }
    if (range.max === Number.POSITIVE_INFINITY) {
        return `${str(range.min)}, and later`
    }
    return `${new str(range.min)} to ${str(range.max)}`
}