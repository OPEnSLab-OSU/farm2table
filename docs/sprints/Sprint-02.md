# Sprint Note: Sprint [2], [Farm2Table]

**Team: Farm2Table** | **Sprint dates:** 26 October 2026 - 08 November 2026 | **Date submitted:**  08 November 2026

## 1. Working Software Evidence

-Deployed URL / release tag / demo video: No working application is available yet, per project sponsor’s direction. This sprint focused on requirements, repository migration, and preparing real and simulated sensor data for future frontend development. A functional prototype has not yet been implemented.

-Demo video timestamps: N/A — no replacement demo video.

-CI run: GitHub Actions CI has been configured and successfully runs automated tests, including coordinate validation and mock sensor dataset validation. The latest pull request passed all checks.
-Repository: https://github.com/OPEnSLab-OSU/farm2table 
-CI evidence: Available in the GitHub Actions checks on the mock-data pull request.

## 2. What Got Done

Everything the team finished this sprint. Each item concrete (someone could go look at it) and consequential
(the project is meaningfully further along). It does not have to be code; non-code work counts when someone can open it (the repository, an issue or ticket, your partner's system). Activity without a result does not
belong here: "worked on the API" and "researched options" are not done things.

- Board link: https://github.com/users/SonNguyenNogFug/projects/2  
- Done this sprint:
- Established Github repository
- Met four (4) times with client to date
- Conducted three (3) interviews with target demographic and subject-matter experts
- Met project database administrators
- Figma mock-up

## 3. Top Risk and One Decision Needed

The single biggest threat to shipping (in fall, before the Definition of Shipped exists, to the term gate), and one concrete decision the team needs from the partner, the instruction team, or itself. Take the risk from the top of your `docs/risks.md`.

- Top risk: Lack of database access
- Decision needed (from whom, by when): Client’s sensor team at OPEnS lab, as soon as possible. (Our web application is intended to pull from a database built and maintained by previous students of the customer)

## 4. Contribution Lines

One line per student, three parts:
  (a) the work you owned this sprint, one or more pieces, each with a link or ID (NDA teams: IDs only);
  (b) whose work you reviewed (a pull request, a spec, a document) and the one change you asked for, named specifically ("LGTM" is not a review);
  (c) one human-written sentence: the most consequential thing you shipped, and how the team knows it works.
If a student has nothing this sprint, their line says so plainly. Mechanical changes (formatter runs, lockfile bumps,
generated files, bulk renames) are normal work but are not evidence; leave them out.

**[Aron Meraz: ]** 
- owned:Created Design.md, Ear-2-EarthReusableCode.m, Pushed React, Express.js structure.
- reviewed: No code reviewed this sprint
- shipped: No code has been shipped. 

**Evan Seip**
- owned: Demographic Interviews. Developed interview content relevant to client interests. Conducted three client instructed interviews with target demographic. Built ~10-page executive summaries of each interview.
- reviewed: No code reviewed this sprint
- shipped: No code shipped this sprint (Interview Videos, Transcripts, and Exec Summaries placed in group share drive)

**Son Thai Do Nguyen**
- owned: Researched public environmental datasets and prepared real and simulated sensor data for Farm2Table.
- reviewed: No peer reviews completed this sprint.
- shipped: Added the AgriMet weather data, simulated the soil-moisture readings, documentation, and validation tests. PR was reviewed and merged with CI passing.

**Thao Nguyen**
- owned: Follow up with team to obtain API credentials and understands how retrieve data sensor, move the Son’s repo to partner’s repo
- reviewed: Reviewed the Design.md from Aron
- shipped: Write the API access documents and what I’ve known about the sensor data

**Annika Etchison**
- owned: Continued working on application functionality UI drafts in Figma, explored multiple FOVs and interactivity. Specifically, the real-time view of different sensors
- reviewed: No reviews yet this sprint
- shipped: [link to mock up](https://www.figma.com/proto/JOKoqxrnU0S6pUnuoq4gWE/Untitled?node-id=41-198&p=f&t=1RwJIXUFxxHgpFBd-1&scaling=contain&content-scaling=fixed&page-id=0%3A1) 

**Branden Rodriguez**
- owned:Revised Figma mock-up, reviewed pull request for place holder data and CI tests.
- reviewed: Son’s Pull request for dummy data.
- shipped: Figma Revision: https://www.figma.com/design/D64DkH3HtdTYiMIva4UNGS/Farm2table-Web-App?node-id=0-1&t=FaNT0dm4tE5GqXWV-1 

**Decision chaired this sprint:** 

Son Thai Do Nguyen led the decision to use public AgriMet weather data and simulated soil-moisture readings as temporary test datasets while the team works toward accessing the actual MongoDB sensor data.

## 5. Judgment Layer (human-written, about five lines)

We received valuable insight from the interviews that will help guide our decision making for the rest of this project. We are still working on fixing some repository issues, which we will reach out about this week. We decided on React for the frontend, and the UI plans are coming along.
