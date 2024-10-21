/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (listings), is part of the app-appointments widget, where it simply lists the appointments, both upcoming,
 * and previous.
 */

import DateSection from "./date-section.mjs";
import timeUtils from "./util.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";




export default class AppointmentListings extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: AppointmentListings.classList,
            innerHTML: `
                <div class='container'>
                    <div class='sections'></div>
                </div>
            `
        });
        const sections = Symbol()

        /** @type {ehealthi.ui.app.app_appointments.listings.Statedata} */ this.statedata = new AlarmObject({ abortSignal: this.destroySignal })
        this.statedata.appointments = []

        /** @type {ehealthi.ui.app.app_appointments.listings.DateRange[]} */ this[sections];


        this.pluralWidgetProperty({
            selector: ['', ...DateSection.classList].join("."),
            parentSelector: ':scope >.container >.sections',
            target: this,
            transforms: {
                /** @param {ehealthi.ui.app.app_appointments.listings.DateRange} input */
                set: (input) => {
                    return new DateSection(
                        {
                            statedata: this.statedata,
                            range: input
                        }
                    ).html
                },
                get: ({ widgetObject: widget }) => {
                    return widget.range
                },
            },
            sticky: false
        }, sections)

        const drawUI = new DelayedAction(async () => {

            // Here's the heart of the widget's navigation ability...
            // carefully constructing ranges, based on the view mode
            const todayStart = timeUtils.dayStart(Date.now());

            /** @type {ehealthi.ui.app.app_appointments.listings.DateRange[]} */
            const ranges = [];

            /**
             * This method tells us if there are any appointments that day.
             * 
             * If there are, add this date the list of ranges
             * @param {number} date 
             * @returns {boolean}
             */
            const addRangeForDate = (date) => {
                const has = this.statedata.$0data.appointments.findIndex(x => timeUtils.dayStart(timeUtils.trueTime(x)) === date) !== -1
                if (has) {
                    ranges.push({ min: date, max: date });
                }

                return has
            }


            /*

            Our aim is to add each day, that's not more than +-7 days away, and then leave infinite ranges for appointments 
            that come before, or after.

            So, if today is Tue, the UI would feature
             x) Wed
             x) Thu
             x) Fri
             x) Sat
             x) next week Sun
             x) next week Mon

             x) Later
            */

            const step = 24 * 60 * 60 * 1000 // The one day gap

            const maxDate = todayStart + step * 7;

            for (let i = todayStart; i < maxDate; i += step) {
                addRangeForDate(i)
            }

            if (this.statedata.$0data.appointments.find(x => x.time > maxDate)) {
                ranges.push({
                    min: todayStart + step * 7,
                    max: Number.POSITIVE_INFINITY
                })
            }


            this[sections] = ranges;



        }, 250, 1000)

        this.statedata.$0.addEventListener('appointments-change', drawUI)

        /**
         * 
         * @param {ehealthi.health.timetable.TimetableEntry} appointment 
         */
        const addEntry = (appointment) => {
            this.statedata.$0data.appointments = this.statedata.$0data.appointments.filter(x => x.id != appointment.id)
            this.statedata.appointments.push(appointment)
        }

        this.download = async () => {
            const modifiedStart = this.statedata.$0data.appointments.sort((a, b) => (a.modified || 0) > (b.modified || 0) ? 1 : -1).reverse()[0]?.modified;
            const createdStart = this.statedata.$0data.appointments.sort((a, b) => a.created > b.created ? 1 : -1).reverse()[0]?.created;
            const timeStart = ((this.statedata.$0data.appointments.length == 0) && timeUtils.dayStart(Date.now())) || undefined;

            for await (const appointment of await hcRpc.health.timetable.getRecentEntries(
                {
                    start: {
                        time: timeStart,
                        modified: modifiedStart,
                        created: createdStart
                    },
                    types: ['appointment']
                }
            )) {
                addEntry(appointment)
            }
        }


        this.blockWithAction(async () => {


            const client = await ModernuserEventClient.get()

            client.events.addEventListener('ehealthi-health-new-timetable-entry', (event) => {
                /** @type {ehealthi.health.timetable.TimetableEntry} */
                const entry = event.detail.data
                addEntry(entry)
                drawUI()
            });

            client.events.addEventListener('ehealthi-health-appointment-changed', (event) => {
                /** @type {ehealthi.health.timetable.TimetableEntry} */
                const data = event.detail.data

                this.statedata.appointments = this.statedata.appointments.map(x => {
                    if (x.id == data.id) {
                        Object.assign(x, data)
                    }
                    return x
                })


            })

            // Whenever there's a connection, or re-connection, we fetch the latest info from the server
            client.events.addEventListener('init', () => {
                this.download()
            })

            this.download()
        })



    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-appointments-listings']
}