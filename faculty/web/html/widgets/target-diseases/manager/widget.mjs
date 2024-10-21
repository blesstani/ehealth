/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget allows an authorized personnel to manage the target diseases of the platform.
 */

import WidgetSettingsManager from "../../widget-settings-manager/widget.mjs";



/**
 * @extends WidgetSettingsManager<ehealthi.ui.target_diseases.TargetDisease>
 */
export default class TargetDiseasesManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `Target Diseases`,
                displayConfig: [
                    {
                        label: `Image`,
                        name: 'image',
                        view: '::image'
                    },
                    {
                        name: 'label',
                        label: `Name`,
                        view: '::text'
                    },
                    {
                        name: 'content',
                        label: `Description`,
                        view: '::text'
                    }
                ],
                form: [
                    [
                        {
                            label: 'Name',
                            name: 'label',
                        }
                    ],
                    [
                        {
                            label: `Image`,
                            name: 'image',
                            type: 'uniqueFileUpload',
                            url: '/$/uniqueFileUpload/upload',
                        }
                    ],
                    [
                        {
                            label: `Description`,
                            name: 'content',
                            type: 'textarea'
                        }
                    ]
                ],
                settingsKey: 'target_diseases'
            }
        );
    }

}