(function() {

  var currentDay = "Fri";
  var data = {};
  var timeInterval;

  function loadData(day, data) {
    var fileName = "/data/comm-data-" + day + ".csv";
    if (!data[day]) {
      console.log("Need to load data for " + day);
      d3.select(".loading").style("visibility", "visible");
      d3.csv("/data/comm-data-" + day + ".csv", function(loaded) {
        data[day] = loaded;
        console.log("Data Load Done. Total Row:" + data[day].length);
        countData(data[day]);
      });
    }
    else {
      console.log("Already Loaded");
      countData(data[day]);
    }
  };

  function countData(data) {
    var locationMap = {};

    //Sort data according to location
    data.forEach(function(row){
      var foundLocation = false;
      for (var i=0, locationNum=Object.keys(locationMap).length ; i<locationNum; i++) {
        var location = Object.keys(locationMap)[i];
        if (location == row["location"]) {
          foundLocation = true;
          locationMap[location].push(row);
          break;
        }
      }
      //If Location is new
      if (!foundLocation) {
        locationMap[row["location"]] = [ ];
        locationMap[row["location"]].push(row);
      }
    });
    for (var i=0, locationNum=Object.keys(locationMap).length ; i<locationNum; i++) {
      var key = Object.keys(locationMap)[i];
      locationMap[key] = countTimeInterval(locationMap[key]);
    }
    render(locationMap);
  }

  function countTimeInterval(data) {
    var count = [];
    var start = d3.time.day(new Date(data[0]["Timestamp"]));
    timeInterval = d3.time.minute.range(d3.time.hour.offset(start, 8), d3.time.minute.offset(start, 1470), 30);

    for (var i=0;i<timeInterval.length-1;i++) {
      count[i] = 0;
    }

    var intervalStart, intervalEnd;
    for (var i=0;i<data.length;i++){
      for (var j=0;j<timeInterval.length-1;j++) {
        intervalStart = timeInterval[j];
        intervalEnd = timeInterval[j+1];
        var time = new Date(data[i]["Timestamp"]);
        if (time >= intervalStart && time <= intervalEnd)
          count[j]++;
      }
    }
    return count;
  }

  function render(data) {
    var array = [];
    var locations = Object.keys(data).sort();
    for (var i=0, locationNum=locations.length ; i<locationNum; i++) {
      array = array.concat(data[locations[i]]);
    }
    function cell_dim(total, cells) { return Math.floor(total/cells) }
    var total_height = 700;
    var total_width = 400;
    var horizontal_margin = 50, vertical_margin = 25;
    var rows = timeInterval.length-1; // 1hr split into 30 min blocks
    var cols = locations.length; //locations.length; // number of location
    var row_height = cell_dim(total_height, rows);
    var col_width = cell_dim(total_width, cols);


    var x = d3.scale.ordinal()
      .domain(locations)
      .rangeRoundPoints([0, total_width - col_width]);
    var y = d3.time.scale()
      .domain([timeInterval[0], timeInterval[timeInterval.length-1]])
      .rangeRound([0, row_height*rows]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");


    var svgContainer = d3.select("#svg-container")
                        .append("svg")

    var color_chart = svgContainer
                        .attr("class", "chart")
                        .attr("width", cols*col_width + horizontal_margin*2)
                        .attr("height", rows*row_height + vertical_margin*2);

    var color = d3.scale.linear()
                .domain([d3.min(array), d3.max(array)])
                .range(["#FFF0F0", "#8b0000"]);

    color_chart.selectAll("rect")
              .data(array)
              .enter()
              .append("rect")
              .attr("x", function(d,i) { return Math.floor(i / rows) * col_width; })
              .attr("y", function(d,i) { return i % rows * row_height; })
              .attr("width", col_width)
              .attr("height", row_height)
              .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")
              .attr("fill", color);

    var xAxisGroup = color_chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+ horizontal_margin + "," + (rows*row_height + vertical_margin) + ")")
        .call(xAxis);

    var yAxisGroup = color_chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")
        .call(yAxis);

    xAxisGroup.selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);

    xAxisGroup.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", total_width)
      .attr("y2", 0);
    d3.select(".loading").style("visibility", "hidden");
  }


  loadData(currentDay, data);
  d3.select("#radio-forms").on("change", function() {
    currentDay = d3.select('input[name="day-select"]:checked').node().value;
    d3.select("svg").remove();
    d3.select(".loading").style("visibility", "visible");
    loadData(currentDay, data);
  });

})();
