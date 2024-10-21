/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (app-customer-service-agent), is where a customer service agent can serve client queries
 */

import ChatEventClient from "/$/chat/static/event-client/client.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class CustomerServiceAgentView extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: CustomerServiceAgentView.classList,
            innerHTML: `
                <div class='container'>
                </div>
            `
        })



        this.blockWithAction(async () => {
            const instance = new (await import("../app-chat-view/widget.mjs")).default()
            instance.type = 'roled'
            const eventClient = await ChatEventClient.create();

            eventClient.events.addEventListener('telep-chat-new-roled-chat', async ({ detail: { id } }) => {
                const info = await hcRpc.chat.management.getChatViewData({ id });
                instance.items = [
                    info,
                    ...instance.items.filter(x => x.id != id)
                ];
                alert(`New Customer Service chat`)
            })
            this.html.$(':scope >.container').appendChild(instance.html)

        })

    }



    /** @readonly */
    static classList = ['hc-ehealthi-app-customer-service-agent-view']

}