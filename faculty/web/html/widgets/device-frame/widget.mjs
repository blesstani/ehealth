/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (device-frame), forms the skeleton of what the user interacts with. 
 * It provides the ability to navigate between different screens. 
 */

import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import osBackButtonManager from "/$/system/static/html-hc/lib/util/os-back-button/manager.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import defineImageProperty from "/$/system/static/html-hc/lib/widget/widget-image.mjs";
import BackForth from "/$/system/static/html-hc/widgets/back-forth/widget.mjs";


const nav = Symbol()
const contentItems = Symbol()


export default class DeviceFrame extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: DeviceFrame.classList,
            innerHTML: `
                <div class='container'>
                    <div class='nav'></div>
                    <div class='content'></div>
                </div>
            `
        });

        /** @type {ehealthi.ui.app.device_frame.Statedata} */ this.statedata = new AlarmObject()

        this[nav] = new Navigation(this.statedata)
        this.html.$('.container >.nav').appendChild(this[nav].html);

        /** @type {ViewContainer[]} */ this[contentItems]
        this.pluralWidgetProperty({
            selector: ['', ...ViewContainer.classList].join('.'),
            parentSelector: '.container >.content',
            property: contentItems,
            childType: 'widget'
        });


        this.statedata.$0.addEventListener('items-change', new DelayedAction(
            () => {
                this[contentItems] = (this.statedata.$0data.items || []).map((x, i) => new ViewContainer(x.content, x.id, i == 0))
            }, 50, 250
        ));

        this[nav].addEventListener('change', new DelayedAction(() => {
            const currentlyVisible = this[contentItems].find(x => x.visible);
            if (currentlyVisible) {
                currentlyVisible.visible = false
            }
            const target = this[contentItems].find(x => x.id == this[nav].itemSelected);
            if (target) {
                target.visible = true
            }
        }, 250, 5000))

        const navigateToRoot = () => {
            const rootTab = this.statedata.$0data.items.find(x => x.main)
            if (!rootTab || this[nav].itemSelected == rootTab.id) {
                return false
            }
            this[nav].select(rootTab.id)
            return true
        }

        this.waitTillDOMAttached().then(() => {
            osBackButtonManager.register({
                html: this.html,
                signal: this.destroySignal,
                callback: (control) => {
                    // The whole idea, is that returning from any tab that is not the main one, should bring us back to the root tab
                    if (navigateToRoot()) {
                        return true
                    }
                    control.pass()
                }
            });

            this.html.addEventListener('backforth-quit', () => {
                navigateToRoot()
            })
        })


    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-device-frame']
    }

}


const backforth = Symbol()

class ViewContainer extends Widget {
    /**
     * 
     * @param {HTMLElement} content 
     * @param {string} id
     * @param {boolean} visible
     */
    constructor(content, id, visible) {
        super();

        this.html = hc.spawn(
            {
                classes: ViewContainer.classList,
                innerHTML: `
                    <div class='container'>

                    </div>
                `
            }
        );

        this.widgetProperty(
            {
                selector: ['', ...BackForth.classList].join('.'),
                parentSelector: ':scope >.container',
                childType: 'widget',
            },
            backforth
        );

        this.htmlProperty(undefined, 'visible', 'class', () => {

            this.html.classList.add('animating')


            setTimeout(() => {
                if (this.visible) {
                    this[backforth] ||= (() => {
                        const backforth = new BackForth({ view: content })
                        osBackButtonManager.register(
                            {
                                signal: this.destroySignal,
                                html: this.html,
                                callback: (params) => {
                                    if (backforth.canGoBack) {
                                        backforth.goBack()
                                        return true
                                    }
                                    params.pass()
                                }
                            }
                        )
                        return backforth
                    })()

                    setTimeout(() => this.html.classList.remove('animating'), 850)

                }
            }, 20)
        })

        /** @type {boolean} */ this.visible = visible

        this.html.setAttribute('view-container-id', id)


    }
    get id() {
        return this.html.getAttribute('view-container-id')
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-device-frame-view-container']
    }
}


