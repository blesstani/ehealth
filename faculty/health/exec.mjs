/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Faculty of Health
 * 
 * This faculty deals with features, that are directly related health, such as consultation, medication, etc..
 */

import AppointmentController from "./appointment/controller.mjs"
import CommerceController from "./commerce/controller.mjs"
import PrescriptionController from "./prescription/controller.mjs"
import MedicalRecordsController from "./records/controller.mjs"
import HealthPublicMethods from "./remote/public.mjs"
import TimetableController from "./timetable/controller.mjs"


export default async function () {

    const appointmentController = new AppointmentController()
    const commerceController = new CommerceController()

    const prescriptionController = new PrescriptionController(
        {
            controllers: {
                commerce: commerceController
            }
        }
    )

    const timetableController = new TimetableController({
        appointment: appointmentController,
        prescription: prescriptionController
    });

    const recordsController = new MedicalRecordsController({
        transaction: commerceController.transaction
    })

    const faculty = FacultyPlatform.get()

    faculty.remote.public = new HealthPublicMethods({
        appointment: appointmentController,
        timetable: timetableController,
        prescription: prescriptionController,
        records: recordsController,
        commerce: commerceController
    })

    await appointmentController.init()
    console.log(`${FacultyPlatform.get().descriptor.label.cyan} running!!`)
}