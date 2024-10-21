/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget (info-community), presents the user with the opportunity to join the organization's social media community
 */

import CommunityJoinButton from "../community-join-button/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



/**
 * @extends Widget<InfoCommunity>
 */
export default class InfoCommunity extends Widget {

    constructor() {
        super();
        this.html = hc.spawn(
            {
                classes: InfoCommunity.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='bg-doodle'></div>
                        <div class='content'>
                            <div class='text'>
                                <div class='title'>Gain <highlight>FREE</highlight> Health Tips</div>
                                <div class='caption'>by joining our community</div>
                            </div>
                            <div class='action'></div>
                        </div>
                    </div>
                `
            }
        );

        this.html.$('.container >.content >.action').appendChild(new CommunityJoinButton().html)

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-info-community']
    }

}