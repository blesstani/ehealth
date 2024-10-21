/**
 * Copyright 2024 HolyCorn Software
 * The holycornweb Project
 * This module contains type definitions for the our-process widget
 */


import ''

global {
    namespace holycornweb.ui.our_process {
        namespace intro {
            interface Item {
                label: string
                icon: string
            }
        }

        interface ProcessStep {
            label: string
            description: string
            icon: string
        }
    }
}