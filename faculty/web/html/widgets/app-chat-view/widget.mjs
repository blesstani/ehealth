/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (app-chat-view), allows a doctor, or patient to chat, and call other users.
 */

import CustomerServiceAgentView from "../app-customer-service-agent/widget.mjs";
import CustomerServiceChat from "../app-customer-service-chat/widget.mjs";
import Item from "./item.mjs";
import ChatEventClient from "/$/chat/static/event-client/client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class AppChatView extends Widget {


    constructor() {

        super();

        this.html = hc.spawn(
            {
                classes: AppChatView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='top'>
                            <div class='title'>Chats</div>
                            <div class='search'>
                                <input >
                            </div>
                        </div>

                        <div class='customer-service-float-action'></div>

                        <div class='content'></div>
                        
                    </div>
                `
            }
        );

        const customerServiceFloatSelector = ':scope >.container >.customer-service-float-action';
        this[this.defineImageProperty({
            selector: customerServiceFloatSelector,
            property: Symbol(),
            cwd: import.meta.url,
            mode: 'inline',
        })] = './customer-service.svg';

        this.html.$(customerServiceFloatSelector).addEventListener('click', async () => {

            this.loadWhilePromise((async () => {

                const isAgent = await hcRpc.web.isCustomerServiceAgent()

                this.html.dispatchEvent(new WidgetEvent('backforth-goto', {
                    detail: {
                        title: isAgent ? `Customer Service` : ``,
                        view: isAgent ? new CustomerServiceAgentView().html : new CustomerServiceChat().html,
                    }
                }))


            })()).catch(handle)
        })


        /** @type {ehealthi.ui.app.app_chat_view.Statedata} */
        this.statedata = new AlarmObject()
        this.statedata.items = []

        /** @type {(this['statedata']['chats'][number])[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.content',
                property: 'items',
                transforms: {
                    set: (input) => {
                        return new Item(input.$0data || input).html
                    },
                    get: (html) => {
                        return html?.widgetObject?.statedata?.$0data
                    }
                }
            }
        )

        /** @type {Item[]} */ this.itemWidgets
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.content',
                property: 'itemWidgets',
                childType: 'widget'
            }
        )

        const onchange = new DelayedAction(() => {
            this.items = this.statedata.$0data.chats
        }, 200, 1000)

        this.statedata.$0.addEventListener('chats-$array-items-change', onchange)
        this.statedata.$0.addEventListener('chats-change', onchange)

        this.waitTillDOMAttached().then(() => {
            this.statedata.chats = []
        });

        /** @type {telep.chat.management.ChatType} */ this.type

        this.blockWithAction(async () => {
            this.statedata.chats = await hcRpc.chat.getMyChatsMetadata(this.type)

            const instance = await ChatEventClient.create()
            instance.events.addEventListener('telep-chat-new-chat', (event) => {
                /** @type {this['statedata']['$0data']['chats'][number]} */
                const chat = event.detail.chat
                this.items = [
                    chat,
                    ...this.items.filter(x => x.id != chat.id)
                ]

            })
        });

        // The search functionality.
        // Let's keep it simple.
        this.html.$(':scope >.container >.top >.search >input').addEventListener('keydown', new DelayedAction(() => {
            /** @type {string} */
            const input = (this.html.$(':scope >.container >.top >.search >input')).value

            const regExp = new RegExp(input.replaceAll(/[^a-zA-Z0-9]/gi, '.*'), 'gi')

            this.itemWidgets.forEach(item => {
                item.html.classList.toggle(
                    'hidden-by-search',
                    !regExp.test(item.statedata.$0data.label) && !regExp.test(item.statedata.$0data.caption)
                )
            })

        }, 250, 1500))

    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-app-chat-view']
    }

}