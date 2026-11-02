# Contributing to Farm2Table

This document explains how team members contribute to the Farm2Table Capstone project.

The project is currently in the planning and setup phase. Development tools and technical requirements will be updated as the team makes decisions.

## Issues & Planning

- Use GitHub Issues to track tasks, bugs, and feature requests.
- Each issue should have a description, an assigned member, and a target completion date.
- The Project Manager is responsible for keeping the task board updated and tracking sprint progress.
- Team members should communicate blockers through Discord.

## Commit Messages

- Write short, descriptive commit messages that explain the changes.
- Suggested format: `type: description`.

Examples:
- `feat: add sensor station markers`
- `fix: correct map display`
- `docs: update README`
- `test: add API tests`

- Reference related GitHub Issues when applicable.

## Code Style, Linting & Formatting

- Use clear and descriptive names for variables, functions, and files.
- Keep code readable and consistent with existing conventions.
- Avoid unnecessary complexity and unrelated changes.
- The team has not finalized the technology stack, formatter, or linter.
- Once selected, the Quality Owner will document the configuration files and local linting commands here.

## Testing

Automated testing is configured using Node.js's built-in test runner.

To run tests locally:

```bash
npm install
npm test
```

Current tests are located in `tests/coordinates.test.js` and validate station coordinates.

Contributors should run tests before opening a pull request and add or update tests when changing relevant functionality.

## Definition of Done

A contribution is considered complete when:

- The work meets its assigned requirements and acceptance criteria.
- The changes have been reviewed by another team member.
- Relevant testing has been completed and documented.
- Related documentation has been updated when necessary.
- No secrets or sensitive information are exposed.
- Required GitHub Actions CI checks must pass before merging.

## Quality Checks

| Check | Status |
|---|---|
| Automated tests | Implemented |
| GitHub Actions CI | Implemented |
| Code review | Conducted through pull requests |
| Linting | Not configured yet |
| Security scanning | Not configured yet |
| Continuous Deployment | Not configured yet |

All contributors should check that CI passes before merging pull requests.

## Contribution Norm

- Every team member must complete at least one accepted contribution per sprint.
- Contributions may include coding, testing, documentation, design, research, deployment, or other approved project work.
- Work should be tracked through GitHub Issues, pull requests, or linked shared documents.
- Code contributions are accepted when reviewed and merged into the repository.
- Documentation and design contributions are accepted when reviewed and approved by the team.
- Research and planning contributions are accepted when the agreed deliverable is reviewed and recorded in the sprint notes.
- Pair programming is allowed, but each member's individual contribution must be clearly documented.
- The Project Manager tracks progress, and each member's accepted work is recorded in the sprint notes.
- Tasks should be sized so everyone has an opportunity to complete at least one accepted contribution per sprint.

## Pull Requests & Reviews

- Create a separate branch for each feature, bug fix, or documentation change.
- Use descriptive branch names, such as `feature/sensor-map` or `docs/readme-update`.
- Submit changes to the `main` branch through pull requests.
- Explain what was changed and how it was tested.
- Link the related GitHub Issue when applicable.
- Proposed policy: At least one other team member should approve a pull request before merging.
- Proposed review turnaround: Within two working days.
- Do not merge changes with unresolved review comments or failing required checks.

The team will confirm PR approval requirements and review turnaround expectations before adopting these policies.

## CI/CD

GitHub Actions Continuous Integration (CI) is configured in `.github/workflows/ci.yml`.

The **Farm2Table CI** workflow runs automatically on:
- Pushes to the `main` branch.
- Pull requests.

The workflow:
1. Checks out the repository.
2. Sets up Node.js 22.
3. Installs dependencies using `npm install`.
4. Runs automated tests using `npm test`.

The team has verified that CI passes with valid code and fails when an intentional defect is introduced.

Continuous Deployment (CD) has not been implemented yet.

## Security & Secrets

- Never commit passwords, API keys, access tokens, or other credentials.
- Store sensitive configuration values using environment variables or an approved secrets manager.
- Do not commit `.env` files containing real credentials.
- Report security concerns privately to the Quality Owner.
- Notify the team immediately if credentials are accidentally exposed so they can be revoked or rotated.
- Review new dependencies and dependency updates before merging.
- Follow the AI and confidentiality rules in the Team Charter and `AGENTS.md`.

## Documentation Expectations

- Update `README.md` when setup or usage instructions change.
- Document significant technical decisions using RFCs in `docs/rfcs/`.
- Update relevant documentation when adding or modifying features.
- Use comments to explain code that is not immediately clear.
- The Documentation Owner is responsible for keeping project documentation current.
- The AI Coordinator is responsible for maintaining `AGENTS.md`.

## Release Process

- The Quality Owner oversees release quality and ensures the Definition of Done is satisfied.
- The Deployment Owner manages deployment environments and deployment procedures.
- The planned hosting target is OPEnS Lab infrastructure associated with farm2table.com, coordinated with Sarvesh.
- The deployment configuration, approval, and release process have not been finalized.
- Before the first release, the team will document versioning, release tags, deployment steps, and rollback procedures.
- Releases should be tested before being demonstrated to the project partner.

## Support & Contact

- Use Discord for team communication, questions, and blockers.
- Project Manager: Evan Seip - sprint planning, task tracking, and partner communication.
- AI Coordinator: Son Thai Do Nguyen - AI tools, `AGENTS.md`, and confidentiality.
- Quality Owner: Branden Rodriguez - testing, CI, code reviews, and Definition of Done.
- Facilitation Owner: Annika Etchison - meeting coordination and team discussions.
- Deployment Owner: Aron Meraz - deployment and environments.
- Documentation Owner: Thao Nguyen - project documentation and decision records.

If a problem cannot be resolved within the team, contact the course TA or instruction team when appropriate.
