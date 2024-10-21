/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * This module contains information about notification templates, that have to do with informing users about appointments
 */



/**
 * @type {modernuser.notification.Template}
 */
const ADMIN_NEW_APPOINTMENT = {
    name: 'ehealthi_health_admin_new_appointment',
    label: `New Appiontment`,
    fields: {
        en: {
            text: `Hello, Admin. An appointment has been created on the platform by {{1}}, slated for {{2}}.\nPlease, confirm the appointment by assigning a doctor, and update time.`,
            html: `Hello, Admin. An appointment has been created on the platform by {{1}}, slated for {{2}}.\nPlease, confirm the appointment by assigning a doctor, and update time.`,
            inApp: {
                title: `New Appointment`,
                caption: `{{1}} booked an appointment. Please assign a doctor, and change the time.`,
                text: `An appointment was booked by {{1}}, slated for {{2}}.\nPlease, confirm the appointment by assigning a doctor, and update time.`,
            },
            whatsapp: {
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: `Hello, Admin. An appointment has been created on the platform by {{1}}, slated for {{2}}.\nPlease, confirm the appointment by assigning a doctor, and update time.`,
                        example: {
                            body_text: [
                                [
                                    'Ojong',
                                    'Nov 28, 2023'
                                ]
                            ]
                        }
                    }
                ],

            },
        }
    }
}



/**
 * @type {modernuser.notification.Template}
 */
const DOCTOR_NEW_APPOINTMENT = {
    name: 'ehealthi_health_doctor_new_appointment',
    label: `New Appiontment`,
    fields: {
        en: {
            text: `Hello, {{1}}. You have a new consultation with {{2}}, slated for {{3}}. Please, log in to change the time to something more convenient.`,
            html: `Hello, {{1}}. You have a new consultation with {{2}}, slated for {{3}}. Please, log in to change the time to something more convenient.`,
            inApp: {
                title: `New Appointment`,
                caption: `{{2}} booked an appointment with you, on {{3}}`,
                text: `An appointment was booked by {{2}}, slated for {{2}}. You're free to change the time to something more convenient.`,
            },
            whatsapp: {
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: `Hello, {{1}}. You have a new consultation with {{2}}, slated for {{3}}. Please, log in to change the time to something more convenient.`,
                        example: {
                            body_text: [
                                [
                                    'Awosi',
                                    'Ojong',
                                    'Nov 28, 2023'
                                ]
                            ]
                        }
                    }
                ],

            },
        }
    }
}



/**
 * @type {modernuser.notification.Template}
 */
const APPOINTMENT_CHANGE = {
    name: 'ehealthi_health_appointment_change',
    label: `New Appiontment`,
    fields: {
        en: {
            text: `Hello, the appointment with {{1}}, on {{2}} has been modified like this. You'll have the appointment with {{3}}, on {{4}}. Log into the app for more details.`,
            html: `Hello, the appointment with {{1}}, on {{2}} has been modified like this. You'll have the appointment with {{3}}, on {{4}}. Log into the app for more details.`,
            inApp: {
                title: `Appointment changed`,
                caption: `Appointment with {{1}}, on {{2}} has been changed.`,
                text: `Hello, the appointment with {{1}}, on {{2}} has been modified like this. You'll have the appointment with {{3}}, on {{4}}. Log into the app for more details.`,
            },
            whatsapp: {
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: `Hello, the appointment with {{1}}, on {{2}} has been modified like this. You'll have the appointment with {{3}}, on {{4}}. Log into the app for more details.`,
                        example: {
                            body_text: [
                                [
                                    'Awosi',
                                    'Nov 28, 2023',
                                    'Ojong',
                                    'Nov 31, 2023'
                                ]
                            ]
                        }
                    }
                ],

            },
        }
    }
}




/**
 * @type {modernuser.notification.Template}
 */
const APPOINTMENT_DOCTOR_REMOVED = {
    name: 'ehealthi_health_appointment_doctor_removed',
    label: `New Appiontment`,
    fields: {
        en: {
            text: `Hello, the appointment with {{1}}, on {{2}} has been assigned to {{3}}, instead. You can contact an administrator for more information.`,
            html: `Hello, the appointment with {{1}}, on {{2}} has been assigned to {{3}}, instead. You can contact an administrator for more information.`,
            inApp: {
                title: `Appointment changed`,
                caption: `Appointment with {{1}}, on {{2}} has assigned to {{3}}.`,
                text: `Hello, the appointment with {{1}}, on {{2}} has been assigned to {{3}}, instead. You can contact an administrator for more information.`,
            },
            whatsapp: {
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: `Hello, the appointment with {{1}}, on {{2}} has been assigned to {{3}}, instead. You can contact an administrator for more information.`,
                        example: {
                            body_text: [
                                [
                                    'Ojong',
                                    'Nov 28, 2023',
                                    'Awosi',
                                ]
                            ]
                        }
                    }
                ],

            },
        }
    }
}




/**
 * @type {modernuser.notification.Template}
 */
const APPOINTMENT_REMINDER = {
    name: 'ehealthi_health_appointment_reminder',
    label: `New Appiontment`,
    fields: {
        en: {
            text: `Hello, please remember your appointment with {{1}}, on {{2}}. Stay logged into the app for updates.`,
            html: `Hello, please remember your appointment with {{1}}, on {{2}}. Stay logged into the app for updates.`,
            inApp: {
                title: `Upcoming Appointment`,
                caption: `Remember your appointment with {{1}}, on {{2}}.`,
                text: `Hello, please remember your appointment with {{1}}, on {{2}}. Stay logged into the app for updates.`,
            },
            whatsapp: {
                category: 'UTILITY',
                components: [
                    {
                        type: 'BODY',
                        text: `Hello, please remember your appointment with {{1}}, on {{2}}. Log into the app for details.`,
                        example: {
                            body_text: [
                                [
                                    'Awosi',
                                    'Nov 28, 2023',
                                ]
                            ]
                        }
                    }
                ],

            },
        }
    }
}







