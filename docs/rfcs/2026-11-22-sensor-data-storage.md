
# RFC: Optimizing Sensor Time-Series Queries in Farm2Table's MongoDB

| Field | Value |
| --- | --- |
| Author | Thao Nguyen |
| Date | 2026-10-25 |
| Latest Update Date | 2026-11-22 |
| Status | Accepted |
| Decision Date | 2026-10-30 |
| Deciders | Whole Team, Team Partner |
| Superseded By | N/A |

## Problem and Context

Farm2Table is an interactive web application developed with OSU's College of Agricultural Sciences and OPEnS Lab to visualize agricultural sensor data. The sensors collect environmental measurements such as soil moisture, temperature, and humidity. Farm2Table stores these readings so users can view historical trends, compare measurements across stations, and export data for further analysis.

Farm2Table already uses MongoDB as its database, which is managed by OPEnS Lab. The remaining decision is how to optimize sensor time-series queries within the existing infrastructure while respecting our read-only database access. Our main features, including plots ranging from 24 hours to a full growing season, station comparisons, and CSV exports, depend on how efficiently the backend retrieves readings over a selected time range.

As the number of sensors and stored readings increases, longer queries may become slower. For example, a sensor recording every 15 minutes generates 96 readings per day, or approximately 17,280 readings over a 180-day growing season. With multiple sensors and stations, the amount of data grows quickly. This is an illustrative estimate, not a measurement of the current Farm2Table database.

This decision becomes harder to reverse as development progresses. Once the API, plotting components, and export functionality depend on a particular query design, changing it could require rewriting backend logic and retesting multiple features. Making the decision now reduces the risk of performance problems appearing after those features are completed.

If we do nothing, Farm2Table will continue using its existing MongoDB queries. These may be sufficient for short time ranges, but their performance on full-season queries has not yet been verified.

## Options

### Option A: MongoDB Time-Series Collections

MongoDB provides specialized time-series collections designed for measurements recorded over time. These collections group related readings into internal buckets based on timestamps and metadata.

For Farm2Table, we could use station and sensor IDs as metadata, with timestamps identifying when measurements were collected.

**Benefits:**
- Keeps MongoDB as the main database.
- Uses storage features designed for time-series workloads.
- May improve query performance and storage efficiency.
- Allows the team to reuse existing MongoDB infrastructure and knowledge.

**Costs:**
- Requires creating new collections and migrating existing readings.
- Requires changes to data ingestion and query logic.
- Requires testing compatibility with our current database version and schema.

This option is appropriate if the current database fails our performance targets, even after optimization, but MongoDB remains acceptable to the partner.

MongoDB's documentation explains how time-series collections group measurements using metadata to improve storage and query efficiency [1].

### Option B: PostgreSQL with TimescaleDB

PostgreSQL is a relational database, while TimescaleDB provides features for managing time-series data. It organizes measurements into time-based partitions called hypertable chunks.

Farm2Table could store sensor readings in TimescaleDB and use PostGIS for geographic queries.

**Benefits:**
- Supports time-based queries over large historical datasets.
- Provides relational joins between stations, sensors, and measurements.
- Offers geographic capabilities through PostGIS.
- May support more complex data analysis in the future.

**Costs:**
- Requires learning and maintaining another database technology.
- Introduces additional hosting, backups, and credentials.
- Requires rewriting the data access layer.
- Creates additional migration and integration risks.

This option could be appropriate if MongoDB cannot meet our performance or data-modeling requirements. However, Farm2Table has already committed to MongoDB, and the database infrastructure is managed by OPEnS Lab. Moving to TimescaleDB would require partner approval, additional hosting, and significant changes to the backend. Therefore, this option is not recommended under our current project constraints.

### Option C: Do Nothing

Keep the existing MongoDB collections and queries without making structural changes.

**Benefits:**
- No migration or new infrastructure is required.
- Preserves compatibility with the existing system.
- Allows the team to focus on implementing application features.
- Has the lowest immediate development cost.

**Costs:**
- Long-range queries may become slow as the dataset grows.
- Existing queries may scan more documents than necessary.
- Performance problems could be discovered late in development.

This option is appropriate if measurements show that the current database already meets our performance requirements.

Doing nothing should still involve testing. Otherwise, we would be accepting an unknown performance risk rather than making an informed decision.

### Option D: Optimize Existing MongoDB Queries

Keep the existing MongoDB database and collections but improve how the Farm2Table backend retrieves and processes sensor data.

