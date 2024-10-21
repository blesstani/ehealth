/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the app-chat-view
 */


import ''

global {
    namespace ehealthi.ui.app.app_chat_view {
        interface ChatItem extends telep.chat.ChatMetadata {
        }


        type Statedata = htmlhc.lib.alarm.AlarmObject<{
            chats: htmlhc.lib.alarm.AlarmObject<ChatItem>[]
        }>
    }
}