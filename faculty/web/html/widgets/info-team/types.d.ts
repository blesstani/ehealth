/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This module contains type definitions for the info-team widget.
 */


import ''

global {
    namespace ehealthi.ui.info_team {
        interface Item {
            label: string
            roleLabel: string
            icon: string
        }

        type Statedata = htmlhc.lib.alarm.AlarmObject<{
            items: Item[]
        }>
    }


    namespace faculty.managedsettings {
        type all = {
            team_info: {
                faculty: 'web'
                namespace: 'widgets'
                data: ehealthi.ui.info_team.Item[]
            }
        }
    }

}