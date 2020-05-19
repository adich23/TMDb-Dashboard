var genreOnDemand = "CONSOLIDATED";

function show_buttons() {
    console.log("Show Task2 Called");
    var divToShowTop10 = document.getElementById('top10');
    var divToShowMid10 = document.getElementById('mid10');
    var divToShowBottom10 = document.getElementById('bottom10');

    divToShowTop10.style.display = 'block';
    divToShowMid10.style.display = 'block';
    divToShowBottom10.style.display = 'block';
}

function hide_buttons() {
    console.log("Show Task3 Called");
    var divToShowTop10 = document.getElementById('top10');
    var divToShowMid10 = document.getElementById('mid10');
    var divToShowBottom10 = document.getElementById('bottom10');

    divToShowTop10.style.display = 'none';
    divToShowMid10.style.display = 'none';
    divToShowBottom10.style.display = 'none'; 
}

const callTop10 = document.querySelector("#top10");
const callMid10 = document.querySelector("#mid10");
const callBottom10 = document.querySelector("#bottom10");

callTop10.onclick = function() {
    var genre = genreOnDemand;
    driver_circularBiPlot('/drawCircularBiPlot/top10/' + genre, 'SPECIFIC', 'chart_1_radarChart')
};

callMid10.onclick = function() {
    var genre = genreOnDemand;
    driver_circularBiPlot('/drawCircularBiPlot/mid10/' + genre, 'SPECIFIC', 'chart_1_radarChart')
};

callBottom10.onclick = function() {
    var genre = genreOnDemand;
    driver_circularBiPlot('/drawCircularBiPlot/bottom10/' + genre, 'SPECIFIC', 'chart_1_radarChart')
};

