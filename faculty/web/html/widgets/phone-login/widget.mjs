/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget is a widget, to override the login widget, for the telep_phone_login plugin
 * 
 */

import TelepPhoneLoginWidget0 from "/$/modernuser/$plugins/telep_phone_login/@public/widget-0.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class eHealthiPhoneLogin extends TelepPhoneLoginWidget0 {


    constructor() {
        super(...arguments);


        this.html.classList.add('hc-ehealthi-phone-login')

        this.html.$(':scope >.container >.top').innerHTML = `Sign In`

        this.html.$(':scope >.container >.main >.caption')?.remove()

        this.html.$(':scope >.container >.main >.change-auth-action')?.remove()
        this.html.$('.container >.main >.form').insertAdjacentElement("afterend", hc.spawn(
            {
                classes: ['change-auth-action']
            }
        ))
        this.html.$('.container >.main >.remember')?.remove()
    }

}


hc.importModuleCSS(import.meta.url)