Possible improvements include optimizing aggregation pipelines, retrieving only necessary fields, reducing redundant queries, and limiting the amount of data sent to the frontend.

**Benefits:**
- Reuses the existing MongoDB infrastructure.
- Does not require database migration or additional hosting.
- Works within Farm2Table's read-only database access.
- May improve performance without changing the partner's collections.

**Costs:**
- Requires reviewing and updating existing backend queries.
- Query optimization may not fully resolve performance issues caused by the current timestamp format.
- Performance improvements must be measured and verified.
- Database-level changes, such as adding indexes, require approval from OPEnS Lab.

This option is appropriate if the existing database can meet our performance requirements through backend improvements without modifying the partner's database.

MongoDB documentation explains how aggregation pipelines, projections, and query execution statistics can help identify and reduce unnecessary processing [3][4].

## Analysis

The main factors influencing this decision are performance, complexity, maintainability, security, and cost.

### Performance

The current Farm2Table backend retrieves sensor readings from MongoDB collections owned by OPEnS Lab. Since timestamps are stored as strings, the backend uses `$dateFromString` when filtering readings by time.

This prevents ordinary timestamp indexes from being used effectively for these queries and may cause full collection scans.

Because Farm2Table only has read-only database access, our team cannot directly create indexes or modify the existing collections. Therefore, query optimization must focus on improvements within the backend, while database-level changes require approval from OPEnS Lab.

Farm2Table must support both short-range and full-season queries. A query covering 24 hours may retrieve relatively few measurements, while a full-season request involving several stations could retrieve tens or hundreds of thousands of readings.

Option A uses MongoDB's time-series storage features, which group related measurements into buckets. Option B uses TimescaleDB hypertables to partition data by time. Both approaches are designed for time-series workloads, but neither guarantees better performance without testing our actual data and queries. Both would also require changes to the partner-controlled database infrastructure.

Option C requires no additional development work, but we do not yet know whether the existing queries can efficiently support full-season requests.

Option D allows us to improve the existing backend without modifying the database structure. We can optimize aggregation pipelines, avoid retrieving unnecessary fields, and reduce the amount of data transferred to the frontend.

However, some performance limitations may remain because timestamp conversion happens during queries. If backend optimization is insufficient, the team would need to discuss possible database-level improvements with OPEnS Lab.

Another concern is the amount of data sent to the browser. Even if the database retrieves a large dataset quickly, sending every measurement to the frontend may slow graph rendering.

For visualization, we can reduce the number of points returned while preserving important trends. CSV exports, however, should retain the complete data.

Project evidence: `backend/src/db/stations.js`.

### Complexity and Maintainability

Our team is developing the application within a limited academic project timeline. We are also responsible for implementing visualization, APIs, and integration with the existing system.

Option B introduces the largest maintenance burden because it requires another database technology and changes to the data layer.

Option A is less disruptive because it keeps MongoDB, but migration and schema changes still require development and testing.

Options C and D are simpler because they preserve the current database architecture. Option D requires additional optimization work but avoids a major migration.

To reduce future migration costs, the backend should expose a consistent data retrieval function:

`getSeries(station, variable, from, to)`

The frontend should receive data through this API rather than depending directly on database-specific queries. If we later change storage systems, we would mainly need to update the backend implementation.

### Security and Cost

Options A, C, and D use the existing MongoDB infrastructure, so they do not inherently require additional database hosting.

Option B introduces another technology that requires credentials, backups, access controls, and potentially additional hosting expenses.

Regardless of the option, the application must protect database credentials and follow the partner's data access requirements.

Development time is also a cost. A more powerful database may not be worthwhile if implementing and maintaining it takes time away from the application's main features without providing a measurable benefit.

### Comparison

| Option | Code Reuse | New Hosting | Migration Effort | Main Risk |
| --- | --- | --- | --- | --- |
| A. MongoDB Time Series | High | No | Medium | Requires partner approval and migration |
| B. TimescaleDB | Low | Yes | High | Conflicts with existing infrastructure |
| C. Do Nothing | Full | No | None | Unmeasured performance |
| D. Optimize MongoDB Queries | Very High | No | None | Limited by read-only access |

These ratings are architectural estimates rather than measured benchmark results.

Based on the current project constraints, Option D offers the best balance between potential performance improvement and implementation risk. Since the database belongs to OPEnS Lab, improving backend queries is more practical than changing the database structure.

## Recommendation and Verification Plan

I recommend **Option D: Optimize Existing MongoDB Queries**.

