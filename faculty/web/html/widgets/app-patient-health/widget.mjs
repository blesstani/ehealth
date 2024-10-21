/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget provides an interface for the patient to benefit from direct health-related features.
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import HealthAlerts from "../app-health-alerts/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import MyProfile from "../app-my-profile/widget.mjs";
import AppNotifications from "../app-notifications/widget.mjs";
import EHealthiArrowButton from "../arrow-button/widget.mjs";
import OurProcess from "./our-process/widget.mjs";
import FeedsView from "/$/web/feeds/static/widgets/feeds/widget.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";


export default class PatientHealth extends Widget {

    constructor() {

        super();

        this.html = hc.spawn(
            {
                classes: PatientHealth.classList,
                innerHTML: `
                    <div class='container'>

                        <div class='btn-init-appointment'></div>
                        <div class='hold-profile'>
                            <div class='welcome'>
                                <div class='pre'>Welcome,</div>
                                <div class='account-label'></div>
                            </div>
                            <div class='main'>
                                <div class='icon'></div>
                            </div>
                        </div>
                        
                        <div class='section important'>
                            <div class='title'>Important</div>
                        </div>

                        <div class='section notifications'>
                            <div class='title'>Notifications</div>
                            <div class='content'></div>
                            <div class='more'></div>
                        </div>

                        <div class='section info'>
                            <div class='title'>How to use</div>
                            <div class='content'></div>
                        </div>

                        <div class='section more'>
                            <div class='title'>More from eHD</div>
                            <div class='content'>
                                <div class='blogs'></div>
                                <div class='feeds'></div>
                            </div>
                        </div>

                        <div class='main'></div>

                    </div>
                `
            }
        );

        // this.widgetProperty(
        //     {
        //         selector: ['', ...MainView.classList].join('.'),
        //         parentSelector: ':scope >.container >.main',
        //         childType: 'widget',
        //     }, 'main'
        // )
        // this.main = new MainView()

        this.html.$('.container >.important').appendChild(new HealthAlerts().html)



        /** @type {string} */ this.meIcon
        this.defineImageProperty(
            {
                selector: '.container >.hold-profile >.main >.icon',
                mode: 'background',
                property: 'meIcon',
                fallback: '/$/shared/static/logo.png'
            }
        );

        this.html.$(':scope >.container >.notifications >.content').appendChild(
            new AppNotifications({
                miniView: true
            }).html
        );

        this.html.$(':scope >.container >.notifications >.more').appendChild(
            new EHealthiArrowButton({
                content: `More Notifications`,
                async onclick() {
                    this.html.dispatchEvent(
                        new WidgetEvent('backforth-goto', { detail: { view: (this.__notifications_full__ ||= new AppNotifications()).html, title: `Notifications` } })
                    );
                }
            }).html
        );


        this.html.$(':scope >.container >.info >.content').appendChild(
            new OurProcess().html
        );


        this.html.$(':scope >.container >.more >.content >.feeds').appendChild(
            new FeedsView().html
        );

        this.blockWithAction(async () => {
            const me = await hcRpc.modernuser.authentication.whoami(true)
            this.meIcon = me.icon
            this.html.$(':scope >.container >.hold-profile >.welcome >.account-label').innerHTML = me.label.split(' ')[0]
        });


        this.html.$('.container >.hold-profile >.main').addEventListener('click', () => {
            let profileUI;
            this.html.dispatchEvent(
                new WidgetEvent('backforth-goto', {
                    detail: {
                        title: `Me`,
                        view: (profileUI ||= new MyProfile()).html,
                    },
                    bubbles: true
                })
            )
        }, { signal: this.destroySignal })

        const onWheel = new DelayedAction((repeated) => {
            const welcomePos = this.html.$(':scope >.container >.hold-profile >.welcome').getBoundingClientRect().top
            this.html.classList.toggle('welcome-hidden', this.html.$('.container >.section.important').getBoundingClientRect().top < welcomePos - 4)
            if (!repeated) {
                setTimeout(() => onWheel(true), 1000)
            }
        }, 250, 1000)

        this.html.addEventListener('hc-connected-to-dom', () => {
            window.addEventListener('wheel', onWheel, { signal: this.destroySignal });
            window.addEventListener('touchmove', onWheel, { signal: this.destroySignal });
        });

        this.html.addEventListener('hc-disconnected-from-dom', () => {
            window.removeEventListener('wheel', onWheel)
            window.removeEventListener('touchmove', onWheel)
        });


    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-patient-health']
    }
}