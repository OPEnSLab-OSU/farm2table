# Farm2Table Sample Sensor Data

This directory contains environmental sensor datasets for development
and testing of the Farm2Table application.

## Data Source

Source: U.S. Bureau of Reclamation — AgriMet

Station: CRVO (Corvallis, Oregon)
Period: October 1–31, 2026
Frequency: Hourly

Original data:
[https://www.usbr.gov/pn-bin/instant.pl?station=CRVO](https://www.usbr.gov/pn-bin/instant.pl?station=CRVO&year=2026&month=10&day=1&year=2026&month=10&day=31&pcode=OBM&pcode=TU&pcode=WD&pcode=WG&pcode=SI&pcode=PC&print_hourly=1)

## Datasets

- `agrimet-crvo-october-2026.json`: Full October dataset with
  744 hourly observations.
- `agrimet-crvo-first-week.json`: Smaller sample containing
  168 hourly observations.
- `simulated-soil-moisture-october-2026.json`: Synthetic soil
  moisture readings generated for testing.

## Measurements

| Code | Measurement | Original Unit |
|---|---|---|
| OBM | Air temperature | °F |
| TU | Relative humidity | % |
| WD | Wind direction | Degrees |
| WG | Peak wind gust | mph |
| SI | Solar radiation | Langleys/hour |
| PC | Cumulative precipitation | Inches |

The converted dataset also provides derived measurements,
including temperature in Celsius and hourly precipitation.

## Simulated Data

The soil moisture measurements are **synthetic** and were not
recorded by the CRVO AgriMet station.

They are intended to help test agricultural sensor visualizations
until real sensor data is available.

## Usage

The JSON files can be loaded by Farm2Table's frontend or
used in tests without requiring a database connection.

The first-week dataset is recommended for initial development.
The full-month dataset can be used to test longer date ranges.

## Limitations

- AgriMet observations are preliminary and may be revised.
- The dataset represents one station, not multiple locations.
- Cumulative precipitation should not be treated as hourly rainfall.
- The client data format may change after coordination with Rory
  and the Farm2Table team.
