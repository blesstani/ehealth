/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (app-customer-service-chat), allows a user to chat with customer service
 */

import ChatWidget from "/$/chat/static/widgets/chat/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class CustomerServiceChat extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: CustomerServiceChat.classList,
            innerHTML: `
                <div class='container'>
                </div>
            `
        });

        this.blockWithAction(async () => {
            this.html.$(':scope >.container').appendChild(new ChatWidget((await hcRpc.web.getCustomerSupportChat())).html)
        })

    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-customer-service-chat']
}