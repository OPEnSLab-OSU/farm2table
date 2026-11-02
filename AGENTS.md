# AGENTS.md
Context for AI coding tools working in this repository. Per-tool files should point here instead of duplicating it.

## Project
Farm2Table is a new application developed independently from
Ear2Earth. The project reuses limited database query logic
from Ear2Earth to retrieve agricultural sensor data, but does
not inherit or extend the Ear2Earth application codebase.

Main features:
- Interactive map of sensor stations, with last-update time and device status
- Per-station sensor list with metadata (type, units, depth/height, deployment info, last communication)
- Interactive time-series plots (24 hours, 7 days, 30 days, season, custom range) with zoom, pan, and hover
- Comparison of multiple variables or multiple stations
- CSV export of selected data
- Works on desktop, tablet, and mobile

## Stack

The full application technology stack has not been finalized.

Current setup:
- Language: JavaScript (initial scaffold)
- Runtime: Node.js 22
- Testing: Node.js built-in test runner
- CI: GitHub Actions

Planned or under evaluation:
- Frontend: TBD
- Mapping: TBD
- Plotting: TBD
- Backend / API: TBD
- Database: MongoDB (planned sensor data source)
- Hosting: OPEnS Lab VPS (planned, pending confirmation)

## Setup commands

The initial testing scaffold can be run locally:

npm install
npm test

Application development and deployment commands
will be documented once the stack is finalized.

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
