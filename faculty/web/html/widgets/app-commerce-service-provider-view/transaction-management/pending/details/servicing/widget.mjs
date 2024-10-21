/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The servicing section of the app-commerce-service-provider-view/transaction-management widget.
 * This section allows a service provider to service a transaction.
 * In real life, this means actually performing the lab tests, and reporting the results.
 */

import Editor from "./editor/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import EHealthiArrowButton from "/$/web/html/widgets/arrow-button/widget.mjs";



export default class TransactionServicing extends Widget {

    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecord} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: TransactionServicing.classList,
            innerHTML: `
                <div class='container'>
                    <div class='header'>
                        <div class='title'>Lab Results</div>
                        <div class='caption'>This goes straight to the doctor</div>
                    </div>

                    <div class='editor'></div>

                    <div class='save'></div>

                    <div class='mark-done'>
                        <div class='text'>
                            <div class='title'>Mark as Complete</div>
                            <div class='caption'>Please, before you do this, check that the test results are correct, and that you have saved all changes. Once you mark as complete, you'll NOT be able to edit after 1 hour.</div>
                        </div>

                        <div class='action'></div>
                        
                    </div>

                </div>
            `
        });


        const editor = new Editor(transaction);

        this.html.$(':scope >.container >.editor').appendChild(
            editor.html
        );

        function jsonEQ(a, b) {
            return JSON.stringify(a) == JSON.stringify(b)
        }
        /** @type {boolean} */ this.dirty
        Reflect.defineProperty(this, 'dirty', {
            get() {
                return !jsonEQ(transaction.results || [], editor.value || [])
            },
            configurable: true,
            enumerable: true,
        });

        const computeButtonState = () => {
            if (btnSave.state != 'waiting') {
                btnSave.state = this.dirty ? 'initial' : 'disabled'
            }
        }

        editor.addEventListener('change', computeButtonState, { signal: this.destroySignal })

        const btnSave = new ActionButton({
            content: `Save Changes`,
            hoverAnimate: false,
            onclick: async () => {
                try {
                    await hcRpc.health.commerce.transaction.setResults({
                        id: transaction.id,
                        results: editor.value
                    })
                    transaction.results = editor.value
                    computeButtonState()
                } catch (e) {
                    handle(e)
                }
            },
            state: 'disabled'
        });

        this.html.$(':scope >.container >.save').appendChild(
            btnSave.html
        );

        const btnDone = new EHealthiArrowButton({
            content: `Mark as done`,
            onclick: async () => {
                try {
                    await hcRpc.health.commerce.transaction.markComplete({ id: transaction.id });
                    transaction.completed = Date.now()
                    updateBtnDone()
                } catch (e) {
                    handle(e);
                }
            },

        });

        const updateBtnDone = () => {
            btnDone.state = transaction.completed ? 'disabled' : 'initial'
            btnDone.content = transaction.completed ? `Already done` : `Mark as done`
        }

        updateBtnDone()

        this.html.$(':scope >.container >.mark-done >.action').appendChild(
            btnDone.html
        )
    }



    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-transactions-pending-servicing']
}