Farm2Table will continue using the MongoDB database provided by OPEnS Lab. Instead of changing the database schema or migrating to another system, we will focus on improving how the backend retrieves and processes sensor measurements.

This approach works within our read-only database access and avoids introducing unnecessary infrastructure changes.

Option C will serve as our performance baseline. We will compare the current queries against optimized versions using both 30-day and full-season workloads.

If backend optimization cannot meet our performance targets, we will discuss database-level improvements with OPEnS Lab, including possible indexing or time-series storage changes.

The verification tests below will determine whether the selected approach is successful.

### Verification Procedure

Testing should use representative sensor datasets containing multiple stations, measurement types, timestamps, and missing readings.

If actual partner data is unavailable, we can use clearly labeled synthetic data for preliminary tests. However, the final decision should be validated against representative authorized data when available.

All options should use equivalent datasets and queries so their results can be compared fairly.

### Test 1: 30-Day Query Performance

Run a query covering:
- 30 days of readings.
- Three stations.
- Two measurement types.

The proposed acceptance target is a 95th-percentile response time under one second.

Run at least 30 requests after warming up the database and record the response times. Calculating the 95th percentile will help identify inconsistent performance rather than relying on a single successful request.

### Test 2: Full-Season Query Performance

Run the same type of query over an entire growing season.

For initial testing, use a representative 180-day period. If the actual required season is longer, repeat the test using that complete period.

The proposed acceptance targets are:
- A 95th-percentile API response time under three seconds.
- No query timeouts or retrieval errors.
- Complete and correctly ordered results.

As with the 30-day test, we will run at least 30 requests after warming up the database and calculate the 95th-percentile response time.

This test addresses the concern that a database may perform well for 30-day queries but struggle when processing an entire season.

The performance targets are proposed values and should be confirmed with the team and partner.

### Test 3: Visualization Data Size

A full-season plot should send no more than 1,000 points per series to the browser.

The data reduction method should preserve important trends and avoid turning missing measurements into misleading values.

This test ensures that acceptable database performance does not hide a separate frontend rendering problem.

### Test 4: CSV Export Correctness

Export measurements to CSV and compare them with the original stored readings.

Verify:
- Timestamps and time zones.
- Measurement values and units.
- Station and sensor identifiers.
- Missing measurements.

The CSV export should preserve full-resolution readings, even when the graph uses reduced data.

### Test 5: Migration Validation

If the team later chooses Option A or B, rehearse the migration using a copy of the dataset.

Compare document or row counts, timestamp ranges, station identifiers, and per-series checksums before and after migration.

Any discrepancies must be investigated before switching the application to the new storage system.

### Failure Response and Rollback

If Option D fails the performance targets, we will inspect query execution statistics and identify whether the bottleneck comes from aggregation, timestamp conversion, or excessive data retrieval.

We will first attempt improvements that do not require database modifications. If these are insufficient, we will discuss possible indexing or storage changes with OPEnS Lab.

Since Option D does not require migrating data, rollback involves restoring the previous backend query implementation. Any future database-level migration would require a separate validation and rollback plan approved by the partner.

The decision will be considered successful when the optimized queries meet the agreed performance and correctness requirements.

## Constraints

### Licensing

Farm2Table inherits parts of its architecture from Ear2Earth. Before changing database technologies, the team must verify any applicable licensing and infrastructure requirements.

If we consider TimescaleDB, we must also review its licensing and deployment conditions.

These constraints favor keeping MongoDB unless another option offers a demonstrated benefit.

### Data Use and Confidentiality

Sensor data provided by the partner must be handled according to the partner's permissions.

Only approved data should be included in public repositories, course submissions, and demonstrations. Raw data and database credentials should not be committed without authorization.

If real measurements cannot be shared, the team should use synthetic datasets for development and public testing.

This also limits the conclusions we can draw from preliminary benchmarks until representative authorized data is available.

### Intellectual Property

Our code and documentation must follow the course and partner agreements.

Any migration or redistribution of inherited components must respect those requirements.

### Operational Requirements

Farm2Table uses a MongoDB database owned and maintained by OPEnS Lab. Our application has read-only access, meaning the team cannot directly modify collections, create indexes, or change the database schema.

This constraint rules out independently implementing database-level changes. Any migration to MongoDB time-series collections or another database would require coordination and approval from OPEnS Lab.

Therefore, the selected approach focuses on optimizing backend queries without changing the existing database.

Testing should use representative datasets and should not interfere with partner-controlled services.

## Delegation and Validation

### AI-Assisted Work

