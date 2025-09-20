import React from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import BoxPlot from './BoxPlot';
import PieChart from './PieChart';
import MulLineChart from './MulLineChart';
import MulBarChart from './MulBarChart';  // Import MulBarChart

function Chart({ selectChart, selectedXColumn, selectedYColumn, isAggClicked, mappedChartData, data }) {
  return (
    <div id="chart-area" style={{ width: '100%', height: 800 }}>
      {isAggClicked && selectedYColumn && selectChart && (
        <>
          {selectChart === 'line' && (
            <LineChart mappedChartData={mappedChartData} selectedXColumn={selectedXColumn} selectedYColumn={selectedYColumn} />
          )}
          {selectChart === 'bar' && (
            <BarChart mappedChartData={mappedChartData} selectedXColumn={selectedXColumn} selectedYColumn={selectedYColumn} />
          )}
          {selectChart === 'box' && (
            <BoxPlot data={data} selectedYColumn={selectedYColumn} />
          )}
          {selectChart === 'pie-chart' && (
            <PieChart mappedChartData={mappedChartData} selectedXColumn={selectedXColumn} selectedYColumn={selectedYColumn} />
          )}
          {selectChart === 'mul-line-chart' && (
            <MulLineChart data={mappedChartData} xColumn={selectedXColumn} yColumns={selectedYColumn} />
          )}
          {selectChart === 'mul-bar-chart' && (  // Add conditional rendering for MulBarChart
            <MulBarChart data={mappedChartData} xColumn={selectedXColumn} yColumns={selectedYColumn} />
          )}
        </>
      )}
    </div>
  );
}

export default Chart;

