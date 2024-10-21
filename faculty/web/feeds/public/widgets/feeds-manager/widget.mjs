/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The twitter feeds provider
 * This widget, allows an admin to decide on the Twitter posts to embed on the site
 */

import WidgetSettingsManager from "/$/web/html/widgets/widget-settings-manager/widget.mjs"




/**
 * @extends WidgetSettingsManager<ehealthi.ui.contact_us.SocialContact>
 */
export default class ContactLinksManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `Social Media Posts`,
                displayConfig: [

                    {
                        name: 'href',
                        label: `Link`,
                        view: '::text'
                    },
                    {
                        label: `Platform`,
                        name: 'provider',
                        view: '::text'
                    }
                ],
                form: [
                    [
                        {
                            label: 'Platform',
                            name: 'provider',
                            type: 'customWidget',
                            customWidgetUrl: new URL('./providers-input.mjs', import.meta.url).href,
                        }
                    ],
                    [
                        {
                            label: `URL`,
                            type: 'text',
                            name: 'href'
                        }
                    ],

                ],
                settingsKey: 'social_media_feeds'
            }
        )
    }

}