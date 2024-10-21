/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module allows users over the public web, with access to features related to service providers
 */

import muser_common from "muser_common";
import ServiceProviderController from "../controller.mjs";


export default class ServiceProviderPublicMethods extends muser_common.UseridAuthProxy.createClass(ServiceProviderController.prototype) { }