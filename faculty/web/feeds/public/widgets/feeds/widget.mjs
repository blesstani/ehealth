/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The feeds feature
 * This widget displays feeds
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class FeedsView extends Widget {


    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: FeedsView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='title'>Social Media</div>
                        <div class='content'></div>
                    </div>
                `
            }
        );

        /** @type {telep.web.feeds.Feed[]} */ this.data
        this.pluralWidgetProperty(
            {
                selector: ['', ...FeedsView.Item.classList].join('.'),
                parentSelector: ':scope >.container >.content',
                transforms: {
                    set: (input) => new FeedsView.Item(input).html,
                    get: html => {
                        const widget = html.widgetObject
                        return {
                            data: widget.data,
                            provider: widget.provider
                        }
                    }
                }
            },
            'data'
        );


        this.blockWithAction(async () => {
            const data = await hcRpc.web.feeds.getFeeds();

            (async () => {
                for await (const item of data) {
                    console.log(`Adding `, item)
                    this.data.push(item)
                }
            })()

        })


    }

    /** @readonly */
    static classList = ['hc-telep-web-feeds-view']


    static Item = class extends Widget {

        /**
         * 
         * @param {object} param0 
         * @param {string} param0.provider
         * @param {object} param0.data
         */
        constructor({ provider, data } = {}) {
            super();

            super.html = hc.spawn(
                {
                    classes: FeedsView.Item.classList,
                    innerHTML: `
                    
                        <div class='container'>
                            <div class='content'></div>
                        </div>
                    `
                }
            );

            this.blockWithAction(async () => {
                // new TwitterView()
                this.html.$(':scope >.container >.content').appendChild(
                    new (await import(`/$/web/feeds/providers/${this.provider}/public/widget.mjs`)).default(this.data).html
                )
            })

            /** @type {string} */ this.provider
            /** @type {object} */ this.data
            Object.assign(this, arguments[0])

        }

        static classList = ['hc-telep-web-feeds-view-item']

    }

}