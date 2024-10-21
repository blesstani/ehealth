/*
Copyright 2021 HolyCorn Software
The HCTS Project
The web faculty
*/

import FeedsController from "./feeds/controller.mjs"
import WebPublicMethods from "./remote/public.mjs"


export default async function init() {

    try {

        setTimeout(() => WebPublicMethods.init(), 2000)
        const feeds = new FeedsController()
        await feeds.init()
        FacultyPlatform.get().remote.public = new WebPublicMethods({ feeds })
        console.log(`${`${platform.descriptor.label}`.yellow} HTTP running`)
    } catch (e) {
        console.log(e)
    }
}
