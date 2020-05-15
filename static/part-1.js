

var category = 'Consolidated';//'Science Fiction';

plot_scatter('/draw2dScatterPlot/'+category,category);

function draw_scatter_2d(dfData, chartTitle,divId) {

    d3.select('#chart'+divId).remove();
    var data = JSON.parse(dfData);
    
    var margin = {top: 20, right: 60, bottom: 60, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([40, width]);

var y = d3.scaleLinear()
    .range([height-30, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);

var div = "#"+divId
console.log(div)
var svg = d3.select(div).append("svg").attr('id', 'chart'+divId)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  data.forEach(function(d) {
    d.budget = parseFloat(d.budget);
    d.revenue = parseFloat(d.revenue);
    d.rb_ratio = +d.rb_ratio;
  });

  x.domain(d3.extent(data, function(d) { return d.budget; })).nice();
  y.domain(d3.extent(data, function(d) { return d.revenue; })).nice();

  svg.append("g")
      .attr("class", "x axis2")
      .attr("transform", "translate(0," + (height-30) + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis2")
      .attr("transform", "translate(40," + 0 + ")")
      .call(yAxis)


    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    var tooltip = d3.select(div).append("div")
        .attr("class", "tooltip4")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        var colort = color(d.rb_ratio);
        var html  = "<span style='color:" + colort + ";'>" + d.name + "</span><br/>";
                    // "<b>" + d.name + "</b>";
                    // "<b>" + d.sugar + "</b> sugar, <b/>" + d.calories + "</b> calories";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 2) + "px")
        .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
    };


  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot3")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.budget); })
      .attr("cy", function(d) { return y(d.revenue); })
      .style("fill", function(d) { return color(d.rb_ratio); })
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout);

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .style("font-size", "12px")
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  // TODO Chart Title

  svg.append("text")
  .attr("x", (width / 2))
  .attr("y", 0 + (margin.top / 2))
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("text-decoration", "underline")
  .style("font-weight", "bold")
  .text(chartTitle);

  svg.append("text")
    .attr("class", "axis_label")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ (10) +","+(height/2)+")rotate(-90)")
    .text("Revenue")
    .style("font-size", "14px");

    svg.append("text")
        .attr("class", "axis_label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (width/2) +","+(height)+")")
        .text("Budget")
        .style("font-size", "14px");


}


function plot_scatter(url, title) {
    $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        xhrFields: {
          withCredentials: false
        },
        success: function(result) {
            console.log("Scatter Python call Success")
            // console.log(result)
            draw_scatter_2d(result,title,'div4')
        },
        error: function(result) {
            $("#div4").html(result);
        }
    });
}
