/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The Web Faculty
 * The Feeds Feature
 * This widget renders a feed coming from Facebook
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

const _init = Symbol()



export default class FacebookFeedView extends Widget {


    constructor({ id } = {}) {
        super();

        super.html = hc.spawn(
            {
                classes: FacebookFeedView.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='content'></div>
                    </div>
                `
            }
        );


        this.blockWithAction(async () => {
            await FacebookFeedView.init()
            const [pageID, postID] = id?.split?.("_")
            console.log(`pageID: ${pageID}, postID: ${postID}`)
            this.html.$(':scope >.container >.content').appendChild(
                hc.spawn(
                    {
                        classes: ['fb-post'],
                        attributes: {
                            'data-href': `https://www.facebook.com/${pageID}/posts/${postID}/`,
                            'data-show-text': true,
                            'data-width': '100%'
                        }
                    }
                )
            )
        });

    }

    /**
     * 
     */
    static async init() {
        const doInit = () => {
            const main = async () => {
                await hc.importJS('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0')
            }

            return (this[_init] = main())
        }
        return await (
            this[_init] ? (async () => {
                try {
                    return await this[_init]
                } catch {
                    doInit()
                }
            })() : doInit()
        )
    }

    /** @readonly */
    static classList = ['hc-telep-web-feeds-facebook-view']

}