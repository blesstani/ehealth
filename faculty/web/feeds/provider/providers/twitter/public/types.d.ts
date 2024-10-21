/**
 * Copyright 2024 HolyCorn Software
 * The Tele-Epilepsy Project
 * The feeds feature
 * This module contains type definitions related to rendering tweets on the UI
 */



import ''


global {
    namespace telep.web.feeds.providers.twitter.ui {
        interface API {
            widgets: WidgetsAPI
        }
        interface WidgetsAPI {
            createTweet: (id: string, element: HTMLElement, opts?: CreateTweetOptions) => Promise<void>
        }
        interface CreateTweetOptions {
            theme?: "light" | "dark"
        }
    }
}