(function() {

  var data = {};

  //TODO: render graph here!!
  function renderGraph(nodes, edges) {
    console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);


    var width = 3000,
    height = 2000;

function colores(n) {
    var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
  }

var force = d3.layout.force()
    .charge(-30)
    .linkDistance(30)
    //.linkDistance(function(d) {return 1000/(d.frequency)})
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
      //.style("stroke-linecap", "round")
      
      //.style("stroke-width", function(d) { return Math.sqrt(d.frequency); }); //*********** specify stroke width


  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("id", function(d) {return d.id;})
      .attr("r", function(d) { return Math.sqrt((d.sendFrequency)+(d.receiveFrequency)); })         //***************** specify Node Size
      .style("fill", function(d) { return colores(d.groupColor); })  //***************** specify Color d.group
      .call(force.drag);
    node.append("title")
      .text(function(d) { return "ID: "+d.id+"\nsendFrequency: "+d.sendFrequency+"\nreceiveFrequency: "+d.receiveFrequency+"\ncolor: "+d.groupColor; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  
  });

  d3.select("#thresholdSlider").on("change", function(thresh) {
    console.log("THRESHOLD");
      var temp_edges = edges.splice(0, edges.length);
      for (var i = 0; i < temp_edges.length; i++) {
        if (temp_edges[i].frequency > thresh) {edges.push(temp_edges[i]);}
      }
      restart();
  });

  //Restart the visualisation after any node and link changes
  function restart() {
    console.log("Restart");
    link = link.data(edges);
    link.exit().remove();
    link.enter().insert("line", ".node").attr("class", "link");
    node = node.data(nodes);
    node.enter().insert("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag);
    force.start();
  }
  }

  // TODO: this is just an example usage
  //function generateGraph(data, startTime, endTime, idList, locationList, callback)
  function dataHandler() {
    ///////////////////////////////
    var DAY="Sun";
    
    var startTimeHr=10;
    var startTimeMin=0;
    var endTimeHr=11;
    var endTimeMin=30;

    var idList=['1278894','839736'];
    var locationList=null;
    var exclusionList= null;
    //['839736','1278894','external'];
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
    function VisitorObject(id, groupNum, firstSeen,isSender, location, to){
      var retObject = {
                        id: id,
                        firstSeen: firstSeen, //timestamp
                        lastSeen: firstSeen,  //timestamp
                        groupColor: groupNum,         //group Num
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
    var staffList=[];

    for (var i=indexOnStartTime; i<indexOnEndTime; ++i) {

      var isStaffIDUnique=true;
      if(data[i].from =='1278894'){
        isStaffIDUnique=true;
          for(var j=0; j<staffList.length; ++j){
            if(staffList[j]==data[i].to){
              //not unique
              isStaffIDUnique=false;
            }
          }
          if(isStaffIDUnique){
            staffList.push(data[i].to);
          }
      }
      else if(data[i].to=='1278894'){
        isStaffIDUnique=true;
        for(var j=0; j<staffList.length; ++j){
          if(staffList[j]==data[i].from){
            isStaffIDUnique=false;
          }
        }
        if(isStaffIDUnique){
          staffList.push(data[i].from);
        }
      }

      // filter out data by idList and locationList
      if(exclusionList){
        var exclusionFound = false;
        for(var j=0; j<exclusionList.length; ++j){
          if(exclusionList[j]===data[i].from || exclusionList[j]===data[i].to){
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

          var isStaff=false;
          for(var k=0; k<staffList.length; ++k){
            if(staffList[k]==data[i].from){
              isStaff=true;
            }
          }
          if(isStaff){
            nodes[j]["groupColor"]= 1;
            //d3.select("#"+nodes[j].id).attr("color",);
          }
          break;
        }
      }
      if (isIdUnique) {
        // register as sender
        var isStaff=false;
        for(var j=0; j<staffList.length; ++j){
          if(staffList[j]==data[i].from)
            isStaff=true;
        }
        
        if(!isStaff)
          nodes.push(VisitorObject(data[i].from, 0, data[i].Timestamp, true, data[i].location, data[i].to));
        else
          nodes.push(VisitorObject(data[i].from, 1, data[i].Timestamp, true, data[i].location, data[i].to));
        
      }

      isIdUnique = true;
      // identify unique IDs by call destination
      for (var j=0; j<nodes.length; ++j){
        if (nodes[j].id===data[i].to) {
          isIdUnique = false;
          nodes[j]["lastSeen"] = data[i].Timestamp;
          nodes[j]["receiveFrequency"] +=1;

          var isStaff=false;
          for(var k=0; k<staffList.length; ++k){
            if(staffList[k]==data[i].to){
              isStaff=true;
            }
          }
          if(isStaff){
            nodes[j]["groupColor"]= 1;
          }
          break;
        }
      }
      if (isIdUnique) {
        // register as recipient

        var isStaff=false;
        for(var j=0; j<staffList.length;++j){
          if(staffList[j]==data[i].to)
            isStaff=true;
        }
        
        if(!isStaff)
          nodes.push(VisitorObject(data[i].to, 0, data[i].Timestamp, false, data[i].location));
        else
          nodes.push(VisitorObject(data[i].to, 1, data[i].Timestamp, false, data[i].location));
        
      }

      //if (i%1000==0)    // just to keep up with the progress of algorithm
      //  console.log("nodes count so far = "+nodes.length);
    }
    console.log("nodes count = "+nodes.length);
    console.log("staffList: " +staffList);
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
