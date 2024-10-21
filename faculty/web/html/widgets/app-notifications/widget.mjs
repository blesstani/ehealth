/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (app-user-notifications), displays the notifications of a user.
 */

import Item from "./item.mjs";
import ModernuserEventClient from "/$/modernuser/notification/static/event-client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class AppNotifications extends Widget {


    constructor({ miniView } = {}) {
        super();

        super.html = hc.spawn({
            classes: AppNotifications.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                </div>
            `
        });

        /** @type {modernuser.notification.InAppNotification[]} */ this.items
        this.pluralWidgetProperty({
            selector: ['', ...Item.classList].join('.'),
            parentSelector: ':scope >.container >.items',
            transforms: {
                set: (input) => {
                    return new Item(input).html
                },
                get: (html) => html.widgetObject?.data
            }
        }, 'items')

        this.blockWithAction(async () => {
            const clientPromise = ModernuserEventClient.get();

            const stream = await hcRpc.modernuser.notification.getInAppNotifications({
                limit: this.miniView ? 5 : 100,
                modifiedStart: this.items.map(x => x.seen || x.time).sort().at(-1),
            });

            this.items = [];

            (async () => {
                for await (const item of stream) {
                    this.items.push(item)
                }
            })();

            const client = await clientPromise;

            client.events.addEventListener('modernuser-notification-new-inApp-notification', ({ detail: data }) => {
                this.items.push(data)
            })

        });

        /** @type {boolean} */ this.miniView;
        this.htmlProperty(undefined, 'miniView', 'class')

        Object.assign(this, arguments[0])
    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-user-notifications']
}