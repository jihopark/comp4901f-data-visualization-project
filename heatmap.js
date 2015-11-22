(function() {
  d3.csv("/data/comm-data-Fri.csv", function(data) {
    alert(data[0]["location"]);
  });

})();
