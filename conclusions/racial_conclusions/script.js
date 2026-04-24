// Simple Horizontal Stacked Bar Chart - D3.js

// ============================================
// DATA FORMAT (Super Simple JSON)
// ============================================
const data = [
    { name: "Category A", yes: 120, no: 80 },
    { name: "Category B", yes: 95, no: 105 },
    { name: "Category C", yes: 150, no: 50 },
    { name: "Category D", yes: 60, no: 140 },
    { name: "Category E", yes: 110, no: 90 }
  ];
  
  // ============================================
  // CHART CODE
  // ============================================
  
  const margin = { top: 20, right: 30, bottom: 30, left: 120 };
  const width = 800 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Colors
  const colors = { yes: "#2ecc71", no: "#e74c3c" };
  
  // Scales
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, height])
    .padding(0.4);
  
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.yes + d.no)])
    .range([0, width]);
  
  // Draw "No" bars
  svg.selectAll(".bar-no")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar-no")
    .attr("y", d => yScale(d.name))
    .attr("x", 0)
    .attr("width", d => xScale(d.no))
    .attr("height", yScale.bandwidth())
    .attr("fill", colors.no);
  
  // Draw "Yes" bars (stacked on top)
  svg.selectAll(".bar-yes")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar-yes")
    .attr("y", d => yScale(d.name))
    .attr("x", d => xScale(d.no))
    .attr("width", d => xScale(d.yes))
    .attr("height", yScale.bandwidth())
    .attr("fill", colors.yes);
  
  // Y Axis
  svg.append("g")
    .call(d3.axisLeft(yScale));
  
  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));
  
  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 80}, -15)`);
  
  legend.append("rect").attr("width", 15).attr("height", 15).attr("fill", colors.yes);
  legend.append("text").attr("x", 20).attr("y", 12).attr("font-size", "12px").text("Yes");
  
  legend.append("rect").attr("y", 20).attr("width", 15).attr("height", 15).attr("fill", colors.no);
  legend.append("text").attr("x", 20).attr("y", 32).attr("font-size", "12px").text("No");