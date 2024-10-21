/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This script provides the possibility of sending a prescription as a message
 */


import TransactionInit from "../widgets/transaction-init/widget.mjs";
import LabTestMessageView from "./view.mjs";
import ChatMessaging from "/$/chat/messaging/static/widgets/chat-messaging/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import EventBasedExtender from "/$/system/static/run/event-based-extender.mjs";

EventBasedExtender.eventTarget.addEventListener('telep-chat-messaging-extend', (event) => {

    event.detail.append((async () => {
        const me = await hcRpc.modernuser.authentication.whoami()
        const chat = ''
        const widget = event.detail.data.widget

        return {
            html: new ComposeChatExtensionWidget({ chat, me, widget }).html,
        }
    })())
});


EventBasedExtender.eventTarget.addEventListener('telep-chat-messaging-create-custom-view', (event) => {

    if (!event.detail.data.message.data.meta?.data["ehealthi-health-commerce-transaction"]) {
        return;
    }

    event.detail.append((async () => {
        const me = await hcRpc.modernuser.authentication.whoami()

        const message = event.detail.data.message

        return {
            html: new LabTestMessageView({ message, me }).html
        }
    })())
});


class ComposeChatExtensionWidget extends Widget {
    /**
     * 
     * @param {object} param0 
     * @param {ChatMessaging} param0.widget
     * @param {modernuser.profile.UserProfileData} param0.me
     */
    constructor({ widget, me } = {}) {
        super()
        this.html = hc.spawn(
            {
                classes: ComposeChatExtensionWidget.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='image'></div>
                        <div class='label'>Lab Test</div>
                    </div>
                `
            }
        );
        const image = Symbol();
        this.defineImageProperty(
            {
                selector: '.container >.image',
                property: image,
                fallback: '/$/shared/static/logo.png',
                mode: 'inline'
            }
        );
        this[image] = './icon.svg'

        this.html.$(':scope >.container').addEventListener('click', () => {

            /** @type {TransactionInit} */
            let init;
            this.html.dispatchEvent(
                new WidgetEvent('backforth-goto', {
                    detail: {
                        title: `Prescribe Lab Test`,
                        view: (init ||= (() => {
                            /** @type {TransactionInit} */
                            const initWidget = new TransactionInit({ patient: { id: widget.chat.recipients.find(x => x != me.id) } })


                            initWidget.addEventListener('complete', () => {
                                initWidget.blockWithAction(async () => {
                                    widget.messages.push({
                                        isNew: true,
                                        type: 'meta',
                                        data: {
                                            meta: {
                                                contentType: 'ehealthi-health-commerce-transaction',
                                                data: {
                                                    "ehealthi-health-commerce-transaction": {
                                                        id: initWidget.value
                                                    }
                                                }
                                            }
                                        }
                                    })
                                    initWidget.html.dispatchEvent(new WidgetEvent('backforth-goback',))
                                })
                            })

                            return initWidget
                        })()).html,
                    }
                })
            )

        })


    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-commerce-compose-extension']
    }
}


hc.importModuleCSS(import.meta.url)