I used AI tools to help summarize MongoDB and TimescaleDB documentation, organize the database alternatives, and improve the structure and clarity of this RFC.

AI assistance was also used to identify possible technical tradeoffs and develop verification criteria.

The selected approach has been accepted, but its performance improvements have not yet been verified through benchmarks.

### Documentation Checks

The technical claims about MongoDB time-series collections, compound indexes, and query execution statistics are supported by MongoDB documentation [1][3][4].

The discussion of TimescaleDB hypertables is based on its technical documentation [2].

These sources describe database capabilities, but they do not establish which option will perform best for Farm2Table.

### Manual Validation

Before implementing a change, the following points require direct validation:

- **Database schema:** Inspect actual station, sensor, timestamp, and measurement fields before designing indexes or time-series metadata.
- **Query performance:** Run the proposed benchmarks instead of assuming optimization will improve performance.
- **Data correctness:** Compare plotted values and CSV exports with the source measurements.
- **Migration integrity:** Compare record counts and checksums before switching storage systems.
- **Partner requirements:** Confirm that the proposed implementation is compatible with the inherited infrastructure.

The most important validation points are schema design, query performance, and migration correctness because mistakes in these areas could cause incorrect graphs, lost readings, or major rework.

The team will document the results of these checks to verify whether the accepted approach meets our performance and correctness requirements. If the results reveal significant limitations, we will revisit the decision.

## Decision

**Status: Accepted**

Farm2Table will continue using MongoDB as its database, with **Option D: Optimize Existing MongoDB Queries** as the selected approach.

Rather than modifying the partner's database or migrating to another system, the team will focus on improving backend aggregation pipelines, reducing unnecessary data retrieval, and optimizing how sensor measurements are processed for visualization.

We will evaluate these improvements using both 30-day and full-season queries to determine whether they meet our performance targets.

If backend optimization is insufficient, we will discuss possible database-level improvements with OPEnS Lab.

This approach allows Farm2Table to improve performance while remaining compatible with the existing MongoDB infrastructure and respecting the partner's database ownership.

## References

[1] MongoDB. *About Time Series Data.*  
https://www.mongodb.com/docs/manual/core/timeseries/timeseries-bucketing/

[2] Tiger Data. *Understand Hypertables.*  
https://www.tigerdata.com/docs/use-timescale/latest/hypertables

[3] MongoDB. *Compound Indexes.*  
https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/

[4] MongoDB. *Interpret Explain Plan Results.*  
https://www.mongodb.com/docs/manual/tutorial/analyze-query-plan/

[5] MongoDB. *Time Series Collection Best Practices.*  
https://www.mongodb.com/docs/manual/core/timeseries/timeseries-best-practices/

---

## Revision Log

| Source | Feedback | Decision | Where or Why |
| --- | --- | --- | --- |
| Alexander Jiang | Provide more context about the sensors and explain how Farm2Table uses the stored data. | Changed | Problem and Context: added examples of sensor measurements and explained how historical data supports visualization, station comparisons, and CSV exports. |
| Alexander Jiang | Include the expected amount of sensor data and explain why query speed matters. | Changed | Problem and Context: added an example of data volume over a growing season and explained how larger datasets affect query performance. |
| Alexander Jiang | Consider improving the existing database setup through indexing and query optimization. | Changed | Options: added Option D, which focuses on optimizing backend MongoDB queries without modifying the partner-owned collections. |
| Alexander Jiang | Improve PDF formatting because Markdown syntax was visible. | Changed | Kept the RFC in Markdown and used proper Markdown rendering when exporting the final PDF. |
| Christopher Lopez | Test full-season queries instead of focusing only on 30-day queries. | Changed | Recommendation and Verification Plan: added a full-season performance test using a representative 180-day period. |
| Christopher Lopez | Verify that the database can handle the larger amount of data required for full-season plots. | Changed | Recommendation and Verification Plan: added response-time targets, repeated performance tests, and visualization data limits. |
| TA | Add more project introduction and context so readers unfamiliar with Farm2Table can understand the decision. | Changed | Problem and Context: added a brief explanation of Farm2Table, its sensors, and how the stored data supports visualization and analysis. |
| TA | Verify the licensing, data use, intellectual property, and confidentiality constraints. | Changed | Constraints: clarified how each requirement affects database selection and identified checks needed before migration. Partner-specific requirements still need confirmation. |
| TA | Add cited evidence and references to support technical claims. | Changed | Analysis and References: added documentation from MongoDB and TimescaleDB to support the database comparison. |
