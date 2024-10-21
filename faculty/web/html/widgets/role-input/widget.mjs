/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget allows someone to request for sensitive roles
 */

import Role from "./role.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Checkbox } from "/$/system/static/html-hc/widgets/checkbox/checkbox.mjs";


/**
 * @extends Widget<InlineRoleInput>
 */
export default class InlineRoleInput extends Widget {

    /**
     * 
     * @param {object} data 
     * @param {string} data.label
     * @param {string} data.name
     */
    constructor(data) {
        super();

        this.html = hc.spawn(
            {
                classes: InlineRoleInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='trigger'>
                            <div class='checkbox'></div>
                            <div class='label'>I work at eHealthi</div>
                        </div>
                        <div class='content'>
                            <div class='prompt'>What positions do you occupy?</div>
                            <div class='roles'>
                                <!-- The roles appear here --->
                            </div>
                        </div>
                    </div>
                `
            }
        );


        this.widgetProperty(
            {
                selector: ['', ...Checkbox.classList].join('.'),
                parentSelector: '.container >.trigger >.checkbox',
                property: 'checkbox',
                childType: 'widget'
            }
        )
        this.checkbox = new Checkbox()

        /** @type {string} */ this.label
        this.htmlProperty('.container >.trigger >.label', 'label', 'innerHTML')

        /** @type {string} */ this.prompt
        this.htmlProperty('.container >.content >.prompt', 'prompt', 'innerHTML')

        this.html.$('.container >.trigger').addEventListener('click', (event) => {
            if (this.checkbox.html.contains(event.target)) {
                return
            }
            this.checkbox.value = !this.checkbox.value
        });

        this.checkbox.addEventListener('change', () => {
            this.html.classList.toggle('expanded', this.checkbox.value)
        });

        /** @type {modernuser.role.data.Role[]} */ this.roles
        this.pluralWidgetProperty(
            {
                selector: ['', ...Role.classList].join('.'),
                parentSelector: '.container >.content >.roles',
                property: 'roles',
                transforms: {
                    set: (d) => {
                        d.icon ||= '/$/shared/static/logo.png'
                        return new Role(d).html
                    },
                    /**
                     * 
                     * @param {Role['html']} html 
                     */
                    get: (html) => {
                        const widget = html.widgetObject
                        return {
                            label: widget.label,
                            id: widget.id,
                        }
                    }
                }
            }
        );

        /** @type {Role[]} */ this.roleWidgets
        this.pluralWidgetProperty(
            {
                selector: ['', ...Role.classList].join('.'),
                parentSelector: '.container >.content >.roles',
                property: 'roleWidgets',
                childType: 'widget',
            }
        )

        this.waitTillDOMAttached().then(() => this.load())

        Object.assign(this, data)


    }

    async load() {
        try {
            await this.loadWhilePromise((async () => {
                this.roles = await hcRpc.modernuser.role.data.getAll()
            })())
        } catch (e) {
            handle(e)
        }
    }

    /**
     * @returns {string[]}
     */
    get value() {
        return this.roleWidgets.filter(x => x.selected).map(x => x.id)
    }
    /**
     * @param {string[]} value
     */
    set value(value) {
        this.roleWidgets.forEach(wid => wid.selected = value.includes(wid.id))
    }

    static {
        this.classList = ['hc-ehealthi-inline-role-input']
    }

}