const items = Symbol()
const itemHTMLs = Symbol()

class Navigation extends Widget {
    /**
     * 
     * @param {ehealthi.ui.app.device_frame.Statedata} statedata 
     */
    constructor(statedata) {
        super();

        this.html = hc.spawn(
            {
                classes: Navigation.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='items'></div>
                        <div class='highlighter'></div>
                    </div>
                `
            }
        );

        this.statedata = statedata;

        const selectMain = new DelayedAction(() => {
            this.waitTillDOMAttached().then(() => {

                const main = this[items].find(x => x.main);
                if (main) {
                    this.select(main.id)
                } else {
                    this.html.$('.container >.items >:first-child').click()
                }
            })
        }, 250, 5000)

        /** @type {ehealthi.ui.app.device_frame.Item[]} */ this[items];
        this.pluralWidgetProperty(
            {
                selector: 'div',
                parentSelector: '.container >.items',
                property: items,
                transforms: {
                    /**
                     * 
                     * @param {ehealthi.ui.app.device_frame.Item} data 
                     */
                    set: (data) => {
                        const html = hc.spawn(
                            {
                                classes: ['item'],
                                innerHTML: `
                                    <div class='icon'></div>
                                    <div class='label'>${data.label}</div>
                                `
                            }
                        );

                        html.addEventListener('click', () => {
                            this.highlight(html)
                            this.itemSelected = data.id
                            this.dispatchEvent(new CustomEvent('change'))
                        })

                        const object = { html };

                        defineImageProperty.call(object, 'icon', '.icon', new URL('./res/', import.meta.url,).href, 'inline')

                        object.icon = data.icon

                        selectMain()

                        html.customData = data

                        return html

                    },
                    get: (html) => {
                        return html.customData
                    }
                }
            }
        )


        /** @type {HTMLElement[]} */ this[itemHTMLs];
        this.pluralWidgetProperty(
            {
                selector: 'div',
                parentSelector: '.container >.items',
                property: itemHTMLs,
                childType: 'html'
            }
        )




        this.statedata.$0.addEventListener('items-change', new DelayedAction(
            () => {
                this[items] = this.statedata.$0data.items || []
            }, 50, 250
        ));

        // Due to the way the widget loads, with CSS coming much later,
        // we want that whenever the dimensions of the key area of this widget changes, let's adjust the highlight all over
        this.waitTillDOMAttached().then(() => {
            const observer = new ResizeObserver(() => {
                this.select(this.itemSelected)
            })
            observer.observe(this.html.$(':scope >.container >.items'), { box: 'content-box' })
        })

    }

    /**
     * This method selects a tab
     * @param {string} id 
     */
    select(id) {
        this[itemHTMLs][this[items].findIndex(x => x.id == id)]?.click()
    }
    /**
     * This method moves the highlighter to the option pertaining to this element.
     * @param {HTMLElement} element 
     */
    highlight(element) {
        while (this.html.contains(element) && ![...this.html.$('.container >.items').children].find(x => x == element)) {
            element = element.parentElement
        }

        if (!this.html.contains(element)) {
            return;
        }

        // Now, get the x, coordinate, relative to its parent
        /**
         * This function returns the relative distance from the from element to the to element
         * @param {HTMLElement} from 
         * @param {HTMLElement} to 
         * @param {"left"|"top"} dimension 
         */
        function relativeDimension(from, to, dimension) {
            return (from.getBoundingClientRect())[dimension] - (to.getBoundingClientRect())[dimension]
        }

        const elemDimen = element.getBoundingClientRect()
        this.html.style.setProperty('--highlighter-x', `${relativeDimension(element, element.parentElement, 'left')}px`)
        this.html.style.setProperty('--highlighter-y', `${relativeDimension(element, element.parentElement, 'top')}px`)
        this.html.style.setProperty('--highlighter-width', `${elemDimen.width}px`)
        this.html.style.setProperty('--highlighter-height', `${elemDimen.height}px`)
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-device-frame-nav']
    }
}
