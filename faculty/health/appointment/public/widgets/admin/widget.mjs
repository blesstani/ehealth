/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This widget (appointment-admin), allows an authorized member of the organization to manage appointments of the system
 */

import InlineUserProfile from "/$/modernuser/static/widgets/inline-profile/widget.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ListDataManager from "/$/system/static/html-hc/widgets/list-data-manager/widget.mjs";



/**
 * @extends ListDataManager<ehealthi.health.appointment.Appointment>
 */
export default class AppointmentAdmin extends ListDataManager {

    constructor() {

        super(
            {
                title: `Appointments`,
                config: {
                    fetch: async () => {
                        return await hcRpc.health.appointment.getReadyAppointments(
                            {
                                start: this.content.sort((a, b) => a.created > b.created ? 1 : a.created == b.created ? 0 : -1).reverse()[0]?.created || 0,
                            }
                        )
                    },
                    display: [
                        {
                            label: `ID`,
                            name: 'id',
                            view: '::text'
                        },
                        {
                            name: 'type',
                            label: `Appointment Type`,
                            view: async (input) => {
                                const types = await hcRpc.health.appointment.getAppointmentTypes()
                                const theType = types.find(x => x.id == input) || { id: input, label: 'Unknown Type', icon: '/$/shared/static/logo.png' }

                                return hc.spawn({
                                    innerHTML: `
                                        <div class='container'>
                                            <div class='main'>
                                                <div class='icon'></div>
                                                <div class='label'>${theType.label}</div>
                                            </div>
                                        </div>
                                    `
                                })
                            }
                        },
                        {
                            label: `Patient`,
                            name: 'patient',
                            view: async (userid) => {
                                return new InlineUserProfile(await getUserProfile(userid)).html
                            }
                        },
                        {
                            label: `Doctor`,
                            name: 'doctor',
                            view: async (userid) => {
                                return new InlineUserProfile(await getUserProfile(userid)).html
                            }
                        },
                        {
                            label: 'Date and Time',
                            name: 'time',
                            view: (time) => {
                                return `<div class='${time < Date.now() ? 'hc-ehealthi-health-appointment-admin-item-late' : ''}'>${new Date().setHours(0, 0, 0, 0) == new Date(time).setHours(0, 0, 0, 0) ? 'Today' : new Date(time).toDateString()} ${new Date(time).toLocaleTimeString()}</div>`
                            }
                        }
                    ],

                    input: [
                        [
                            {
                                label: `Doctor`,
                                name: 'doctor',
                                type: 'customWidget',
                                customWidgetUrl: "/$/modernuser/static/widgets/user-n-role-input/widget.mjs",
                                mode: 'user'
                            }
                        ],
                        [
                            {
                                label: `Date`,
                                name: 'date',
                                type: 'date',
                                valueProperty: 'valueAsNumber',
                            },
                            {
                                label: `Time`,
                                name: 'time',
                                type: 'time',
                            }
                        ]
                    ],
                    edit: {
                        execute: async (input) => {
                            // Reschedule the appointment, or change the doctor. 
                            const [hours, minutes, seconds] = input.time.split(':')
                            const time = new Date(input.date).setHours(new Number(hours || 0).valueOf(), new Number(minutes || 0).valueOf(), new Number(seconds || 0).valueOf())
                            if (!input.doctor) {
                                throw new Error(`Please select a doctor for this appointment`)
                            }
                            const cleanedInput = {
                                ...input,
                                date: undefined, // Cancel that date value coming from the input form
                                doctor: input.doctor.id,
                                time,
                            }

                            await hcRpc.health.appointment.modify(
                                {
                                    id: cleanedInput.id,
                                    data: {
                                        time,
                                        doctor: cleanedInput.doctor
                                    }
                                }
                            )

                            return cleanedInput

                        },
                        setForm: async (input) => {
                            return {
                                doctor: input.doctor ? await getUserProfile(input.doctor) : undefined,
                                date: input.time,
                                time: new Date(input.time).toTimeString().split(' ')[0]
                            }
                        },
                    }
                }
            }
        )

    }
}



/**
 * This method returns a user's profile, fetched from his userid
 * @param {string} id 
 * @returns {Promise<modernuser.profile.UserProfileData>}
 */
async function getUserProfile(id, retry = true) {
    if (!id) {
        return {
            id,
            label: `&lt; Nobody &gt;`,
            icon: '/$/shared/static/logo.png'
        }
    }
    return users.find(x => x.id == id) || (async () => {
        if (isFetching) {
            await isFetching
        }
        fetchQueue.add(id)
        await new Promise(x => setTimeout(x, 200 * Math.random())) // Randomly wait for others to add their own requests, before calling the fetchUsers() method
        await fetchUsers()
        const user = users.find(x => x.id == id)
        if (!user && !retry) {
            throw new Error(`User with id ${id}, was not found`)
        }
        return user || await getUserProfile(id, false)
    })()
}


const fetchQueue = new Set()
/** @type {modernuser.profile.UserProfileData[]} */
const users = []

let isFetching;


async function fetchUsers() {
    if (isFetching) {
        return await isFetching;
    }
    isFetching = ((async () => {
        users.push(
            ...await hcRpc.modernuser.profile.getProfiles([...fetchQueue])
        )
        fetchQueue.clear()
    })()).finally(() => {
        isFetching = undefined;
    })
}


hc.importModuleCSS(import.meta.url)