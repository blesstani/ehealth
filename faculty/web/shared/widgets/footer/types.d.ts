/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the footer widget
 */


export declare interface FooterLink {
    label: string,
    href: string
}


export declare interface FooterSectionData {
    title: string
    links: FooterLink[]
}