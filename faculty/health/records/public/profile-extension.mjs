/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module (profile-extension), allows a doctor to access a patient's medical history, by tapping on his profile.
 * The profile view, is sponsored by the chat module.
 * This extension simply occupies space in the provided view.
 */

import MedicalRecordsView from "./widgets/medical-records/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import EventBasedExtender from "/$/system/static/run/event-based-extender.mjs";



EventBasedExtender.eventTarget.addEventListener('telep-chat-show-profile-detail', (event) => {

    console.log(`Computing records extension for `, event.detail.data)

    if (event.detail.data.chat.type != 'private' || event.detail.data.chat.recipients.length != 2) {
        return;
    }

    event.detail.append((async () => {
        if (await hcRpc.health.records.canViewMedicalRecords()) {
            const me = await hcRpc.modernuser.authentication.whoami()
            const widget = new MedicalRecordsView({ patient: event.detail.data.chat.recipients.find(x => x != me.id) });

            return {
                html: widget.html
            }
        }

    })())
})