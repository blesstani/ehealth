/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module (records), provides the possibility of storing client's medical records.
 * A medical record here, is just a dated, titled bunch of text
 */

import muser_common from "muser_common"
import shortUUID from "short-uuid"
import { CollectionProxy } from "../../../system/database/collection-proxy.js"
import TransactionController from "../commerce/transaction/controller.mjs"


const collection = Symbol()


/** @type {ehealthi.health.records.Collections} */
const collections = new CollectionProxy({
    'records': 'records.default',
})

const controllers = Symbol()

export default class MedicalRecordsController {

    /**
     * 
     * @param {object} _controllers 
     * @param {TransactionController} _controllers.transaction
     */
    constructor(_controllers) {
        this[collection] = collections.records
        this[controllers] = _controllers;
    }

    /**
     * This method searches medical records for a given patient
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.patient
     * @param {import('mongodb').Filter<Pick<ehealthi.health.records.MedicalRecord, "content"|"type"|"doctor">>} param0.search
     */
    async* searchRecordsFor({ userid, patient, search }) {
        if (userid !== patient) {
            await muser_common.whitelisted_permission_check(
                {
                    userid,
                    intent: { freedom: 'use' },
                    permissions: ['permissions.health.records.view'],
                }
            )
        };

        const legal = soulUtils.pickOnlyDefined(search, ['content', 'type', 'doctor'])

        for await (const item of await this[collection].find({ ...legal, patient })) {
            delete item._id
            delete item.patient
            yield await MedicalRecordsController.fillRecord(item, that[controllers].transaction)
        }

    }

    /**
     * This method checks if there's any medical record with the given filter
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.patient
     * @param {import('mongodb').Filter<Pick<ehealthi.health.records.MedicalRecord, "content"|"type"|"doctor">>} param0.search
     */
    async recordExists({ userid, patient, search }) {
        if (userid !== patient) {
            await muser_common.whitelisted_permission_check(
                {
                    userid,
                    intent: { freedom: 'use' },
                    permissions: ['permissions.health.records.view'],
                }
            )
        };


        const legal = {
            ...soulUtils.pickOnlyDefined(search, ['content', 'type', 'doctor']),
            patient
        }

        return (await this[collection].countDocuments(legal)) > 0

    }

    /**
     * This method returns medical records for a given patient
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.patient
     * @param {ehealthi.health.records.RecordSeverity} param0.severity
     */
    async getRecordsFor({ userid, patient, severity = 3 }) {

        if (userid !== patient) {
            await muser_common.whitelisted_permission_check(
                {
                    userid,
                    intent: { freedom: 'use' },
                    permissions: ['permissions.health.records.view'],
                }
            )
        }

        const that = this;
        /**
         * @type {()=>AsyncGenerator<ehealthi.health.records.MedicalRecord, void, unknown>}

         */

        async function* dataIterator() {
            for await (const item of await that[collection].find({ patient, severity: { $lte: severity } }, { sort: { time: 'desc' } })) {
                delete item._id
                yield await MedicalRecordsController.fillRecord(item, that[controllers].transaction)
                profilesStream.write(item.doctor)
            }
            profilesStream.end()
        }


        const profilesStream = new muser_common.UserProfileTransformStream();


        const res = {
            data: dataIterator,
            profiles: () => profilesStream.iterator()
        }

        return new JSONRPC.ActiveObject(res)

    }

    /**
     * This method is used to create a medical record
     * @param {object} param0 
     * @param {string} param0.patient
     * @param {Omit<ehealthi.health.records.MedicalRecordInit, "patient">} param0.data
     */
    async insertRecord({ userid, patient, data }) {

        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.records.view']
            }
        )

        const content = data.content;
        delete data.content

        soulUtils.checkArgs(data, {
            title: 'string',
            severity: 'number',
            type: 'string',
        }, "record", undefined, ['exclusive'])

        soulUtils.checkArgs(content, "'string'|'object'", 'data.content')

        const id = shortUUID.generate()

        await this[collection].insertOne(
            {
                ...data,
                id,
                content,
                doctor: userid,
                patient,
                time: data.time || Date.now(),
                created: Date.now(),
            }
        )

        return id
    }

    /**
     * This method checks if the record specified by `id`, can be modified by user specified by `userid`
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.userid
     */
    async canModify({ id, userid }) {
        const existing = await this[collection].findOne({ id })
        if (!existing) {
            throw new Exception(`The medical record you're trying to modify, doesn't exist.`)
        }
        await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: ['permissions.health.records.modify'],
                whitelist: [existing.doctor]
            }
        );


        if (Date.now() > (existing.created + MedicalRecordsController.MAX_MODIFY_TIME)) {
            throw new Exception(`You can only modify / delete a medical record ${MedicalRecordsController.MAX_MODIFY_TIME} hours after it has been created`)
        }


        return existing
    }

    /**
     * This method tells us if a user has the possibility of viewing other's medical records
     * @param {object} param0 
     * @param {string} param0.userid
     */
    async canViewMedicalRecords({ userid }) {
        return await muser_common.whitelisted_permission_check(
            {
                userid,
                permissions: [
                    'permissions.health.records.view'
                ],
                throwError: false
            }
        )
    }



    /**
     * This method gets all the permission levels the calling user has over the intended patient
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.patient
     */
    async getMedicalRecordsRightsFor({ userid, patient }) {

        /** @param {Parameters<muser_common['whitelisted_permission_check']>['0']['permissions']['0']} permission */
        const permissionCheck = (permission) => muser_common.whitelisted_permission_check({ userid, permissions: ['permissions.health.records.view'], throwError: false });
        const supervise = await permissionCheck('permissions.health.records.modify')
        const generalWrite = supervise || await permissionCheck('permissions.health.records.write')
        return {
            read: (userid == patient) || generalWrite || await permissionCheck('permissions.health.records.view'),
            write: generalWrite,
            supervise: supervise
        }
    }


    /**
     * This method modifies a medical record
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.id
     * @param {ehealthi.health.records.MedicalRecordInit} param0.data
     */
    async modifyRecord({ userid, id, data }) {

        await this.canModify({ id, userid })


        const content = data.content;
        delete data.content

        soulUtils.checkArgs(data, {
            title: 'string',
            severity: 'number',
            time: 'number',
            type: 'string',
        }, "record", undefined, ['definite', 'exclusive'])

        if (typeof content != 'undefined') {
            soulUtils.checkArgs(content, "'string'|'object'", 'data.content')
        }



        this[collection].updateOne(
            {
                id
            },
            {
                $set: {
                    ...data,
                    doctor: userid,
                    [content ? 'content' : 'doctor']: content ? content : userid
                }
            }
        );




    }

    /**
     * This method adds the additional necessary data for a medical record
     * @param {ehealthi.health.records.MedicalRecord} data 
     * @param {TransactionController} transactionController
     */
    static async fillRecord(data, transactionController) {

        if (data.type == 'diagnosis' && typeof data.content?.id == 'string') {
            data.content.$transaction = await transactionController.getTransaction({ id: data.content.id })
        }

        return data
    }

    /**
    * This method deletes a medical record
    * @param {object} param0 
    * @param {string} param0.userid
    * @param {string} param0.id
    */
    async delete({ userid, id }) {
        await this.canModify({ id, userid })
        this[collection].deleteOne({ id })
    }

    /** @readonly After this time, a record can no longer be modified */
    static get MAX_MODIFY_TIME() {
        return 12 * 60 * 60 * 1000
    }


}