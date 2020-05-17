

var category = 'Consolidated';//'Science Fiction';

plot_scatter('/draw2dScatterPlot/'+category,category);

plot_boxplot('/drawBoxPlot/'+category,category);

function draw_box_plot(dictData, chartTitle,divId) {
    
    // set the dimensions and margins of the graph
    d3.select('#chart'+divId).remove();
	var margin = {top: 20, right: 20, bottom: 50, left: 450},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;    
  
    var barWidth = 30;
    var div = "#"+divId
    console.log(div)

    // Generate five 100 count, normal distributions with random means
    var groupCounts = JSON.parse(dictData);
    var globalCounts = [];
    // var meanGenerator = d3.randomUniform(10);
    // for(i=0; i <= 5; i++) {
    // var randomMean = meanGenerator();
    // var generator = d3.randomNormal(randomMean);
    // var key = i.toString();
    // groupCounts[key] = [];

    // for(j=0; j<100; j++) {
    //     var entry = generator();
    //     groupCounts[key].push(entry);
    //     globalCounts.push(entry);
    // }
    // }

    // Sort group counts so quantile methods work
    for(var key in groupCounts) {
    var groupCount = groupCounts[key];
    // globalCounts.push(groupCount);
    globalCounts = globalCounts.concat(groupCount);
    groupCounts[key] = groupCount.sort(sortNumber);
    }

    // Setup a color scale for filling each box
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(Object.keys(groupCounts));

    // Prepare the data for the box plots
    var boxPlotData = [];
    for (var [key, groupCount] of Object.entries(groupCounts)) {
    var localMin = d3.min(groupCount);
    var localMax = d3.max(groupCount);

    var obj = {};
    obj["key"] = key;
    obj["counts"] = groupCount;
    obj["quartile"] = boxQuartiles(groupCount);
    obj["whiskers"] = [localMin, localMax];
    obj["color"] = colorScale(key);
    // console.log(obj);
    boxPlotData.push(obj);
    }

    // Compute an ordinal xScale for the keys in boxPlotData
    var xScale = d3.scalePoint()
    .domain(Object.keys(groupCounts))
    .rangeRound([0, width])
    .padding([0.5]);

    // Compute a global y scale based on the global counts
    var min = d3.min(globalCounts);
    var max = d3.max(globalCounts);
    var yScale = d3.scaleLinear()
    .domain([min, max])
    .range([height, 0]);
    
    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select(div).append("svg").attr('id', 'chart'+divId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    // append a group for the box plot elements
    var g = svg.append("g");

    // Draw the box plot vertical lines
    var verticalLines = g.selectAll(".verticalLines")
    .data(boxPlotData)
    .enter()
    .append("line")
    .attr("x1", function(datum) { return xScale(datum.key); })
    .attr("y1", function(datum) { return yScale(datum.whiskers[0]); })
    .attr("x2", function(datum) { return xScale(datum.key); })
    .attr("y2", function(datum) { return yScale(datum.whiskers[1]); })
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("fill", "none");


    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    var tooltip = d3.select(div).append("div")
        .attr("class", "tooltip4")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        console.log("MOuseOver")
        // console.log(d)
        var html  =  "<b> Median " + d.quartile[1] + "</b><br/>"+
                    "<b>Min. " + d.whiskers[0] + "</b><br/>"+ "<b/> Max. " + d.whiskers[1] + "</b>";

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



    // Draw the boxes of the box plot, filled and on top of vertical lines
    var rects = g.selectAll("rect")
    .data(boxPlotData)
    .enter()
    .append("rect")
    .attr("width", barWidth)
    .attr("height", function(datum) {
        var quartiles = datum.quartile;
        var height =  yScale(quartiles[0]) - yScale(quartiles[2]);      
        return height;
    })
    .attr("x", function(datum) { return xScale(datum.key) - (barWidth/2); })
    .attr("y", function(datum) { return yScale(datum.quartile[2]); })
    .attr("fill", function(datum) { return datum.color; })
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .on("mouseover", tipMouseover)
    .on("mouseout", tipMouseout);

    // Now render all the horizontal lines at once - the whiskers and the median
    var horizontalLineConfigs = [
    // Top whisker
    {
        x1: function(datum) { return xScale(datum.key) - barWidth/2 },
        y1: function(datum) { return yScale(datum.whiskers[0]) },
        x2: function(datum) { return xScale(datum.key) + barWidth/2 },
        y2: function(datum) { return yScale(datum.whiskers[0]) }
    },
    // Median line
    {
        x1: function(datum) { return xScale(datum.key) - barWidth/2 },
        y1: function(datum) { return yScale(datum.quartile[1]) },
        x2: function(datum) { return xScale(datum.key) + barWidth/2 },
        y2: function(datum) { return yScale(datum.quartile[1]) }
    },
    // Bottom whisker
    {
        x1: function(datum) { return xScale(datum.key) - barWidth/2 },
        y1: function(datum) { return yScale(datum.whiskers[1]) },
        x2: function(datum) { return xScale(datum.key) + barWidth/2 },
        y2: function(datum) { return yScale(datum.whiskers[1]) }
    }
    ];

    for(var i=0; i < horizontalLineConfigs.length; i++) {
    var lineConfig = horizontalLineConfigs[i];

    // Draw the whiskers at the min for this series
    var horizontalLine = g.selectAll(".whiskers")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("x1", lineConfig.x1)
        .attr("y1", lineConfig.y1)
        .attr("x2", lineConfig.x2)
        .attr("y2", lineConfig.y2)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", "none");
    }

    // Move the left axis over 25 pixels, and the top axis over 35 pixels
    //var axisY = svg.append("g").attr("transform", "translate(25,0)");
    //var axisX = svg.append("g").attr("transform", "translate(35,0)");

    //x-axis
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

    // Add the Y Axis
    svg.append("g")
    .call(d3.axisLeft(yScale));
        
    function boxQuartiles(d) {
        return [
        d3.quantile(d, .25),
        d3.quantile(d, .5),
        d3.quantile(d, .75)
        ];
    }
    
    // Perform a numeric sort on an array
    function sortNumber(a,b) {
    return a - b;
    }






}

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

function plot_boxplot(url, selectedValue) {
    $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        xhrFields: {
          withCredentials: false
        },
        success: function(result) {
            console.log("3-D Python call Success")
            // console.log(result)
            draw_box_plot(result,selectedValue,'div5')
        },
        error: function(result) {
            $("#div5").html(result);
        }
    });
}
