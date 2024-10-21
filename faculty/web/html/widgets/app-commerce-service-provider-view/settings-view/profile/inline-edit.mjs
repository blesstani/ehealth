/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This widget allows us to construct a view, where a piece of text can be viewed, and edited, in one view
 */

import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";

export default class InlineEdit extends Widget {


    /**
     * 
     * @param {InlineEdit['value']} value 
     * @param {(value: InlineEdit['value'])=> Promise<void>} update
     */
    constructor(value, update) {
        super();

        super.html = hc.spawn({
            classes: InlineEdit.classList,
            innerHTML: `
                <div class='container'>
                    <div class='content' contentEditable=false></div>
                    <div class='actions'>
                        <div class='edit'></div>
                        <div class='revert'></div>
                        <div class='apply'></div>
                    </div>
                </div>
            `
        });

        this.html.$(':scope >.container >.actions >.edit').appendChild(
            new ActionButton({
                content: `Edit`,
                hoverAnimate: false,
                onclick: async () => {
                    this.html.classList.add('editable')
                    this.html.$(':scope >.container >.content').setAttribute('contentEditable', 'true')
                }
            }).html
        )
        this.html.$(':scope >.container >.actions >.revert').appendChild(
            new ActionButton({
                content: `Cancel`,
                hoverAnimate: false,
                onclick: async () => {
                    this.html.classList.remove('editable')
                    this.html.$(':scope >.container >.content').removeAttribute('contentEditable')
                    this.innerValue = value0
                    onInput()
                }
            }).html
        );
        this.html.$(':scope >.container >.actions >.apply').appendChild(
            new ActionButton({
                content: `Save`,
                hoverAnimate: false,
                onclick: async () => {
                    if (await update(this.innerValue)) {
                        value0 = this.innerValue
                        this.html.classList.remove('editable')
                        this.html.$(':scope >.container >.content').removeAttribute('contentEditable')
                        onInput()
                    }
                }
            }).html
        );

        /** @type {string} */ this.innerValue
        this.htmlProperty(':scope >.container >.content', 'innerValue', 'innerHTML')

        const onInput = new DelayedAction(() => {
            this.html.classList.toggle('dirty', value0 != this.innerValue)
        }, 250, 1000)

        this.blockWithAction(async () => {
            const contentView = this.html.$(':scope >.container >.content')
            contentView.addEventListener('input', onInput)
        })

        /** @type {string} */ this.value
        Reflect.defineProperty(this, 'value', {
            set: (value) => {
                this.innerValue = value
                value0 = value
            },
            get: () => value0,
            configurable: true
        })
        let value0

        this.value = value


    }


    /** @readonly */
    static classList = ['hc-ehealthi-app-inline-edit']
}