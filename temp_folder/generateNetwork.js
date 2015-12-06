(function() {

  var data = {};

  //TODO: render graph here!!
  function renderGraph(nodes, edges) {
    console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);
  }

  // TODO: this is just an example usage
  //function generateGraph(data, startTime, endTime, idList, locationList, callback)
  function dataHandler() {
    generateGraph(data["Fri"], data["Fri"][1000]["Timestamp"], data["Fri"][2000]["Timestamp"], ["1075494"], ["Wet Land", "Coaster Alley"], renderGraph);
    // or
    generateGraph(data["Fri"], data["Fri"][0]["Timestamp"], data["Fri"][10]["Timestamp"], null, null, renderGraph);
    generateGraph(data["Sun"], data["Sun"][0]["Timestamp"], data["Sun"][data["Sun"].length-1]["Timestamp"], ["1711922"], null, sortByFrequency);
    /*generateGraph(data["Fri"], data["Fri"][0]["Timestamp"], data["Fri"][data["Fri"].length-1]["Timestamp"], null, null, friday);
    generateGraph(data["Sat"], data["Sat"][0]["Timestamp"], data["Sat"][data["Sat"].length-1]["Timestamp"], null, null, saturday);
    generateGraph(data["Sun"], data["Sun"][0]["Timestamp"], data["Sun"][data["Sun"].length-1]["Timestamp"], null, null, sunday);*/
  }


  function sortByFrequency(nodes, edges) {
    console.log("sortByFrequency");
    console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);
    nodes.sort(function (a,b) {
      return b.sendFrequency - a.sendFrequency;

    })
    console.log("sorted nodes count = "+nodes.length);
    console.log(nodes);
  }

  var fridayNodes = [];
  var saturdayNodes = [];
  var sundayNodes = [];
  var commonIdList = [];

  function friday(nodes, edges) {
    fridayNodes = nodes;console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);
  }
  function saturday(nodes, edges) {
    saturdayNodes = nodes;console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);
  }
  function sunday(nodes, edges) {
    sundayNodes = nodes;console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);
    computeCommonIds();
  }

  function computeCommonIds() {
    for (var i=0; i<fridayNodes.length; ++i) {
      var appearOnSaturday = false;
      var appearOnSunday = false;
      // look for same node in saturday
      for (var j=0; j<saturdayNodes.length; ++j) {
        if (fridayNodes[i].id === saturdayNodes[j].id) {
          appearOnSaturday = true;
          break;
        }
      }

      // look for same node in sunday
      for (var j=0; j<sundayNodes.length; ++j) {
        if (fridayNodes[i].id === sundayNodes[j].id) {
          appearOnSunday = true;
          break;
        }
      }

      if (appearOnSaturday==true && appearOnSunday==true) {
        commonIdList.push(fridayNodes[i].id);
      }

    }
    console.log(commonIdList);
    document.getElementById("data-container").innerHTML=JSON.stringify(commonIdList)
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


  // example 1: generateGraph(data["Fri"], timeStamp, null, null);
  // example 2: generateGraph(data["Fri"], timeStamp, ["1234","4534"], null);
  // data, startTime and endTime need to be passed. Oter parameters are used as additional filters
  function generateGraph(data, startTime, endTime, idList, locationList, callback) {

    var nodes = [];
    var edges = [];

    if (!loadCompleted)
      return;

    /*
      Part 1: generate nodes
    */
    function VisitorObject(id,firstSeen,isSender, location, to){
      var retObject = {
                        id: id,
                        firstSeen: firstSeen, //timestamp
                        lastSeen: firstSeen,  //timestamp
                        sendFrequency: 0,
                        receiveFrequency: 0,
                        sendLocationFrequency: {"Kiddie Land": 0, "Entry Corridor": 0, "Tundra Land": 0, "Wet Land": 0, "Coaster Alley": 0}
                      };
      if (isSender) {
        retObject.sendFrequency = 1;
        retObject.sendLocationFrequency[location] = 1;
      }
      else {
        retObject.receiveFrequency = 1;
      }
      return retObject;
    }

    //console.log("StartTime = "+new Date(startTime));
    var indexOnStartTime = 0;
    while ((new Date(data[indexOnStartTime]["Timestamp"])).getTime()<(new Date(startTime)).getTime()) {
      indexOnStartTime++;
    }
    var indexOnEndTime = indexOnStartTime;
    while (data[indexOnEndTime] && (new Date(data[indexOnEndTime]["Timestamp"])).getTime()<=(new Date(endTime)).getTime()) {
      indexOnEndTime++;
    }

    //console.log("indexOnStartTime = "+indexOnStartTime);
    //console.log("indexOnEndTime = "+indexOnEndTime);

    // for each row in table
    for (var i=indexOnStartTime; i<indexOnEndTime; ++i) {
      // filter out data by idList and locationList
      if (idList) {
        var idFound = false;
        for (var j=0; j<idList.length; ++j) {
          if (idList[j]===data[i].from || idList[j]===data[i].to) {
            idFound=true;
            break;
          }
        }
        // skip this row
        if (!idFound) {
          continue;
        }
      }
      if (locationList) {
        var locFound = false;
        for (var j=0; j<locationList.length; ++j) {
          if (locationList[j]===data[i].location) {
            locFound=true;
            break;
          }
        }
        // skip this row
        if (!locFound) {
          continue;
        }
      }


      var isIdUnique = true;
      // identify unique IDs by source from call source
      for (var j=0; j<nodes.length; ++j){
        if (nodes[j].id===data[i].from) {
          isIdUnique = false;
          nodes[j]["lastSeen"] = data[i].Timestamp;
          nodes[j]["sendFrequency"] +=1;
          nodes[j]["sendLocationFrequency"][data[i].location] +=1;
          break;
        }
      }
      if (isIdUnique) {
        // register as sender
        nodes.push(VisitorObject(data[i].from, data[i].Timestamp, true, data[i].location, data[i].to));
      }

      isIdUnique = true;
      // identify unique IDs by call destination
      for (var j=0; j<nodes.length; ++j){
        if (nodes[j].id===data[i].to) {
          isIdUnique = false;
          nodes[j]["lastSeen"] = data[i].Timestamp;
          nodes[j]["receiveFrequency"] +=1;
          break;
        }
      }
      if (isIdUnique) {
        // register as recipient
        nodes.push(VisitorObject(data[i].to, data[i].Timestamp, false, data[i].location));
      }

      if (i%10000==0)    // just to keep up with the progress of algorithm
        console.log("nodes count so far = "+nodes.length);
    }
    //console.log("nodes count = "+nodes.length);
    //console.log(nodes);


    /*
      Part 2: generate edges
    */
    function D3Edge(src, tgt, val){
      var retObject = {
                        source: src,
                        target: tgt,
                        frequency: val,
                      };
      return retObject;
    }
    for (var i=indexOnStartTime; i<indexOnEndTime; ++i)
    {
      // filter out data by idList and locationList
      if (idList) {
        var idFound = false;
        for (var j=0; j<idList.length; ++j) {
          if (idList[j]===data[i].from || idList[j]===data[i].to) {
            idFound=true;
            break;
          }
        }
        // skip this row
        if (!idFound) {
          continue;
        }
      }
      if (locationList) {
        var locFound = false;
        for (var j=0; j<locationList.length; ++j) {
          if (locationList[j]===data[i].location) {
            locFound=true;
            break;
          }
        }
        // skip this row
        if (!locFound) {
          continue;
        }
      }

      // find source index
      var sourceIndex = -1;
      for (var j=0; j<nodes.length; ++j){
        if (data[i].from===nodes[j].id)
          sourceIndex = j;
      }

      // find target index
      var targetIndex = -1;
      for (var j=0; j<nodes.length; ++j){
        if (data[i].to===nodes[j].id)
          targetIndex = j;
      }

      // no such edge found
      if (sourceIndex==-1 || targetIndex==-1)
        continue;

      // check for duplicate source & target
      var newEdge = true;
      for (var j=0; j<edges.length; ++j){
        if (edges[j].source == sourceIndex && edges[j].target == targetIndex
          || edges[j].source == targetIndex && edges[j].target == sourceIndex) {
          newEdge = false;
          edges[j]["frequency"] +=1;
          break;
        }
      }
      if (newEdge)
        edges.push(D3Edge(sourceIndex, targetIndex, 1));

      if (i%10000==0)    // just to keep up with the progress of algorithm
        console.log("edges count so far = "+edges.length);
    }

    //console.log("edges count = "+edges.length);
    //console.log(edges);
    if (callback) {
      callback(nodes, edges);
    }
    else {
      console.log("callback function not defined");
    }
  }


  loadData(data, 2);
})();
