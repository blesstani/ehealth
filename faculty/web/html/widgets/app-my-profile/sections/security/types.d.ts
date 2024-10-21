/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the app-my-profile widget, that deal with security settings.
 */



import ''

global {
    declare var holycornLib: {
        name: 'holycornLib'
    }

    interface LoginManagerAddOnEventData {
        /** Data about the login which the user needs to manage */
        data: modernuser.authentication.UserLogin
        /** This method is called, if you wish to add a clickable action, via which the user can manage the given login */
        register: (html: HTMLElement) => void
    }

    interface Window {
        addEventListener(event: 'modernuser.login-management.prepare-actions', cb: (event: CustomEvent<LoginManagerAddOnEventData>) => void, opts?: AddEventListenerOptions)
    }
}