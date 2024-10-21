/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (profile-data), is part of the app-my-profile widget, and plays the role of allowing the user to directly certain profile data;
 * for example, names, photo, sex, and date of birth
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


const action = Symbol()
const image = Symbol()


export default class ProfileDataSection extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: ProfileDataSection.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='profile-image'></div>
                            <div class='profile-details'>
                                <div class='profile-label'></div>
                                <div class='profile-meta'>
                                    <div class='profile-meta-date-of-birth'>
                                        <div class='label'>Date of Birth</div>
                                        <div class='content'></div>
                                    </div>
                                    <div class='profile-meta-sex'>
                                        <div class='label'>Sex</div>
                                        <div class='content'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class='action'></div>
                    </div>
                `
            }
        );

        this[action] = new ActionButton(
            {
                content: `Edit`,
                onclick: async () => {
                    const popup = new PopupForm(
                        {
                            title: `Edit Profile`,
                            caption: 'what people see about you',
                            form: [
                                [
                                    {
                                        label: `Photo`,
                                        name: 'icon',
                                        type: 'uniqueFileUpload',
                                        url: '/$/uniqueFileUpload/upload',
                                        value: this.statedata.profile?.icon
                                    }

                                ],
                                [
                                    {
                                        label: `Names`,
                                        name: 'label',
                                        type: 'text',
                                        value: this.statedata.profile?.label
                                    }
                                ],
                                [
                                    {
                                        label: `Sex`,
                                        name: 'meta.sex',
                                        type: 'choose',
                                        value: this.statedata.profile?.meta?.sex,
                                        values: {
                                            M: "Male",
                                            F: "Female"
                                        }
                                    }
                                ],
                                [
                                    {
                                        label: `Date of Birth`,
                                        name: 'meta.birthDate',
                                        type: 'date',
                                        valueProperty: 'valueAsNumber',
                                        value: this.statedata.profile?.meta?.birthDate
                                    }
                                ]
                            ],
                            positive: 'Update',
                            negative: 'Go back',
                            execute: async () => {
                                const { value } = popup
                                const finalValue = {}
                                const metaRegExp = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/
                                for (const field in value) {
                                    if (metaRegExp.test(field)) {
                                        const [, parent, child] = metaRegExp.exec(field);
                                        (finalValue[parent] ||= {})[child] = value[field]
                                    } else {
                                        finalValue[field] = value[field]
                                    }
                                }

                                if (finalValue.icon.indexOf('bundle-cache-ignore') == -1) {
                                    finalValue.icon = `${finalValue.icon}${`${finalValue.icon}`.indexOf('?') == -1 ? '?' : '&'}bundle-cache-ignore=true`
                                }

                                await hcRpc.modernuser.profile.updateMyProfile(finalValue)

                                Object.assign(this.statedata.profile, finalValue)

                                setTimeout(() => popup.hide(), 1300)
                            }
                        }
                    )
                    popup.show()
                }
            }
        );

        this.html.$('.container >.action').appendChild(
            this[action].html
        );

        this.defineImageProperty({
            selector: '.container >.main >.profile-image',
            property: image
        })


        /** @type {htmlhc.lib.alarm.AlarmObject<{profile:modernuser.profile.UserProfileData}>} */
        this.statedata = new AlarmObject()

        this.statedata.$0.addEventListener('change', () => {
            if (this.statedata.$0data.profile?.label) {
                this.html.$('.container >.main >.profile-details >.profile-label').innerHTML = this.statedata.$0data.profile.label
            }

            this[image] = this.statedata.$0data.profile?.icon || '/$/shared/static/logo.png'

            if (this.statedata.$0data.profile?.meta?.birthDate) {
                this.html.$('.container >.main >.profile-details >.profile-meta >.profile-meta-date-of-birth >.content').innerHTML = new Date(this.statedata.$0data.profile.meta.birthDate).toDateString()
            }
            if (this.statedata.$0data.profile?.meta?.sex) {
                this.html.$('.container >.main >.profile-details >.profile-meta >.profile-meta-sex >.content').innerHTML = this.statedata.$0data.profile.meta.sex == 'M' ? "Male" : "Female"
            }
        });

        this.blockWithAction(async () => {
            this.statedata.profile = await hcRpc.modernuser.authentication.whoami()
        })


    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-data']
    }
}