/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This script controls the admin page
 */

import BackendDashboard from '/$/backend_dashboard/static/widget/widget.mjs'
import { handle } from '/$/system/static/errors/error.mjs'


const dashboard = new BackendDashboard()
document.body.appendChild(dashboard.html)
dashboard.loadFromServer({ name: 'admin' }).catch(e => handle(e))