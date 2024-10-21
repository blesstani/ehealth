/**
 * Copyright 2024 HolyCorn Software
 * The eHealthi Project
 * This script controls the support page
 */

import Hero from "../../widgets/hero/widget.mjs";
import RequestSupport from "../../widgets/request-support/widget.mjs";
import Footer from "/$/shared/static/widgets/footer/widget.mjs";
import Navbar from "/$/shared/static/widgets/navbar/widget.mjs";

document.body.appendChild(new Navbar().html)
const hero = new Hero();
document.body.appendChild(hero.html)

document.body.appendChild(new RequestSupport().html)

document.body.appendChild(new Footer().html)