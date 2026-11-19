<!-- docs/rfcs/YYYY-MM-DD-short-title.md (or docs/adr/, whichever your repo uses) -->

# RFC: Selecting a Time-Series Data Aggregation and Downsampling Strategy for Farm2Table

<!-- Decision record header. Leave Status as "Draft" while the RFC is under review.
     When your team decides, fill in the outcome and the decision date. The
     document stays where it is; this header is what makes it a record. -->

| Field | Value |
|---|---|
| Author | Son Thai Do Nguyen |
| Date | 2026-10-25 |
| Last Updated | 2026-11-18 |
| Status | Proposed |
| Decision Date | TBD |
| Deciders | Farm2Table Team and Project Partner |
| Superseded By | N/A |

## Problem and Context

Farm2Table is an interactive web application developed in collaboration with the OPEnS Lab at Oregon State University. The project aims to make agricultural and environmental sensor data more accessible to researchers, farmers, students, and visitors. Users will be able to explore sensor locations, view current environmental conditions, compare measurements across stations, and analyze historical trends.

The application will visualize measurements such as soil moisture, temperature, humidity, rainfall, and wind conditions. It is also intended to support a touchscreen kiosk running Android, making visualization performance and responsiveness important for the user experience.

Environmental sensors may continuously transmit measurements throughout the day. Assuming a five-minute sampling interval, each sensor measurement could produce approximately 288 data points per day, 8,640 per month, and 105,120 per year. When users compare multiple sensors or stations over extended periods, the amount of data transferred and displayed can increase significantly.

Since the initial RFC draft, the team has established MongoDB access, developed backend logic for retrieving and parsing sensor data, and prepared preliminary synthetic datasets for development and testing. As the team moves toward implementing time-series visualization, it must decide how historical measurements should be processed before being displayed.

The main challenge is reducing data volume without losing meaningful environmental information, such as sudden rainfall events, temperature extremes, or changes in soil moisture.

This decision is currently reversible because the original measurements can remain unchanged in MongoDB. However, changing the aggregation strategy after the API and visualization components are implemented could require significant rework.

Without a defined strategy, Farm2Table may experience slow loading times, excessive data transfer, and reduced responsiveness when displaying long time ranges. An inappropriate aggregation method could also hide important environmental events and lead users to misinterpret the data.

## Options

### Option A: Return Raw Measurements (Do Nothing)

Retrieve and display all original sensor readings without applying aggregation or downsampling. The backend returns every available measurement within the selected time range.

**Benefits:** Preserves complete measurement details, requires minimal additional processing, and simplifies verification against the original database records.

**Costs:** Large datasets may increase network usage, API response times, and browser rendering overhead. These limitations may become more noticeable on the Android touchscreen kiosk.

**When to choose:** This option is appropriate when users explore short time ranges, the number of measurements is relatively small, or every individual reading needs to remain visible.

### Option B: Fixed-Interval Aggregation

Group measurements into predefined time intervals, such as 15 minutes, one hour, or one day. Calculate representative values for each interval based on the measurement type.

**Benefits:** Reduces the amount of data transferred and displayed, improves the potential responsiveness of historical visualizations, and provides predictable data resolution. It is also relatively straightforward to implement and maintain.

**Costs:** Aggregation may hide sudden environmental changes or extreme values. Different measurements require different aggregation functions, such as averaging temperature and summing incremental rainfall.

**When to choose:** This option is appropriate when users primarily explore historical trends and the team needs a manageable solution that balances performance, accuracy, and development effort.

### Option C: Adaptive Downsampling

Automatically adjust the number of displayed data points based on the selected time range, available measurements, or chart dimensions.

**Benefits:** Provides greater flexibility across different time ranges and screen sizes. Users can explore longer periods without necessarily displaying every original measurement.

**Costs:** Requires more complex backend and frontend coordination. Changes in visualization resolution may also make comparisons less consistent unless the application clearly communicates how the data was processed.