function draw_circularBiPlotConsolidated(data, divID) {
    var margin = {top: 190, right: 0, bottom: 0, left: 220},
    width = 460 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom,
    innerRadius = 90,
    outerRadius = Math.min(width, height) / 2;

    genreOnDemand = "CONSOLIDATED";

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
    
    if(max_revenue > max_budget) {
        var max = max_revenue;
    }
    else {
        var max = max_budget;
    }

    console.log(max_budget + " " + max_revenue + " " + max);

    var x = d3.scaleBand()
      .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
      .align(0)                  // This does nothing
      .domain(data.map(function(d) { return d.genre; }));

    var y = d3.scaleRadial()
      .range([innerRadius, outerRadius])   // Domain will be define later.
      .domain([0, max]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    var ybis = d3.scaleRadial()
      .range([innerRadius, 5])   // Domain will be defined later.
      .domain([0, max]);
    
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
            .style("font-size", "10px")
            .attr("alignment-baseline", "middle")
        .on("mouseover", function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr("opacity", "0.5");

                svg.append("text")
                    .attr("class", "tooltip_budget")
                    .attr("transform", "translate(" + (-innerRadius/2 + 35)  + "," + 0 + ")")
                    .style("font-size", "10px")
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
            genreOnDemand = d.genre;
            
            console.log("genreOnDemand is:");
            console.log(genreOnDemand);
        
            driver_circularBiPlot("/drawCircularBiPlot/top10/" + d.genre, "SPECIFIC", divID);
            driver_radarChart("/drawRadarChart/" + d.genre, "SPECIFIC", "chart_1_radarChart");
            
            // Show all the buttons necessary for plotting sections of data
            // Hide if tag is CONSOLIDATED 
            // So write the HIDE function when RESET button is clicked and also when page loads for the first time

            show_buttons();

            plot_scatter('/draw2dScatterPlot/' + d.genre, d.genre);
            plot_boxplot('/drawBoxPlot/' + d.genre, d.genre);
            plot_parallelplot('/drawParallelPlot/' + d.genre, d.genre);

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
    var margin = {top: 180, right: 0, bottom: 0, left: 210},
    width = 460 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom,
    innerRadius = 90,
    outerRadius = Math.min(width, height) / 2;

	console.log("On button click")
    console.log(data)
    var max_revenue = d3.max(data, function(d) { return d.revenue; });
    var max_budget = d3.max(data, function(d) { return d.budget; });
    d3.select("#circularBiPlot").remove();
    
    console.log(margin.left, margin.right, margin.top, margin.bottom, width, height);
    
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

    if(max_revenue > max_budget) {
        var max = max_revenue;
    }
    else {
        var max = max_budget;
    }

    console.log(max_budget + " " + max_revenue + " " + max);
    var y = d3.scaleRadial()
      .range([innerRadius, outerRadius])   // Domain will be define later.
      .domain([0, max]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    var ybis = d3.scaleRadial()
      .range([innerRadius, 5])   // Domain will be defined later.
      .domain([0, max]);
    
    data.forEach(function(d) {
        d.movie = d.movie;
        d.budget = parseFloat(d.budget);
        d.revenue = parseFloat(d.revenue);
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
            .style("font-size", "10px")
            .attr("alignment-baseline", "middle")
        .on("mouseover", function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr("opacity", "0.5");

                svg.append("text")
                    .attr("class", "tooltip_budget")
                    .attr("transform", "translate(" + (-innerRadius/2 + 35)  + "," + 0 + ")")
                    .style("font-size", "10px")
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
            console.log(data)
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

function draw_radarChartConsolidated(data, divID) {

    const max = Math.max;
    const sin = Math.sin;
    const cos = Math.cos;
    const HALF_PI = Math.PI / 2;

    const RadarChart = function RadarChart(divID, data, options) {
        const wrap = (text, width) => {
            text.each(function() {
                var text = d3.select(this), 
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.4, 
                    y = text.attr("y")
                    x = text.attr("x")
                    dy = parseFloat(text.attr("dy"))
                    tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
            
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            }); 
        } //wrap function is closed here 

        const  cfg = {
            w: 600,
            h: 600,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            levels: 3,
            maxValue: 0,            //What is the value that the biggest circle will represent
            labelFactor: 1.25,  //How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60,      //The number of pixels after which a label needs to be given a new line
            opacityArea: 0.35,  //The opacity of the area of the blob
            dotRadius: 4,           //The size of the colored circles of each blog
            opacityCircles: 0.1,    //The opacity of the circles of each blob
            strokeWidth: 2,         //The width of the stroke around each blob
            roundStrokes: false,    //If true the area and stroke will follow a round path (cardinal-closed)
            color: d3.scaleOrdinal(d3.schemeCategory10),    //Color function,
            format: '.2%',
            unit: '',
            legend: false
        };

        //Put all of the options into a variable called cfg
        if('undefined' !== typeof options){
          for(var i in options){
            if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
          }//for i
        }//if

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        // var maxValue = max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
        let maxValue = 0;
        for (let j=0; j < data.length; j++) {
            for (let i = 0; i < data[j].axes.length; i++) {
                data[j].axes[i]['id'] = data[j].name;
                if (data[j].axes[i]['value'] > maxValue) {
                    maxValue = data[j].axes[i]['value'];
                }
            }
        }
        maxValue = max(cfg.maxValue, maxValue);

        const allAxis = data[0].axes.map((i, j) => i.axis), //Names of each axis
            total = allAxis.length,                 //The number of different axes
            radius = Math.min(cfg.w/2, cfg.h/2),    //Radius of the outermost circle
            Format = d3.format(cfg.format),             //Formatting
            angleSlice = Math.PI * 2 / total;       //The width in radians of each "slice"

        //Scale for the radius
        const rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);

        /////////////////////////////////////////////////////////
        //////////// Create the container SVG and g /////////////
        /////////////////////////////////////////////////////////
        const parent = d3.select("#"+divID);

        //Remove whatever chart with the same id/class was present before
        parent.select("svg").remove();

        //Initiate the radar chart SVG
        let svg = parent.append("svg")
                .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right + 80)
                .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
                .attr("class", "radar");

        let g = svg.append("g")
            .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        let filter = g.append('defs').append('filter').attr('id','glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        let axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", d => radius / cfg.levels * d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter" , "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter().append("text")
           .attr("class", "axisLabel")
           .attr("x", 4)
           .attr("y", d => -d * radius / cfg.levels)
           .attr("dy", "0.4em")
           .style("font-size", "10px")
           .attr("fill", "#737373")
           .text(d => Format(maxValue * d / cfg.levels) + cfg.unit);

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxValue *1.1) * cos(angleSlice * i - HALF_PI))
            .attr("y2", (d, i) => rScale(maxValue* 1.1) * sin(angleSlice * i - HALF_PI))
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d,i) => rScale(maxValue * cfg.labelFactor) * cos(angleSlice * i - HALF_PI))
            .attr("y", (d,i) => rScale(maxValue * cfg.labelFactor) * sin(angleSlice * i - HALF_PI))
            .text(d => d)
            .call(wrap, cfg.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        const radarLine = d3.radialLine()
            .curve(d3.curveLinearClosed)
            .radius(d => rScale(d.value))
            .angle((d,i) => i * angleSlice);

        if(cfg.roundStrokes) {
            radarLine.curve(d3.curveCardinalClosed)
        }

        //Create a wrapper for the blobs
        const blobWrapper = g.selectAll(".radarWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper");

        //Append the backgrounds
        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", d => radarLine(d.axes))
            .style("fill", (d,i) => cfg.color(i))
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function(d, i) {
                //Dim all blobs
                parent.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', () => {
                //Bring back all blobs
                parent.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);
            });

        //Create the outlines
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function(d,i) { return radarLine(d.axes); })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", (d,i) => cfg.color(i))
            .style("fill", "none")
            .style("filter" , "url(#glow)");

        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data(d => d.axes)
            .enter()
            .append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
            .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
            .style("fill", (d) => cfg.color(d.id))
            .style("fill-opacity", 0.8);

        //Wrapper for the invisible circles on top
        const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(d => d.axes)
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice*i - HALF_PI))
            .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice*i - HALF_PI))
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function(d,i) {
                tooltip
                    .attr('x', this.cx.baseVal.value - 10)
                    .attr('y', this.cy.baseVal.value - 10)
                    .transition()
                    .style('display', 'block')
                    .text(Format(d.value) + cfg.unit);
            })
            .on("mouseout", function(){
                tooltip.transition()
                    .style('display', 'none').text('');
            });

        const tooltip = g.append("text")
            .attr("class", "tooltip")
            .attr('x', 0)
            .attr('y', 0)
            .style("font-size", "12px")
            .style('display', 'none')
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em");

        if (cfg.legend !== false && typeof cfg.legend === "object") {
            let legendZone = svg.append('g');
            let names = data.map(el => el.name);
            
            if (cfg.legend.title) {
                let title = legendZone.append("text")
                    .attr("class", "title")
                    .attr('transform', `translate(${cfg.legend.translateX},${cfg.legend.translateY})`)
                    .attr("x", cfg.w - 70)
                    .attr("y", 10)
                    .attr("font-size", "12px")
                    .attr("fill", "#404040")
                    .text(cfg.legend.title);
            }
            
            let legend = legendZone.append("g")
                .attr("class", "legend")
                .attr("height", 100)
                .attr("width", 200)
                .attr('transform', `translate(${cfg.legend.translateX},${cfg.legend.translateY + 20})`);
            
            // Create rectangles markers
            legend.selectAll('rect')
              .data(names)
              .enter()
              .append("rect")
              .attr("x", cfg.w - 65)
              .attr("y", (d,i) => i * 20)
              .attr("width", 10)
              .attr("height", 10)
              .style("fill", (d,i) => cfg.color(i));
            
            // Create labels
            legend.selectAll('text')
              .data(names)
              .enter()
              .append("text")
              .attr("x", cfg.w - 52)
              .attr("y", (d,i) => i * 20 + 9)
              .attr("font-size", "11px")
              .attr("fill", "#737373")
              .text(d => d)
              .on("mousedown", function(d, i) {
                genreOnDemand = d;
                show_buttons();
                driver_radarChart("/drawRadarChart/" + d, "SPECIFIC", divID);
                driver_circularBiPlot("/drawCircularBiPlot/top10/" + d, "SPECIFIC", "chart_2_circularBiPlot");
                plot_scatter('/draw2dScatterPlot/' + d, d);
                plot_boxplot('/drawBoxPlot/'+ d, d);
                plot_parallelplot('/drawParallelPlot/' + d, d);
            });
        }

        return svg;
    } //RadarChart function closed

    var margin = { top: 50, right: 80, bottom: 50, left: 80 },
                width = 700 //Math.min(700, window.innerWidth / 4) - margin.left - margin.right,
                height = 700//Math.min(width, window.innerHeight - margin.top - margin.bottom);

    var radarChartOptions2 = {
      w: 290,
      h: 350,
      margin: margin,
      maxValue: 60,
      levels: 6,
      roundStrokes: true,
      color: d3.scaleOrdinal().range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']),
        format: '.0f',
        legend: {title: 'Genres', translateX: 180, translateY: 80},
        unit: '$'
    };

    let svg_radar2 = RadarChart(divID, data, radarChartOptions2);
} // Entire function closed 


