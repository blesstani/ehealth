/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This widget (input), is part of the medical-records widget, where it allows a doctor to input details about medical records.
 */

import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";



export default class MedicalRecordInput extends PopupForm {

    /**
     * 
     * @param {object} param0
     * @param {ehealthi.health.records.MedicalRecordMutable} param0.data
     * @param {string} param0.patient
     * @param {PopupForm['execute']} param0.execute
     */
    constructor({ value, patient, execute } = {}) {

        super(
            {
                title: `Medical Record`,
                caption: `Enter details about this medical record`,
                positive: `Save`,
                negative: `Go back`,
                form: [
                    [
                        {
                            name: "type",
                            label: "Type",
                            type: "choose",
                            values: {
                                general: "General Remark",
                                // prescription: "prescription", // Let's leave out this option. Only the system should automatically fill in prescription medical records
                                diagnosis: "Diagnosis",
                                allergy: "Allergy"
                            }
                        },
                        {
                            name: "severity",
                            label: "Severity",
                            type: "choose",
                            values: {
                                1: "Critical",
                                2: "Very Important",
                                3: "Important"
                            }
                        },
                    ],
                    [
                        {
                            name: "title",
                            label: "Title",
                            type: 'text'
                        },
                    ],
                    [
                        {
                            name: "content",
                            label: "Content",
                            type: 'textarea'
                        },
                    ],



                ],
                execute
            }
        );


        Object.assign(this, arguments[0])


    }

    /**
     * @param {ehealthi.health.records.MedicalRecordMutable}  value
     */
    set value(value) {
        super.value = value
        this.id = value.id
    }
    get value() {
        return {
            ...super.value,
            severity: new Number(super.value.severity).valueOf()
        }
    }


}