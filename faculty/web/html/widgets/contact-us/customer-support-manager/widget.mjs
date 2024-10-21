/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The contact-us widget
 * This sub-widget (contact-manager), provides a terminal for an authorized user to manage the contact that get's to receive requests for support
 */

import WidgetSettingsManager from "../../widget-settings-manager/widget.mjs";
import ContactInput from "/$/modernuser/notification/static/widgets/contact-input/widget.mjs";



/**
 * @extends WidgetSettingsManager<ehealthi.ui.contact_us.SocialContact>
 */
export default class ContactLinksManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `System Contacts`,
                displayConfig: [
                    {
                        name: 'label',
                        label: `Name`,
                        view: '::text'
                    },
                    {
                        name: 'contact.caption',
                        label: `Contact`,
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
                            label: `Contact`,
                            type: 'customWidget',
                            name: 'contact',
                            customWidgetUrl: "/$/modernuser/notification/static/widgets/contact-input/widget.mjs"
                        }
                    ],

                ],
                settingsKey: 'organization_support_contacts'
            }
        )
    }

}