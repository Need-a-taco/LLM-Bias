d3.json("../data/json_bar_data.json").then(rawData => {

  const data = rawData.map(d => {
    const key = Object.keys(d)[0];
    return {
      quarter: key,
      value: d[key]
    };
  });

  const chart = createChart(data);
  document.getElementById("chart").appendChild(chart);

});
  
  function createChart(data) {
    const width = 928;
    const height = 500;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 60;
    const marginLeft = 40;
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.quarter))
      .range([marginLeft, width - marginRight])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height - marginBottom, marginTop]);
  
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");
  
    // Bars
    svg.append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.quarter))
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value))
      .attr("width", x.bandwidth());

    const formatQuarter = q => q.replace(/(Q\d)/, " $1");

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3.axisBottom(x)
          .tickFormat(formatQuarter)
          .tickSizeOuter(0)
      );

    svg.append("text")
      .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Quarter");
  
    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-family", "Times New Roman")  
        .attr("font-size", "12px") 
        .text("Frequency of Papers"));
  
    return svg.node();
  }
  
  const chart = createChart(data);
  document.getElementById("chart").appendChild(chart);