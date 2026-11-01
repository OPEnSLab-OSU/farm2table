<!-- docs/rfcs/YYYY-MM-DD-short-title.md (or docs/adr/, whichever your repo uses) -->

# RFC: [CI Testing Strategy]

<!-- Decision record header. Leave Status as "Proposed" until your team decides,
     before or after the reviews. Then fill in the outcome and the decision date.
     The document stays where it is; this header is what makes it a record. -->

| Field | Value |
| --- | --- |
| Author |Branden Rodriguez |
| Date | 2026-10-27 |
| Status | Proposed |
| Decision Date | TBD |
| Deciders | Farm2Table Team |
| Superseded By | N/A |

## Problem and Context

Farm2Table is developing an interactive web app that helps farmers and educators view agricultural sensor data including soil moisture, temperature, rainfall, wind speed, and wind direction. The web app will include features such as data visualization, comparing sensor nodes, and have an interactive dashboard. Since this project has a team of multiple people, its important to decide how to test code changes and make sure that they don't affect functionality.

Farm2Table is still in early development. The team has established a GitHub repository, research on requirements, as well as developing a Figma prototype. Farm2Table does not have a working application at the moment or a continuous integration (CI) pipeline. As the Quality Owner, I am responsible for helping to ensure our code meets the quality standards of our team, as well as keeping the main branch reliable.

Why now. As we begin creating and implementing th application, the number of features and dependencies will increase. Creating a testing strategy early will allow us to create consistent expectations before our code base grows. Consistent expectations will lead the team so sucess in keeping the main branch reliable. Changing our team's testing practices after building features and workflows would lead to more work in the future.

What happens if we do nothing. Without a testing strategy, the team may test their code differently or miss problems that could affect other components. For example, a change to sensor data processing could lead to an incorrect display of data visualization in the app. Or even fail to display anything at all if readings are missing. These problems may not be discovered until they are already merged and tested by other developers on the team.

## Options

### Option A: [GitHub Actions]

Use GitHub Actions to automatically run builds and tests when code is pushed to the repository or a pull request is opened. GitHub Actions uses YAML files to define which checks should run and when [1].

Benefits: GitHub Actions is directly integrated with GitHub, which the team is already using. This would allow the team to set up automated testing without having a separate server. When the team tests their builds, they will be able to see the test results directly from the repository.

Costs: The team would need to create and maintain workflow files and automated tests. Workflows would also need changes as the web app grows and dependencies are added. GitHub provides hosted servers, but there may be usage costs that could be applied depending on our repository settings and usage [3].

When this is the right choice: When our team wants a simple CI solution that can integrate with our GitHub repository directly, and requires minimal management.

### Option B: [Jenkins]

Use Jenkins, an open source automation server to run automated builds and tests. Jenkins supports pipelines defined in a Jenkinsfile, which can be stored along with the teams application code in GitHub [4].

Benefits: Jenkins provides flexibility and control over how tests are executed. Jenkins supports custom build environments and plugins that can help with functionality [4]. This could work for Farm2table if the team needs specialized testing environments or complex automation.

Costs: Using a self hosted Jenkins setup would require our team to manage a server, GitHub Actions provides servers that are managed by GitHub. A typical setup requires the team to configure and maintain a server. This would include managing updates, security, plugins, and availability [5]. The Jenkins setup could be costly if it takes up time from developing the web application.

When this is the right choice: When the team needs more control with testing environments or if the team needs functionality that would be hard to implement in GitHub Actions.

### Option C: Do Nothing

Develop Farm2Table without establishing a CI pipeline. Developers would be responsible for manually checking their code before pushing to the repository.

Benefits: Requires no additional platform, configurations, or maintenance. The team would be able to focus more on the web application.

Costs: Without automatic checks, the team can overlook errors or could have inconsistent testing. Errors can be pushed to the main branch without notice until the application is demonstrated, or if another feature is affected. As the application grows and becomes more complex, it could be much harder and cost more time to test and check each feature.

