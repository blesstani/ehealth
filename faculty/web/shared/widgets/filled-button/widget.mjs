/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project.
 * This widget (filled-button), is a special button widget for this project, with aesthetic looks.
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";



export default class FilledButton extends ActionButton {



    /**
     * 
     * @param {object} param0 
     * @param {typeof this.content} param0.content
     * @param {typeof this.onclick} param0.onclick
     * @param {typeof this.state} param0.state
     * @param {boolean} param0.hoverAnimate
     */
    constructor({ content, onclick, state, hoverAnimate }) {
        super(...arguments)
        super.html.classList.add(...FilledButton.classList)
    }

    static get classList() {
        return ['hc-ehealthi-filled-button']
    }


}

hc.importModuleCSS(import.meta.url)