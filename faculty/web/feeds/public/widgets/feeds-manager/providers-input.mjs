/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Feeds Manager
 * This widget (providers-input), allows a user to choose from a list of providers
 */

import { InlineSelect } from "/$/system/static/html-hc/widgets/inline-select/index.mjs";


export default class ProvidersInput extends InlineSelect {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.label
     */
    constructor({ name, label } = {}) {
        super({ name, label });

        this.blockWithAction(async () => {
            const providers = [ // TODO: Fetch this dynamically
                {
                    name: 'facebook',
                    label: 'Facebook'
                },
                {
                    name: 'twitter',
                    label: 'Twitter'
                }
            ];


            this.values = Object.fromEntries(providers.map(x => [x.name, x.label]))

        })

    }

}