(function() {

  var currentDay = "Sun";
  var data = {};
  var timeInterval;

  function loadData(day, data) {
    var fileName = "/data/comm-data-" + day + ".csv";
    if (!data[day]) {
      console.log("Need to load data for " + day);
      d3.select(".loading").style("display", "inline");
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
    var peopleCount = {};

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
      peopleCount[key] = countUniqueCallersTimeInterval(locationMap[key]);
      locationMap[key] = countTimeInterval(locationMap[key]);
    }
    console.log("peopleCount");
    console.log(peopleCount);
    render(locationMap, peopleCount);
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
    console.log("countTimeInterval");
    console.log(count);
    return count;
  }

  function countUniqueCallersTimeInterval(data) {
    var count = [];
    var uniqueIdList = [];

    var start = d3.time.day(new Date(data[0]["Timestamp"]));
    timeInterval = d3.time.minute.range(d3.time.hour.offset(start, 8), d3.time.minute.offset(start, 1470), 30);

    for (var i=0;i<timeInterval.length-1;i++) {
      count[i] = 0;
      uniqueIdList[i] = [];
    }

    var intervalStart, intervalEnd;
    for (var i=0;i<data.length;i++){
      for (var j=0;j<timeInterval.length-1;j++) {
        intervalStart = timeInterval[j];
        intervalEnd = timeInterval[j+1];
        var time = new Date(data[i]["Timestamp"]);
        if (time >= intervalStart && time <= intervalEnd) {
          //count[j]++;
          var isUnique = true;
          for (var k=0; k<uniqueIdList[j].length; ++k) {
            if (data[i]["from"]===uniqueIdList[j][k]) {
              isUnique = false;
            }
          }
          if (isUnique)
            uniqueIdList[j].push(data[i]["from"]);
        }
      }
    }
    console.log("countUniqueCallers");

    for (var i=0; i<uniqueIdList.length; ++i) {
      count[i] = uniqueIdList[i].length;
    }
    console.log(count);
    return count;

  }

  function render(data, blueData) {
    var array = [];
    var blueArray = [];

    var locations = Object.keys(data).sort();
    for (var i=0, locationNum=locations.length ; i<locationNum; i++) {
      array = array.concat(data[locations[i]]);
      blueArray = blueArray.concat(blueData[locations[i]]);
    }
    for (var i=0; i<array.length; ++i) {
      blueArray[i] = parseInt(array[i]) / parseInt(blueArray[i]);
    }
    console.log("blueArray");
    console.log(blueArray);

    function cell_dim(total, cells) { return Math.floor(total/cells) }
    var total_height = 400;
    var total_width = 700;
    var horizontal_margin = 100, vertical_margin = 25;
    var cols = timeInterval.length-1; // 1hr split into 30 min blocks
    var rows = locations.length; //locations.length; // number of location
    var row_height = cell_dim(total_height, rows);
    var col_width = cell_dim(total_width, cols);


    var location_scale = d3.scale.ordinal()
      .domain(locations)
      .rangeRoundPoints([0, total_height - row_height]);

    var time_scale = d3.time.scale()
      .domain([timeInterval[0], timeInterval[timeInterval.length-1]])
      .rangeRound([0, col_width*cols]);

    var xAxis = d3.svg.axis()
        .scale(time_scale)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(location_scale)
        .orient("left");


    var svgContainer = d3.select("#svg-container")
                        .append("svg")

    var blueSvgContainer = d3.select("#svg-container")
                        .append("svg")

    var blue_color_chart = blueSvgContainer
                        .attr("class", "chart")
                        .attr("width", cols*col_width + horizontal_margin*2)
                        .attr("height", rows*row_height + vertical_margin*2);

    var color_chart = svgContainer
                        .attr("class", "chart")
                        .attr("width", cols*col_width + horizontal_margin*2)
                        .attr("height", rows*row_height + vertical_margin*2);


    var max = d3.max(array), min = d3.min(array);
    var blueMax = d3.max(blueArray), blueMin = d3.min(blueArray);
    var color = d3.scale.linear()
                .domain([min, max])
                .range(["#FFFAFA", "#CC0000"]);

    // blue color
    var blueColor = d3.scale.linear()
                .domain([blueMin, blueMax])
                .range(["#FAFAFF", "#0000CC"]);
    // first row = array1, second row = array2 and so on.
    function mixByRow(arr1, arr2, cols) {
      var output = [];
      // for each row of arr1 and arr2
      for (var i=0; i<(array.length/cols); ++i) {
        console.log ("row "+i);
        // first row = red, second row = blue
        for (var j=0; j<cols; ++j) {
          output.push(arr1[i*cols+j]);
        }
        for (var j=0; j<cols; ++j) {
          output.push(arr2[i*cols+j]);
        }
      }
      return output;
    }

    var arrayForNewHeatmap = mixByRow(array, blueArray, cols);
    console.log(arrayForNewHeatmap);
    //console.log(array);
    color_chart.selectAll("rect")
              .data(arrayForNewHeatmap)
              .enter()
              .append("rect")
              .attr("y", function(d,i) { return Math.floor(i / cols) * (row_height/2); })
              .attr("x", function(d,i) { return i % cols * col_width; })
              .attr("width", col_width)
              .attr("height", function(d,i) {if((Math.floor(i/cols))%2==0){return row_height/2}else{return row_height/2.4}})
              .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")
              .attr("fill", function(d,i) {
                //console.log(d);
                //console.log("max "+max);
                //console.log(Math.floor(i/cols)+"th row");
                if ((Math.floor(i/cols))%2==0) {
                  return color(d);
                }
                else {
                  return blueColor(d);
                }
              });

/*
    color_chart.selectAll("rect")
              .data(array)
              .enter()
              .append("rect")
              .attr("y", function(d,i) { return Math.floor(i / cols) * row_height; })
              .attr("x", function(d,i) { return i % cols * col_width; })
              .attr("width", col_width)
              .attr("height", row_height/2)
              .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")
              .attr("fill", color);
*/
    var xAxisGroup = color_chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+ horizontal_margin + "," + (vertical_margin-15) + ")")
        .call(xAxis);

    var yAxisGroup = color_chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+ horizontal_margin + "," + (row_height/2 + vertical_margin) + ")")
        .call(yAxis);

    xAxisGroup.selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);

    d3.select(".loading").style("display", "none");

    var linearScale = d3.scale.linear()
                  .domain([1,6])
                  .range([min, max]);
    var scaleExplanation = d3.select("#explanations")
                        .append("svg");
    scaleExplanation.attr("class", "scale-explanation")
                    .attr("width", cols*col_width + horizontal_margin*2)
                    .attr("height", 80);
    scaleExplanation.selectAll("rect")
                    .data([1,2,3,4,5,6].map(linearScale))
                    .enter()
                    .append("rect")
                    .attr("x", function(d,i) { return i * col_width/2; })
                    .attr("y", function(d,i) { return 0; })
                    .attr("width", col_width/2)
                    .attr("height", row_height)
                    .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")
                    .attr("fill", color);

    var text1 = scaleExplanation.append("text");
    var text2 = scaleExplanation.append("text");

    text1.text("less")
      .attr("x",0)
      .attr("y",0)
      .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")

    text2.text("more")
      .attr("x",col_width*2.5)
      .attr("y",0)
      .attr("transform", "translate("+ horizontal_margin + "," + vertical_margin + ")")

  }


  loadData(currentDay, data);

  d3.select("#radio-forms").on("change", function() {
    currentDay = d3.select('input[name="day-select"]:checked').node().value;
    d3.select(".chart").remove();
    d3.select("#explanations").remove();
    d3.select(".loading").style("display", "inline");
    loadData(currentDay, data);
  });

})();
