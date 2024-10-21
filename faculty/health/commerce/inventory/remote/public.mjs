/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows features related to inventory management to be available from the public web.
 */

import muser_common from "muser_common";
import InventoryController from "../controller.mjs";



export default class InventoryPublicMethods extends muser_common.UseridAuthProxy.createClass(InventoryController.prototype) {

}