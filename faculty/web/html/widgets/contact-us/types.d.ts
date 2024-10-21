/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This module contains type definitions for the contact-us widget.
 */


import ''


global {
    namespace ehealthi.ui.contact_us {
        interface SocialContact {
            icon: string
            href: string
            label: string
        }
    }

    namespace faculty.managedsettings {
        interface all {
            organization_contacts: {
                namespace: 'widgets'
                faculty: 'web'
                data: ehealthi.ui.contact_us.SocialContact[]
            }
        }
    }
}