/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows access to publicly available features, that are related to medical records.
 */

import muser_common from "muser_common";
import MedicalRecordsController from "../controller.mjs";



export default class MedicalRecordsPublicMethods extends muser_common.UseridAuthProxy.createClass(MedicalRecordsController.prototype) {

    /**
     * 
     * @param {MedicalRecordsController} controller 
     */
    constructor(controller) {
        super(controller)
    }

}