**When to choose:** This option is appropriate when fixed aggregation intervals cannot adequately support different time ranges, screen sizes, or levels of user interaction.

### Option D: Feature-Preserving Downsampling

Select representative measurements while preserving important features, such as peaks, drops, and sudden changes. Unlike averaging, this approach prioritizes retaining the original visual characteristics of a time series.

**Benefits:** Preserves meaningful environmental events while reducing the number of displayed measurements. This may help users identify unusual conditions or sudden changes in sensor readings.

**Costs:** Requires more sophisticated algorithms and additional validation. Preserving visual patterns does not necessarily preserve statistical properties, such as averages or cumulative rainfall totals.

**When to choose:** This option is appropriate when identifying extreme values and short-duration environmental events is more important than displaying consistent aggregated summaries.

## Analysis

### Data Accuracy

The primary concern when reducing sensor data is preserving meaningful environmental information. Aggregation combines multiple measurements into a summarized value, while downsampling reduces the number of points used to represent a time series.

Option A preserves every original measurement, making it the most accurate representation of the collected data. However, displaying thousands of measurements may be unnecessary when users only want to understand long-term trends.

Option B reduces data volume through fixed time intervals. However, the aggregation function must reflect the meaning of each measurement. Temperature and soil moisture can generally be summarized using averages, while incremental rainfall measurements should be summed. Minimum and maximum values should also be retained where necessary to preserve extreme environmental conditions.

Option C provides greater flexibility by adjusting the resolution based on user-selected time ranges or available display space. However, changing resolutions may introduce inconsistencies when comparing measurements.

Option D prioritizes preserving the visual characteristics of a time series through algorithms such as MinMax, LTTB, and MinMaxLTTB. These methods support scalable visualization but do not necessarily preserve statistical properties such as averages or cumulative rainfall totals (Van Der Donckt et al., 2025).

### Technical Complexity and Maintainability

Farm2Table currently uses MongoDB for data storage and an Express.js backend for retrieving and parsing sensor measurements. The existing parser dynamically identifies available sensors rather than relying on a fixed set of sensor names.

During development, the team generated three preliminary synthetic datasets containing 504 sensor packets. Local testing against the backend parser produced 5,040 individual readings without invalid-value flags. All 32 existing backend tests also passed. However, some measurement names and units still require confirmation from the project partner.

Option B could build upon this existing architecture by introducing a reusable aggregation module after measurements have been parsed. This would separate data-processing logic from visualization components and reduce duplicated implementation.

Options C and D introduce additional complexity because they require resolution-selection logic or specialized point-selection algorithms.

### Performance and Cost

Assuming a five-minute sampling interval, the estimated number of data points for a single measurement is:

| Time Range | Raw Points | Aggregated Points | Reduction |
|---|---:|---:|---:|
| 24 hours | 288 | 288 | 0% |
| 7 days | 2,016 | 672 | 66.7% |
| 30 days | 8,640 | 720 | 91.7% |
| 90 days | 25,920 | 90 | 99.7% |

These estimates assume complete and regularly sampled measurements. They represent reductions in displayed data points rather than measured improvements in API response times.

The team is considering Plotly.js for interactive time-series visualization. Van Der Donckt et al. (2025) demonstrate the potential performance benefits of integrating downsampling techniques with Plotly-based visualization tools.

Backend aggregation could reduce network transfer and browser processing, although it would introduce additional server-side computation.

Manojlović and Erdeljan (2017) demonstrate that temporal aggregation can improve the efficiency of processing and retrieving large volumes of continuously collected sensor data. Their findings support using predefined time intervals and multiple aggregation functions to reduce data volume while retaining useful information.

Ortigossa et al. (2025) highlight that visualizing large time-series datasets can introduce visual clutter and reduce interpretability. Interactive visualization at different levels of detail can help users explore complex datasets more effectively. These findings support Farm2Table's proposed approach of displaying summarized historical measurements while allowing access to more detailed readings.

