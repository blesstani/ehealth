/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This simple widget gives the user the option to join the organization's community.
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";



export default class CommunityJoinButton extends ActionButton {

    constructor() {
        super(
            {
                content: `Join WhatsApp Community`
            }
        );

        this.blockWithAction(
            async () => {
                /** @type {ehealthi.ui.community_join_button.CommunityInfo} */
                const info = (await hcRpc.system.settings.get({ faculty: 'web', name: 'community_info', namespace: 'widgets' })) || {}
                this.content = info.caption || this.content
                this.onclick = () => {
                    hc.spawn({ tag: 'a', attributes: { href: info.href, target: '_blank' } }).click()
                }
            }
        )
    }
}