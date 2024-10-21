/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The app-commerce-service-provider-view
 * This widget gives service providers a visible interface to access featurest that matter to them.
 */

import SettingsView from "./settings-view/widget.mjs";
import ServiceProviderTransactionManagement from "./transaction-management/widget.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class AppCommerceServiceProviderView extends Widget {



    constructor() {

        super();

        super.html = hc.spawn({
            classes: AppCommerceServiceProviderView.classList,
            innerHTML: `
                <div class='container'>
                    <div class='top'>
                        <div class='settings'>
                            <div class='icon'></div>
                            <div class='label'>Settings</div>
                        </div>
                    </div>
                    <div class='transaction-listings'></div>
                </div>
            `
        });

        this[
            this.defineImageProperty({
                selector: ':scope >.container >.top >.settings >.icon',
                property: Symbol(),
                mode: 'inline',
                cwd: import.meta.url,
                fallback: '/$/shared/static/logo.png'
            })
        ] = './settings.svg'

        this.html.$(":scope >.container >.top >.settings").addEventListener('click', () => {
            this.html.dispatchEvent(
                new WidgetEvent('backforth-goto', {
                    detail: {
                        title: `Settings`,
                        view: new SettingsView().html,
                    }
                })
            )
        });

        this.html.$(':scope >.container >.transaction-listings').appendChild(
            new ServiceProviderTransactionManagement().html
        );

        this.waitTillDOMAttached().then(() => {
            const computePosition = new DelayedAction(
                () => {

                    const settingView = this.html.$(":scope >.container >.top >.settings");
                    // Here, we're trying to determineif the settings icon would be in mini view
                    settingView.classList.toggle('mini', settingView.getBoundingClientRect().top < 34)

                }, 150, 500)
            window.addEventListener('wheel', computePosition)
        })

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view']

}