/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (app-patient-lab-view), provides common features for patients, that linked to using the laboratory
 */

import LabPendingTransactions from "./pending/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class AppPatientLabView extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: AppPatientLabView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='sections'>
                        <div class='section pending'>
                            <div class='header'>
                                <div class='title'>Pending Tests</div>
                            </div>
                            <div class='content'></div>
                        </div>
                        
                    </div>
                </div>
            `
        });

        this.html.$(':scope >.container >.sections >.section.pending >.content').appendChild(
            new LabPendingTransactions().html
        )
    }

    /** @readonly */
    static emptyTXT = `You don't have any things to do in the lab.<br>If the doctor requires that you do a lab test, you can come back to this tab.`


    /** @readonly */
    static classList = ['hc-ehealthi-app-patient-lab-view']
}