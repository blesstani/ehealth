/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module, contains type definitions useful, in a wide scope, to the Faculty of Health
 */

import HealthPublicMethods from "./remote/public.mjs"

global {

    namespace modernuser.profile {
        interface UserProfileMeta {
            birthDate: number
            sex: "M" | "F"
            isDoctor: boolean
        }
    }

    namespace faculty {
        interface faculties {
            health: {
                remote: {
                    public: HealthPublicMethods
                    internal: {}
                }
            }
        }
    }

    namespace modernuser.permission {
        interface AllPermissions {
            "permissions.health.appointment.view": true
            "permissions.health.appointment.supervise": true
        }
    }

}