### Security and Infrastructure

All four options must operate within the partner's existing database infrastructure and access restrictions. Aggregation should be performed through authorized backend services without exposing database credentials to the frontend.

Option B does not require permanent changes to the original MongoDB collections or additional external processing services. This makes it a practical initial approach while minimizing infrastructure changes and preserving the ability to switch strategies later.

Actual performance and infrastructure costs remain uncertain until aggregation and visualization benchmarks have been conducted.

## Recommendation and Verification Plan

I recommend **Option B: Fixed-Interval Aggregation** for the initial implementation of Farm2Table because it provides a reasonable balance between performance, data accuracy, technical complexity, and maintainability.

This approach allows the team to reduce the amount of data displayed without introducing complex downsampling algorithms during the early stages of development. It is particularly suitable for the planned touchscreen kiosk, where responsiveness and ease of interaction are important.

The proposed aggregation resolutions are:

| Time Range | Resolution |
|---|---|
| Up to 24 hours | Raw measurements |
| Up to 7 days | 15-minute intervals |
| Up to 30 days | Hourly intervals |
| Longer periods | Daily intervals |

These resolutions are preliminary and may be adjusted based on testing and stakeholder feedback.

Aggregation should be implemented as a reusable backend module. The frontend should receive processed measurements along with their timestamps, units, and aggregation intervals.

### Verification Plan

**Check 1: Aggregation Correctness**

Compare aggregated results against independently calculated values from the original datasets. Temperature and soil moisture averages, rainfall totals, and minimum and maximum values should match the reference calculations within an appropriate numerical tolerance.

**Check 2: Performance**

Measure API response times, response sizes, and chart rendering times using raw and aggregated datasets. Test with 24-hour, 7-day, and 30-day time ranges.

The initial targets are:

- API response time below 1 second.
- Initial chart rendering below 2 seconds on the target kiosk.
- At least 90% reduction in displayed data points for a complete 30-day dataset sampled every five minutes.

These are proposed acceptance criteria rather than measured results.

**Check 3: Environmental Event Preservation**

Create test datasets containing known rainfall events, temperature extremes, and sudden soil moisture changes.

Aggregated rainfall totals should match the original incremental rainfall totals within 1%. Significant temperature and soil moisture changes should remain identifiable through retained minimum and maximum values.

If important events become indistinguishable, the aggregation interval or calculation method should be reconsidered.

**Check 4: Missing and Irregular Data**

Test datasets containing missing measurements, duplicate timestamps, invalid values, and irregular sampling intervals.

Missing measurements must not be automatically treated as zero. Intervals without valid readings should be represented as missing data rather than fabricated values.

**Check 5: Visualization and Usability**

Use the planned Plotly visualization to compare raw and aggregated time-series charts. Verify that timestamps, measurement units, aggregation intervals, and selected date ranges are displayed correctly.

Test chart interactions on the Android touchscreen kiosk to ensure that users can navigate historical readings without relying on mouse-hover functionality.

**Check 6: Data Export and Reversibility**

Verify that CSV exports, if implemented, clearly identify whether the exported measurements are raw or aggregated.

The original MongoDB measurements must remain unchanged and accessible.

### Failure and Reconsideration

If fixed-interval aggregation repeatedly fails to meet the performance targets, the team should investigate Option C. If it fails to preserve important environmental events, Option D should be considered.

The final aggregation strategy should be evaluated using representative CHIMES data and confirmed with the project partner before being treated as an accepted decision.

## Constraints

### Data Ownership and Integrity

The original sensor measurements are owned and maintained by OPEnS Lab. Farm2Table must not modify or delete these measurements without authorization. Therefore, aggregation should process copies of the retrieved data rather than permanently replacing the original database records.

### Licensing

External libraries used for data processing and visualization must have licenses compatible with the project. Any additional dependencies introduced for aggregation or downsampling must be reviewed before adoption.

