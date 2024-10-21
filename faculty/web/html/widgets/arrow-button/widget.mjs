/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, is a nice-looking button featuring an arrow to the right
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";


export default class EHealthiArrowButton extends ActionButton {

    /**
    * 
    * @param {object} param0 
    * @param {typeof this.content} param0.content
    * @param {typeof this.onclick} param0.onclick
    * @param {typeof this.state} param0.state
    * @param {boolean} param0.hoverAnimate
    */
    constructor({ } = {}) {
        super(...arguments)

        this.html.classList.add(...EHealthiArrowButton.classList)
        this.html.$('.container').appendChild(
            hc.spawn(
                {
                    tag: 'div',
                    classes: ['arrow'],
                    innerHTML: `&#x2192;`
                }
            )
        );

        this.html.classList.remove('hoverAnimate')
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-arrow-button']
    }

}

hc.importModuleCSS(import.meta.url);
