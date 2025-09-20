import React from 'react';

export default function Aggsel({ selectedAgg, onSelectAggregator }) {
  const handleAggChange = (event) => {
    onSelectAggregator(event.target.value);
  };

  return (
    <div>
      <label>Select Aggregator</label>
      <select value={selectedAgg} onChange={handleAggChange}>
        <option value=''>--Select Aggregator--</option>
        <option value="none">No Aggregator</option>
        <option value="sum">Sum</option>
        <option value="min">Minimum</option>
        <option value="max">Maximum</option>
        <option value="count">Count</option>
        <option value="dis-count">Count(DISTINCT)</option>
      </select>
    </div>
  );
}
