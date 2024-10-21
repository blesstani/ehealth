/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Platform
 * This script runs on the custom login page of the platform
 */

import eHealthiLoginWidget from "../../widgets/login-widget/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

const loginContainer = hc.spawn({ classes: ['login'] })

document.body.appendChild(
    loginContainer
)

const widget = new eHealthiLoginWidget()

loginContainer.appendChild(widget.html)

hc.importModuleCSS(import.meta.url);