async function modernuser() {
    return await FacultyPlatform.get().connectionManager.overload.modernuser()
}

const timeString = (time) => `${new Date(time).toDateString()} at ${new Date(time).toTimeString().split(' ')[0]}`


/**
 * This method informs the admins of an appointment scheduled
 * @param {ehealthi.health.appointment.Appointment} appointment 
 */
async function adminNotify(appointment) {
    const admins = await (await modernuser()).permissions.grants.findUsersByPermission(
        {
            permissions: ['permissions.health.appointment.supervise'],
        }
    );

    const patient = await (await modernuser()).profile.get_profile({ id: appointment.patient })

    let success;
    for await (const admin of admins) {
        try {
            (await modernuser()).notification.notifyUser({
                userid: admin.id,
                language: 'en',
                template: ADMIN_NEW_APPOINTMENT.name,
                data: [
                    patient.label,
                    timeString(appointment.time)
                ]
            });
            success = true
        } catch (e) {
            console.log(`Failed to notify admin ${admin.label} (${admin.id}) of appointment ${appointment.id.red}\n`, e)
        }
    }

    if (!success) {
        throw new Exception(`Could not notify the administrators about the appointment ${appointment.id}`)
    }



}


/**
 * This method notifies a doctor that there's a new appointment that concerns him
 * @param {ehealthi.health.appointment.Appointment} appointment 
 */
async function doctorNwNotify(appointment) {

    /** @type {modernuser.profile.UserProfileData[]} */
    const profiles = []

    for await (const profile of await (await modernuser()).profile.getProfiles([appointment.doctor, appointment.patient])) {
        profiles.push(profile)
    }

    await (await modernuser()).notification.notifyUser(
        {
            userid: appointment.doctor,
            template: DOCTOR_NEW_APPOINTMENT.name,
            data: [
                profiles[0].label,
                profiles[1].label || "No name",
                timeString(appointment.time)
            ],
            language: 'en'
        }
    )
}



/**
 * This method informs the patient, of the changes made to his appointment with a doctor.
 * @param {object} param0
 * @param {ehealthi.health.appointment.Appointment} param0.appointment 
 * @param {string} param0.oldDoctor
 * @param {number} param0.oldTime
 * @param {"patient"|"doctor"} param0.userType
 */
async function changeNotify({ appointment, userType, oldDoctor, oldTime }) {
    userType = userType == 'doctor' ? 'doctor' : 'patient'
    const otherPerson = await (await modernuser()).profile.get_profile({ id: userType == 'doctor' ? appointment.patient : oldDoctor || appointment.doctor });


    await (await modernuser()).notification.notifyUser(

        {
            userid: appointment[userType],
            language: 'en',
            template: APPOINTMENT_CHANGE.name,
            data: [
                otherPerson.label || "No Name",
                timeString(oldTime || appointment.time),
                userType == 'patient' ? oldDoctor ? otherPerson.label : 'the same doctor' : 'the same patient',
                oldTime ? timeString(appointment.time) : 'the same day, and time'
            ]
        }
    );
}


/**
 * This method informs a doctor, that his appointment with a patient, has been assigned to some other doctor.
 * @param {object} param0 
 * @param {ehealthi.health.appointment.Appointment} param0.appointment
 * @param {string} param0.oldDoctor
 * 
 */
async function doctorRemovedNotify({ appointment, oldDoctor }) {
    const [nwDoctorProfile, patientProfile] = await (await modernuser()).profile.getProfiles([appointment.doctor, appointment.patient])
    if (!patientProfile) {
        throw new Error(`The patient ${appointment.patient}, was not found!`)
    }
    await (await modernuser()).notification.notifyUser(
        {
            userid: oldDoctor,
            language: 'en',
            template: APPOINTMENT_DOCTOR_REMOVED.name,
            data: [
                patientProfile.label || "No name",
                timeString(appointment.time),
                nwDoctorProfile.label
            ]
        }
    )
}

/**
 * This method reminds the doctor, or patient, that they have an upcoming appointment
 * @param {object} param0 
 * @param {ehealthi.health.appointment.Appointment} param0.appointment
 * @param {"doctor"|"patient"} param0.userType
 * 
 */
async function appointmentReminder({ appointment, userType }) {

    const otherUser = await (await modernuser()).profile.get_profile({ id: appointment[userType == 'doctor' ? 'patient' : 'doctor'] });

    await (await modernuser()).notification.notifyUser(
        {
            userid: appointment[userType],
            language: 'en',
            template: APPOINTMENT_REMINDER.name,
            data: [
                otherUser.label,
                timeString(appointment.time)
            ]
        }
    )

}


const templates = [
    ADMIN_NEW_APPOINTMENT,
    DOCTOR_NEW_APPOINTMENT,
    APPOINTMENT_CHANGE,
    APPOINTMENT_DOCTOR_REMOVED,
    APPOINTMENT_REMINDER,
]


async function createTemplates() {

    await Promise.all(templates.map(async (template) => {
        (await modernuser()).notification.createTemplate(template)
    }))
}



const AppointmentNotificationTemplates = {
    adminNotify,
    createTemplates,
    doctorNwNotify,
    changeNotify,
    doctorRemovedNotify,
    appointmentReminder,
}

export default AppointmentNotificationTemplates