document.addEventListener("DOMContentLoaded", function () {
  const url =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

  Promise.all([d3.json(url)])
    .then((data) => ready(data))
    .catch((err) => console.log("error: ", err));

  function ready(data) {
    //     PARAMETERS
    const w = 900;
    const h = 500;
    const paddingTB = 50;
    const paddingLR = 50;

    const title = "Video Game Sales";
    const description = "Top 100 Most Sold Video Games Grouped by Platform";

    const credit =
      "Created by <a href='https://github.com/odakris?tab=repositories' target='_blank' rel='noreferrer noopener'>Odakris</a>";

    //     CONTAINER
    const container = d3
      .select("body")
      .append("div")
      .attr("id", "container")
      .attr("class", "flex-center");

    //      HEADER
    const header = container
      .append("div")
      .attr("id", "header")
      .attr("class", "flex-center")
      .attr("class", "margin");

    //     TITLE
    header
      .append("h1")
      .attr("id", "title")
      .html(title)
      .style("color", "linen")
      .style("text-align", "center")
      .attr("class", "margin");

    //     DESCRIPTION
    header
      .append("h4")
      .attr("id", "description")
      .html(description)
      .style("color", "linen")
      .style("text-align", "center")
      .attr("class", "margin");

    //     TREEMAP CONTAINER
    const treemapContainer = container
      .append("div")
      .attr("id", "treemap-container")
      .attr("class", "margin");

    //     SVG
    const svg = treemapContainer
      .append("svg")
      .attr("id", "treemap")
      .attr("width", w + paddingLR)
      .attr("height", h + paddingTB);

    //     SORT DATA by size
    const hierarchy = d3
      .hierarchy(data[0])
      .sum((d) => d.value) //sum every child's values
      .sort((a, b) => b.value - a.value); // and sort them in descending order
    // console.log("root", root);

    //   CREATE TREEMAP
    const treemap = d3
      .treemap()
      .size([w + paddingLR, h + paddingTB])
      .padding(0.2);
    // treemap added x0, x1, y0, and y1 attributes to every node of the data.

    //     PLOT DATA IN TREEMAP
    const root = treemap(hierarchy);
    console.log("root", root);
    // console.log("hierarchy", hierarchy);

    //     GET ALL COTEGORIES FROM DATA
    // const category = data[0].children.map((item) => item.name);
    const category = root.children.map((item) => item.data.name);

    //     COLORS SET
    const colors = [
      "#1f77b4",
      "#aec7e8",
      "#ff7f0e",
      "#ffbb78",
      "#2ca02c",
      "#98df8a",
      "#d62728",
      "#ff9896",
      "#9467bd",
      "#c5b0d5",
      "#8c564b",
      "#c49c94",
      "#e377c2",
      "#f7b6d2",
      "#7f7f7f",
      "#c7c7c7",
      "#bcbd22",
      "#dbdb8d",
      "#17becf",
      "#9edae5",
    ];

    //     COLORSCALE
    const colorScale = d3.scaleOrdinal().domain(category).range(colors);

    //     TOOLTIP
    const tooltip = container
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute");

    //     LEGEND
    const legendW = 875;
    const legendH = 125;
    const legendRectSize = 20;
    const legendTextW = 100;
    const offsetRectToText = 30;
    const nbElemRow = 6;

    const legend = container
      .append("div")
      .attr("id", "legend")
      .attr("class", "margin");

    //     LEGEND SVG
    const legendSVG = legend
      .append("svg")
      .attr("width", legendW)
      .attr("height", legendH)
      .append("g");

    //     LEGEND "g" PLACED WITH TRANSFORM
    const legendElem = legendSVG
      .selectAll("g")
      .data(category)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d, i) =>
          "translate(" +
          (offsetRectToText +
            (i % nbElemRow) *
              (legendRectSize + offsetRectToText + legendTextW)) +
          "," +
          Math.floor(i / nbElemRow) * offsetRectToText +
          ")"
      );

    //     LEGEND RECT
    legendElem
      .append("rect")
      .attr("class", "legend-item")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .attr("fill", (d, i) => colorScale(category[i]));

    // LEGEND TEXT
    legendElem
      .append("text")
      .text((d, i) => category[i])
      .attr("x", offsetRectToText)
      .attr("y", 0.8 * legendRectSize)
      .attr("fill", "linen");

    //     CELLS
    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")"); // let the group element handle the general positioning

    //     CREATE CELLS IN SVG
    cell
      .append("rect") // append rect for each cell
      .attr("id", (d) => d.data.id)
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.data.category))
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value);

    //     APPEND TEXT TO CORRESPONDING CELL
    cell
      .append("text") // append text node for each cell / movie
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])|[/]/g)) // split the name and use that as data to create indiviual tspan elements
      .enter()
      .append("tspan") // append tspan node for each element of the string which got split
      .attr("x", 2)
      .attr("y", (d, i) => 10 + 10 * i) // offset the y positioning with the index of the data
      .text((d) => d)
      .style("font-size", 9);

    //     TOOLTIP CELLS
    cell
      .on("mousemove", (event, d) => {
        tooltip
          .style("top", event.pageY + 30 + "px")
          .style("left", event.pageX + 30 + "px")
          .style("opacity", 1)
          .attr("data-name", () => d.data.name)
          .attr("data-category", () => d.data.category)
          .attr("data-value", () => d.data.value)
          .style("background-color", () => colorScale(d.data.category))
          .style("color", "linen")
          .html(
            "Game : " +
              d.data.name +
              "</br>" +
              "Platform: " +
              d.data.category +
              "</br>" +
              "Sales Volume: " +
              d.data.value +
              " Million Units"
          );
      })
      .on("mouseout", (d) => tooltip.style("opacity", 0));

    container
      .append("div")
      .attr("id", "credit")
      .html(credit)
      .style("font-size", "12px")
      .style("color", "linen");
  }
});
