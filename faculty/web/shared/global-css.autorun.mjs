/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This script automatically runs in every page, automatically importing the global.css stylesheet.
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


hc.importModuleCSS(import.meta.url, './global.css')