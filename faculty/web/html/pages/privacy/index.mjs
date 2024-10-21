/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This module controls the privacy policy page
 */

import Hero from "../../widgets/hero/widget.mjs";
import InfoPrivacy from "../../widgets/info-privacy/widget.mjs";
import Footer from "/$/shared/static/widgets/footer/widget.mjs";
import Navbar from "/$/shared/static/widgets/navbar/widget.mjs";


const navbar = new Navbar()

const hero = new Hero()

const privacy = new InfoPrivacy()

const footer = new Footer()


for (const widget of [navbar, hero, privacy, footer]) {
    document.body.appendChild(widget.html)
}

hero.title = `Privacy Policy`
hero.caption = `This is how we store, and use your data.`