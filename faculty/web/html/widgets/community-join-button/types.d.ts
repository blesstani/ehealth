/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions useful for the community-join-button widget
 */


import ''

global {
    namespace ehealthi.ui.community_join_button {
        interface CommunityInfo {
            href: string
            caption: string
        }
    }

    namespace faculty.managedsettings {
        interface all {
            community_info: {
                namespace: 'widgets'
                faculty: 'web'
                data: ehealthi.ui.community_join_button.CommunityInfo
            }
        }
    }
}