/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (settings-view), is part of the app-commerce-service-provider-view, where it contains important settings
 * for the service provider
 */

import InventoryManager from "./inventory/widget.mjs";
import ProfileManager from "./profile/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class SettingsView extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: SettingsView.classList,
            innerHTML: `
                <div class='container'>

                    <div class='section profile'>
                        <div class='top'>
                            <div class='title'>General Info</div>
                            <div class='caption'>Information needed by patients.</div>
                        </div>

                        <div class='content'></div>
                    </div>

                    <div class='section inventory'>
                        <div class='top'>
                            <div class='title'>Inventory</div>
                            <div class='caption'>The services you provide</div>
                        </div>

                        <div class='content'></div>
                    </div>

                </div>
            `
        })

        this.html.$(':scope >.container >.section.inventory >.content').appendChild(
            new InventoryManager().html
        )

        this.html.$(':scope >.container >.section.profile >.content').appendChild(
            new ProfileManager().html
        )

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-commerce-service-provider-view-settings']

}