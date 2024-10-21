/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * Faculty of Health
 * This module (service-provider), deals with the data about external organizations (called service providers), that provide
 * these features to users
 */

import ServiceProviderInventoryController from "./inventory/controller.mjs";
import ServiceProviderProfileController from "./profile/controller.mjs";



export default class ServiceProviderController {

    constructor() {
        this.profile = new ServiceProviderProfileController()
        this.inventory = new ServiceProviderInventoryController({
            profile: this.profile
        })
    }

}