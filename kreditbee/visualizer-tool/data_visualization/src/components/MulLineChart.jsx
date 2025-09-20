import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const MulLineChart = ({ data, xColumn, yColumns }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (data.length === 0 || !xColumn || yColumns.length === 0) return;

    // Set up SVG dimensions and margins
    const margin = { top: 200, right: 100, bottom: 130, left: 120 };
    const width = 1800 - margin.left - margin.right;
    const height = 1000 - margin.top - margin.bottom;

    // Clear any existing SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Append the SVG object to the chart div
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert data types for yColumns
    data.forEach(d => {
      yColumns.forEach(col => {
        d[col] = +d[col];
      });
    });

    // Determine the x-axis scale based on data type
    const isNumeric = !isNaN(data[0][xColumn]);
    const x = isNumeric
      ? d3.scaleLinear()
          .domain(d3.extent(data, d => d[xColumn]))
          .range([0, width])
      : d3.scaleBand()
          .domain(data.map(d => d[xColumn]))
          .range([0, width])
          .padding(0.1);

    // Draw x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(isNumeric ? d3.axisBottom(x).ticks(5) : d3.axisBottom(x).tickSize(0));

    // Set up the y-axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(...yColumns.map(col => d[col])))])
      .nice()
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(yColumns);

    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "lightgray")
      .style("padding", "5px")
      .style("border-radius", "5px");

    // Draw the lines and add tooltip events
    yColumns.forEach(col => {
      const line = d3.line()
        .x(d => isNumeric ? x(d[xColumn]) : x(d[xColumn]) + x.bandwidth() / 2)
        .y(d => y(d[col]));

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color(col))
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Create circles for tooltip
      svg.selectAll(`.dot-${col}`)
        .data(data)
        .enter().append("circle")
        .attr("class", `dot-${col}`)
        .attr("cx", d => isNumeric ? x(d[xColumn]) : x(d[xColumn]) + x.bandwidth() / 2)
        .attr("cy", d => y(d[col]))
        .attr("r", 5)
        .attr("fill", color(col))
        .on("mouseover", (event, d) => {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`${xColumn}: ${d[xColumn]}<br/>${col}: ${d[col]}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    });

    // Add legend
    const legend = svg.selectAll(".legend")
      .data(yColumns)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width - 31},${-38 + i * 30})`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d);

    // Add x-axis label
    svg.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20) // Adjusted position
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text(xColumn);

    // Add title
    svg.append('text')
      .attr('class', 'chart-name')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('font-size', '40px')
      .attr('text-anchor', 'middle')
      .text('Multiple Line Chart');
  }, [data, xColumn, yColumns]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default MulLineChart;

