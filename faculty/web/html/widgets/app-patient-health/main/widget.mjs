/**
 * Copryright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (main), is part of the app-patient-health widget, where it serves as an interface for the patient to see
 * upcoming appointments, prescriptions, and payments, by browsing the calendar.
 */

import AppointmentView from "./views/appointment.mjs";
import PrescriptionView from "./views/prescription.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import SimpleCalendar from "/$/system/static/html-hc/widgets/simple-calendar/widget.mjs";



/**
 * @extends Widget<MainView>
 */
export default class MainView extends Widget {

    constructor() {
        super()

        this.html = hc.spawn(
            {
                classes: MainView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='calendar'></div>
                        <div class='date-caption'></div>
                        <div class='items'></div>
                    </div>
                `
            }
        );

        /** @type {SimpleCalendar} */ this.calendar
        this.widgetProperty(
            {
                selector: ['', ...SimpleCalendar.classList].join('.'),
                parentSelector: '.container >.calendar',
                childType: 'widget',
                property: 'calendar',
                onchange: () => {
                    this.waitTillDOMAttached().then(() => this.calendar.selectedDate = new Date())
                }
            }
        );

        this.calendar = new SimpleCalendar()

        /** @type {ehealthi.ui.app.app_patient_health.Statedata} */
        this.statedata = new AlarmObject()
        this.statedata.items = []


        this.calendar.addEventListener('selectionchange', () => {
            const today = new Date().setHours(0, 0, 0, 0)
            const haveVerb = this.calendar.selectedDate - today >= 0 ? 'have' : 'had'
            this.html.$('.container >.date-caption').innerHTML = `${this.calendar.selectedDate == today ? `Today` : `On ${this.calendar.selectedDate.toDateString()}`}, you ${haveVerb}`
        });

        /** @type {HTMLElement[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...HourSection.classList].join('.'),
                parentSelector: '.container >.items',
                property: 'items',
                childType: 'html',
            }
        )

        const download = new DelayedAction(() => {
            this.blockWithAction(
                async () => {
                    const isEmpty = this.statedata.items.length == 0
                    const timeStart = isEmpty ? new Date().setHours(0, 0, 0, 0) : undefined;
                    const modifiedStart = isEmpty ? undefined : this.statedata.items.sort((a, b) => a.modified || 0 > b.modified || 0 ? 1 : -1).reverse()[0]?.modified;
                    const createdStart = isEmpty ? undefined : this.statedata.items.sort((a, b) => a.created > b.created ? 1 : -1).reverse()[0]?.created;
                    const looper = await hcRpc.health.timetable.getRecentEntries(
                        {
                            start: {
                                time: timeStart,
                                modified: modifiedStart,
                                created: createdStart
                            }

                        }
                    )

                    for await (const item of looper) {
                        const index = this.statedata.$0data.items.findIndex(x => x.id == item.id)
                        if (index != -1) {
                            this.statedata.items[index] = item
                        } else {
                            this.statedata.items.push(item)
                        }
                    }

                }
            ).catch(() => undefined) // Do nothing about the error, since the user would have a retry button on the UI.
        }, 500)


        /**
         * This method is called, when the set of items for the selected date has changed, or the selected date itself has changed.
         */
        const draw = async () => {

            const currDate = this.calendar.selectedDate.getTime()
            function absoluteTime(time) {
                return new Date(time).setHours(0, 0, 0, 0)
            }
            const entries = this.statedata.$0data.items.filter(x => (absoluteTime(x["@timetable-entry"].date.start) <= currDate) && (absoluteTime(x["@timetable-entry"].date.end) >= currDate))

            // So finally, these are the things that would be drawn
            /**
             * 
             * @param {ehealthi.health.timetable.TimetableEntry} item 
             */
            const transformItem = item => {
                if (item["@timetable-entry"].type == 'appointment') {
                    const html = this.drawAppointmentEntryUI(item).html
                    html.time = item.time
                    return [html]
                }

                if (item['@timetable-entry'].type == 'prescription') {
                    /** @type {ehealthi.health.prescription.Intake[]} */
                    let intakes = item.intake
                    intakes = intakes.sort((a, b) => a.start > b.start ? 1 : a.start == b.start ? 0 : -1)

                    if (!item.started || (intakes[0].start > currDate) || (intakes[intakes.length - 1].end < currDate) || (item.ended > 0)) {
                        return []
                    }
                    return intakes.map(intake => {
                        return intake.dosage.map(dose => {
                            const html = new PrescriptionView(item, dose, currDate).html
                            html.time = dose.time
                            return html
                        })
                    }).flat()
                }


                const html = hc.spawn({
                    innerHTML: `Calendar item!`
                })
                html.time = item.time
                return [html]
            }

            const nwItems = entries.map(transformItem).flat(2)

            // So, let's not just switch then abruptly.
            // Let's animate the changes.

            this.html.classList.add('animating')

            const animationTimeMs = new Number(window.getComputedStyle(this.html.$('.container >.items')).getPropertyValue('animation-duration').split(/[A-Za-z]/)[0]).valueOf() * 1000


            // Wait for the animation to go a little more than half
            await new Promise(x => setTimeout(x, animationTimeMs * 0.575, 250))

            // Actually clear the previous content
            this.items = [];

            // Add the new items

            // Divide the items into sections, according to the hours
            /** @type {{[hour: number]: (typeof nwItems)[number][]}} */
            const sectionHours = {}
            for (const entry of nwItems) {
                (sectionHours[new Date(entry.time).getHours()] ||= []).push(entry)
            }

            const sections = Object.entries(sectionHours).map(([hour, items]) => new HourSection(hour, items).html)

            this.items.push(...sections)

            // By now, the animation would have been done
            let timeout;
            await Promise.race(
                [
                    hc.waitForDOMEvents(this.html.$('.container >.items'), ['animationend'], { timeout: animationTimeMs / 2 }),
                    timeout = setTimeout(() => console.warn(`Till now, the animation event has not been triggered!`), 5000)
                ]
            )
            clearTimeout(timeout)
            this.html.classList.remove('animating')


        }

        this.statedata.$0.addEventListener('items-change', draw)

        this.calendar.addEventListener('selectionchange', draw)

        // Now, let's listen to events that are there to inform us of new appointments
        this.waitTillDOMAttached().then(() => {
            this.blockWithAction(async () => {
                const client = await ModernuserEventClient.get()

                client.events.addEventListener('ehealthi-health-new-timetable-entry', (event) => {
                    /** @type {ehealthi.health.timetable.TimetableEntry} */
                    const entry = event.detail.data
                    this.statedata.items = [
                        ...this.statedata.$0data.items.filter(x => x.id !== entry.id),
                        entry
                    ]
                    draw()
                });

                client.events.addEventListener('ehealthi-health-prescription-changed', (event) => {
                    /** @type {ehealthi.health.prescription.Prescription} */
                    const prescription = event.detail.data
                    const existing = this.statedata.items.find(x => x.id == prescription.id)
                    if (existing) {
                        Object.assign(existing, prescription)
                        draw()
                    }
                })

                // Whenever there's a connection, or re-connection, we fetch the latest info from the server
                client.events.addEventListener('init', () => {
                    download()
                })

                download()
            })
        });





    }


    /**
     * This method creates a view, for an appointment timetable entry.
     * @param {ehealthi.health.timetable.TimetableEntry} item 
     */
    drawAppointmentEntryUI(item) {
        const widget = new AppointmentView(item)
        return widget
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-main-view']
    }

}



/**
 * @extends Widget<HourSection>
 */
class HourSection extends Widget {
    /**
     * 
     * @param {number} hour 
     * @param {HTMLElement[]} items 
     */
    constructor(hour, items) {
        super()
        this.html = hc.spawn(
            {
                classes: HourSection.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='hour-label'></div>
                        <div class='items'></div>
                    </div>
                `
            }
        );

        this.html.$('.container >.hour-label').innerHTML = hc.toTimeString(new Date(new Date().setHours(hour, 0, 0, 0)))
        items.forEach(item => {
            this.html.$('.container >.items').appendChild(item)
        })
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health-main-view-hour-section']
    }
}