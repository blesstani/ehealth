/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module (util) contains utilities needed by the app-appointments/listings widget
 */


/**
 * This method returns the final or proposed time of a consultation
 * @param {ehealthi.health.appointment.Appointment} appointment
 * @returns {number}
 */
function trueTime(appointment) {
    return appointment.time;
}

/**
 * This method takes in time, and returns a time equivalent to start of that day
 * @param {number} time 
 * @returns {number}
 */
function dayStart(time) {
    return new Date(time).setHours(0, 0, 0, 0);
}

/**
 * This method ensures a consistent formatting of time
 * @param {number} time 
 * @returns 
 */
function timeString(time) {
    const obj = new Date(time)
    const pad = x => `${x}`.padStart(2, '0')
    return `${pad(obj.getHours())}:${pad(obj.getMinutes())}`
}



const timeUtils = {
    dayStart,
    trueTime,
    timeString
}

export default timeUtils