/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This timetable module provides unified access to appointments, and prescriptions.
 */


export default class TimetableController {

    /**
     * 
     * @param {object} controllers_ 
     * @param {import('../appointment/controller.mjs').default} controllers_.appointment
     * @param {import('../prescription/controller.mjs').default} controllers_.prescription
     */
    constructor(controllers_) {
        this[controllers] = controllers_

        this[controllers].appointment.events.addEventListener('appointment-ready', async (event) => {

            const data = TimetableController.wrapAppointment(
                await this[controllers].appointment.dbController.findOne({ id: event.detail.id, $stages: ['recent', 'ready'] })
            )

            const modernuser = await FacultyPlatform.get().connectionManager.overload.modernuser()
            await modernuser.notification.events.inform(
                {
                    userids: [...new Set([data.doctor, data.patient, data.userid])],
                    event: 'ehealthi-health-new-timetable-entry',
                    detail: {
                        data
                    },
                    options: {
                        aggregation: {
                            timeout: 5_000,
                            sameData: true,
                        },
                        precallWait: 1000,
                        timeout: 5000,
                        retries: 10,
                        retryDelay: 1000
                    }
                }
            )
        });

        this[controllers].appointment.events.addEventListener('appointment-changed', async ({ detail }) => {
            const modernuser = await FacultyPlatform.get().connectionManager.overload.modernuser()

            /** @type {ehealthi.health.appointment.AppointmentMutableData & Pick<ehealthi.health.appointment.Appointment, "patient">} */
            const data = detail
            /** @type {ehealthi.health.timetable.TimetableEntry} */
            let entry;
            entry = await TimetableController.wrapAppointment(data, data.doctor ? {
                user: await modernuser.profile.get_profile({ id: data.doctor })
            } : {});

            // Now, we have to dispatch the events to the frontend, conditionally.
            // To the client, we're sending the full entry, because he has to know if there's a new doctor
            // To the doctor, we're sending just time updates, because there can be no new patient profile


            // For the patient
            modernuser.notification.events.inform(
                {
                    userids: [data.patient],
                    event: 'ehealthi-health-appointment-changed',
                    detail: {
                        data: {
                            ...entry,
                            patient: undefined
                        }
                    }
                }
            );


            // And now, for the doctor
            modernuser.notification.events.inform(
                {
                    userids: [data.doctor],
                    event: 'ehealthi-health-appointment-changed',
                    detail: {
                        data: (

                            /**
                             * 
                             * @param {typeof entry} input 
                             */
                            (input) => {
                                /** @type {typeof input} */
                                const clone = JSON.parse(JSON.stringify(input))

                                delete clone['@timetable-entry'].extra.user
                                return clone
                            }
                        )(entry)
                    }
                }
            )



        })
    }

    /**
     * This method returns entries, such as appointments, and prescriptions, in ascending order
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {ehealthi.health.timetable.StartParam} param0.start
     * @param {('prescription'|'appointment')[]} param0.types
     */
    async* getRecentEntries({ userid, start, types = ['prescription', 'appointment'] } = {}) {


        /** 
         * @type {Parameters<this[controllers]['appointment']['dbController']['find']>[0]}
         * Generally, we're looking for apppointments that were either scheduled after a given time, or created after a given time.
         */
        const timeQuery = {
            $or: [
                start.modified ? {
                    modified: {
                        $gt: start.modified
                    }
                } : undefined,
                start.created ? {
                    created: {
                        $gt: start.created
                    },

                } : undefined,
                start.time ? {
                    time: { $gt: start.time || 0 }
                } : undefined
            ].filter(x => typeof x != 'undefined'),

        }

        if (timeQuery.$or.length == 0) {
            delete timeQuery.$or
        }

        const unpaidAppointments = types.includes('appointment') && await this[controllers].appointment.dbController.find(
            /**
             * Looking for appointments, that the 'paid' field isn't greater than zero, where the user is either the doctor, or patient.
             */
            {
                $or: [
                    {
                        doctor: userid,
                        ...timeQuery
                    },
                    {
                        patient: userid,
                        ...timeQuery
                    }
                ],
                paid: { $not: { $gt: 0 } },

                $stages: ['recent']
            }
        )



        const confirmedAppointments = types.includes('appointment') && await this[controllers].appointment.dbController.find(

            {
                $or: [
                    {

                        doctor: userid,
                        ...timeQuery
                    },
                    {
                        patient: userid,
                        ...timeQuery
                    }
                ],
                $stages: ['ready'],

            },
            {
                sort: { time: 'asc' }

            }
        );




        /** @type {modernuser.profile.UserProfileData[]} */
        const users = []

        async function getUser(id) {
            const user0 = {
                label: `Someone`,
                id
            }

            if (!id) {
                return user0
            }

            try {
                return (users.find(x => x.id == id)) || await (async () => {
                    const user = await (await FacultyPlatform.get().connectionManager.overload.modernuser()).profile.get_profile({ id })
                    users.push(user)
                    return user
                })()
            } catch (e) {
                console.warn(`Failed to fetch user ${id} data \n`, e)
                return user0
            }

        }

        const pendingPrescriptions = (types.includes('prescription') && (await this[controllers].prescription?.getPrescriptions({ userid, active: false, start }))) || []

        for await (const item of pendingPrescriptions) {
            yield TimetableController.wrapPrescription(item, {
                user: await getUser(item.doctor),
            })
        }

        for (const cursor of [unpaidAppointments, confirmedAppointments]) {

            if (cursor) {

                for await (const item of cursor) {
                    yield TimetableController.wrapAppointment(item, item.doctor != userid ? {
                        user: await getUser(item.doctor)
                    } : item.patient != userid ? {
                        user: await getUser(item.patient)
                    } : {})
                }
            }
        }

        const regularPrescriptions = (types.includes('prescription') && (await this[controllers].prescription.getPrescriptions({ userid, active: true, start }))) || []
        // And then, regular prescriptions

        for await (const item of regularPrescriptions) {
            yield TimetableController.wrapPrescription(item, {
                user: await getUser(item.doctor),
            })
        }




    }


    /**
     * This method appends the necessary data to a prescription to make it a timetable entry
     * @param {ehealthi.health.prescription.Prescription} data 
     * @param {ehealthi.health.timetable.TimetableEntry['@timetable-entry']['extra']} extra
     * @returns {ehealthi.health.timetable.TimetableEntry}
     */
    static wrapPrescription(data, extra) {

        return {
            "@timetable-entry": {
                type: 'prescription',
                date: {
                    start: data.started ? new Date(data.started).setHours(0, 0, 0, 0) : 0,
                    end: new Date(data.intake.sort((a, b) => a.end > b.end ? 1 : a.end == b.end ? 0 : -1).at(-1).end).setHours(0, 0, 0, 0)
                },
                extra
            },
            ...data,
        }
    }


    /**
     * This method appends the necessary data to an appointment to make it a timetable appointment entry
     * @param {ehealthi.health.appointment.Appointment} data 
     * @param {ehealthi.health.timetable.TimetableEntry['@timetable-entry']['extra']} extra
     * @returns {ehealthi.health.timetable.TimetableEntry}
     */
    static wrapAppointment(data, extra) {

        return {
            "@timetable-entry": {
                type: 'appointment',
                date: {
                    start: new Date(data.time).setHours(0, 0, 0, 0),
                    end: new Date(data.time).setHours(0, 0, 0, 0)
                },
                extra
            },
            ...data,
        }
    }

}


const controllers = Symbol()