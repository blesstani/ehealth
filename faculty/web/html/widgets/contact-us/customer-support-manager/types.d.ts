/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The contact-us widget
 * This module contains type definitions related to the customer support contact feature
 */


import ''

global {
    namespace ehealthi.ui.contact_us.customer_support {
        interface CustomerSupportContact {
            label: string
            contact: modernuser.notification.ContactExtra
        }
    }

    namespace faculty.managedsettings {


        interface all {
            organization_support_contacts: {
                faculty: 'web'
                namespace: 'widgets'
                data: ehealthi.ui.contact_us.customer_support.CustomerSupportContact[]
            }
        }
    }
}