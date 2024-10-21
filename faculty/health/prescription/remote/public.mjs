/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module provides public methods related to prescriptions
 */

import muser_common from "muser_common";
import PrescriptionController from "../controller.mjs";

const controller = Symbol()

export default class PrescriptionPublicMethods {

    /**
     * 
     * @param {PrescriptionController} controller_ 
     */
    constructor(controller_) {
        this[controller] = controller_
    }

    /**
     * This method is used to make a prescription
     * @param {Omit<ehealthi.health.prescription.PrescriptionInit, "userid">} prescription 
     */
    async prescribe(prescription) {
        return await this[controller].prescribe(
            {
                ...arguments[1],
                userid: (await muser_common.getUser(arguments[0])).id
            }
        )
    }

    /**
     * This method retrieves a prescription.
     * @param {object} param0 
     * @param {string} param0.id
     */
    async getPrescription({ id }) {
        return new JSONRPC.MetaObject(
            await this[controller].getPrescription(
                {
                    ...arguments[1],
                    userid: (await muser_common.getUser(arguments[0])).id
                }
            ),
            {
                cache: {
                    expiry: 10 * 60 * 1000,
                    tag: `prescription-${arguments[1]?.id}`
                }
            }
        )
    }

    /**
     * This method indicates that the user has started taking the prescription
     * @param {object} param0 
     * @param {string} param0.id
     */
    async start({ id }) {
        return new JSONRPC.MetaObject(
            await this[controller].start(
                {
                    ...arguments[1],
                    userid: (await muser_common.getUser(arguments[0])).id
                }
            ),
            {
                rmCache: [`prescription-${arguments[0]?.id}`]
            }
        )
    }

    /**
     * This method is used to modify a prescription
     * @param {object} param0 
     * @param {string} param0.id
     * @param {ehealthi.health.prescription.PrescriptionMutableData} param0.data
     */
    async modify({ id, data }) {
        return new JSONRPC.MetaObject(
            await this[controller].modify(
                {
                    ...arguments[1],
                    userid: (await muser_common.getUser(arguments[0])).id
                }
            ),
            {
                rmCache: [`prescription-${arguments[0]?.id}`]
            }
        )
    }
    /**
     * This method is used to end a prescription
     * @param {object} param0 
     * @param {string} param0.id
     */
    async end({ id }) {
        return new JSONRPC.MetaObject(
            await this[controller].end(
                {
                    ...arguments[1],
                    userid: (await muser_common.getUser(arguments[0])).id
                }
            ),
            {
                rmCache: [`prescription-${arguments[0]?.id}`]
            }
        )
    }
}