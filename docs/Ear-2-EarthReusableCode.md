## MongoDB Queries

### Collections (`/collections`)
Each collection is a device (sensor station).

```js
const database = mongoclient.db(databaseName);
const collectionsList = await database.listCollections().toArray();
const collectionNames = collectionsList.map(col => col.name);
```

### Earliest and latest timestamp (`/date-range`)
Returns the earliest and latest dates with data, so the user doesn't have to guess how far back they can see.

```js
const [doc] = await col.aggregate([
  {
    $project: {
      t: {
        $dateFromString: {
          dateString: "$Timestamp.time_local",
          onError: null,
          onNull: null,
        },
      },
    },
  },
  { $match: { t: { $ne: null } } },
  { $group: { _id: null, minDate: { $min: "$t" }, maxDate: { $max: "$t" } } },
]).toArray();

// doc → { minDate, maxDate }, or undefined if the collection is empty
```

### Packets in a time range (`/data?startTime=&endTime=`)
The user selects a time range, and data from that period is retrieved.

```js
const start = new Date(startTime);
const end = new Date(endTime);

const packets = (
  await collection.aggregate([
    {
      $addFields: {
        _t: {
          $dateFromString: {
            dateString: "$Timestamp.time_local",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    { $match: { _t: { $gte: start, $lt: end } } },
    { $sort: { _t: -1 } },
    { $project: { _t: 0, Packet: 0, WiFi: 0 } },
  ]).toArray()
).reverse();
```

### Last X packets (`/data?x=`)
The user can ask to see the last "X" packets.

```js
const packets = (
  await collection
    .find({}, { projection: { Packet: 0 } })
    .sort({ "Timestamp.time_local": -1 })
    .limit(x)
    .toArray()
).reverse();
```

### Deployment metadata (`/metadata`)
Information about a deployment: when a station was put in, where it is physically located (longitude/latitude), and who runs the station.

```js
const collections = await database.listCollections().toArray();
let packet = null;

for (const c of collections) {
  packet = await database.collection(c.name).findOne({ type: "metadata" });
  if (packet) break;
}
```

---

## Reuse Opportunities

### A. Data retrieval — High reuse potential
**Source:** `server.js` — `/data`, `/databases`, `/collections`

Ear2Earth already uses Express and the MongoDB driver to retrieve sensor readings, including recent packets and custom time ranges. Farm2Table can adapt these queries to retrieve measurements when a user selects a station on the map.

### B. Time-series plots — High reuse potential
**Source:** `index.js`

Ear2Earth already creates Plotly charts with zooming, panning, and measurement inspection. It also includes synchronized x-axis behavior in `syncThisPlot()`. The charting logic could be extracted into a reusable Farm2Table chart component, separate from the existing sound controls.

### C. Date-range selection — High reuse potential
**Source:** `server.js` — `/date-range`; `index.js` — `setDateBoundsForSelection()`

Ear2Earth can retrieve the earliest and latest available readings for a sensor dataset and supports custom date selection. Farm2Table can extend this with presets for 24 hours, 7 days, 30 days, and growing seasons.

### D. CSV export — High reuse potential
**Source:** `index.js` — `generateCSV()`

It already produces CSV data from plotted measurements. Farm2Table can adapt this to export selected stations, variables, and time ranges, with clearer unit and timezone handling.
