/**
 * Copyright 2023 HolyCorn Software
 * The ehealthi Project
 * This script controls the homepage of the app
 */

import PatientHome from "../widgets/app-patient-home/widget.mjs";


// TODO: Implement logic of showing either patient, or doctor UI.
document.body.appendChild(new PatientHome().html)