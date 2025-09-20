import React, { useEffect } from 'react';
import * as d3 from 'd3';

function BarChart({ mappedChartData, selectedXColumn, selectedYColumn }) {
  useEffect(() => {
    // Remove existing SVG element
    d3.select('#bar-chart svg').remove();

    // Check if data and columns are valid
    if (!mappedChartData || !selectedXColumn || !selectedYColumn) {
      console.error('Invalid data or column names provided');
      return;
    }

    const svg = d3.select('#bar-chart').append('svg')
      .attr('width', 1800)
      .attr('height', 1000);

    const margin = { top: 200, right: 100, bottom: 180, left: 180 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const showTooltip = (event, d) => {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`${selectedXColumn}: ${d[selectedXColumn]}<br>${selectedYColumn}: ${d[selectedYColumn]}`)
        .style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    };

    const moveTooltip = (event) => {
      tooltip.style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    };

    const hideTooltip = () => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    };

    // Define scales
    const x = d3.scaleBand()
      .domain(mappedChartData.map(d => d[selectedXColumn]).concat([0]))
      .range([0, width])
      .paddingInner(0.3)
      .paddingOuter(0.2);

    const yMax = d3.max(mappedChartData, d => d[selectedYColumn]);
    const yMin = d3.min(mappedChartData, d => d[selectedYColumn]);

    const y = d3.scaleLinear()
      .domain([
        yMin < 0 ? yMin : 0,
        yMax + (yMax - yMin) * 0.1  // Add an extra tick for the positive value
      ])
      .nice()
      .range([height, 0]);

    const xAxisCall = d3.axisBottom(x)
      .tickValues(x.domain().filter((d, i) => i % Math.ceil(x.domain().length / 7) === 0));

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxisCall)
      .selectAll('text')
      .style('text-anchor', 'start')
      .attr('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('dy', '0.35em')
      .attr('font-size', '12px');

    g.selectAll('.bar')
      .data(mappedChartData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[selectedXColumn]))
      .attr('y', d => d[selectedYColumn] >= 0 ? y(d[selectedYColumn]) : y(0))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d[selectedYColumn]) - y(0)))
      .attr('fill', d => d[selectedYColumn] >= 0 ? 'steelblue' : 'orange')
      .on('mouseover', showTooltip)
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);

    g.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", height + 70) // Adjusted position
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text(selectedXColumn);

    g.append("text")
      .attr("class", "y axis-label")
      .attr("x", -(height / 2))
      .attr("y", -120) // Adjusted position to bring it closer to the axis
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text(selectedYColumn);

    g.append('text')
      .attr('class', 'chart-name')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('font-size', '40px')
      .attr('text-anchor', 'middle')
      .text('Bar Chart');
  }, [mappedChartData, selectedXColumn, selectedYColumn]);

  return <div id="bar-chart" style={{ width: '100%', height: 1000 }}></div>;
}

export default BarChart;


