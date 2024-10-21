/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget allows the user to manage the security aspects of his account
 */

import NewLoginPopup from "./new.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import runMan from "/$/system/static/run/lib.mjs";


export default class SecuritySection extends Widget {

    constructor() {
        super()

        this.html = hc.spawn(
            {
                classes: SecuritySection.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='logins'>
                            <div class='content'></div>
                            <div class='btn-add'></div>
                        </div>
                    </div>
                `
            }
        );

        const load = () => this.blockWithAction(
            async () => {
                this.logins = await hcRpc.modernuser.authentication.getMyLoginsMin()
            }
        );

        /** @type {modernuser.authentication.UserLogin[]} */ this.logins
        this.pluralWidgetProperty(
            {
                selector: ['', ...LoginMethod.classList].join('.'),
                parentSelector: '.container >.logins >.content',
                property: 'logins',
                transforms: {
                    set: (data) => {
                        const widget = new LoginMethod(data);
                        widget.addEventListener('delete', () => {
                            this.logins = this.logins.filter(x => !(x.id == data.id && x.plugin == data.plugin))
                        })
                        return widget.html
                    },
                    get: html => {
                        /** @type {LoginMethod} */
                        const widget = html.widgetObject
                        return widget.statedata.$0data.data
                    }
                }
            }
        );


        this.html.$('.container >.logins >.btn-add').addEventListener('click', () => {
            const popup = new NewLoginPopup();
            popup.show()
            popup.addEventListener('complete', () => {
                load()
            })
        })


        load()

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-security']
    }
}




let scriptsImported;
let importPromise;

window.runMan = runMan

async function importScripts() {
    if (scriptsImported) {
        return
    }
    await (importPromise ||= runMan.addScope('modernuser.login-management'));
    scriptsImported = true
}


class LoginMethod extends Widget {
    /**
     * 
     * @param {modernuser.authentication.UserLogin} login 
     */
    constructor(login) {

        super();

        this.html = hc.spawn(
            {
                classes: LoginMethod.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='icon'></div>
                        <div class='label'></div>
                        <div class='actions'></div>
                    </div>
                `
            }
        );

        /** @type {htmlhc.lib.alarm.AlarmObject<{data:modernuser.authentication.UserLogin}>} */ this.statedata = new AlarmObject()

        this.statedata.data = {}

        /** @type {string} */ this.icon
        this.defineImageProperty({ selector: '.container >.icon', property: 'icon', mode: 'inline' })

        this.statedata.$0.addEventListener('data.plugin-change', () => {
            this.icon = `/$/modernuser/$plugins/${this.statedata.data.plugin}/@public/icon.png`
        })

        this.statedata.$0.addEventListener('data.label-change', () => {
            this.html.$('.container >.label').innerHTML = this.statedata.data.label
        })

        this.blockWithAction(() => importScripts())

        const register = (html) => {
            // When this method is called, the expectation, is that we add the given HTMLElement to the user's view.
            this.html.$('.container >.actions').appendChild(html)
        }

        const clearActions = () => [...this.html.$('.container >.actions').children].forEach(x => x.remove())

        // And now, each time the user hovers over this widget, we ask other components to prepare login method management actions.
        this.html.addEventListener('mouseenter', new DelayedAction(() => {

            clearActions()

            // Add the default actions
            const deleteWidget = new Widget()
            deleteWidget.html = hc.spawn(
                {
                    classes: ['hc-ehealthi-app-my-profile-security-item-action', 'delete'],
                    innerHTML: `
                    <div class='container'>
                        <div class='icon'></div>
                    </div>`
                }
            );

            deleteWidget.defineImageProperty(
                {
                    selector: '.container >.icon',
                    property: 'icon',
                    mode: 'inline',
                    cwd: new URL('./res/', import.meta.url).href
                }
            )

            deleteWidget.icon = 'delete.svg';

            deleteWidget.html.addEventListener('click', () => {
                new BrandedBinaryPopup(
                    {
                        title: `Delete`,
                        question: `Deleting ${login.label} means you won't be able to use it to log in.<br>\nDo you want to do it?`,
                        positive: `Delete`,
                        negative: `No`,
                        execute: async () => {
                            await hcRpc.modernuser.authentication.deleteLogin({ id: login.id })

                            this.dispatchEvent(new CustomEvent('delete'))
                        }
                    }
                ).show()
            })

            this.html.$('.container >.actions').appendChild(deleteWidget.html)


            // Now, call for the other assorted actions

            window.dispatchEvent(
                new CustomEvent(
                    'modernuser.login-management.prepare-actions',
                    {
                        detail: {
                            data: JSON.parse(JSON.stringify(this.statedata.$0data.data)),
                            register
                        }
                    }
                )
            )

        }, 250, 750));

        this.html.addEventListener('mouseleave', clearActions)



        Object.assign(this.statedata.data, login)
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-security-item']
    }

}