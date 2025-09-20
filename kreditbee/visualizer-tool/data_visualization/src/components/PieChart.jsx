import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ mappedChartData, selectedXColumn, selectedYColumn }) => {
  const ref = useRef();

  useEffect(() => {
    if (!mappedChartData.length || !selectedXColumn || !selectedYColumn) return;

    // Remove any existing SVG elements
    d3.select(ref.current).selectAll('*').remove();

    // Set the dimensions and margins of the graph
    const width = 1700;
    const height = 750;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Append the svg object to the div called 'chart-area'
    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height + 100)  // Increase the height to accommodate the title
      .append("g")
      .attr("transform", `translate(${width / 2}, ${(height / 2) + 50})`);  // Adjust the transform to center the chart

    // Set the color scale
    const color = d3.scaleOrdinal()
      .domain(mappedChartData.map(d => d[selectedXColumn]))
      .range(d3.schemeDark2);

    // Compute the position of each group on the pie
    const pie = d3.pie()
      .sort(null)
      .value(d => d[selectedYColumn]);

    const data_ready = pie(mappedChartData);

    // The arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);

    // Another arc for label positioning
    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.92);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("opacity", 0);

    // Build the pie chart
    svg.selectAll('allSlices')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data[selectedXColumn]))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d) {
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            const x = Math.sin(midAngle) * 10;
            const y = -Math.cos(midAngle) * 10;
            return `translate(${x},${y})`;
          });

        tooltip
          .style("opacity", 1)
          .html(`${selectedXColumn}: ${d.data[selectedXColumn]}<br>${selectedYColumn}: ${d.data[selectedYColumn]}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)');

        tooltip
          .style("opacity", 0);
      });

    // Add the polylines between chart and labels
    svg.selectAll('allPolylines')
      .data(data_ready)
      .join('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function (d) {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    // Add the labels
    svg.selectAll('allLabels')
      .data(data_ready)
      .join('text')
      .text(d => d.data[selectedXColumn])
      .attr('transform', function (d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? 'start' : 'end');
      });

    // Add the chart title
    svg.append('text')
      .attr('class', 'chart-name')
      .attr('x', 0)
      .attr('y', -radius - 30)  // Position above the chart
      .attr('font-size', '40px')
      .attr('text-anchor', 'middle')
      .text('Pie Chart');

    // Create a legend
    const legend = svg.append("g")
      .attr("transform", `translate(${radius + 90},${-radius})`);

    const total = d3.sum(mappedChartData, d => d[selectedYColumn]);

    legend.selectAll('rect')
      .data(data_ready)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 25)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', d => color(d.data[selectedXColumn]));

    legend.selectAll('text')
      .data(data_ready)
      .enter()
      .append('text')
      .attr('x', 25)
      .attr('y', (d, i) => i * 25 + 15)
      .text(d => `${d.data[selectedXColumn]}: ${(d.data[selectedYColumn] / total * 100).toFixed(1)}%`);

  }, [mappedChartData, selectedXColumn, selectedYColumn]);

  return <div ref={ref}></div>;
};

export default PieChart;
