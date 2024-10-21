/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (item), is part of the app-user-notifications widget, where it represents a single notification on the parent widget.
 */

import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class Item extends Widget {


    /**
     * 
     * @param {modernuser.notification.InAppNotification} data 
     */
    constructor(data) {
        super();

        super.html = hc.spawn({
            classes: Item.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='icon'></div>
                        <div class='content'>
                            <div class='title'>${data.title}</div>
                            <div class='caption'>${data.caption}</div>
                        </div>
                        <div class='actions'></div>
                    </div>
                </div>
            `
        });

        this[
            this.defineImageProperty({
                selector: ':scope >.container >.main >.icon',
                property: Symbol(),
                cwd: import.meta.url,
                mode: 'inline',
                fallback: '/$/shared/static/logo.png'
            })
        ] = data.icon

        this.data = data

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-user-notifications-item']

}