# Farm2Table — Requirements

**Project:** Farm2Table — Interactive IoT WebApp for Agriculture and Education  
**Status:** Draft / Planning  
**Last Updated:** 2026-11-01

## 1. Problem Statement

Agricultural and environmental research sites collect large
amounts of sensor data, including soil moisture, rainfall,
temperature, solar radiation, and wind measurements.

Although this data is available, exploring relationships
between sensors, locations, and time can be difficult,
especially for non-technical users.

Farm2Table aims to provide an interactive web application
where users can navigate a landscape, select sensor stations,
view current conditions, analyze historical measurements,
and compare environmental variables.

The intended navigation flow is:

**Landscape → Station → Sensor → Time Series**

The application builds on the existing Ear2Earth platform,
with a stronger focus on geographic exploration and
agricultural education.

## 2. Functional Requirements

### FR1 — Interactive Map

- Display sensor stations on an interactive geographic map.
- Allow users to select a station to view its information.
- Support navigation between geographic and station views.

**Acceptance Criteria:**
- Selecting a station displays its identity and available
  sensors.
- Users can return to the map and select another station.

### FR2 — Station Dashboard (FOV 1)

- Display current or most recent measurements for a
  selected station.
- Show available environmental variables such as
  temperature, humidity, rainfall, and soil moisture.
- Display the last communication time and sensor status.

**Acceptance Criteria:**
- Users can inspect the latest available measurements.
- Missing or unavailable measurements are clearly identified.

### FR3 — Spatial Data Exploration (FOV 2)

- Allow users to select an environmental variable.
- Display its measurements across available stations.
- Support comparison between geographic locations.

**Acceptance Criteria:**
- Users can select a variable and see measurements from
  stations where that variable is available.
- Stations without the selected variable are not shown as
  having valid measurements.

**Potential Enhancement:**
- Heatmap visualization for spatial differences.

### FR4 — Time-Series Visualization (FOV 3)

- Display interactive charts of historical sensor data.
- Support common date ranges such as 24 hours, 7 days,
  30 days, and custom dates.
- Allow users to zoom, pan, and inspect measurements.
- Support comparison between environmental variables.

**Acceptance Criteria:**
- Selecting a date range updates the displayed measurements.
- Users can inspect individual readings and timestamps.
- Charts handle missing measurements without displaying
  misleading continuous data.

### FR5 — Sensor Metadata

- Display sensor type, measurement unit, and deployment
  information when available.
- Support stations with different sensor configurations.
- Show soil moisture and temperature measurements at
  different depths when available.

**Acceptance Criteria:**
- Users can identify the sensors installed at a station.
- Sensor depth and measurement units are displayed
  where this metadata exists.

### FR6 — Data Comparison

- Support comparing measurements from multiple stations
  or multiple environmental variables.
- Preserve units and timestamps when comparing data.
- Allow comparisons such as rainfall versus soil moisture.

**Acceptance Criteria:**
- Users can compare at least two selected data series.
- Different measurement units are clearly labeled.

### FR7 — Data Export

- Allow users to export selected sensor measurements
  to CSV or another common format.

**Acceptance Criteria:**
- Exported files contain the selected measurements,
  timestamps, and relevant variable information.
- Exported values match the data used in the visualization.

## 3. Non-Functional Requirements

### Usability
- The application should be understandable to both
  technical and non-technical users.
- Navigation should remain consistent between map,
  station, and chart views.

### Responsiveness
- The interface should support desktop, tablet, and
  mobile browsers.
- Visualizations should resize with the browser window.

### Data Quality
- Missing, stale, or unavailable measurements must be
  clearly communicated.
- Timestamps and measurement units must be consistent.

### Reliability
- The application should handle unavailable sensor data
  or backend errors without crashing the entire interface.

### Security
- Database credentials and secrets must not be exposed
  in frontend code or committed to GitHub.
- Database access should occur through controlled
  backend services.

### Maintainability
- The system should use modular, documented components.
- Reusable Ear2Earth functionality should be evaluated
  before being rewritten.

## 4. Constraints

- Farm2Table builds on the existing Ear2Earth project.
- The project depends on access to environmental sensor
  data and metadata provided by the partner.
- Available sensors and measurements may differ
  between stations.
- The production environment is expected to use the
  OPEnS Lab infrastructure supported by Sarvesh.
- The final application framework has not yet been
  confirmed by the team.
- Development is planned to move from the temporary
  team repository to Chet's repository.
- The project must fit the CS46X capstone schedule.

## 5. Success Metrics

The initial application will be considered successful
when users can:

1. Navigate an interactive map of sensor stations.
2. Select a station and inspect available measurements.
3. View historical measurements over a chosen date range.
4. Compare environmental measurements across variables
   or locations.
5. Export selected sensor data.
6. Understand when data is unavailable or outdated.

Performance and usability targets will be refined after
stakeholder interviews and prototype testing.

## 6. Non-Goals for Initial Release

The following are not required for the initial release:

- Machine-learning-based environmental forecasting.
- Automated irrigation or farm equipment control.
- Advanced weather prediction.
- Complex simulation of agricultural processes.
- Complete replacement of Ear2Earth's sonification tools.

## 7. Potential Future Features

Ideas discussed with the project partner include:

- Heatmaps for environmental variables.
- Threshold indicators for freezing or wildfire risk.
- Weather API overlays.
- Evapotranspiration-related visualizations.
- Educational activities and guided questions.
- Different interfaces for researchers and learners.

These are potential enhancements, not confirmed
initial-release requirements.

## 8. Open Questions

1. Which stations and sensors will be available?
2. What is the exact MongoDB data structure?
3. Which frontend and backend frameworks will be used?
4. How should soil depth and sensor metadata be represented?
5. What performance targets should the application meet?
6. Which datasets can be used for development and testing?
7. Which features should be prioritized after interviews?
8. How will the team validate the application with users?

## 9. Current Implementation Status

As of Repo Checkpoint 1, Farm2Table is in the planning
and initial setup stage.

The repository contains project documentation, RFCs,
sprint notes, and preliminary backend configuration.

The interactive map, station dashboards, and time-series
interface have not yet been implemented.

These requirements describe the intended product and
will be updated as development and stakeholder feedback
progress.
