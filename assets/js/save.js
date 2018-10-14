var svgWidth = 960;
var svgHeight = 550;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("class","chart")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Initial Params
var chosenYAxis = "healthcare";

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales  
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[chosenYAxis])])
      .range([height, 0]);

  return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisBottom(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles
function renderText(bubbleText, newXScale, chosenXaxis, newYScale, chosenYAxis) {

  bubbleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return bubbleText;
}

function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare (%): ";
  } else if (chosenYAxis === "income") {
    var ylabel = "Household Income (median): ";
  }else {
    var ylabel = "Age (median): ";
  }

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%): ";
  } else if (chosenXAxis === "income") {
    var xlabel = "Household Income (median): ";
  }else {
    var xlabel = "Age (median): ";
  }


  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d) {
      return (`${d.state}<br>${ylabel} ${d[chosenYAxis]}<br>${xlabel} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
    // onmouseout event
    .on("mouseout", function(d, index) {
      toolTip.hide(d, this);
    });

  return circlesGroup;
}

// Import Data
d3.csv("/assets/data/data.csv")
  .then(function(data) {
    console.log(data)

    // parse data to int
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age
        data.income = +data.income;
      });

    // Create scale functions
    var xLinearScale = xScale(data, chosenXAxis);

    var yLinearScale = yScale(data, chosenYAxis);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "18")
    .attr("fill", "pink")
    .attr("stroke", "black")
    .attr("opacity", ".5")

    var bubbleText = chartGroup.selectAll(".chart")
    .data(data)
    .enter()
    .append("text")
    .attr("x",d => xLinearScale(d[chosenXAxis]))
    .attr("y",d => yLinearScale(d[chosenYAxis]))
    .attr("dx", "-8")
    .attr("dy", "4.5")
    .style("font-size", "10px")
    .text(d => d.abbr);

    // Create group for  2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (median)");

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("In Poverty (%)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 45)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income (median)");

    // append y axis
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        bubbleText = renderText(bubbleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        } else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

    // labelsGroup.selectAll("text")
    // .on("click", function() {
    //   // get value of selection
    //   var value = d3.select(this).attr("value");
    //   if (value !== chosenYAxis) {

    //     // replaces chosenXAxis with value
    //     chosenYAxis = value;

    //     // functions here found above csv import
    //     // updates y scale for new data
    //     yLinearScale = yScale(data, chosenYAxis);

    //     // updates y axis with transition
    //     yAxis = renderYAxis(yLinearScale, yAxis);

    //     // updates circles with new x values
    //     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    //     // updates tooltips with new info
    //     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //     bubbleText = renderText(bubbleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    //     // changes classes to change bold text
    //     if (chosenYAxis === "healthcare") {
    //       povertyLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //       ageLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       incomeLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //     } else if (chosenYAxis === "obesity") {
    //       povertyLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       ageLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       incomeLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //     } else {
    //       povertyLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       ageLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //       incomeLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //     }
    //   }
    // });



  });