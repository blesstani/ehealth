/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows users over the public web to access functions for health commercial transactions.
 */

import muser_common from "muser_common";
import TransactionController from "../controller.mjs";



export default class TransactionPublicMethods extends muser_common.UseridAuthProxy.createClass(TransactionController.prototype) {

}