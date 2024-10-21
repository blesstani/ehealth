/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget displays a single 'Frequently Asked Question'
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AccordionItem from "/$/system/static/html-hc/widgets/arcordion/item.mjs";


export default class Question extends AccordionItem {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.title
     * @param {string} param0.content
     */
    constructor({ title, content } = {}) {
        super(
            {
                label: title,
                content: hc.spawn({
                    classes: [Question.classList[0] + '-content'],
                    innerHTML: `
                        <div class='container'>
                            <div class='content'>${content}</div>
                            <div class='bottom'>
                                <div class='logo'><img src='/$/shared/static/logo.png'></div>
                            </div>
                        </div>
                    `
                })
            }
        )

        this.html.classList.add(...Question.classList)
    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-frequently-asked-questions-item']
    }
}


hc.importModuleCSS(import.meta.url);