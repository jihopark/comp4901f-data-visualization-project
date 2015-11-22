(function() {


  var data = {};

  function loadData(day, data) {
    var fileName = "/data/comm-data-" + day + ".csv";
    if (!data[day]) {
      console.log("Need to load data for " + day);
      d3.csv("/data/comm-data-Fri.csv", function(loaded) {
        data[day] = loaded;
        console.log("Data Load Done. Total Row:" + data[day].length);
        countData(data[day]);
      });
    }
    else {
      console.log("Already Loaded");
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
  }

  function countTimeInterval(data) {
    var count = [];
    var start = d3.time.day(new Date(data[0]["Timestamp"]));
    var timeInterval = d3.time.minute.range(d3.time.hour.offset(start, 8), d3.time.minute.offset(start, 1470), 30);

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

  loadData("Fri", data);

})();
