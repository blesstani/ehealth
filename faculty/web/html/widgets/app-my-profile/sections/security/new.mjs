/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget, is part of the app-my-profile widget, and simply allows the user to add a new login.
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import FileExplorer from "/$/system/static/html-hc/widgets/file-explorer/widget.mjs";



/**
 * This popup allows a user to create a new login
*/
export default class NewLoginPopup extends HCTSBrandedPopup {

    constructor() {
        super();

        this.title = `New Login`
        this.content = hc.spawn(
            {
                classes: ['hc-ehealthi-app-my-profile-security-new-login'],
                innerHTML: `
                    <div class='container'>
                        <div class='explorer'></div>
                    </div>
                `
            }
        );

        this.explorer = new FileExplorer()
        this.html.$('.container >.explorer').appendChild(this.explorer.html)

        this.blockWithAction(
            async () => {
                const plugins = await hcRpc.modernuser.authentication.getPluginsPublicData()

                this.explorer.statedata.items = [
                    ...plugins.map(x => {
                        return [
                            ({ id: `plugin-${x.name}`, parent: '', icon: `/$/modernuser/$plugins/${x.name}/@public/icon.png`, label: x.label }),
                            // And now, append each of the login widgets
                            ({ id: `plugin-${x.name}-view`, parent: `plugin-${x.name}`, label: x.label, custom_html: new LoginWidgetContainer(x, this).html, navigable: false })
                        ]
                    }).flat(),
                    {
                        label: `Add Login`,
                        id: '',
                        parent: undefined,
                    }
                ]
            }
        );
        /** @type {(event: "hide"|"complete", cb: (event: CustomEvent)=> void, opts: AddEventListenerOptions)} */ this.addEventListener;
    }

}


class LoginWidgetContainer extends Widget {

    /**
     * 
     * @param {modernuser.authentication.AuthPluginPublicData} plugin 
     * @param {NewLoginPopup} parent
     */
    constructor(plugin, parent) {

        super();

        this.html = hc.spawn(
            {
                classes: LoginWidgetContainer.classList,
                innerHTML: `
                    <div class='container'></div>
                `
            }
        );

        this.blockWithAction(async () => {
            /** @type {typeof import("/$/modernuser/static/authentication/lib/widget-model.mjs").default} */
            const WidgetClass = (await import(`/$/modernuser/$plugins/${plugin.name}/@public/widget.mjs`)).default
            const instance = new WidgetClass(plugin.credentials)
            instance.face = 'signup'

            setTimeout(() => this.html.$('.container').appendChild(instance.html), 500)


            instance.addEventListener('complete', async () => {
                // In this where the user has entered his info, we can now create a login at the backend.
                try {
                    await hcRpc.modernuser.authentication.addLogin({ plugin: plugin.name, data: instance.values })
                    instance.blockWithAction(() => instance.onSystemAction({ action: 'signup', data: { active: false } }).then(() => {
                        // At this point the new login has been added, and activated.
                        parent.dispatchEvent(new CustomEvent('complete'))
                        setTimeout(() => parent.hide(), 1200)
                    }))
                } catch (e) {
                    handle(e)
                }
            })
        })

    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-app-my-profile-security-new-login-container', 'hc-modernuser-frame']
    }
}
