/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * The medical-records widget.
 * This sub-widget (item), represents a single entry on the medical-records widget
 */

import ViewResults from "/$/health/commerce/static/messaging-extension/results-view/widget.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class MedicalRecordEntry extends Widget {

    /**
     * 
     * @param {ehealthi.health.records.ui.MedicalRecord_frontend} record 
     */
    constructor(record) {
        super();


        super.html = hc.spawn(
            {
                classes: MedicalRecordEntry.classList,
                innerHTML: `
                    <div class='container'>

                        <div class='time-info'></div>

                        <div class='main'>
                            <div class='icon'></div>

                            <div class='details'>
                                <div class='title'>${record.title}</div>
                                <div class='content'></div>
                                <div class='extra-info'>
                                    <div class='doctor-profile'></div>
                                </div>
                            </div>
                        </div>

                        <div class='actions'></div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.icon
        this.defineImageProperty(
            {
                selector: '.container >.main >.icon',
                property: 'icon',
                mode: 'inline',
                fallback: '/$/shared/static/logo.png',
                cwd: import.meta.url
            }
        );
        this.html.$(':scope >.container >.time-info').innerText = new Date(record.time).toDateString()

        this.blockWithAction(async () => {


            const target = this.html.$(':scope >.container >.main >.details >.extra-info >.doctor-profile');
            target.appendChild(
                // TODO: Get full user profile from Faculty of Health
                new InlineUserProfile(record.doctor).html
            );

            const contentHTML = this.html.$(`:scope >.container >.main >.details >.content`);

            if (typeof record.content == 'string') {
                contentHTML.innerHTML = record.content
            }

            if (typeof record.content == 'object' && record.type == 'diagnosis' && record.content.$transaction) {
                // Then this medical record contains lab test results
                contentHTML.appendChild(
                    new ViewResults(record.content.$transaction).html
                )
            }

        })

        this.icon = `./res/${(record.type == 'diagnosis') || (record.type == 'prescription') ? record.type : 'comment'}.svg`

        this.data = record

    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-health-medical-records-item']
    }

}