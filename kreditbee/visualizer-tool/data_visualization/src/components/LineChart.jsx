
import React, { useEffect } from 'react';
import * as d3 from 'd3';

function LineChart({ mappedChartData, selectedXColumn, selectedYColumn }) {
  useEffect(() => {
    // Remove existing SVG element
    d3.select('#line-chart svg').remove();

    // Check if data and columns are valid
    if (!mappedChartData || !selectedXColumn || !selectedYColumn) {
      console.error('Invalid data or column names provided');
      return;
    }

    const svg = d3.select('#line-chart').append('svg')
      .attr('width', 1800)
      .attr('height', 1000);

    const margin = { top: 200, right: 100, bottom: 130, left: 120 };
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
      .domain(mappedChartData.map(d => d[selectedXColumn]))
      .range([0, width])
      .paddingInner(0.3)
      .paddingOuter(0.2);

    const yMax = d3.max(mappedChartData, d => d[selectedYColumn]);
    const yMin = d3.min(mappedChartData, d => d[selectedYColumn]);

    const y = d3.scaleLinear()
      .domain([
        yMin < 0 ? yMin : 0,
        yMax + (yMax - yMin) * 0.05
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

    // Line generator
    const line = d3.line()
      .x(d => x(d[selectedXColumn]) + x.bandwidth() / 2)
      .y(d => y(d[selectedYColumn]));

    g.append('path')
      .datum(mappedChartData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    g.selectAll('circle')
      .data(mappedChartData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d[selectedXColumn]) + x.bandwidth() / 2)
      .attr('cy', d => y(d[selectedYColumn]))
      .attr('r', 5)
      .attr('fill', 'steelblue')
      .on('mouseover', showTooltip)
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);

    g.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text(selectedXColumn);

    g.append("text")
      .attr("class", "y axis-label")
      .attr("x", -(height / 2))
      .attr("y", -80)  // Adjusted y position to bring it closer
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
      .text('Line Chart');
  }, [mappedChartData, selectedXColumn, selectedYColumn]);

  return <div id="line-chart" style={{ width: '100%', height: 1000 }}></div>;
}

export default LineChart;
