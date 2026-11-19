import { useEffect, useState } from 'react'

export default function SensorMenu({ stationId, onSensorSelect }) {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setSensors([])
    setError(null)

    if (!stationId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    fetch(`/api/stations/${encodeURIComponent(stationId)}/sensors`, {
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch sensors')
        }
        return response.json()
      })
      .then(data => {
        setSensors(data)
        setLoading(false)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setError(error.message)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [stationId])

  const groupedSensors = sensors.reduce((groups, sensor) => {
    if (!groups[sensor.sensor]) {
      groups[sensor.sensor] = []
    }

    groups[sensor.sensor].push(sensor)
    return groups
  }, {})

  if (!stationId) return <p>Select a station first.</p>
  if (loading) return <p>Loading sensors...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="sensor-menu">
      <h2>Available Sensors</h2>

      {sensors.length === 0 && <p>No sensors available.</p>}

      {Object.entries(groupedSensors).map(([name, fields]) => (
        <details key={name}>
          <summary>{fields[0].sensorName}</summary>

          {fields.map(sensor => (
            <button
              key={sensor.field}
              onClick={() => onSensorSelect?.(sensor)}
            >
              {sensor.variable}
              {sensor.unit ? ` (${sensor.unit})` : ''}
            </button>
          ))}
        </details>
      ))}
    </div>
  )
}