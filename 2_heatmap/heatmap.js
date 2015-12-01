(function() {

  var data = {};

  function loadData(day, data) {
    var fileName = "/data/comm-data-" + day + ".csv";
    if (!data[day]) {
      console.log("Need to load data for " + day);
      d3.csv("/data/comm-data-Fri.csv", function(loaded) {
        data[day] = loaded;
        console.log("Data Load Done. Total Row:" + data[day].length);
      });
    }
    else {
      console.log("Already Loaded");
    }
  };

  loadData("Sat", data);

})();
