(function() {
  var currentDay = "Fri";
  var data = {};

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

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  function countData(data) {
    var fromData = {};
    var toData = {};
    for (var i=0, length=data.length; i<length; i++) {
      fromData[data[i]["from"]] = fromData[data[i]["from"]] || 0;
      fromData[data[i]["from"]]++;

      toData[data[i]["to"]] = toData[data[i]["to"]] || 0;
      toData[data[i]["to"]]++;
    }
    console.log("counting done");
    var fromDataKeys = Object.keys(fromData), toDataKeys = Object.keys(toData);
    var fromDataLength = fromDataKeys.length;
    var toDataLength = toDataKeys.length;

    var fromDataValue = [], toDataValue = [];

    console.log("From ID has " + fromDataLength + " unique values.");
    console.log("To ID has " + toDataLength + " unique values");

    for (var i=0 ; i<fromDataLength; i++) {
      fromDataValue.push({id:fromDataKeys[i],
                          fromCount:fromData[fromDataKeys[i]],
                          toCount:(toData[fromDataKeys[i]] ? toData[fromDataKeys[i]] : 0)});
    }

    var ultimateIds = fromDataKeys.concat(toDataKeys);
    ultimateIds = ultimateIds.filter(onlyUnique);
    console.log("There are total " + ultimateIds.length + " unique ids in this data.");

    console.log("From Data Maximum: " + d3.max(fromDataValue) + " Minimum: " + d3.min(fromDataValue));
    console.log("To Data Maximum: " + d3.max(toDataValue) + " Minimum: " + d3.min(toDataValue));

    var ul = d3.select("#from") // this one exists, and is to be parent of...
      .selectAll('div')       // ... these, which don't exist yet, but will once ...
        .data(fromDataValue)     // ... data[] is used to determine how many there must be ...
        .enter()                 // ... and we pick the set of 'not-yet-existing' elements corresponding
          .append('p')     // ... to one(1) data[i] item each
            .text(function(r){ return r.id+","+r.fromCount+","+r.toCount; });
    // create a row for each object in the data

  }
  loadData("Sun", data);

})();
