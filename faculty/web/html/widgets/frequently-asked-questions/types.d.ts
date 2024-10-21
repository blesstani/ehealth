/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Frequently Asked Questions widget
 * 
 */

import ''


global {
    namespace ehealthi.ui.frequently_asked_questions {

        export declare interface QuestionData {
            title: string
            content: string
        }
    }

    namespace faculty.managedsettings {
        interface all {
            frequently_asked_questions: {
                faculty: 'web'
                namespace: 'widgets'
                data: ehealthi.ui.frequently_asked_questions.QuestionData[]
            }
        }
    }
}
