/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This sub-widget (item), represents a single chat on the app-chat-view widget.
 * 
 */

import Chat from "./main/widget.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


const icon = Symbol()

export default class Item extends Widget {

    /**
     * 
     * @param {ehealthi.ui.app.app_chat_view.ChatItem} data 
     */
    constructor(data) {
        super();

        this.html = hc.spawn(
            {
                classes: Item.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='icon'></div>
                            <div class='details'>
                                <div class='title'>Tanko Fabiola</div>
                                <div class='caption'>
                                    I went for consultation, and
                                    the doctor said we have to
                                    take long walks to get back.
                                </div>
                            </div>
                            <div class='indicators'>
                                <div class='latest-time'>19:23</div>
                                <div class='count'></div>
                            </div>
                        </div>
                    </div>
                `
            }
        );

        this.defineImageProperty(
            {
                selector: '.container >.main >.icon',
                property: icon,
                mode: 'background',
                fallback: '/$/shared/static/logo.png'
            }
        );

        this[icon] = '/widgets/coming-soon/bg.png'


        /** @type {ehealthi.ui.app.app_chat_view.Statedata['chats'][number]} */
        this.statedata = new AlarmObject();

        this.statedata.$0.addEventListener('caption-change', () => this.html.$('.container >.main >.details >.caption').innerHTML = this.statedata.caption || '---')
        this.statedata.$0.addEventListener('label-change', () => this.html.$('.container >.main >.details >.title').innerHTML = this.statedata.label)
        this.statedata.$0.addEventListener('icon-change', () => this[icon] = this.statedata.icon)
        this.statedata.$0.addEventListener('unreadCount-change', () => this.html.$('.container >.main >.indicators >.count').innerHTML = this.statedata.unreadCount < 1 ? '' : this.statedata.unreadCount)
        this.statedata.$0.addEventListener('lastTime-change', () => this.html.$('.container >.main >.indicators >.latest-time').innerHTML = new Date(this.statedata.lastTime).toTimeString().split(' ')[0].split(':').slice(0, 2).join(':'))
        this.statedata.$0.addEventListener('lastDirection-change', () => this.html.setAttribute('direction', this.statedata.lastDirection))

        Object.assign(this.statedata, data)

        let widget;

        /** @returns {Chat} */
        const getWidget = () => widget ||= new Chat(this.statedata)

        this.html.addEventListener('click', () => {
            const widget = getWidget();
            this.html.dispatchEvent(new WidgetEvent('backforth-goto', { detail: { view: widget.html } }))
            widget.messaging.addEventListener('unread-count-change', () => {
                this.statedata.unreadCount = widget.messaging.unreadCount
            });
            widget.messaging.addEventListener('last-message-change', () => {
                const msgs = widget.messaging.messages
                const msg = msgs[msgs.length - 1]
                this.statedata.lastDirection = msg.isOwn ? 'outgoing' : 'incoming'
                // TODO: implement captioning extension
                this.statedata.caption = msg.data.text || (msg.data.media && msg.data.media.caption || '')
                this.statedata.lastTime = msg.edited?.time || msg.time
                this.statedata.unreadCount = widget.messaging.unreadCount
                this.statedata.icon = widget.messaging.chat.icon
                this.statedata.label = widget.messaging.chat.label
            })
        });



    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-chat-view-item']
    }
}