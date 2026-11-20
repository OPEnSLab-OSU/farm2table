import { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import TimelineSelector from './TimelineSelector'

const durations = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
}

export default function SensorChart({ stationId, selectedSensor }) {
    const [readings, setReadings] = useState([])
    const [timeframe, setTimeframe] = useState('day')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!stationId || !selectedSensor) return

        const controller = new AbortController()
        const baseUrl = `/api/stations/${encodeURIComponent(stationId)}`

        setReadings([])
        setLoading(true)
        setError(null)

        async function loadReadings() {
            try {
                const rangeResponse = await fetch(`${baseUrl}/range`, {
                    signal: controller.signal
                })

                if (!rangeResponse.ok) {
                    throw new Error('Failed to fetch date range')
                }

                const range = await rangeResponse.json()

                if (!range) {
                    setLoading(false)
                    return
                }

                const earliest = new Date(range.start).getTime()
                const latest = new Date(range.end).getTime()

                const start = timeframe === 'all'
                    ? earliest
                    : Math.max(earliest, latest - durations[timeframe])

                const end = latest + 1

                if (end - start > 366 * durations.day) {
                    throw new Error('Please select a timeframe of one year or less.')
                }

                const params = new URLSearchParams({
                    start: new Date(start).toISOString(),
                    end: new Date(end).toISOString(),
                    sensor: selectedSensor.sensor
                })

                const response = await fetch(
                    `${baseUrl}/readings?${params}`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch historical readings')
                }

                const data = await response.json()

                const filtered = data.filter(reading =>
                    reading.field === selectedSensor.field &&
                    reading.quality === 'ok' &&
                    Number.isFinite(reading.value)
                )

                filtered.sort(
                    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                )

                if (!controller.signal.aborted) {
                    setReadings(filtered)
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error.message)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadReadings()

        return () => controller.abort()
    }, [stationId, selectedSensor, timeframe])

    if (!selectedSensor) return null

    return (
        <div>
            <TimelineSelector
                value={timeframe}
                onChange={setTimeframe}
            />

            {loading && <p>Loading historical readings...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && readings.length === 0 && (
                <p>No historical readings available.</p>
            )}

            {!loading && !error && readings.length > 0 && (
                <>
                    <p>Displaying {readings.length} readings</p>

                    <Plot
                        data={[
                            {
                                x: readings.map(reading => reading.timestamp),
                                y: readings.map(reading => reading.value),
                                type: 'scatter',
                                mode: 'lines+markers',
                                marker: { size: 3 },
                                line: { color: '#2e8b57', width: 2 }
                            }
                        ]}
                        layout={{
                            title: { text: selectedSensor.variable },
                            xaxis: {
                                title: { text: 'Time (UTC)' },
                                type: 'date',
                                autorange: true
                            },
                            yaxis: {
                                title: {
                                    text: selectedSensor.unit || selectedSensor.variable
                                },
                                autorange: true
                            },
                            autosize: true
                        }}
                        config={{
                            responsive: true,
                            displaylogo: false,
                            displayModeBar: true,
                            toImageButtonOptions: {
                                format: 'png',
                                filename: `${stationId}_${selectedSensor.variable}_${timeframe}`,
                                height: 600,
                                width: 1200,
                                scale: 2
                            }
                        }}
                        style={{
                            width: '100%',
                            height: '400px'
                        }}
                        useResizeHandler={true}
                    />
                </>
            )}
        </div>
    )
}