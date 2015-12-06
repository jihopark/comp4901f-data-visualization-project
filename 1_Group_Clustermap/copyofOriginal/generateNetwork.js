(function() {

  var data = {};

  //TODO: render graph here!!
  function renderGraph(nodes, edges) {
    console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);


    var width = 4500,
    height = 2250;

  var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-70)
    .linkDistance(function(d) {return 2000/(d.frequency)})
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

    force
      .nodes(nodes)
      .links(edges)
      .start();

  var link = svg.selectAll(".link")
      .data(edges)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-linecap", "round")
      
      .style("stroke-width", function(d) { return Math.sqrt(d.frequency); }); //*********** specify stroke width


  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return Math.sqrt((d.sendFrequency)+(d.receiveFrequency)); })         //***************** specify Node Size
      .style("fill", function(d) { return color(1); })  //***************** specify Color d.group
      .call(force.drag);
    node.append("title")
      .text(function(d) { return "ID: "+d.id+"\nsendFrequency: "+d.sendFrequency+"\nreceiveFrequency: "+d.receiveFrequency; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  
  });
  }

  // TODO: this is just an example usage
  //function generateGraph(data, startTime, endTime, idList, locationList, callback)
  function dataHandler() {
    ///////////////////////////////
    var DAY="Sun";
    
    var startTimeHr=8;
    var startTimeMin=0;
    var endTimeHr=23;
    var endTimeMin=59;

    var idList=['839736','1278894'];
    var locationList=null;
    var exclusionList=null;
    ////////////////////////////////
    
    var dayStart = d3.time.day(new Date(data[DAY][0]["Timestamp"]));
    var startTime = d3.time.minute.offset(dayStart, (startTimeHr *60 + startTimeMin));
    var endTime = d3.time.minute.offset(dayStart, (endTimeHr *60 + endTimeMin));
    
    
    generateGraph(data[DAY], startTime, endTime, idList, exclusionList, locationList, renderGraph);
    // or
    //generateGraph(data["Sun"], data["Sun"][0]["Timestamp"], data["Sun"][10]["Timestamp"], null, null, renderGraph);
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
  function generateGraph(data, startTime, endTime, idList, exclusionList, locationList, callback) {

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
    while ((new Date(data[indexOnStartTime]["Timestamp"]))<startTime) {
      console.log("indexOnStart");
      indexOnStartTime++;
    }
    console.log(new Date(data[indexOnStartTime]["Timestamp"]));
    var indexOnEndTime = indexOnStartTime;
    while ((indexOnEndTime<data.length-1) && (new Date(data[indexOnEndTime]["Timestamp"]))<=endTime) {
      console.log("indexOnEnd");
      indexOnEndTime++;
    }
    console.log(new Date(data[indexOnEndTime]["Timestamp"]));
    //console.log("indexOnStartTime = "+indexOnStartTime);
    //console.log("indexOnEndTime = "+indexOnEndTime);

    // for each row in table
    for (var i=indexOnStartTime; i<indexOnEndTime; ++i) {

      // filter out data by idList and locationList
      if(exclusionList){
        var exclusionFound = false;
        for(var j=0; j<exlusionList.length; ++j){
          if(exlusionList[j]===data[i].from || exclusionList[j]===data[i].to){
            exclusionFound=true;
            break;
          }
        }
        // skip this row
        if(exclusionFound){
          continue;
        }
      }

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

      //if (i%1000==0)    // just to keep up with the progress of algorithm
      //  console.log("nodes count so far = "+nodes.length);
    }
    console.log("nodes count = "+nodes.length);
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

      //if (i%1000==0)    // just to keep up with the progress of algorithm
      //  console.log("edges count so far = "+d3Edges.length);
    }

    console.log("edges count = "+edges.length);
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
