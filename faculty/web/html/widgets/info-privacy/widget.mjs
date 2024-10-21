/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget shows the user information about the app's privacy policy
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class InfoPrivacy extends Widget {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: InfoPrivacy.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='title'></div>
                        <div class='content'></div>
                    </div>
                </div>
            `
        });


        this.blockWithAction(async () => {
            const data = await hcRpc.system.settings.get({
                faculty: 'web',
                namespace: 'widgets',
                name: 'privacy_policy'
            })
            this.html.$('.container >.main >.content').innerHTML = (data?.content || 'Content is empty').replaceAll(/\n/gi, "<br>").replaceAll(/(<br>)+/gi, "<br>")
        });

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-info-privacy']
    }

}