const test = require('node:test');
const assert = require('node:assert/strict');

const fullData = require('../data/agrimet-crvo-october-2026.json');
const weeklyData = require('../data/agrimet-crvo-first-week.json');
const soilData = require('../data/simulated-soil-moisture-october-2026.json');

test('all datasets load successfully', () => {
    assert.ok(fullData.metadata);
    assert.ok(weeklyData.metadata);
    assert.ok(soilData.metadata);

    assert.ok(Array.isArray(fullData.observations));
    assert.ok(Array.isArray(weeklyData.observations));
    assert.ok(Array.isArray(soilData.observations));
});

test('datasets contain expected observation counts', () => {
    assert.equal(fullData.observations.length, 744);
    assert.equal(weeklyData.observations.length, 168);
    assert.equal(soilData.observations.length, 744);
});

test('observations contain valid timestamps', () => {
    for (const dataset of [fullData, weeklyData, soilData]) {
        for (const observation of dataset.observations) {
            assert.match(
                observation.timestampLocal,
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
            );
        }
    }
});

test('weather observations contain valid sensor values', () => {
    for (const observation of fullData.observations) {
        if (observation.temperatureF !== null) {
            assert.ok(Number.isFinite(observation.temperatureF));
        }

        if (observation.relativeHumidityPercent !== null) {
            assert.ok(Number.isFinite(observation.relativeHumidityPercent));
            assert.ok(observation.relativeHumidityPercent >= 0);
            assert.ok(observation.relativeHumidityPercent <= 100.5);
        }

        if (observation.windDirectionDegrees !== null) {
            assert.ok(observation.windDirectionDegrees >= 0);
            assert.ok(observation.windDirectionDegrees <= 360);
        }

        if (observation.peakWindGustMph !== null) {
            assert.ok(observation.peakWindGustMph >= 0);
        }
    }
});

test('simulated soil moisture is clearly labeled', () => {
    assert.equal(soilData.metadata.dataType, 'synthetic');
});

test('weekly data matches the first 168 full-month readings', () => {
    assert.deepEqual(
        weeklyData.observations,
        fullData.observations.slice(0, 168)
    );
});
