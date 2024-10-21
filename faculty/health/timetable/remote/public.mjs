/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows users over the public web, to access features from the timetable controller
 */

import muser_common from "muser_common";
import TimetableController from "../controller.mjs";



export default class TimetablePublicMethods extends muser_common.UseridAuthProxy.createClass(TimetableController.prototype) {

    /**
     * 
     * @param {TimetableController} controller 
     */
    constructor(controller) {
        super(controller)
    }
}