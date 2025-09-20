import React, { useEffect } from 'react';
import * as d3 from 'd3';

function BoxPlot({ data, selectedYColumn }) {
  useEffect(() => {
    // Remove existing SVG element
    d3.select('#box-plot svg').remove();

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const svg = d3.select('#box-plot').append('svg')
      .attr('width', 1800)
      .attr('height', 800);

    const margin = { top: 200, right: 100, bottom: 130, left: 120 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sortData = data.map(d => d[selectedYColumn]).sort(d3.ascending);
    const q1 = d3.quantile(sortData, 0.25);
    const median = d3.quantile(sortData, 0.5);
    const q3 = d3.quantile(sortData, 0.75);
    const iqRange = q3 - q1;
    const lowerBound = q1 - 1.5 * iqRange;
    const upperBound = q3 + 1.5 * iqRange;

    // Filter data to be within the bounds
    const filteredData = sortData.filter(d => d >= lowerBound && d <= upperBound);
    const min = d3.min(filteredData);
    const max = d3.max(filteredData);

    const y = d3.scaleLinear()
      .domain([d3.min(sortData), d3.max(sortData)])
      .range([height, 0]);

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('dy', '0.35em')
      .attr('font-size', '12px');

    const boxWidth = 100;
    const center = width / 2;

    // Append box
    g.append("rect")
      .attr("x", center - boxWidth / 2)
      .attr("y", y(q3))
      .attr("width", boxWidth)
      .attr("height", y(q1) - y(q3))
      .attr("stroke", "black")
      .style("fill", "#69b3a2");

    // Append whiskers
    g.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "black");

    // Append individual lines for min, median, max
    const lineData = [
      { value: min, label: 'Minimum' },
      { value: median, label: 'Median' },
      { value: max, label: 'Maximum' },
      { value: q1, label: '1st Quartile' },
      { value: q3, label: '3rd Quartile' }
    ];

    g.selectAll("line.toto")
      .data(lineData)
      .enter()
      .append("line")
      .attr("x1", d => d.label === 'Median' ? center - boxWidth / 2 : center - boxWidth / 4)
      .attr("x2", d => d.label === 'Median' ? center + boxWidth / 2 : center + boxWidth / 4)
      .attr("y1", d => y(d.value))
      .attr("y2", d => y(d.value))
      .attr("stroke", "black")
      .on('mouseover', function (event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`${d.label}: ${d.value}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function () {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 200}, 0)`);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 200)
      .attr('height', 150)
      .attr('fill', 'lightgray')
      .attr('stroke', 'black');

    legend.selectAll('text')
      .data(lineData)
      .enter().append('text')
      .attr('x', 10)
      .attr('y', (d, i) => 20 * i + 20)
      .attr('dy', '.35em')
      .text(d => `${d.label}: ${d.value}`);

    g.append("text")
      .attr("class", "y axis-label")
      .attr("x", -(height / 2))
      .attr("y", -60)
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
      .text('Box Plot');

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, selectedYColumn]);

  return <div id="box-plot" style={{ width: '100%', height: 800 }}></div>;
}

export default BoxPlot;
