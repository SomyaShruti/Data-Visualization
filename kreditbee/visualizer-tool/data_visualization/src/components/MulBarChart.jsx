import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const MulBarChart = ({ data, xColumn, yColumns }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (data.length === 0 || !xColumn || yColumns.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the previous chart

    const margin = { top: 50, right: 100, bottom: 50, left: 20 };
    const width = 1500 - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(data.map(d => d[xColumn]))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(yColumns, col => d[col]))]).nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(yColumns)
      .range(d3.schemeCategory10);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#f4f4f4")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "5px");

    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", d => `translate(${x(d[xColumn])},0)`)
      .selectAll("rect")
      .data(d => yColumns.map(col => ({ key: col, value: d[col], xValue: d[xColumn] })))
      .enter().append("rect")
      .attr("x", (d, i) => x.bandwidth() / yColumns.length * i)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth() / yColumns.length)
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.key))
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`${d.xValue} - ${d.key}: ${d.value}`);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .text("Multiple Bar Chart");

    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right},${margin.top})`);

    yColumns.forEach((col, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0,${i * 20})`);

      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color(col));

      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("text-transform", "capitalize")
        .text(col);
    });

    // Add x-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(xColumn);

    return () => {
      tooltip.remove();
    };
  }, [data, xColumn, yColumns]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default MulBarChart;
