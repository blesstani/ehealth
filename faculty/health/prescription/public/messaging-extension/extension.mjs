/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This script provides the possibility of sending a prescription as a message
 */


import PrescriptionInput from "../widgets/prescription-input/widget.mjs";
import ChatMessaging from "/$/chat/messaging/static/widgets/chat-messaging/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import BrandedBinaryPopup from "/$/system/static/html-hc/widgets/branded-binary-popup/widget.mjs";
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import EventBasedExtender from "/$/system/static/run/event-based-extender.mjs";

EventBasedExtender.eventTarget.addEventListener('telep-chat-messaging-extend', (event) => {
    event.detail.append((async () => {
        const me = await hcRpc.modernuser.authentication.whoami()

        // TODO: Check more surely, if the current user can make prescriptions
        if (!(me.meta?.isDoctor ?? true)) {
            return;
        }
        const chat = ''
        /** @type {ChatMessaging} */
        const widget = event.detail.data.widget

        return {
            html: new ComposeChatExtensionWidget({ chat, me, widget }).html,
        }
    })())
});

EventBasedExtender.eventTarget.addEventListener('telep-chat-messaging-create-custom-view', (event) => {

    /** @type {telep.chat.messaging.Message} */
    const msg = event.detail.data.message
    if (msg.data.meta?.contentType !== 'ehealthi-health-prescription') {
        return
    }

    event.detail.append((async () => {
        const widget = new MessageViewExtensionWidget({});
        widget.blockWithAction(async () => {
            Object.assign(widget.statedata, await hcRpc.health.prescription.getPrescription({ id: msg.data.meta.data["ehealthi-health-prescription"].id }))
        })
        return {
            html: widget.html
        }
    })())
})



class MessageViewExtensionWidget extends Widget {

