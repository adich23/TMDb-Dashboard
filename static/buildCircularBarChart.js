var margin = {top: 180, right: 0, bottom: 0, left: 180},
    width = 460 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom,
    innerRadius = 90,
    outerRadius = Math.min(width, height) / 2

function draw_circularBiPlotConsolidated(data, divID) {
    var max_revenue = d3.max(data, function(d) { return d.revenue; });
    var max_budget = d3.max(data, function(d) { return d.budget; });
    d3.select("#circularBiPlot").remove();
    var svg = d3.select("#"+divID)
            .append("svg")
            .attr("id", "circularBiPlot")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.scaleBand()
      .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
      .align(0)                  // This does nothing
      .domain(data.map(function(d) { return d.genre; }));

    var y = d3.scaleRadial()
      .range([innerRadius, outerRadius])   // Domain will be define later.
      .domain([0, max_revenue]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    var ybis = d3.scaleRadial()
      .range([innerRadius, 5])   // Domain will be defined later.
      .domain([0, max_revenue]);
    
    data.forEach(function(d) {
        d.genre = d.genre;
        d.budget = parseFloat(d.budget);
        d.revenue = parseFloat(d.revenue);
    });

    // Add the bars
    svg.append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
        .attr("class", "revenue_values")
        .attr("fill", "forestgreen")
        .attr("class", "yo")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d['revenue']); })
            .startAngle(function(d) { return x(d.genre); })
            .endAngle(function(d) { return x(d.genre) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))


    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
            .append("g")
            .attr("text-anchor", function(d) { return (x(d.genre) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            .attr("transform", function(d) { return "rotate(" + ((x(d.genre) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['revenue'])+10) + ",0)"; })
            .append("text")
            .text(function(d){return(d.genre)})
            .attr("transform", function(d) { return (x(d.genre) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            .style("font-size", "11px")
            .attr("alignment-baseline", "middle")
        .on("mouseover", function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr("opacity", "0.5");

                svg.append("text")
                    .attr("class", "tooltip_budget")
                    .attr("transform", "translate(" + (-innerRadius/2 + 25)  + "," + 0 + ")")
                    .style("font-size", "12px")
                    .style("fill", "darkOrange")
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", -25)
                        .text("Genre: " + d.genre)
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", 15)
                        .text("Total Budget: " + d.budget + " M")
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", 15)
                        .text("Total Revenue: " + d.revenue + " M")
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", 15)
                        .text("Avg Budget: " + d.avg_genre_budget + " M")
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", 15)
                        .text("Avg Revenue: " + d.avg_genre_revenue + " M")
        })
        .on("mouseout", function(d, i) {
            d3.selectAll(".tooltip_budget").remove();

            d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1');
        })
        .on("mousedown", function(d, i,) {
            driver_circularBiPlot("/drawCircularBiPlot/" + d.genre, "SPECIFIC", divID);
            driver_radarChart("/drawRadarChart/" + d.genre, "SPECIFIC", "chart_1_radarChart");
        });


    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
            .attr("class", "budget_values")
            .attr("fill", "red")
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius( function(d) { return ybis(0) })
            .outerRadius( function(d) { return ybis(d['budget']); })
            .startAngle(function(d) { return x(d.genre); })
            .endAngle(function(d) { return x(d.genre) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))
}


function draw_circularBiPlotSpecific(data, divID) {
	console.log("Are we in the server?")
    console.log(divID)
    var max_revenue = d3.max(data, function(d) { return d.revenue; });
    var max_budget = d3.max(data, function(d) { return d.budget; });
    d3.select("#circularBiPlot").remove();

    var svg = d3.select("#"+divID)
            .append("svg")
                .attr("id", "circularBiPlot")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.scaleBand()
      .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
      .align(0)                  // This does nothing
      .domain(data.map(function(d) { return d.movie; }));

    var y = d3.scaleRadial()
      .range([innerRadius, outerRadius])   // Domain will be define later.
      .domain([0, max_revenue]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    var ybis = d3.scaleRadial()
      .range([innerRadius, 5])   // Domain will be defined later.
      .domain([0, max_revenue]);
    
    data.forEach(function(d) {
        d.movie = d.movie;
        d.budget = parseFloat(d.budget);
        d.revenue = parseFloat(d.revenue);
        console.log(d)
    });

    svg.append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
        .attr("class", "revenue_values")
        .attr("fill", "forestgreen")
        .attr("class", "yo")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d['revenue']); })
            .startAngle(function(d) { return x(d.movie); })
            .endAngle(function(d) { return x(d.movie) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
            .append("g")
            .attr("text-anchor", function(d) { return (x(d.movie) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            .attr("transform", function(d) { return "rotate(" + ((x(d.movie) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['revenue'])+10) + ",0)"; })
            .append("text")
            .text(function(d){return(d.movie)})
            .attr("transform", function(d) { return (x(d.movie) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            .style("font-size", "11px")
            .attr("alignment-baseline", "middle")
        .on("mouseover", function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr("opacity", "0.5");

                svg.append("text")
                    .attr("class", "tooltip_budget")
                    .attr("transform", "translate(" + (-innerRadius/2 + 25)  + "," + 0 + ")")
                    .style("font-size", "12px")
                    .style("fill", "darkOrange")
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", -15)
                        .text("Movie: " + d.movie)
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", 15)
                        .text("Budget: " + d.budget + " M")
                    .append("svg:tspan")
                        .attr("x", -40)
                        .attr("dy", 15)
                        .text("Revenue: " + d.revenue + " M")
        })
        .on("mouseout", function(d, i) {
            d3.selectAll(".tooltip_budget").remove();

            d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1');
        });

    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
            .attr("class", "budget_values")
            .attr("fill", "red")
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius( function(d) { return ybis(0) })
            .outerRadius( function(d) { return ybis(d['budget']); })
            .startAngle(function(d) { return x(d.movie); })
            .endAngle(function(d) { return x(d.movie) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius)) 
}


function driver_circularBiPlot(endPointAddr, tag, divID) {
    $.ajax({
        type: 'GET',
        url: endPointAddr,
        contentType: 'application/json; charset=utf-8',
        xhrFields:{
            withCredentials: false
        },
        headers:{},
        success:function(result) {
          	var data = JSON.parse(result)
            if(tag == "CONSOLIDATED")
                draw_circularBiPlotConsolidated(data, divID);
            else {
                draw_circularBiPlotSpecific(data, divID);
            }
        },
        error: function(error) {
            $("#error").html(error);
        }
    });
}

