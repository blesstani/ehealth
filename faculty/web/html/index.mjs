/**
 * Copyright 2023 HolyCorn Software
 * DeInstantWay Project
 * This script controls the home page
 */

import Navbar from "/$/shared/static/widgets/navbar/widget.mjs";
import Footer from "/$/shared/static/widgets/footer/widget.mjs";
import Hero from "./widgets/hero/widget.mjs";
import WhyUs from "./widgets/why-us/widget.mjs";
import InfoServices from "./widgets/info-services/widget.mjs";
import InfoTeam from "./widgets/info-team/widget.mjs";
import InfoCommunity from "./widgets/info-community/widget.mjs";
import ContactUs from "./widgets/contact-us/widget.mjs";
import ComingSoon from "./widgets/coming-soon/widget.mjs";
import FrequentlyAskedQuestions from "./widgets/frequently-asked-questions/widget.mjs";
import InfoMoto from "./widgets/info-moto/widget.mjs";
import TargetDiseases from "./widgets/target-diseases/widget.mjs";



document.body.appendChild(new Navbar().html)

document.body.appendChild(
    new Hero().html
)

document.body.appendChild(
    new WhyUs().html
)
document.body.appendChild(
    new InfoServices().html
)
document.body.appendChild(
    new TargetDiseases().html
)

document.body.appendChild(
    new InfoTeam().html
)

document.body.appendChild(
    new InfoMoto().html
)

document.body.appendChild(
    new FrequentlyAskedQuestions().html
)

document.body.appendChild(
    new InfoCommunity().html
)


document.body.appendChild(
    new ContactUs().html
)

document.body.appendChild(
    new ComingSoon({ label: `eHealthi Mobile App<br>Tap to download beta version (Android only).`, image: 'bg.png' }).html
)

document.body.appendChild(
    new Footer().html
)
