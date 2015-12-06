var vis = d3.select("#visualisation");
function cell_dim(total, cells) { return Math.floor(total/cells) }
var total_height = 500;
var total_width = 1000;
var horizontal_margin = 100, vertical_margin = 25;
var cols = 30; // 1hr split into 30 min blocks
var rows = 5; //locations.length; // number of location
var row_height = cell_dim(total_height, rows);
var col_width = cell_dim(total_width, cols);

(function() {

  var data = {};
  var locations = ["Kiddie Land", "Entry Corridor", "Tundra Land", "Wet Land", "Coaster Alley"];
  function render(day, targetId) {
    d3.select("#visualisation").html("");
    /////////////////////////
    // DRAW AXIS STUFF

    var start = d3.time.day(new Date(data[day][0]["Timestamp"]));
    timeInterval = d3.time.minute.range(d3.time.hour.offset(start, 8), d3.time.minute.offset(start, 1470), 30);

    var location_scale = d3.scale.ordinal()
      .domain(locations)
      .rangeRoundPoints([0, total_height - row_height]);
    var time_scale = d3.time.scale()
      .domain([timeInterval[0], timeInterval[timeInterval.length-1]])
      .rangeRound([0, col_width*cols]);
    var xScale = d3.scale.linear().range([horizontal_margin, col_width*cols+horizontal_margin]).domain([0, 54000000]);
    var yScale = d3.scale.linear().range([vertical_margin, total_height+vertical_margin]).domain([0, 5]);

    var xAxis = d3.svg.axis()
        .scale(time_scale)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(location_scale)
        .orient("left");
    var xAxisGroup = vis.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+ horizontal_margin + "," + (vertical_margin-15) + ")")
        .call(xAxis);
    var yAxisGroup = vis.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+ horizontal_margin + "," + (row_height/2 + vertical_margin) + ")")
        .call(yAxis);
    var location_scale = d3.scale.ordinal()
      .domain(locations)
      .rangeRoundPoints([0, total_height - row_height]);
    xAxisGroup.selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);



    /////////////////////////
    // DRAW CHART
    //input parameters

    var startTimeMillis = (new Date(data[day][0]["Timestamp"])).getTime();
    var targetIdCount = 0;
    for (var i=0; i<data[day].length; ++i) {
      if (targetId===data[day][i].from) {
        targetIdCount++;
        var locationId = -1;
        for (var j=0; j<5; ++j) {
          if (locations[j]===data[day][i].location) {
            locationId = j;
          }
        }

        vis.append("rect")
            .attr("x", xScale((new Date(data[day][i].Timestamp)).getTime()-startTimeMillis))
            .attr("y", yScale(locationId))
            .attr("width", 1)
            .attr("height", yScale(0.7))
            .attr('opacity',0.3)
            .attr('fill',"#00FF00");
      }
      else if (targetId===data[day][i].to) {
        targetIdCount++;
        var locationId = -1;
        for (var j=0; j<5; ++j) {
          if (locations[j]===data[day][i].location) {
            locationId = j;
          }
        }

        vis.append("rect")
            .attr("x", xScale((new Date(data[day][i].Timestamp)).getTime()-startTimeMillis))
            .attr("y", yScale(locationId))
            .attr("width", 1)
            .attr("height", yScale(0.7))
            .attr('opacity',0.3)
            .attr('fill',"#FF0000");
      }


    }

    console.log("target Id count = "+targetIdCount);
  }

  // TODO: this is just an example usage
  //function generateGraph(data, startTime, endTime, idList, locationList, callback)
  function dataHandler() {
    //render("Fri","325528");
  }



  var days = ["Fri","Sat","Sun"];
  var loadCompleted = false;
  function loadData(data, counter) {
    var fileName = "/data/comm-data-" + days[counter] + ".csv";
    if (!data[days[counter]]) {
      console.log("Need to load data for " + days[counter]);
      d3.csv("/data/comm-data-"+days[counter]+".csv", function(loaded) {
        data[days[counter]] = loaded;
        console.log("Data Load Done. Total Row:" + data[days[counter]].length);
        if (counter>0)
          loadData(data, counter-1);
        else {
            loadCompleted=true;
            dataHandler();
        }
      });
    }
    else {
      console.log("Already Loaded");
    }
  };

  loadData(data, 2);

  document.getElementById("button").addEventListener("click", function() {
      console.log(document.getElementById("inputDay").value+", "+document.getElementById("inputId").value);
      render(document.getElementById("inputDay").value, document.getElementById("inputId").value);
      document.getElementById("title").innerHTML = "Call history of id="+document.getElementById("inputId").value+" on "+document.getElementById("inputDay").value+"day";
  }, false);


})();
