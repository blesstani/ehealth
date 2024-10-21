/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The contact-us widget
 * This sub-widget (links-manager), provides a terminal for an authorized user to manage the list of contact links of the platform.
 */

import WidgetSettingsManager from "../../widget-settings-manager/widget.mjs";



/**
 * @extends WidgetSettingsManager<ehealthi.ui.contact_us.SocialContact>
 */
export default class ContactLinksManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `Contact Links`,
                displayConfig: [
                    {
                        label: `Image`,
                        name: 'icon',
                        view: '::image'
                    },
                    {
                        name: 'label',
                        label: `Name`,
                        view: '::text'
                    },
                    {
                        name: 'href',
                        label: `URL`,
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
                            label: `URL`,
                            type: 'text',
                            name: 'href'
                        }
                    ],
                    [
                        {
                            label: `Image`,
                            name: 'icon',
                            type: 'uniqueFileUpload',
                            url: '/$/uniqueFileUpload/upload',
                        }
                    ],
                ],
                settingsKey: 'organization_contacts'
            }
        )
    }

}