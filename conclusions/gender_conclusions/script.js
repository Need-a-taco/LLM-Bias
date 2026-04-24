function buildChart(rawData) {
  const titleOffset = -395;
  const titleVerticalOffset = -20; 
  
  d3.select("body")
    .insert("h1", ":first-child")
    .style("text-align", "center")
    .style("margin-left", `${titleOffset}px`)
    .style("margin-bottom", `${titleVerticalOffset}px`)
    .text("Conclusions of Bias for Gender Groups");

  const data = Object.keys(rawData).map((name) => {
    const yes = rawData[name].yes;
    const no = rawData[name].no;
    const total = yes + no;
    const pYes = total > 0 ? yes / total : 0;
    const pNo = total > 0 ? no / total : 0;
    return { name, yes, no, total, pYes, pNo };
  });

  const margin = { top: 36, right: 180, bottom: 30, left: 120 };
  const plotWidth = 650;
  const height = 300 - margin.top - margin.bottom;
  const countX = plotWidth + 12;
  const fullWidth = margin.left + plotWidth + margin.right;

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", fullWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colors = { yes: "#1f77b4", no: "#ff7f0e" };

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, height])
    .padding(0.4);

  const xScale = d3.scaleLinear().domain([0, 1]).range([0, plotWidth]);

  svg
    .selectAll(".bar-no")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar-no")
    .attr("y", (d) => yScale(d.name))
    .attr("x", 0)
    .attr("width", (d) => xScale(d.pNo))
    .attr("height", yScale.bandwidth())
    .attr("fill", colors.no);

  svg
    .selectAll(".bar-yes")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar-yes")
    .attr("y", (d) => yScale(d.name))
    .attr("x", (d) => xScale(d.pNo))
    .attr("width", (d) => xScale(d.pYes))
    .attr("height", yScale.bandwidth())
    .attr("fill", colors.yes);

  svg.append("g").call(d3.axisLeft(yScale));

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickFormat(d3.format(".0%"));

  svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

  svg
    .append("text")
    .attr("x", countX)
    .attr("y", 10)
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .text("No. of Times Studied");

  svg
    .selectAll("text.row-total")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "row-total")
    .attr("x", countX)
    .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", "13px")
    .attr("fill", "#222")
    .text((d) => `n=${d.total}`);

    const legendOffset = 23; // Adjust this number to move legend up/down

    const legend = svg.append("g").attr("transform", `translate(${plotWidth + 60}, ${-22 + legendOffset})`);
    
    legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0 + legendOffset)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", colors.yes);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 12 + legendOffset)
      .attr("font-size", "12px")
      .text("Yes");
    
    legend
      .append("rect")
      .attr("y", 20 + legendOffset)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", colors.no);
    
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 32 + legendOffset)
      .attr("font-size", "12px")
      .text("No");

}

d3.json("gender_conclusions.json")
  .then(buildChart)
  .catch((err) => {
    console.error(err);
    d3.select("body")
      .append("p")
      .style("color", "#c0392b")
      .style("max-width", "40rem")
      .style("font-family", "system-ui, sans-serif")
      .style("margin", "0 auto")
      .html(
        "Could not load <code>gender_conclusions.json</code>. " +
          "Browsers block loading local JSON when you open this page as a file. " +
          "From this folder, run a local server (e.g. <code>python -m http.server</code>) " +
          "and open the page at <code>http://localhost:8000/</code>."
      );
  });