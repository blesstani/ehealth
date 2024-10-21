/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The frequently-asked-questions widget
 * This sub-widget (manager), provides a terminal for  an authorized user to manage the list of services.
 */

import WidgetSettingsManager from "../../widget-settings-manager/widget.mjs";




/**
 * @extends WidgetSettingsManager<ehealthi.ui.frequently_asked_questions.QuestionData>
 */
export default class FrequentlyAskedQuestionsManager extends WidgetSettingsManager {

    constructor() {
        super(
            {
                title: `Frequently Asked Questions`,
                displayConfig: [
                    {
                        name: 'title',
                        label: `Title`,
                        view: '::text'
                    },
                    {
                        name: 'content',
                        label: `Content`,
                        view: '::text'
                    }
                ],
                form: [
                    [
                        {
                            label: `Title`,
                            name: 'title'
                        }
                    ],
                    [
                        {
                            label: `Content`,
                            name: 'content',
                            type: 'textarea'
                        }
                    ]
                ],
                settingsKey: "frequently_asked_questions"
            }
        )
    }

}