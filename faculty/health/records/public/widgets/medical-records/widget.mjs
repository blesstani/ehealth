/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget allows a doctor to view the medical records of a patient
 */

import MedicalRecordInput from "./input.mjs";
import MedicalRecordEntry from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class MedicalRecordsView extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.patient
     */
    constructor({ patient } = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: MedicalRecordsView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='top'>
                            <div class='main'>
                                <div class='title'>Medical History</div>
                                <div class='actions'></div>
                            </div>
                            <div class='search'></div>
                        </div>

                        <div class='content'></div>
                    </div>
                `
            }
        );


        /** @type {ehealthi.health.records.ui.MedicalRecord_frontend[]} */ this.entries
        this.pluralWidgetProperty(
            {
                selector: ['', ...MedicalRecordEntry.classList].join('.'),
                parentSelector: ':scope >.container >.content',
                transforms: {
                    set: (item) => new MedicalRecordEntry(item).html,
                    get: html => html.widgetObject.data
                },
                sticky: true
            },
            'entries'
        );

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: ':scope >.container >.top >.main >.actions',
                childType: 'html',
            },
            'actions'
        );


        const load = new DelayedAction(() => this.blockWithAction(async () => {
            const session = await hcRpc.health.records.getRecordsFor({ patient, severity: 3 })

            const me = await hcRpc.modernuser.authentication.whoami()
            /** @type {Awaited<ReturnType<hcRpc['health']['records']['getMedicalRecordsRightsFor']>>} */
            let permissions

            if ((me.id != patient)) {
                permissions = await hcRpc.health.records.getMedicalRecordsRightsFor({ patient })
            }

            if (permissions?.write) {
                enableWrite()
            }

            /** @type {modernuser.profile.UserProfileData[]} */
            const profiles = [];

            ;// This should happen in the background (populating the medical records UI)
            (async () => {
                for await (const record of await session.data()) {
                    while (true) {

                        const profile = profiles.find(x => x.id == record.doctor);
                        if (profile) {
                            record.doctor = profile
                            break;
                        }
                        await new Promise(x => setTimeout(x, 100))
                    }
                    this.entries.push(record)
                }
            })();

            (async () => {
                for await (const profile of await session.profiles()) {
                    profiles.push(profile)
                }
            })();

        }))


        const enableWrite = () => {

            /** @type {MedicalRecordInput} */
            let input;
            const writeHTML = hc.spawn(
                {
                    innerHTML: `+`,
                    onclick: async () => {

                        if (!input) {
                            (input = new MedicalRecordInput(
                                {
                                    patient,
                                    execute: async () => {

                                        input.id = await hcRpc.health.records.insertRecord({ patient, data: input.value })
                                        const me = await hcRpc.modernuser.authentication.whoami(true)

                                        this.entries.push(
                                            {
                                                id: input.id,
                                                ...input.value,
                                                created: Date.now(),
                                                time: Date.now(),
                                                patient,
                                                doctor: me
                                            }
                                        );

                                        input.destroy()
                                    }
                                }
                            )).show();

                            input.destroySignal.addEventListener('abort', () => {
                                input = undefined
                                console.log(`Input destroyed`)
                            }, { once: true })
                        }
                    }
                }
            )

            this.actions.push(
                writeHTML
            )
        }


        load()

    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-health-medical-records']
    }


}