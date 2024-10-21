/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module (commerce), controls the aspects of the platform, that have to do with provision, and payment for services by especially third-parties.
 */

import InventoryController from "./inventory/controller.mjs";
import ServiceProviderController from "./service-provider/controller.mjs";
import TransactionController from "./transaction/controller.mjs";



export default class CommerceController {

    constructor() {
        this.inventory = new InventoryController()
        this.service_provider = new ServiceProviderController()
        this.transaction = new TransactionController({ inventory: this.inventory })
    }

}