    /**
     * 
     * @param {ehealthi.health.prescription.Prescription} data 
     */
    constructor(data) {
        super();
        this.html = hc.spawn(
            {
                classes: MessageViewExtensionWidget.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='top'>
                            <div class='icon'></div>
                            <div class='title'>Prescription</div>
                        </div>
                        <div class='main'>
                            <div class='details'>
                                <div class='label'>Garracetamol</div>
                                <div class='duration-caption'></div>
                                <table class='intake-details'></table>
                                <div class='notes'></div>
                            </div>
                        </div>
                        <div class='actions'></div>
                    </div>
                `
            }
        );

        /** @type {htmlhc.lib.alarm.AlarmObject<ehealthi.health.prescription.Prescription>} */ this.statedata = new AlarmObject()
        this.statedata.$0.addEventListener('label-change', () => this.html.$('.container >.main >.details >.label').innerHTML = this.statedata.label)
        this.statedata.$0.addEventListener('intake-change', () => {
            const dateString = (number) => new Date(number).toDateString().split(' ').slice(1).join(' ')
            const intake = this.statedata.intake[0]
            this.html.$('.container >.main >.details >.duration-caption').innerHTML = `${dateString(intake.start)} to ${dateString(intake.end)}`

            const intakeTable = this.html.$('.container >.main >.details >.intake-details')
            intakeTable.innerHTML = '';

            intake.dosage.map((intake) => {

                return (hc.spawn(
                    {
                        tag: 'tr',
                        innerHTML: `
                            <td>${hc.toTimeString(new Date(intake.time))}</td>
                            <td>${intake.quantity.value} ${intake.quantity.label}</td>
                        `
                    }
                ))
            }).forEach(row => intakeTable.appendChild(row));

        });

        this.statedata.$0.addEventListener('notes-change', () => this.html.$('.container >.main >.details >.notes').innerHTML = this.statedata.notes || '')

        const icon = Symbol()
        this.defineImageProperty(
            {
                selector: '.container >.top >.icon',
                property: icon,
                fallback: '/$/shared/static/logo.png',
                mode: 'inline',
                cwd: import.meta.url
            }
        );
        this[icon] = './medication.svg'

        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: ':scope >.container >.actions',
                childType: 'html',
            }, 'actions'
        )


        const drawUI = () => {


            this.blockWithAction(async () => {

                const userid = (await hcRpc.modernuser.authentication.whoami()).id;
                const MAX_MODIFY_TIME = (this.statedata.created || Date.now()) + (24 * 60 * 60 * 1000);

                this.actions = []

                if (this.statedata.doctor == userid) {

                    if (((Date.now() < MAX_MODIFY_TIME)) && !this.statedata.ended) {

                        // The logic of modifying a prescription

                        const btnEdit = new ActionButton(
                            {
                                content: `Edit Prescription`,
                                onclick: async () => {
                                    const prescriptionInput = new PrescriptionInput({ value: JSON.parse(JSON.stringify(this.statedata.$0data)) })
                                    prescriptionInput.html.classList.add('hide-patient-input')
                                    const popup = new HCTSBrandedPopup(
                                        {
                                            content: prescriptionInput.html
                                        }
                                    );

                                    popup.show();

                                    const abort = new AbortController()

                                    prescriptionInput.addEventListener('complete', async () => {
                                        try {
                                            await prescriptionInput.loadWhilePromise((async () => {
                                                await hcRpc.health.prescription.modify({ id: this.statedata.id, data: prescriptionInput.value })
                                                Object.assign(this.statedata, prescriptionInput.value)
                                                setTimeout(() => popup.hide(), 1250)
                                                abort.abort()
                                            })())
                                        } catch (e) {
                                            handle(e)
                                        }

                                    }, { signal: abort.signal });

                                    popup.addEventListener('hide', () => {
                                        abort.abort()
                                    }, { signal: abort.signal })
                                }
                            }
                        );

                        this.actions.push(
                            btnEdit.html,
                        )
                    }

                    // The action of terminating the prescription

                    const btnStop = new ActionButton(
                        {
                            content: this.statedata.ended ? `You canceled this on ${new Date(this.statedata.ended).toDateString()}` : `Stop Prescription`,
                            state: this.statedata.ended ? 'disabled' : 'initial',
                            onclick: async () => {
                                new BrandedBinaryPopup(
                                    {
                                        title: `Stop Prescription?`,
                                        question: `Do you want to stop this prescription? The decision would be final, and irreversible. Please, think again.`,
                                        positive: `End Prescription`,
                                        negative: `Go back`,
                                        execute: async () => {
                                            await hcRpc.health.prescription.end({ id: this.statedata.id })
                                            this.statedata.ended = Date.now()
                                            drawUI()
                                        }
                                    }
                                ).show()
                            }
                        }
                    );
                    btnStop.html.classList.add('danger')

                    const naturalEnd = this.statedata.intake.map(x => x.end).sort().reverse()[0]

                    // Only put a stop button, if the prescription is still valid.
                    // Also put the stop button (blurred out of course), if the prescription was ended unaturally
                    if ((naturalEnd > Date.now()) || this.statedata.ended) {
                        this.actions.push(
                            btnStop.html
                        )
                    }
                }




            })

        }
        this.statedata.$0.addEventListener('doctor-change', drawUI)

        Object.assign(this.statedata, data)
    }

    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-prescription-messaging-view-extension']
    }
}


class ComposeChatExtensionWidget extends Widget {
    /**
     * 
     * @param {object} param0 
     * @param {ChatMessaging} param0.widget
     * @param {modernuser.profile.UserProfileData} param0.me
     */
    constructor({ widget, me } = {}) {
        super()
        this.html = hc.spawn(
            {
                classes: ComposeChatExtensionWidget.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='image'></div>
                        <div class='label'>Prescription</div>
                    </div>
                `
            }
        );
        const image = Symbol();
        this.defineImageProperty(
            {
                selector: '.container >.image',
                property: image,
                fallback: '/$/shared/static/logo.png',
                mode: 'inline'
            }
        );
        this[image] = './medication.svg'

        /** @type {PrescriptionInput} */
        let main;
        let popup;
        let timeout;

        const createNew = () => {
            main = new PrescriptionInput({ patient: widget.chat.recipients.find(x => x != me.id) })
            popup = new HCTSBrandedPopup(
                {
                    content: hc.spawn(
                        {
                            classes: ['hc-ehealthi-health-prescription-chat-compose-extension-popup-content'],
                            children: [
                                hc.spawn({
                                    classes: ['top'],
                                    innerHTML: `
                                    <div class='title'>Make a Prescription</div>
                                `
                                }),
                                main.html
                            ]
                        }
                    )
                }
            );

            // Let's make provisions for accidental exits.
            // If the user dismisses the popup, without having made a prescription, he has 15s before it clears

            // Therefore, in case the user successfully makes a prescription, we'll clear the previous data
            main.addEventListener('complete', async () => {
                // Now, send this prescription as a message
                let id;

                try {
                    await main.loadWhilePromise(
                        (async () => {
                            // In case the problem is with sending the message, not making the prescription, let's not repeat 
                            // the prescription process.

                            if (!id) {
                                id = await hcRpc.health.prescription.prescribe({ ...main.value, patient: widget.chat.recipients.find(x => x != me.id) });
                            }
                            widget.messages.push(
                                {
                                    type: 'meta',
                                    chat: widget.chat.id,
                                    data: {
                                        meta: {
                                            contentType: 'ehealthi-health-prescription',
                                            data: {
                                                "ehealthi-health-prescription": {
                                                    id
                                                }
                                            }
                                        }
                                    },
                                    isNew: true,
                                    isOwn: true,
                                    time: Date.now(),

                                }
                            )

                            popup.hide()

                        })()
                    )
                } catch (e) {
                    handle(e)
                    return
                }
                createNew()
            })

            popup.addEventListener('hide', () => {
                clearTimeout(timeout)
                timeout = setTimeout(createNew, 15_000)
            }, { once: true })

            clearTimeout(timeout)
        }
        this.html.addEventListener('click', () => {
            popup.show()
            clearTimeout(timeout)
        });

        createNew();


    }
    /** @readonly */
    static get classList() {
        return ['hc-ehealthi-health-prescription-messaging-compose-extension']
    }
}


hc.importModuleCSS(import.meta.url)