import { useEffect, useState } from 'react'
import SensorMenu from './components/SensorMenu'
import './App.css'
import toothlessGif from './assets/Toothless_dancing.gif'

function App() {
  const [stations, setStations] = useState([])
  const [stationId, setStationId] = useState('')
  const [selectedSensor, setSelectedSensor] = useState(null)

  useEffect(() => {
    fetch('/api/stations')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch stations')
        }
        return response.json()
      })
      .then(setStations)
      .catch(console.error)
  }, [])

  return (
    <main>
      <h1>Farm2Table</h1>
      <h3>Hello World!</h3>
      <div>
      <img src={toothlessGif} alt="Loading animation" />
      </div>
      <label>Select Station: </label>

      <select
        value={stationId}
        onChange={event => {
          setStationId(event.target.value)
          setSelectedSensor(null)
        }}
      >
        <option value="">Select a station</option>

        {stations.map(station => (
          <option key={station} value={station}>
            {station}
          </option>
        ))}
      </select>

      <SensorMenu
        stationId={stationId}
        onSensorSelect={setSelectedSensor}
      />

      {selectedSensor && (
        <div>
          <h3>Selected Sensor</h3>
          <p>{selectedSensor.sensorName}</p>
          <p>Measurement: {selectedSensor.variable}</p>
          <p>Latest value: {selectedSensor.lastValue ?? 'N/A'}</p>
        </div>
      )}
    </main>
  )
}

export default App