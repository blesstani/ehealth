/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (profile), allows a service provider to manage his profile
 */

import IconView from "./icon-view.mjs";
import InlineEdit from "./inline-edit.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class ProfileManager extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ProfileManager.classList,
            innerHTML: `
                <div class='container'>

                    <div class='sections'>

                        <div class='section icon'>
                            <div class='header'>
                                <div class='title'>Image</div>
                                <div class='caption'>The logo of your lab</div>
                            </div>

                            <div class='content'></div>
                            
                        </div>
                    
                        <div class='section label'>
                            <div class='header'>
                                <div class='title'>Laboratory</div>
                                <div class='caption'>The names of your laboratory</div>
                            </div>

                            <div class='content'></div>
                            
                        </div>


                        <div class='section address'>
                            <div class='header'>
                                <div class='title'>Address</div>
                                <div class='caption'>Where your lab is situated</div>
                            </div>

                            <div class='content'></div>
                            
                        </div>


                        <div class='section description'>
                            <div class='header'>
                                <div class='title'>Description</div>
                                <div class='caption'>A short slogan. Patients might choose you, when they see this.</div>
                            </div>

                            <div class='content'></div>
                            
                        </div>

                    </div>

                </div>
            `
        });

        /** @type {htmlhc.lib.alarm.AlarmObject<ehealthi.health.commerce.service_provider.profile.ServiceProvider>} */ this.statedata = new AlarmObject({ abortSignal: this.destroySignal })


        this.html.$(':scope >.container >.sections >.section.icon').appendChild(
            (() => {
                const widget = new IconView('/$/shared/static/logo.png');
                this.statedata.$0.addEventListener('icon-change', () => {
                    widget.value = this.statedata.$0data.icon
                })
                widget.addEventListener('change', () => {
                    this.statedata.icon = widget.value
                }, { signal: this.destroySignal })
                this.html.addEventListener('destroyed', () => {
                    widget.destroy()
                }, { once: true })
                return widget
            })().html
        )



        /** @type {InlineEdit} */ this.label
        /** @type {InlineEdit} */ this.address


        for (const property of ['label', 'address', 'description']) {
            ((property) => {
                const view = new InlineEdit(`Some ${property == 'label' ? 'name' : property}`, async (value) => {
                    try {
                        await hcRpc.health.commerce.service_provider.profile.updateProfile({ data: { [property]: value } })
                        return true
                    } catch (e) {
                        handle(e)
                    }
                })
                this.widgetProperty({
                    selector: ['', ...InlineEdit.classList].join('.'),
                    parentSelector: `:scope >.container >.sections >.section.${property} >.content`,
                    childType: 'widget'
                }, property);
                this[property] = view

                this.statedata.$0.addEventListener(`${property}-change`, () => {
                    console.log(`Now setting the value '${property}'`)
                    this[property].value = this.statedata.$0data[property] || `Nothing here`
                })
            })(property)
        }



        this.blockWithAction(async () => {
            Object.assign(this.statedata, await hcRpc.health.commerce.service_provider.profile.getProvider({}))
            console.log(`This profile\n`, this.statedata.$0data)
        })



    }

    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-settings-profile']

}