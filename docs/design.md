
# Farm2Table — Technical Design

**Status:** Living document. Describes the repository as of Repo Checkpoint 1 (scaffold only, no product features yet).
**Last updated:** 2026-11-01

## 1. Context

Farm2Table is a browser-based app for exploring agricultural and environmental sensor data collected by OPEnS Lab sensor stations. The intended navigation flow is **landscape → station → sensor → time series** (`docs/requirements.md`). Sensor readings already live in a MongoDB database maintained by the partner's sensor team, the same data the earlier Ear2Earth project uses. Farm2Table only reads that data; it does not write to the database or control sensors.


<img width="422" height="99" alt="image" src="https://github.com/user-attachments/assets/d384728e-e634-4298-ba44-1794b6dc38eb" />


Solid lines exist today; dashed lines are planned and not implemented.

## 2. The system as it exists

The repository currently holds a Node.js test scaffold, CI, and planning documents.

| Path | What it does |
|---|---|
| `package.json` | Node.js project `farm2table` 0.1.0. One script: `npm test` runs Node's built-in test runner (`node --test`). No dependencies. |
| `src/coordinates.js` | Exports `isValidCoordinate(latitude, longitude)`, the first piece of station-location logic the map will need. |
| `tests/coordinates.test.js` | Four tests: accepts a valid coordinate, rejects out-of-range latitude, rejects out-of-range longitude, rejects a non-numeric value. |
| `.github/workflows/ci.yml` | GitHub Actions workflow "Farm2Table CI": on every pull request and every push to `main`, checks out the code, sets up Node 22, runs `npm install` and `npm test`. |
| `backend/.env.example` | Template for `MONGODB_URI`, the MongoDB connection string. The real `backend/.env` is git-ignored. |
| `docs/requirements.md` | Problem statement, functional and non-functional requirements, constraints. |
| `docs/risks.md` | Risk register. |
| `docs/rfcs/` | Six proposals. |
| `docs/sprints/` | Sprint notes. |

There is no frontend, backend server, or database connection in the code yet.

## 3. Data model

The partner's MongoDB document format has not been shared yet (`docs/risks.md`, Risk 1), so no data model is implemented. The entities the requirements describe:

| Entity | Fields named in the requirements |
|---|---|
| Station | identity, location on the map, last communication time, sensor status (FR1, FR2) |
| Sensor | type, measurement unit, depth or height, deployment information (FR5) |
| Reading | timestamp, value, unit (FR4, FR6, FR7) |

## 4. Deployment

**Today:** nothing is deployed. The only automated environment is GitHub Actions CI, which runs the tests on every pull request.

**Staging and rollback (plan):** changes will be tested on a separate branch. Only once it has been confirm will it be moved to Main/Dev. If roll back is still needed then a previous version will take over Main/Dev. 
