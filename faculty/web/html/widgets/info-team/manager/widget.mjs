/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget allows an authorized personnel to manage the team information of the platform.
 */

import WidgetSettingsManager from "../../widget-settings-manager/widget.mjs";



/**
 * @extends WidgetSettingsManager<ehealthi.ui.info_team.Item>
 */
export default class TeamInfoManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `Team`,
                displayConfig: [
                    {
                        label: `Photo`,
                        name: 'icon',
                        view: '::image'
                    },
                    {
                        name: 'label',
                        label: `Names`,
                        view: '::text'
                    },
                    {
                        name: 'roleLabel',
                        label: `Job Title`,
                        view: '::text'
                    }
                ],
                form: [
                    [
                        {
                            label: 'Name',
                            name: 'label',
                        },
                        {
                            label: 'Job title',
                            name: 'roleLabel'
                        }
                    ],
                    [
                        {
                            label: `Photo`,
                            name: 'icon',
                            type: 'uniqueFileUpload',
                            url: '/$/uniqueFileUpload/upload',
                        }
                    ],
                ],
                settingsKey: 'team_info'
            }
        )
    }

}