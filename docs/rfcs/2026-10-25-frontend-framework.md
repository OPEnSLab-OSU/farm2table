<!-- docs/rfcs/2026-10-25-frontend-framework.md-->

# RFC: Selecting a Frontend Framework for Farm2Table


| Field | Value |
| --- | --- |
| Author |Annika Etchison |
| Date | 2026-10-25 |
| Status | Proposed |
| Decision Date | (fill when decided) |
| Deciders | (who agreed to the outcome) |
| Superseded By | (link, if applicable) |

## Problem and Context

Farm2Table aims to make agricultural sensor data intuitive to explore through an interactive map, sensor information panels, and time-series visualizations. Users should be able to select sensors, inspect the recordings, and compare.
. 
The team must select a frontend framework to establish a consistent architecture for these interactive features. React, and Vue are potential options, both offering different approaches to component development and state management.

This decision should be made before substantial frontend development begins. Switching frameworks later could require rewriting components, state management, integrations, and tests. Without an agreed-upon framework, we may adopt inconsistent patterns or introduce unnecessary architectural complexity.


## Options

### Option A: React

Build the interface using React and its component-based architecture.

Benefits: Flexible component design, extensive ecosystem, and established approaches to managing interactive application state.

Costs: Requires learning React-specific concepts and selecting additional tools for routing and potentially state management.


### Option B: Vue

Build the interface using Vue and its reactive component system.

Benefits: Familiar HTML-based templates, reactive state management, and official tools for routing and larger application architectures.

Costs: Requires learning Vue's conventions and evaluating compatibility with the project's mapping and visualization libraries.



### Option D: Do Nothing
Proceed without selecting a frontend framework.

Benefits: Avoids spending immediate development time evaluating alternatives.

Costs: If no framework has been selected, inconsistent implementation patterns or an unsuitable initial choice could require later unnecessary rework.

## Analysis

Maintainability and Complexity

Both frameworks support reusable components for Farm2Table's map, station details, sensor data, and charts. React offers flexibility, while Vue provides an established reactivity system and official application tools. The best choice depends on the team's experience, preferred programming model, and ability to maintain a consistent architecture.

Integration and Performance

The selected framework must work with the project's intended mapping and visualization libraries. The team should verify compatibility before committing to a framework.
Performance will also depend on API requests, data volume, chart rendering, and map complexity. No Farm2Table specific benchmarks are currently available, so performance should be evaluated using a prototype.

Cost and Reversibility

Changing frameworks after development could require rewriting components, updating dependencies, and repeating tests. 



Recommendation and Verification Plan

I recommend Option A: React. React provides a flexible component architecture suitable for coordinating the interactive map, station information, and time-series visualizations. Its ecosystem also offers a range of tools for implementing and testing these features.

We should verify the decision by:

Integration: Build a prototype connecting a map selection to station details and a time-series chart.

State Management: Confirm that changing stations, sensors, and date ranges updates the correct components.

Performance: Test representative map and chart interactions with sample sensor data.

Compatibility: Verify that the selected mapping and charting libraries work with the framework.

If the prototype has significant integration problems or if the team has more experience with another framework, we should reconsider before beginning substantial development.


Delegation and Validation

- **What you handed to AI tools** on this decision, whether that was the analysis, the prototype, the tests, or the writing.
- **What checks made that reasonable**: tests, CI, review gates, a staging environment, a rollback path. Name the ones that actually exist in your repo, not the ones you intend to build.
- **Where you stopped and validated the result yourself, and why those points.** If this decision is hard to reverse, say what you personally checked before committing to it.

Constraints

The team must verify compatibility with the existing Ear2Earth platform and repository 


Decision

Proposed. No decision has been made

