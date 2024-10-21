/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (app-labs-view), is responsible for what the user sees and has access to, concerning the laboratory.
 * 
 * What the patient sees, is different from what the service provider sees.
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


const loadCache = Symbol()

export default class AppLabsView extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: AppLabsView.classList,
            innerHTML: `
                <div class='container'>

                </div>
            `
        });

        /** @type {HTMLElement} */ this.view
        this.widgetProperty({
            parentSelector: ':scope >.container',
            selector: '*',
            childType: 'html',
        }, 'view');

        this.blockWithAction(async () => {
            await this.showView(await hcRpc.health.commerce.service_provider.profile.isServiceProvider() ? 'provider' : 'patient')
        })

    }

    /**
     * This method simply switches the view
     * @param {"provider"|"patient"} type 
     */
    async showView(type) {
        this.view = (this[loadCache] ||= {})[type] ||= (await (async () => {
            return new (type == 'provider' ? await import('../app-commerce-service-provider-view/widget.mjs') : await import('../app-patient-lab-view/widget.mjs')).default()
        })()).html
    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-labs-view']

}