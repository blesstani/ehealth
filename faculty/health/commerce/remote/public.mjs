/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows users over the public web to access features related to commerce
 */

import CommerceController from "../controller.mjs";
import InventoryPublicMethods from "../inventory/remote/public.mjs";
import ServiceProviderPublicMethods from "../service-provider/remote/public.mjs";
import TransactionPublicMethods from "../transaction/remote/public.mjs";



export default class CommercePublicMethods {

    /**
     * 
     * @param {CommerceController} controller 
     * @param {}
     */
    constructor(controller) {
        this.inventory = new InventoryPublicMethods(controller.inventory)
        this.service_provider = new ServiceProviderPublicMethods(controller.service_provider)
        this.transaction = new TransactionPublicMethods(controller.transaction)
    }

}