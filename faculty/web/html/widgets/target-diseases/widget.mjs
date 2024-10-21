/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (target-diseases), displays information about diseases that the organization treats
 */

import Item from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


/**
 * @extends Widget<TargetDiseases>
 */
export default class TargetDiseases extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: TargetDiseases.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='title'>What we treat</div>
                        <div class='items'></div>
                    </div>
                `
            }
        );

        /** @type {ehealthi.ui.target_diseases.TargetDisease[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.items',
                property: 'items',
                transforms: {
                    set: (input) => {
                        return new Item(input).html
                    },
                    get: (html) => {
                        /** @type {Item} */
                        const widget = html.widgetObject
                        return {
                            label: widget.label,
                            image: widget.image
                        }
                    }
                }
            }
        );


        this.blockWithAction(async () => {
            this.items = (await hcRpc.system.settings.get({ faculty: 'web', name: 'target_diseases', namespace: 'widgets' })) || []
        })

    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-target-diseases']
    }

}