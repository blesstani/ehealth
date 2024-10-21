/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget (prescription-input), allows the doctor to make a prescription
 */

import IntakeInput from "../intake-input/widget.mjs";
import UserAndRoleInput from "/$/modernuser/static/widgets/user-n-role-input/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";



export default class PrescriptionInput extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {ehealthi.health.prescription.Prescription} param0.value
     */
    constructor({ value } = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: PrescriptionInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='patient-input'></div>
                        <div class='medication-label-input labeled-input'>
                            <div class='label'>Medication</div>
                            <input>
                        </div>
                        <div class='intake-input'></div>
                        <div class='notes labeled-input'>
                            <div class='label'>Notes</div>
                            <textarea></textarea>
                        </div>
                        <div class='confirm'></div>
                    </div>
                `
            }
        );

        const patientInput = new UserAndRoleInput(
            {
                label: `Patient`,
                mode: 'user',
                name: 'patient',
            }
        )

        this.html.$('.container >.patient-input').appendChild(patientInput.html)

        const label = Symbol()
        /** @type {string} */ this[label];

        this.htmlProperty('.container >.medication-label-input >input', label, 'inputValue')

        const intakeInput = new IntakeInput()
        this.html.$('.container >.intake-input').appendChild(intakeInput.html)

        const btnConfirm = new ActionButton(
            {
                content: `Confirm Prescription`,
                onclick: () => this.dispatchEvent(new CustomEvent('complete'))
            }
        );
        /** @type {(event: 'complete', cb: (event: CustomEvent)=> void, opts?: AddEventListenerOptions)} */ this.addEventListener

        this.html.$(':scope >.container >.confirm').appendChild(btnConfirm.html)

        /** @type {Omit<ehealthi.health.prescription.Prescription, "intake"|"patient">} */ this.others

        /** @type {ehealthi.health.prescription.Prescription} */ this.value
        Reflect.defineProperty(this, 'value', {
            /**
             * 
             * @param {this['value']} value 
             */
            set: (value) => {
                this.others = {
                    ...value
                }

                intakeInput.value = value.intake[0] // TODO: Deal with multiple intake values
                patientInput.value = {
                    id: value.patient
                }
                this[label] = value.label
                this.html.$(':scope >.container >.notes >textarea').value = value.notes || ''

            },
            /** @returns {this['value']} */
            get: () => {
                return {
                    ...this.others,
                    intake: [intakeInput.value], // For now, there's a possibility of just one intake instruction
                    patient: patientInput.value?.id,
                    label: this[label],
                    notes: this.html.$(':scope >.container >.notes >textarea').value

                }
            },
            configurable: true,
            enumerable: true
        })

        Object.assign(this, arguments[0])


    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-prescription-input']
    }

}
