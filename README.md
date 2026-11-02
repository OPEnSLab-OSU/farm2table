# Farm2Table-Capstone
Browser-based map and time-series explorer for farm and environmental sensor data, built on the open-source Ear2Earth platform.

## Status
Checkpoint 1: scaffold only. No product features yet.

## Prerequisites
- Node.js
- Git
  
## Quickstart
1. Clone the repository and enter it:
```bash
   git clone <REPO-URL>
   cd Farm2Table-Capstone
```
 
2. Install dependencies:
```bash
   npm install
```
 
3. Create the backend environment file:
```bash
   cp backend/.env.example backend/.env
```
 
   Then fill in the values (see [Environment variables](#environment-variables)). The scaffold does not need real keys yet.
 
4. Run the tests to confirm the scaffold works:
```bash
   npm test
```
 
   Expected result: all tests pass.

## Environment variables
 
Defined in `backend/.env.example`. Copy it to `backend/.env`; the real `.env` is git-ignored and must never be committed.

## Project structure
 
| Path | Contents |
|---|---|
| `src/` | Application code (scaffold: `coordinates.js`) |
| `tests/` | Automated tests |
| `backend/` | Backend configuration (`.env.example`) |
| `docs/` | Living docs: requirements, design, risks |
| `.github/workflows/ci.yml` | CI: runs the tests on every pull request |
 
## Documentation
 
- [Requirements](docs/requirements.md)
- [Design](docs/design.md)
- [Risks](docs/risks.md)
- [Contributing](CONTRIBUTING.md)
- [AI context file](AGENTS.md)
