/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (main), is part of the app-chat-view widget, where it allows the user to chat with another user.
 * In fact, it is the heart of the app-chat-view
 */

import ChatWidget from "/$/chat/static/widgets/chat/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";




export default class Chat extends ChatWidget {

    /**
     * @param {telep.chat.ChatMetadata} chat
     */
    constructor(chat) {
        super(chat);
        this.html.classList.add(...Chat.classList)
    }

    static get classList() {
        return ['hc-ehealthi-app-chat-view-main']
    }
}


hc.importModuleCSS(import.meta.url)