/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (results-view), allows especially a doctor to see the results of prescribed lab test.
 */

import ImageView from "./views/image.mjs";
import TextView from "./views/text.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";
import utils from "/$/web/html/widgets/app-commerce-service-provider-view/transaction-management/utils.mjs";


export default class ViewResults extends Widget {


    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecordExtra} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: ViewResults.classList,
            innerHTML: `
                <div class='container'>
                    <div class='patient-info'></div>
                    <div class='summary'>
                        <div class='commodities'>
                            <div class='label'>Tests</div>
                            <ul class='content'></ul>
                        </div>
                        <div class='provider-info'>
                            <div class='label'>Laboratory</div>
                            <div class='content'></div>
                        </div>

                        <div class='completion-info'>
                            <div class='label'>Completed on</div>
                            <div class='content'></div>
                        </div>
                        
                    </div>
                    <div class='results'>
                        <div class='title'>Test Results</div>
                        <div class='content'></div>
                        <div class='add-to-history'></div>
                    </div>
                </div>
            `
        });

        /** @type {ehealthi.health.commerce.inventory.Commodity[]} */ this.commodities
        this.pluralWidgetProperty({
            parentSelector: ':scope >.container >.summary >.commodities >.content',
            selector: 'li',
            transforms: {
                set: (input) => {
                    const li = hc.spawn({
                        tag: 'li',
                        innerHTML: input.label,
                    })
                    li.data = input;
                    return li
                },
                get: ({ data }) => data
            }
        }, 'commodities');

        /** @type {ehealthi.health.commerce.transaction.TransactionResult[]} */ this.results
        this.pluralWidgetProperty({
            selector: '.' + ViewResults.ViewWrapper.classList.join('.'),
            parentSelector: ':scope >.container >.results >.content',
            transforms: {
                set: (input) => new ViewResults.ViewWrapper(input).html,
                get: ({ widgetObject: { value } }) => value
            }
        }, 'results')




        this.blockWithAction(async () => {
            this.html.$(':scope >.container >.patient-info').appendChild(
                new InlineUserProfile({
                    ...transaction.$profiles.find(x => x.id == transaction.patient)
                }).html
            );

            const serviceProviderProfile = await hcRpc.health.commerce.service_provider.profile.getProvider({ provider: transaction.service_provider })
            this.html.$(':scope >.container >.summary >.provider-info').appendChild(
                new InlineUserProfile({
                    id: serviceProviderProfile.userid,
                    label: serviceProviderProfile.label || serviceProviderProfile.$profile.label,
                    icon: serviceProviderProfile.icon || serviceProviderProfile.$profile.icon,
                }).html
            );

            this.html.$(':scope >.container >.summary >.completion-info >.content').innerText = utils.dateString(transaction.completed)

            const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect()

            this.commodities = transaction.commodities.map(x => inventory.find(xx => xx.id == x))
            this.results = transaction.results || []

            const me = await hcRpc.modernuser.authentication.whoami();


            if (me.id == transaction.doctor) {

                let existing = await hcRpc.health.records.recordExists({ patient: transaction.patient, search: { content: { id: transaction.id } } });


                const btnAddRecord = new ActionButton({
                    content: existing ? `Added to Medical History` : `Add results to Medical History`,
                    state: existing ? 'disabled' : 'initial',
                    hoverAnimate: false,
                    onclick: async () => {
                        if (existing) return;

                        const form = new PopupForm({
                            title: `Add to Medical History`,
                            caption: `Adding the lab results to the patient's medical history would make it available for all doctors. Please, enter a title for this medical record to make searching easy.`,
                            form: [
                                [
                                    {
                                        label: `Title`,
                                        name: 'title',
                                    },
                                ],
                                [
                                    {
                                        label: `Severity`,
                                        name: 'severity',
                                        type: 'choose',
                                        values: {
                                            1: "Critical",
                                            2: "Very Important",
                                            3: "Important"
                                        },
                                    }
                                ]
                            ],
                            positive: 'Add',
                            negative: `Cancel`,
                            execute: async () => {

                                await hcRpc.health.records.insertRecord({
                                    patient: transaction.patient,
                                    data: {
                                        type: 'diagnosis',
                                        title: form.value.title,
                                        severity: new Number(form.value.severity).valueOf(),
                                        content: {
                                            id: transaction.id,
                                        },
                                    }
                                });

                                existing = true;

                                btnAddRecord.state = 'disabled'

                            }
                        });

                        form.show()
                    }
                });

                this.html.$(`:scope >.container >.results >.add-to-history`).appendChild(
                    btnAddRecord.html
                )
            }

        })


    }

    static ViewWrapper = class extends Widget {


        /**
         * 
         * @param {ehealthi.health.commerce.transaction.TransactionResult} input 
         */
        constructor(input) {
            super();

            super.html = hc.spawn({
                classes: ViewResults.ViewWrapper.classList,
                innerHTML: `
                    <div class='container'></div>
                `
            });

            /** @type {Widget} */ this.view
            this.widgetProperty({
                selector: '*',
                parentSelector: ':scope >.container',
                childType: 'widget'
            }, 'view');


            this.view = (() => {
                switch (input.type) {
                    case 'image':
                        return new ImageView(input)
                    default:
                        return new TextView(input)
                }
            })();

        }

        set value(value) {
            this.view.value = value
        }
        get value() {
            return this.view.value
        }

        /** @readonly */
        static classList = ['hc-ehealthi-health-commerce-view-extension-results-view-wrapper']

    }


    /** @readonly */
    static classList = ['hc-ehealthi-health-commerce-view-extension-results-view']

}