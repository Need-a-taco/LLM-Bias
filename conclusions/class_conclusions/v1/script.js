function buildChart(rawData) {
  const data = Object.keys(rawData).map((name) => {
    const yes = rawData[name].yes;
    const no = rawData[name].no;
    const total = yes + no;
    const pYes = total > 0 ? yes / total : 0;
    const pNo = total > 0 ? no / total : 0;
    return { name, yes, no, total, pYes, pNo };
  });

  data.sort((a, b) => b.pYes - a.pYes);

  const legendLabelFound = "Found bias against group";
  const legendLabelNot = "Did not find bias against group";

  function addWrappedLegendText(parent, x, y, str) {
    const words = str.split(" ");
    const mid = Math.ceil(words.length / 2);
    const lines = [
      words.slice(0, mid).join(" "),
      words.slice(mid).join(" "),
    ].filter((s) => s.length > 0);
    const te = parent
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("font-size", "11px");
    te.append("tspan").attr("x", x).attr("dy", 0).text(lines[0]);
    if (lines[1]) {
      te.append("tspan").attr("x", x).attr("dy", "1.05em").text(lines[1]);
    }
  }

  function addLegendRow(legendG, rowIndex, fill, labelStr) {
    const rowStep = 40;
    const sw = 14;
    const y0 = rowIndex * rowStep;
    const row = legendG.append("g").attr("transform", `translate(0, ${y0})`);
    row
      .append("rect")
      .attr("x", 0)
      .attr("y", 6)
      .attr("width", sw)
      .attr("height", sw)
      .attr("fill", fill);
    addWrappedLegendText(row, 22, 10, labelStr);
  }

  const margin = { top: 36, right: 310, bottom: 30, left: 120 };
  const plotWidth = 650;
  const height = 500 - margin.top - margin.bottom;
  const countX = plotWidth + 10;
  const fullWidth = margin.left + plotWidth + margin.right;

  // Legend position (inner coords): x past plot right edge; y down from chart top.
  // SVG height grows with y so large values stay visible (was clipped before).
  const legendTranslate = { x: 52, y: 2 };
  const legendBlockExtent = legendTranslate.y + 2 * 40 + 28;
  const innerBottom = Math.max(height + margin.bottom, legendBlockExtent);
  const svgTotalHeight = margin.top + innerBottom;

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", fullWidth)
    .attr("height", svgTotalHeight)
    .attr("overflow", "visible")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colors = { yes: "#ff7f0e", no: "#1f77b4" };

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, height])
    .padding(0.4);

  const xScale = d3.scaleLinear().domain([0, 1]).range([0, plotWidth]);

  svg
    .selectAll(".bar-yes")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar-yes")
    .attr("y", (d) => yScale(d.name))
    .attr("x", 0)
    .attr("width", (d) => xScale(d.pYes))
    .attr("height", yScale.bandwidth())
    .attr("fill", colors.yes);

  svg
    .selectAll(".bar-no")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar-no")
    .attr("y", (d) => yScale(d.name))
    .attr("x", (d) => xScale(d.pYes))
    .attr("width", (d) => xScale(d.pNo))
    .attr("height", yScale.bandwidth())
    .attr("fill", colors.no);

  svg.append("g").call(d3.axisLeft(yScale));

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickFormat(d3.format(".0%"));

  svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

  svg
    .append("text")
    .attr("x", countX)
    .attr("y", 2)
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

  const legend = svg
    .append("g")
    .attr("transform", `translate(${plotWidth + legendTranslate.x}, ${legendTranslate.y})`);

  addLegendRow(legend, 0, colors.yes, legendLabelFound);
  addLegendRow(legend, 1, colors.no, legendLabelNot);

}

d3.json("class_conclusions.json")
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
        "Could not load <code>class_conclusions.json</code>. " +
          "Browsers block loading local JSON when you open this page as a file. " +
          "From this folder, run a local server (e.g. <code>python -m http.server</code>) " +
          "and open the page at <code>http://localhost:8000/</code>."
      );
  });