/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * 
 */


import Question from "./question.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import Accordion from "/$/system/static/html-hc/widgets/arcordion/widget.mjs";



export default class FrequentlyAskedQuestions extends Widget {

    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: FrequentlyAskedQuestions.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='title'>Frequently Asked Questions</div>
                            <div class='content'></div>
                        </div>
                    </div>
                `
            }
        );


        /**
         * @type {Accordion<ehealthi.ui.frequently_asked_questions.QuestionData, Question>}
         */
        this.accordion = new Accordion()
        this.html.$('.container >.main >.content').appendChild(
            this.accordion.html
        );

        this.accordion.dataToWidget = (input) => {
            return new Question(input)
        };

        this.accordion.widgetToData = (widget) => {
            return { title: widget.label, content: widget.content }
        };

        this.blockWithAction(
            async () => {
                this.accordion.items = (await hcRpc.system.settings.get({ faculty: 'web', namespace: 'widgets', name: 'frequently_asked_questions' })) || []
            }
        )

    }
    /**
     * @readonly
     */
    static get classList() {
        return ['hc-ealthi-frequently-asked-questions']
    }

}