/**
 * Copyright 2024 HolyCorn Software
 * The holycornweb Project
 * This widget (our-process), spells out the process by which HolyCorn Software
 * gets software projects done
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class OurProcess extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: OurProcess.classList,
            innerHTML: `
                <div class='container'>
                    <div class='process-steps'></div>
                    
                </div>
            `
        });


        /** @type {holycornweb.ui.our_process.ProcessStep[]} */ this.steps
        this.pluralWidgetProperty({
            selector: ['', ...OurProcess.ProcessStep.classList].join('.'),
            parentSelector: ':scope >.container >.process-steps',
            transforms: {
                set: val => new OurProcess.ProcessStep(val).html,
                get: ({ widgetObject: { icon, description, label } }) => ({ icon, label, description })
            }
        }, 'steps')

        this.steps = [
            {
                label: `Book Consultation`,
                description: `It all starts with a consultation. Book, and appointment, and select the date, the type of doctor you want, and make necessary payments. To get started, go to the Consult tab.`,
                icon: `./data/calendar.svg`
            },
            {
                label: `Receive a doctor`,
                description: `A doctor will be assigned you, and you'll know via a notification on your phone. Take note that the date, and time too may be changed, according to the organization's timetable.`,
                icon: `./data/doctor.svg`
            },
            {
                label: `Chat & Video Call`,
                description: `This is where you enjoy health, from home. After being assigned a doctor, a chat with the doctor will appear in the chats tab. The doctor will message you, and video call you, if necessary.`,
                icon: `./data/chat.svg`
            },
            {
                label: `Lab Test (optional)`,
                description: `You may be sent to a laboratory to do a test. When that happens, the app would prompt you to pay for the lab test. Once you pay, you'll be given instructions on how to reach the lab. Please, you may not be allowed to see your lab results, until the doctor does.`,
                icon: `./data/lab-technician.svg`
            },
            {
                label: `Take Medication (optional)`,
                description: `You may be prescribed medication. You're free to buy it at any pharmacy of your choice. Once you buy the medication, you'll see a notification on the home screen. Tap on it, to begin follow-up. When you do, the app would remind you to take your drugs everyday.`,
                icon: `./data/medication.svg`
            }
        ]
    }

    static ProcessStep = class extends Widget {

        /**
         * 
         * @param {holycornweb.ui.our_process.ProcessStep} data 
         */
        constructor(data) {
            super();

            super.html = hc.spawn({
                classes: OurProcess.ProcessStep.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='icon'></div>
                            <div class='text'>
                                <div class='label'></div>
                                <div class='description'></div>
                            </div>
                        </div>
                    </div>
                `
            });

            /** @type {string} */ this.icon
            this.defineImageProperty({ selector: ':scope >.container >.main >.icon', property: 'icon', mode: 'inline', cwd: import.meta.url })

            /** @type {string} */ this.label
            /** @type {string} */ this.description
            for (const property of ['label', 'description']) {
                this.htmlProperty(`:scope >.container >.main >.text >.${property}`, property, 'innerText')
            }

            Object.assign(this, data)

            this.blockWithAction(async () => {
                const myIndex = [...this.html.parentElement.children].filter(x => x.classList.contains(OurProcess.ProcessStep.classList[0])).findIndex(x => x == this.html)
                if (myIndex < 1) {
                    return;
                }
                const rightHanded = (myIndex % 2) == 1;
                // We're simply adding an arrow

                // And then adjusting our layout accordingly
                this.html.classList.toggle('right', rightHanded)

            })


        }


        /** @readonly */
        static classList = ['hc-holycornweb-our-process-step']
    }


    /** @readonly */
    static classList = ['hc-holycornweb-our-process']

}