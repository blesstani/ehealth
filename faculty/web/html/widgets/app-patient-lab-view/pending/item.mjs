/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget represents a single transaction on the view, where the user can manage his transactions with the lab
 */


import utils from "../../app-commerce-service-provider-view/transaction-management/utils.mjs";
import configureTransaction from "/$/health/commerce/static/widgets/configure-transaction/function.mjs";
import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";

export default class Item extends Widget {


    /**
     * 
     * @param {ehealthi.health.commerce.transaction.TransactionRecordExtra} transaction 
     */
    constructor(transaction) {
        super();

        super.html = hc.spawn({
            classes: Item.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='icon'></div>
                        <div class='details'>
                            <div class='label'></div>
                            <div class='transaction-id'>
                                <div class='label'>ID</div>
                                <div class='content'></div>
                            </div>
                            <div class='summary'>
                                <div class='commodities'></div>
                                <div class='date'></div>
                                <div class='amount'>
                                    <div class='content'>Amount <data></data></div>
                                    <div class='status-icon'></div>
                                </div>
                                <div class='doctor-info'>
                                    <div class='label'>Doctor</div>
                                    <div class='content'></div>
                                </div>
                            </div>
                            <div class='actions'></div>
                        </div>
                    </div>
                </div>
            `
        });

        const icon = Symbol();

        this.defineImageProperty({
            selector: (':scope >.container >.main >.icon'),
            property: icon,
            mode: 'inline',
            fallback: '/$/shared/static/logo.png',
            cwd: import.meta.url
        });


        this[
            this.defineImageProperty({
                selector: ':scope >.container >.main >.details >.summary >.amount >.status-icon',
                property: Symbol(),
                mode: 'inline',
                cwd: import.meta.url
            })
        ] = './payment-done.svg';

        /** @type {htmlhc.lib.alarm.AlarmObject<{$provider: modernuser.profile.UserProfileData} & ehealthi.health.commerce.transaction.TransactionRecordExtra>} */ this.statedata = new AlarmObject({ abortSignal: this.destroySignal })

        this.statedata.$0.addEventListener('$provider.label-change', () => {

            this.html.$(':scope >.container >.main >.details >.label').innerText = this.statedata.$provider.label
            this[icon] = this.statedata.$provider.icon

        })


        this.statedata.$0.addEventListener('commodities-change', async () => {

            await this.blockWithAction(async () => {
                const inventory = await hcRpc.health.commerce.inventory.getInventoryDirect()
                const commodities = this.statedata.$0data.commodities;
                if (!commodities) return;
                this.html.$(':scope >.container >.main >.details >.summary >.commodities').innerHTML = `${commodities.length} test${commodities.length > 1 ? 's' : ''} <data>${commodities.map(
                    commo => inventory.find(x => x.id == commo)?.label || `#${commo}`
                ).join(',')}</data>`;

                this.html.$(':scope >.container >.main >.details >.summary >.amount >.content >data').innerText = (data => `${data.price.value} ${data.price.currency}`)(
                    commodities.map(x => inventory.find(xx => xx.id == x)).reduce(
                        (prev, curr) => ({
                            price: {
                                currency: curr.price.currency || prev.price.currency,
                                value: (curr.price.value || 0) + (prev.price.value || 0)
                            }
                        })
                    )
                )
            })

        })

        this.statedata.$0.addEventListener('service_provider-change', async () => {

            const provider = this.statedata.$0data.service_provider ? await hcRpc.health.commerce.service_provider.profile.getProvider({ provider: this.statedata.$0data.service_provider }) : {
                label: '<No Lab Chosen>',
                icon: '/$/shared/static/logo.png'
            };
            (this.statedata.$provider ||= {}).icon = provider.icon || provider.$profile.icon;

            this.statedata.$provider.label = provider.label || provider.$profile.label
        });

        this.statedata.$0.addEventListener('paid-change', () => {
            this.html.classList.toggle('paid', this.statedata.paid)
        })



        hc.watchToCSS({
            source: this.html.$(':scope >.container >.main >.details'),
            watch: {
                dimension: 'height'
            },
            target: this.html.$(':scope >.container >.main >.icon'),
            apply: '--min-height',
            signal: this.destroySignal
        })


        this.statedata.$0.addEventListener('created-change', () => {
            this.html.$(':scope >.container >.main >.details >.summary >.date').innerHTML = `Since <data>${utils.dateString(this.statedata.$0data.created)}</data>`
        })
        this.statedata.$0.addEventListener('id-change', () => {
            this.html.$(':scope >.container >.main >.details >.transaction-id >.content').innerText = this.statedata.$0data.id
        })

        this.html.$(':scope >.container >.main >.details >.actions').appendChild(
            new ActionButton({
                content: `Manage`,
                hoverAnimate: false,
                onclick: async () => {
                    configureTransaction(this.statedata, this.html)
                }
            }).html
        );


        const doctorProfileUI = Symbol()
        this.widgetProperty({
            selector: ['', ...InlineUserProfile.classList].join('.'),
            parentSelector: ':scope >.container >.main >.details >.summary >.doctor-info >.content',
            childType: 'widget'
        }, doctorProfileUI)

        const doctorInfoChange = () => {

            this[doctorProfileUI] = new InlineUserProfile({
                ...(this.statedata.$0data.$profiles || []).find(x => x.id == this.statedata.$0data.doctor)
            })

        }
        this.statedata.$0.addEventListener('doctor-change', doctorInfoChange)
        this.statedata.$0.addEventListener('$profiles-change', doctorInfoChange)

        Object.assign(this.statedata, transaction)
    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-patient-lab-view-pending-transactions-item']

}