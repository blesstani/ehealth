/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The info-services widget
 * This sub-widget (manager), provides a terminal for  an authorized user to manage the list of services.
 */

import WidgetSettingsManager from "../../widget-settings-manager/widget.mjs";



/**
 * @extends WidgetSettingsManager<ehealthi.ui.info_services.ServiceInfo>
 */
export default class ServicesManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `Services`,
                displayConfig: [
                    {
                        label: `Image`,
                        name: 'image',
                        view: '::image'
                    },
                    {
                        name: 'title',
                        label: `Title`,
                        view: '::text'
                    },
                    {
                        name: 'description',
                        label: `Description`,
                        view: '::text'
                    }
                ],
                form: [
                    [
                        {
                            label: 'Title',
                            name: 'title',
                        }
                    ],
                    [
                        {
                            label: `Description`,
                            type: 'textarea',
                            name: 'description'
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
                ],
                settingsKey: 'organization_services'
            }
        )
    }

}