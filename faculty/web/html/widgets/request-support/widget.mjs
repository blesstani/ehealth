/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget (request-support), allows a user to receive customer support
 */

import ContactUs from "../contact-us/widget.mjs";
import FrequentlyAskedQuestions from "../frequently-asked-questions/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class RequestSupport extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: RequestSupport.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='faqs'>
                            <div class='main'></div>
                        </div>
                        <div class='form'></div>
                    </div>
                </div>
            `
        });

        this.html.$(':scope >.container >.main >.faqs').appendChild(
            new FrequentlyAskedQuestions().html
        );

        this.html.$(':scope >.container >.main >.form').appendChild(
            new ContactUs().html
        )

    }

    /** @readonly */
    static classList = ['hc-ehealthi-request-support']
}