/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions, related to storing, and retrieving the platform's privacy policy
 */



import ''

global {
    namespace faculty.managedsettings {
        interface all {
            privacy_policy: {
                faculty: 'web'
                namespace: 'widgets'
                data: ehealthi.ui.info_privacy.PrivacyPolicy
            }
        }
    }

    namespace ehealthi.ui.info_privacy {
        interface PrivacyPolicy {
            content: string
        }
    }
}