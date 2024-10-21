/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, allows a user, whether doctor, or patient, to manage his profile
 */

import NotificationContactsSection from "./sections/notification-contacts/widget.mjs";
import ProfileDataSection from "./sections/profile-data/widget.mjs";
import SecuritySection from "./sections/security/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



/**
 * @extends Widget<MyProfile>
 */
export default class MyProfile extends Widget {

    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: MyProfile.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='sections'></div>
                    </div>
                `
            }
        );

        /** @type {Section[]} */ this.sections
        this.pluralWidgetProperty(
            {
                selector: ['', ...Section.classList].join('.'),
                parentSelector: '.container >.sections',
                property: 'sections',
                childType: 'widget',
            }
        );

        this.blockWithAction(async () => {

            this.sections = [
                new Section(
                    {
                        title: `Profile`,
                        caption: `What people see`,
                        content: new ProfileDataSection().html
                    }
                ),
                new Section(
                    {
                        title: `Security`,
                        caption: `How you log in`,
                        content: new SecuritySection().html
                    }
                ),
                new Section(
                    {
                        title: `Contacts`,
                        caption: `How notifications reach you`,
                        content: new NotificationContactsSection().html
                    }
                )
            ]

        })

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile']
    }

}



/**
 * @extends Widget<Section>
 */
class Section extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.title
     * @param {string} param0.caption
     * @param {HTMLElement} param0.content
     */
    constructor({ title, caption, content } = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: Section.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='top'>
                            <div class='title'></div>
                            <div class='caption'></div>
                        </div>

                        <div class='content'>
                        </div>
                        
                    </div>
                `
            }
        );

        /** @type {string} */ this.title
        /** @type {string} */ this.caption
        for (const property of ['title', 'caption']) {
            this.htmlProperty(`.container >.top >.${property}`, property, 'innerHTML')
        }

        /** @type {HTMLElement} */ this.content
        this.widgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.content',
                property: 'content',
                childType: 'html'
            }
        );

        Object.assign(this, arguments[0])
    }

    /** @readonlys */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-section']
    }
}