# Farm2Table - Risk Register

This document tracks risks that may affect the development
and delivery of Farm2Table.

**Last Updated:** November 20, 2026

## Risk 1: Delays in Frontend Design and Integration

- **Status:** Open
- **Priority:** High
- **Identified:** November 20, 2026
- **Owner:** Farm2Table Team

### Description

Although backend data retrieval, dynamic sensor selection,
and interactive Plotly graphs have been implemented, the
final Figma design has not yet been approved by the project
partner.

### Impact

Delays in finalizing the frontend design could result in
additional development effort and delay the delivery of
an integrated application.

### Mitigation

- Finalize the Figma design with the project partner.
- Continue developing reusable frontend components.
- Maintain communication between team members.
- Conduct regular integration testing.

### Decision Needed

The team and project partner must review, finalize, and
approve the Figma design so that frontend development
can proceed with agreed-upon design requirements.

**Needed by:** December 4, 2026.

## Risk 2: Performance with Large Sensor Datasets

- **Status:** Open
- **Priority:** Medium
- **Identified:** November 20, 2026
- **Owner:** Farm2Table Team

### Description

Increasing volumes of historical sensor data may affect
API performance and graph rendering.

### Impact

Large datasets could reduce application responsiveness,
particularly on the planned touchscreen kiosk.

### Mitigation

- Implement data aggregation and downsampling.
- Optimize historical data queries.
- Conduct performance testing with larger datasets.

## Risk 3: Lack of Database Access

- **Status:** Resolved
- **Priority:** High
- **Identified:** October 25, 2026
- **Resolved:** November 19, 2026
- **Owner:** Farm2Table Team

### Resolution

Database access has been established, and the project
partner has populated MongoDB with synthetic sensor data.
The team has successfully implemented and tested sensor
data retrieval, dynamic sensor discovery, and historical
data visualization.

## Other Risks

Additional risks will be documented as they are identified.
