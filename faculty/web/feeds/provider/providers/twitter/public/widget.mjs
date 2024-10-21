/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The feeds feature
 * This widget renders tweets on the frontend
 */

import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


const _init = Symbol()


export default class TwitterView extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.href
     */
    constructor({ id, href }) {
        super()

        this.html = hc.spawn({
            classes: TwitterView.classList
        })

        this.blockWithAction(async () => {

            await (await TwitterView.getAPI()).widgets.createTweet(id || ((link) => {
                const statusRegExp = /^[^\/]+\/[^\/]+\/status\/([0-9]+)/
                if (statusRegExp.test(link)) {
                    return statusRegExp.exec(link)[1]
                }
                console.log(`The link ${link}, doesn't conform to `, statusRegExp)
                return link
            })(href.split(/^https{0,1}:\/\//).at(-1)), this.html)
        })
    }

    /** @readonly */
    static classList = ['hc-telep-web-feeds-twitter-view']

    static async init() {
        if (this[_init]) {
            try {
                await this[_init]
                return
            } catch { }
        }
        this[_init] = (async () => {
            await hc.importJS("https://platform.twitter.com/widgets.js");
            while (!window.twttr?.widgets) {
                await new Promise(x => setTimeout(x, 200))
            }
            return window.twttr
        })();
    }

    /**
     * This returns a handle to the twitter API
     * @returns {Promise<telep.web.feeds.providers.twitter.ui.API>}
     */
    static async getAPI() {

        await this.init()

        while (!window.twttr?.widgets) {
            await new Promise(x => setTimeout(x, 2000))
        }

        return window.twttr
    }

}