/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Platform
 * This widget is the login widget for the eHealthi platform; customized to suit
 * the design needs
 */

import Onboarding from "./onboarding.mjs";
import { pluginData } from "/$/modernuser/static/authentication/lib/widget-model.mjs";
import LoginWidget from "/$/modernuser/static/widgets/login-widget/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { SlideContainer } from "/$/system/static/html-hc/widgets/slide-container/container.mjs";



export default class eHealthiLoginWidget extends Widget {

    constructor() {
        super();

        super.html = hc.spawn(
            {
                classes: eHealthiLoginWidget.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='slider'></div>
                        </div>
                    </div>
                `
            }
        );

        this.widgetProperty(
            {
                selector: ['', ...SlideContainer.classList].join('.'),
                parentSelector: '.container >.main >.slider',
                property: 'slider',
                childType: 'widget',
            }
        );
        this.slider = new SlideContainer()


        /** @type {LoginWidget} */ this.main
        Reflect.defineProperty(this, 'main', {
            get: () => this.slider.screens[0]?.widgetObject,
            set: v => this.slider.screens = [v.html, ...this.slider.screens.filter(x => x !== v.html)],
            configurable: true,
            enumerable: true
        });

        /** @type {Onboarding} */ this.onboarding
        Reflect.defineProperty(this, 'onboarding', {
            get: () => this.slider.screens[1]?.widgetObject,
            set: v => this.slider.screens = [...this.slider.screens.filter((x, i) => (x !== v.html)), v.html],
            configurable: true,
            enumerable: true
        })

        this.main = new LoginWidget({ custom: { help: false, navigation: false } })
        this.main.continue = () => {
            window.location = '/app/'
        }
        this.onboarding = new Onboarding()

        // Wait till the list of providers have been set on the login widget
        const waitForProviders = async () => {
            let watcher;
            await new Promise((resolve) => {
                watcher = new MutationObserver(() => {
                    if (this.main.providers.length > 1) {
                        resolve();
                    }
                });
                watcher.observe(this.main.html, { subtree: true, childList: true })
            });
            watcher.disconnect()

            this.main.providers = [...this.main.providers.sort((a, b) => /phone/.test(a[pluginData].name) ? -1 : /phone/.test(b[pluginData].name) ? 1 : 0)]
            // Now that providers have been loaded, let's start noting the position of the action button on the phone login provider widget, and using it to enhance the UI
            hc.watchToCSS(
                {
                    source: this.main.html,
                    watch: {
                        dimension: 'top',
                    },
                    apply: () => {
                        this.html.style.setProperty('--magic-height', `${this.html.$(':is(.hc-ehealthi-onboarding>.container .hc-uniqueFileUpload, .hc-telep-phone-login-widget>.container>.main>.action)').getBoundingClientRect().top}px`)
                    },
                    target: this.html,
                    signal: this.destroySignal
                }
            )
        }

        waitForProviders()

        this.main.onAction = async (widget, action, data) => {

            const doNormal = () => LoginWidget.prototype.onAction.call(this.main, widget, action, data)

            console.log(`About to do normal`)

            await doNormal()

            // Only if the user is signing up, or hasn't configured his account...
            // should give him the opportunity to modify his profile
            if (action != 'signup' && action != 'login') {
                return
            }
            if (data.onboarded || await hcRpc.modernuser.onboarding.checkMyOnboarding()) {
                return
            }


            // Now, if the user just signed up, let's give him the ability to onboard
            this.slider.index = 1

            this.onboarding.addEventListener('complete', () => {
                // And then, when the user has completely set up his account
                // we let him sign up again.
                this.slider.index = 0
            }, { once: true })
        }


    }
    static get classList() {
        return ['hc-ehealthi-login-widget']
    }


}

