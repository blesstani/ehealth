/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget shows information about the services offered by the organization.
 */

import FilledButton from "/$/shared/static/widgets/filled-button/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { AnimatedTick } from "/$/system/static/html-hc/widgets/animated-tick/tick.js";
import DualPaneExpander from "/$/system/static/html-hc/widgets/dual-pane-expander/widget.mjs";


const actionLabels = Symbol()



/**
 * @extends Widget<InfoServices>
 */
export default class InfoServices extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: InfoServices.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'></div>
                    </div>
                `
            }
        );

        /** @type {DualPaneExpander} */ this.main
        this.widgetProperty({
            selector: ['', ...DualPaneExpander.classList].join('.'),
            parentSelector: '.container >.main',
            childType: 'widget',
            property: 'main'
        });

        this.main = new DualPaneExpander()

        this.main.title = `Our Services`;

        /** @type {HTMLElement[]} */ this[actionLabels]
        this.pluralWidgetProperty(
            {
                property: actionLabels,
                parentSelector: `:scope >.container >.main >*>.container >.main >.left >.options`,
                selector: '* >.container >.label',
                childType: 'html',
                immediate: false
            }
        )

        /** @type {ehealthi.ui.info_services.Statedata} */ this.statedata = new AlarmObject()

        const onchange = new DelayedAction(() => {
            this.main.items = this.statedata.services.map(
                serv => {
                    const tick = new AnimatedTick({ activated: true })

                    const actionLabelHTML = hc.spawn({
                        classes: ['hc-ehealthi-info-services-action-label'],

                        innerHTML: `
                                <div class='label'>${serv.title}</div>
                                <div class='tick'></div>
                            `,
                    });
                    actionLabelHTML.$('.tick').appendChild(tick.html)
                    actionLabelHTML.addEventListener('click', () => {
                        this[actionLabels].forEach(x => {
                            /** @type {AnimatedTick} */
                            const tickWidget = x.$('.tick >*').widgetObject;
                            tickWidget.activated = false
                        })
                        tick.activated = true;
                        tick.animate()
                    })

                    return {
                        name: serv.id,
                        actionLabel: actionLabelHTML,
                        contentLabel: hc.spawn({ innerHTML: `<img src='${serv.image}'>` }),
                        content: hc.spawn({ innerHTML: serv.description }),
                        actions: [
                            new FilledButton(
                                {
                                    content: `Contact`,
                                    // TODO: Move the user to the contact form, filled with appropriate details
                                }
                            ).html
                        ]
                    }
                }
            );

        }, 250)
        this.statedata.$0.addEventListener('services-$array-items-change', onchange)
        this.statedata.$0.addEventListener('services-change', onchange)

        this.blockWithAction(async () => {
            this.statedata.services = (await hcRpc.system.settings.get({ faculty: 'web', name: 'organization_services', namespace: 'widgets' })) || []
        })


    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ehealthi-info-services']
    }

}