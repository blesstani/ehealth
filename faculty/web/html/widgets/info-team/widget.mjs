/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * The info-team widget.
 * This widget shows information about the organizational team.
 */

import Item from "./item.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import WideSlider from "/$/system/static/html-hc/widgets/wide-slider/widget.mjs";


const slider = Symbol()

/**
 * @extends Widget<InfoTeam>
 */
export default class InfoTeam extends Widget {

    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: InfoTeam.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='title'>
                            <div>Meet our</div><div class='highlight'>TEAM</div>
                        </div>

                        <div class='content'>
                            <div class='navigation'>
                                <div class='left'></div>
                                <div class='right'></div>
                            </div>
                        </div>

                        
                        
                    </div>
                `
            }
        );

        /** @type {WideSlider} */ this[slider]
        this.widgetProperty(
            {
                selector: ['', ...WideSlider.classList].join('.'),
                parentSelector: '.container >.content',
                property: slider,
                childType: 'widget'
            }
        );

        this[slider] = new WideSlider();

        /** @type {ehealthi.ui.info_team.Statedata} */
        this.statedata = new AlarmObject()

        this.statedata.$0.addEventListener('items-change', new DelayedAction(() => {
            this[slider].items = this.statedata.items.map(item => new Item(item).html)
        }, 250));

        this.blockWithAction(async () => {

            this.statedata.items = (await hcRpc.system.settings.get({ faculty: 'web', name: 'team_info', namespace: 'widgets' })) || []
        })


        const directions = [-1, 1]
        const navigationButtons = [...this.html.$$('.container >.content >.navigation >*')]
        for (let i = 0; i < directions.length; i++) {
            ((i) => {
                navigationButtons[i].addEventListener('click', () => {
                    this[slider].index += directions[i]
                })
            })(i)
        }



    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-info-team']
    }

}