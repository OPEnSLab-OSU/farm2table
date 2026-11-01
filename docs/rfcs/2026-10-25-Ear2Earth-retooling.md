| Field | Value |
| --- | --- |
| Author | Evan Seip |
| Date | 2026-10-25 |
| Status | Proposed |
| Decision Date | TBD |
| Deciders | Group 016 |
| Superseded By | NA |

## Problem and Context
This project is called Farm2Table and proposed by a professor (the client) in Oregon State
University’s (OSU) Agricultural Sciences Department. The intent of this project is to implement a web
application that visualizes data from open source sensors, built by the Openly Published Environmental
Sensing (OPEnS) lab on OSU’s campus. The desired end-state is that the end-user will have an
application on their personal electronic device and be able to gain insight into their agricultural operation
based on intuitive geospatial visualizations fed live by the sensors. The sensors collect data on their local
environment, contextual to what the end-user wants to know. At the current time, we understand that the
sensors are capable of collecting on sunlight, rainfall, windspeed, and soil moisture. It has not been made
clear what specific metrics are collected. However, it has been made clear that these sensors and their
implementation has been used in a project from a previous year, called Ear2Earth. This platform uses a
database that pulls information from the same sensors and data that we are expecting to use. The platform
is owned by the client, and completed for the state that was expected. That repository has been made
available to our team.
At this time, under client direction, we have not begun implementing code towards the desired
end-state. As such, the hardest decision we currently face is whether or not we should retool and extend
the Ear2Earth platform to suit the needs of our project, or whether we should start completely from
scratch (excluding the database).

## Options
### Option A: Extend Ear2Earth Architecture
This would involve building and retooling the clients existing platform to meet the desired end
state of our project. Ear2Earth pulls data from the same database (collected by most-of / some-of the same
sensors). This platform has visualization techniques that the client has expressed interest in, and noted
took time-intensive problem solving. It stands to reason that the benefit of retooling what we can from
this platform would facilitate a quicker turnaround time to delivering iterations in our sprints. The costs of
doing this is that we won’t be as familiar with the code given that we are extending someone else’s work.
Especially in this academic domain where the codebase wasn’t exactly built under a codified standard
operating procedure and rigorous quality assurance / quality control (QA/QC) process. Furthermore, there 
are the “unknown unknowns.” That is, we could commit to following this path, only to encounter some
unique roadblock that creates more work than anticipated.

### Option B: Build completely from scratch
Under this option, we would build completely from scratch and only utilize the working database
that has been established. The benefit of doing this would be that we are deeply familiar with the
codebase of the project as we are the ones producing it. This would enable us to problem-solve more
intuitively and see solutions we wouldn’t necessarily see by retooling an older project. This would also
allow us to implement solutions as we see fit, with the possibility that better solutions are available at
present, than when the previous platform was implemented. All that to say, the main benefit would be that
we create the right tool for the job in this case. The costs are that this will probably be more time
intensive. There of course could be unexpected roadblocks as well. As we enter week 5, with no actual
code, this could prove to be a poor decision from an academic standpoint. The client is invested in their
product and vision, but we are beholden to the class and grading checkpoints. That is, we need something
to show in order to make the due-outs for future sprints and grading checkpoints.

### Option C: Do Nothing
Doing nothing would be disastrous and academically fatal. The problem is looking at the project
as a whole, so doing nothing would mean not moving forward on the project. This would be a failure for
all parties involved.

## Analysis
At this time the technical tradeoffs are unknown. We have access to the repository for Ear2Earth, but
current understanding of the codebase is very limited as it is to be determined whether we need to look
further into this platform. There is no real evidence or citations to make this determination at this point.

## Recommendation and Verification Plan
I would propose option B, which is starting from scratch. From our meetings with the client, the
scope of this project is achievable and the complexity of the project is within the capabilities of the team.
I think there is merit to going down option A, and not reinventing the wheel, but I believe that there is
more to be gained from an academic standpoint by building the project on our own. I foresee that we may
run into issues with implementing some visualization techniques from the data that we receive from the
database, but that is a part of learning. We will know this plan works by building, problem-solving and
iterating as we work towards the vision that the client has. We will know we succeeded by whether the
client gives positive feedback or determines that there is more to do.

## Constraints
At this time, I do not foresee any licensing or IP issues. The sensors are all made by the OPEnS
lab (which the client heads) with the intent of being open-source. The client has positive control of the
previous platform and the database that feeds this is maintained by students under the employment of the
client. Because this project is wholly composed of entities controlled by the client, we should have no
issues with access.

## Delegation and Validation
- **What you handed to AI tools**: No AI tools were used to compose this document.
- **What checks made that reasonable**: NA
- **Where you stopped and validated the result yourself, and why those points.**: NA

## Decision
Proposed
