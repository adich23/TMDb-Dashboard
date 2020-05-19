

/*
var category = 'Comedy';//'Science Fiction';

plot_scatter('/draw2dScatterPlot/'+category,category);

plot_boxplot('/drawBoxPlot/'+category,category);
// always call box-plot first
plot_parallelplot('/drawParallelPlot/'+category,category);
*/
var boxplot_data;

// for box-plot and parallel-plot
// var colorScale;

const btn = document.querySelector('#btn');
const btn1 = document.querySelector('#btn_1');
// handle click button


btn.onclick = function () {
    draw_box_plot(boxplot_data,0,category,'div5');
    // var selectedValue;
    // const rbs = document.querySelectorAll('input[name="choice"]');
    // for (const rb of rbs) {
    //     if (rb.checked) {
    //         selectedValue = rb.value;
    //         break;
    //     }
    // }
    
};

btn1.onclick = function () {
    draw_box_plot(boxplot_data,1,category,'div5');
};










function draw_box_plot(dictData, feature_num, chartTitle, divId) {
    
    // set the dimensions and margins of the graph
    d3.select('#chart'+divId).remove();
	var margin = {top: 20, right: 20, bottom: 50, left: 450},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;    
  
    var barWidth = 30;
    var div = "#"+divId;
    console.log(div)

    // Generate five 100 count, normal distributions with random means
    var listGroupCounts = JSON.parse(dictData);
    var groupCounts = listGroupCounts[+feature_num];
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
    var colorScale = d3.scaleOrdinal()
    .domain(['2011', '2012', '2013', '2014','2015'])
    // .domain(Object.keys(groupCounts).sort())
    .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd"]);//,"#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]);

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
        // console.log("MOuseOver")
        // console.log(d)
        var html  = "<b>Min. " + d.whiskers[0] + "</b><br/>"+  
                    "<b> Median " + d.quartile[1] + "</b><br/>"+
                    "<b/> Max. " + d.whiskers[1] + "</b>";

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

    svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 5) + ")")
      .style("text-anchor", "middle")
      .text("Years");

    let feature_map = new Map();
    feature_map.set('0', 'Popularity');
    feature_map.set('1', 'Runtime');

    // Add the Y Axis
    svg.append("g")
    .call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(feature_map.get(feature_num)); 
        
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


function draw_parallel_plot(dfData, chartTitle,divId) {
    
    d3.select('#parallel'+divId).remove();

    var margin = {top: 30, right: 10, bottom: 10, left: 10};
    var width = 960 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    sample_data = JSON.parse(dfData)

    var x = d3.scalePoint().range([0, width]).padding(1),
        y = {};

    var line = d3.line(),
        axis = d3.axisLeft(),
        background,
        foreground;
    
    var dimensions = null;
    
    // const svg = d3.select(div).append()(width + margin.left + margin.right, height+margin.top + margin.bottom)
    // .attr('id', 'parallel'+divId));
    

    var div = "#"+divId;
    console.log(div)
    var svg = d3.select(div).append("svg").attr('id', 'parallel'+divId)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

        const svg_adjusted = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    years_list = []
    sample_data.forEach(function(d){
        years_list.push(d.year);
      })
    years_set = d3.set(years_list.sort())
    years_list = Array.from(years_set);
    var colorScale = d3.scaleOrdinal()
    .domain(['2011', '2012', '2013', '2014','2015'])
    .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd"]);//,"#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]);

    // var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    // .domain(years_list);
    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(sample_data[0]).filter(function(d) {
        
        // if (d == 'year') {
        //     return y[d] = d3.scalePoint()
        //     .domain(years_list)
        //     // .domain(d3.extent(sample_data, function(p) { p[d]; }))
        //     .range([0,height]);
        // }
        if (d == "year") {
            return (y[d] = d3.scaleLinear()
            .domain(d3.extent(sample_data, function(p) { return parseInt(p[d]); }))
            .range([height, 0]));
        }
        if (d !="name" && d!= "year") {
            return (y[d] = d3.scaleLinear()
            .domain(d3.extent(sample_data, function(p) { return +p[d]; }))
            .range([height, 0]));
        }
        // return d != "name" && (y[d] = d3.scaleLinear()
        //     .domain(d3.extent(sample_data, function(p) { return +p[d]; }))
        //     .range([height, 0]));
    }));

    // y['year'] = d3.scalePoint()
    // .domain(years_list)
    // .range([0, height]);

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    var tooltip = d3.select(div).append("div")
        .attr("class", "tooltip4")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        // console.log("MOuseOver")
        console.log(d)
        var html  =  "<b>" + d.name+ "</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 2) + "px")
        .transition()
            .duration(200) // ms
            .style("opacity", .8) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
    };





    // Add grey background lines for context.
    background = svg_adjusted.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(sample_data)
        .enter().append("path")
        .attr("d", path);

    // Add foreground lines for focus.
    foreground = svg_adjusted.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(sample_data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", function(d) { return colorScale(d.year); })
        // .on("mouseover", highlight)
        // .on("mouseleave", doNotHighlight );
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);

    // Add a group element for each dimension.
    const g = svg_adjusted.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { 
            d3.select(this).call(axis.scale(y[d]));
            if(d=='year') {
                d3.select(this).call(axis.ticks(5));
                d3.select(this).call(axis.tickFormat(x => x.toString()));
            }
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { 
            d3.select(this).call(y[d].brush = d3.brushY()
                .extent([[-10,0], [10,height]])
                .on("brush", brush)           
                .on("end", brush)
                )
            })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {  
        var actives = [];
        svg.selectAll(".brush")
        .filter(function(d) {
                y[d].brushSelectionValue = d3.brushSelection(this);
                return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this).map(y[d].invert)
                });
        });
        
        var selected = [];
        // Update foreground to only display selected values
        foreground.style("display", function(d) {
            let isActive = actives.every(function(active) {
                let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
                return result;
            });
            // Only render rows that are active across all selectors
            if(isActive) selected.push(d);
            return (isActive) ? null : "none";
        });
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

var color = d3.scaleOrdinal()
.domain([1,2,3])
.range(['#b41f2d','#ffa70e','#1b9e51'])

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
            boxplot_data = result
            draw_box_plot(boxplot_data,0,selectedValue,'div5')
        },
        error: function(result) {
            $("#div5").html(result);
        }
    });
}

function plot_parallelplot(url, selectedValue) {
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
            draw_parallel_plot(result,selectedValue,'div6')
        },
        error: function(result) {
            $("#div6").html(result);
        }
    });
}