function driver_radarChart(endPointAddr, tag, divID) {
    $.ajax({
        type: 'GET',
        url: endPointAddr,
        contentType: 'application/json; charset=utf-8',
        xhrFields:{
            withCredentials: false
        },
        headers:{},
        success:function(result) {
            var cleaned_data = result
                            .replace(/\\'/g, "\\'")
                            .replace(/\\n/g, "\\n")  
                            .replace(/\\"/g, '\\"')
                            .replace(/\\&/g, "\\&")
                            .replace(/\\r/g, "\\r")
                            .replace(/\\t/g, "\\t")
                            .replace(/\\b/g, "\\b")
                            .replace(/\\f/g, "\\f");
                            // remove non-printable and other non-valid JSON chars
            cleaned_data = cleaned_data.replace(/[\u0000-\u0019]+/g,""); 
         
            var str_data = JSON.stringify(cleaned_data);
            var data = JSON.parse(cleaned_data)
         
            if(tag == "CONSOLIDATED")
                draw_radarChartConsolidated(data, divID);
            else {
                draw_radarChartConsolidated(data, divID);
            }
        },
        error: function(result) {
            $("#error").html(result);
        }
    });
}

var boxplot_data;

const btn = document.querySelector('#btn');
const btn1 = document.querySelector('#btn_1');

btn.onclick = function () {
    draw_box_plot(boxplot_data, 0, category,'div5');
};

btn1.onclick = function () {
    draw_box_plot(boxplot_data, 1, category,'div5');
};

function draw_box_plot(dictData, feature_num, chartTitle, divId) {
    
    // set the dimensions and margins of the graph
    d3.select('#chart'+divId).remove();
    var margin = {top: 20, right: 20, bottom: 50, left: 20},
    width = 500 - margin.left - margin.right,
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
    var height = 390 - margin.top - margin.bottom;

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
            draw_parallel_plot(result,selectedValue,'div6')
        },
        error: function(result) {
            $("#div6").html(result);
        }
    });
}