### Data Quality

Sensor measurements may contain missing values, irregular timestamps, inconsistent units, or invalid readings. The aggregation module must account for these conditions to avoid producing misleading summaries.

Different measurement types also require different aggregation functions. A single calculation method cannot be applied to every sensor.

### Confidentiality and Security

Database credentials and restricted sensor data must not be exposed publicly or shared with unauthorized AI tools. Database access and aggregation should be handled through the backend.

### Infrastructure and Compatibility

The solution must remain compatible with the existing MongoDB database and Express.js backend. It should also support the planned touchscreen kiosk without requiring unnecessary infrastructure changes.

These constraints support Option B because fixed-interval aggregation can be implemented within the existing architecture while preserving the original measurements and minimizing additional dependencies.

## Delegation and Validation

### AI Delegation

ChatGPT was used to assist with organizing the RFC, researching aggregation and downsampling strategies, comparing technical tradeoffs, and developing the proposed verification plan. AI also assisted with generating preliminary synthetic sensor datasets for development and testing.

The final recommendation was based on the project's requirements, available infrastructure, development progress, and technical constraints rather than relying solely on AI-generated suggestions.

### Personal Validation

I personally performed the following validation activities:

- Calculated the estimated number of measurements and data reduction percentages using the assumed five-minute sampling interval.
- Explored existing MongoDB collections to understand sensor packet structures and measurement formats.
- Validated the structure of three generated JSON datasets containing 504 synthetic sensor packets.
- Tested the datasets against the existing backend parser, which successfully produced 5,040 individual readings without invalid-value flags.
- Ran the backend test suite and confirmed that all 32 tests passed.

Testing the generated datasets against the existing parser was particularly important because incorrect field names, measurement units, or data structures could lead to inaccurate aggregation results and misleading visualizations.

### Validation Limitations

Although the preliminary datasets were successfully parsed, some sensor field names and measurement units still require confirmation from the project partner.

The proposed aggregation strategy has not yet been implemented or benchmarked. The estimated performance improvements and acceptance criteria must therefore be verified using representative sensor data and the planned Plotly visualization.

AI-generated recommendations and datasets should remain subject to human review before being incorporated into the final implementation.

## Decision

**Status:** Proposed.

Option B: Fixed-Interval Aggregation is recommended as the initial approach for processing historical sensor measurements in Farm2Table.

The recommendation is based on the current project requirements, existing backend architecture, available sensor datasets, and the need to support responsive time-series visualization on the planned touchscreen kiosk.

The team has not formally accepted or rejected this proposal. Implementation and performance validation are still pending.

The decision status and decision date will be updated once the team and project partner reach an agreement. The original sensor measurements will remain unchanged to ensure that alternative strategies can be adopted if necessary.

## References

### External Sources

- Manojlović, I., & Erdeljan, A. (2017). Efficient Aggregation of Time Series Data. Proceedings of the 7th International Conference on Information Society and Technology (ICIST 2017), pp. 102–107.

- Ortigossa, E. S., Dias, F. F., Nascimento, D. C., & Nonato, L. G. (2025). Time Series Information Visualization - A Review of Approaches and Tools. IEEE Access, 13. https://doi.org/10.1109/ACCESS.2025.3609404

- Van Der Donckt, J., Van Der Donckt, J., & Van Hoecke, S. (2025). tsdownsample: High-performance time series downsampling for scalable visualization. SoftwareX, 29, 102045. https://doi.org/10.1016/j.softx.2025.102045

### Internal Project Sources

- Farm2Table Project Requirements (`docs/requirements.md`).
- Farm2Table Technical Design (`docs/design.md`).
- Backend Sensor Parser (`backend/src/db/translate.js`).
- Synthetic Sensor Datasets (`data/roundhouse/generated/`).
- Backend Tests and Local Validation Results, November 2026.