When is this the right choice: During early research and prototype stages. When there is little amounts of code to test, creating a CI system may not be proven beneficial as there is not much code to test.

## Analysis

| Criterion | GitHub Actions | Jenkins | Do Nothing |
| --- | --- | --- | --- |
| Initial setup | Low | High | None |
| Automated testing | Yes | Yes | No |
| GitHub integration | Built-in | Requires configuration | None |
| Server maintenance | Not required | Required if self-hosted | None |
| Flexibility | High | Very high | Limited |
| Infrastructure cost | Depends on usage | Hosting and maintenance | None |
| Ongoing maintenance | Workflows and tests | Server, plugins, pipelines, and tests | Manual debugging |
| Best fit | Small GitHub-based teams | Custom testing environments | Early prototyping |

Reliability: Both GitHub Actions and Jenkins can automatically execute tests and report failures. GitHub Actions uses pushes and pull requests to trigger workflows [1]. Jenkins uses configurable pipelines and integrations with source control [4]. Both platforms could help identify problems before code is merged. This doesn't mean that automated testing is perfect. Tests only detect problems covered by existing tests, therefore there is no guarantee that the application will be bug free.

Complexity and maintainability: GitHub actions would likely require less initial set up since the team is already using GitHub. The team could create a workflow file in the repository and use GitHub servers to execute tests. Jenkins offers more control with the tests, but self hosted installation also requires someone to manage server, plugins, updates, and security. Jenkins documentation states how the pipeline system works, how plugins add functionality, and how pipelines can be configured with a Jenkinsfile.

Performance and cost: GitHub actions provides hosted servers while self hosting Jenkins requires computing resources and maintenance [3][5]. Performance and cost is unknown at this time due to not having a working web application.

Security: GitHub Actions and Jenkins need to protect credentials as well as private data [2][5]. Farm2Table uses sensor data from a project partners database, the team should make sure the data is approved during testing as opposed to directly connecting to the database.

## Recommendation and Verification Plan

GitHub Actions: I recommend GitHub Actions because it integrates with our repository, and requires less management than Jenkins.

1. Create a workflow in GitHub Actions
2. Configure it to run on pull and push requests.
3. Add build commands and tests to ensure CI runs safely and efficently.

Initial CI Implementation:
- [ ] **Workflow execution:** Verify pushes and pull requests trigger the workflow.
- [ ] **Build verification:** Confirm that valid application code builds successfully.
- [ ] **Failure detection:** create a failing test and verify that CI reports the failure.
- [ ] **Sensor testing:** Test valid, missing, and invalid sensor readings.
- [ ] **Branch protection:** Verify failing checks prevent pull requests from merging.

These tests will be completed during our initial CI setup before the team relies on automated checks to approve the code.

## Constraints

Licensing: GitHub actions, Jenkins plugins, and testing libraries must have licenses compatible with the project.

Data use: Automated tests should use approved sensor data.

IP: Testing the code needs to follow the team's project agreements and requirements.

Confidentiality: Sensor data, database credentials, and teammate information should not appear in the public repository or CI logs.

Development constraints: Our team has not established any technologies yet. 

## Delegation and Validation

- **What you handed to AI tools** I used ChatGPT to help research CI platforms, compare GitHub Actions and Jenkins, and organize this RFC.
- **Where you stopped and validated the result yourself, and why those points.** I compared our options with our use of GitHub, our current stage in the project, and as the Quality Owner. before we proceed with GitHub Actions, I need to verify that the workflow will support our technology stack, detect failing tests, and will protect partner information.

What is assessed is in the [AI policy](https://capstone.alexulbrich.com/assignments/introduction/#ai-policy-applies-to-every-assignment).

## Decision

Proposed.

## Sources

[1] [GitHub Actions Documentation](https://docs.github.com/en/actions)
[2] [GitHub Actions Security](https://docs.github.com/en/actions/reference/security/secure-use)
[3] [GitHub Actions Billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
[4] [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
[5] [Jenkins Security Documentation](https://www.jenkins.io/doc/book/security/)
