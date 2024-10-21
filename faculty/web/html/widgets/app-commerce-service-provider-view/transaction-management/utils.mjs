/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This utility module is part of the app-commerce-service-provider-view/transaction-management widget, where it provides
 * some universal functions such as date formatting
 */



/**
 * This method ensures a consistent formatting of time
 * @param {number} time 
 * @returns 
 */
function dateString(time) {
    function timeString() {
        return `${pad(obj.getHours())}:${pad(obj.getMinutes())}`
    }
    const pad = x => `${x}`.padStart(2, '0')

    const obj = new Date(time)

    let dateString = obj.toDateString()

    const theYear = dateString.split(' ')
    if (theYear.at(-1) == new Date().getFullYear().toString()) {
        dateString = dateString.split(' ').slice(0, -1).join(' ')
    }

    return `${dateString}, at ${timeString()}`
}


const utils = {
    dateString
}

export default utils