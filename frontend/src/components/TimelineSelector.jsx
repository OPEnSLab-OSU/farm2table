export default function TimelineSelector({ value, onChange }) {
  return (
    <div style={{ margin: '15px 0' }}>
      <label htmlFor="timeframe">Select Timeframe: </label>

      <select
        id="timeframe"
        value={value}
        onChange={event => onChange(event.target.value)}
        style={{
          padding: '10px 16px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        <option value="hour">Past Hour</option>
        <option value="day">Past Day</option>
        <option value="week">Past Week</option>
        <option value="month">Past Month</option>
        <option value="all">All Time</option>
      </select>
    </div>
  )
}