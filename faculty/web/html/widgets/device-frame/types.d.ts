/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the device-frame widget
 */



import ''

global {
    namespace ehealthi.ui.app.device_frame {
        interface Item {
            id: string
            label: string
            icon: string
            content: HTMLElement
            main: boolean
        }

        type Statedata = htmlhc.lib.alarm.AlarmObject<{
            items: Item[]
        }>
    }
}