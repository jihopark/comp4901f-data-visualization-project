(function() {

  var data = {};


  var uniqueIdList = [];
  var d3Edges = [];
  var groups = [];


  // @input param = data
  // @output = uniqueIdList = visitorList
  function generateUniqueIdList(data, dataRange)
  {
    function VisitorObject(id,firstSeen,isSender, location, to){
      var retObject = {
                        id: id,
                        firstSeen: firstSeen, //timestamp
                        lastSeen: firstSeen,  //timestamp
                        sendFrequency: 0,
                        receiveFrequency: 0,
                        sendIdList: [],
                        sendIdCount: 0,
                        sendLocationFrequency: {"Kiddie Land": 0, "Entry Corridor": 0, "Tundra Land": 0, "Wet Land": 0, "Coaster Alley": 0}
                      };
      if (isSender) {
        retObject.sendFrequency = 1;
        retObject.sendLocationFrequency[location] = 1;
        retObject.sendIdList.push(to);
        retObject.sendIdCount=1;
      }
      else {
        retObject.receiveFrequency = 1;
      }
      return retObject;
    }

    // for each row in table
    for (var i=0; i<dataRange; ++i) {
      if (data[i].to==="external") {
        //console.log("external ignored");
        continue;
      }
      var isIdUnique = true;
      // identify unique IDs by source from call source
      for (var j=0; j<uniqueIdList.length; ++j){
        if (uniqueIdList[j].id===data[i].from) {
          isIdUnique = false;
          uniqueIdList[j]["lastSeen"] = data[i].Timestamp;
          uniqueIdList[j]["sendFrequency"] +=1;
          uniqueIdList[j]["sendLocationFrequency"][data[i].location] +=1;
          // push to sendIdList, if it is unique
          isSendIdUnique=true;
          for (var k=0; k<uniqueIdList[j]["sendIdList"].length; ++k) {
            if(uniqueIdList[j]["sendIdList"][k]===data[i].to) {
              isSendIdUnique=false;
              break;
            }
          }
          if (isSendIdUnique) {
            uniqueIdList[j]["sendIdList"].push(data[i].to);
            uniqueIdList[j]["sendIdCount"]+=1;
          }

          break;
        }
      }
      if (isIdUnique) {
        // register as sender
        uniqueIdList.push(VisitorObject(data[i].from, data[i].Timestamp, true, data[i].location, data[i].to));
      }

      isIdUnique = true;
      // identify unique IDs by call destination
      for (var j=0; j<uniqueIdList.length; ++j){
        if (uniqueIdList[j].id===data[i].to) {
          isIdUnique = false;
          uniqueIdList[j]["lastSeen"] = data[i].Timestamp;
          uniqueIdList[j]["receiveFrequency"] +=1;
          break;
        }
      }
      if (isIdUnique) {
        // register as recipient
        uniqueIdList.push(VisitorObject(data[i].to, data[i].Timestamp, false, data[i].location));
      }

      if (i%1000==0)    // just to keep up with the progress of algorithm
        console.log("unique ID count so far = "+uniqueIdList.length);
    }

    console.log("unique ID count = "+uniqueIdList.length);
    console.log(uniqueIdList);
    //console.log(JSON.stringify(uniqueIdList));

  }

  // @output = edge = {sourceId, targetId, timeStamp, location}
  function generateD3Edges(data, dataRange, visitorList) {
    function D3Edge(src, tgt, val){
      var retObject = {
                        source: src,
                        target: tgt,
                        frequency: val,
                      };
      return retObject;
    }
    //console.log(data);

    for (var i=0; i<dataRange; ++i)
    {
      if (data[i].to==="external") {
        //console.log("external ignored");
        continue;
      }
      // find source index
      var sourceIndex = -1;
      for (var j=0; j<visitorList.length; ++j){
        if (data[i].from===visitorList[j].id)
          sourceIndex = j;
      }

      // find target index
      var targetIndex = -1;
      for (var j=0; j<visitorList.length; ++j){
        if (data[i].to===visitorList[j].id)
          targetIndex = j;
      }

      // no such edge found
      if (sourceIndex==-1 || targetIndex==-1)
        continue;

      // check for duplicate source & target
      var newEdge = true;
      for (var j=0; j<d3Edges.length; ++j){
        if (d3Edges[j].source == sourceIndex && d3Edges[j].target == targetIndex
          || d3Edges[j].source == targetIndex && d3Edges[j].target == sourceIndex) {
          newEdge = false;
          d3Edges[j]["frequency"] +=1;
          break;
        }
      }
      if (newEdge)
        d3Edges.push(D3Edge(sourceIndex, targetIndex, 1));

      if (i%1000==0)    // just to keep up with the progress of algorithm
        console.log("edges count so far = "+d3Edges.length);
    }

    console.log("edges count = "+d3Edges.length);
    console.log(d3Edges);
    //console.log(JSON.stringify(d3Edges));



  }

  function generateGroupings(data, dataRange, visitorList) {
    function Group(idString) {
      var retObject = {
                        idList: [idString],
                        frequency: 0   //aggregate communication frequency
                      }
      return retObject;
    }

    // initialize list of groupings
    for (var i=0; i<visitorList.length; ++i) {
      groups.push(Group(visitorList[i].id));
    }
    console.log(groups);

    for (var i=0; i<dataRange; ++i) {
      var sameGroup = true;
      var senderGroup = -1;
      var recepientGroup = -1;
      if (data[i].to==="external") {
        // ignore all extern recepients
        //console.log("ignore extern");
        continue;
      }

      for (var j=0; j<groups.length; ++j) {
        for (var k=0; k<groups[j].idList.length; ++k) {
          if (groups[j].idList[k]===data[i].from) {
            senderGroup = j;
          }
          if (groups[j].idList[k]===data[i].to) {
            recepientGroup = j;
          }
        }
      }
      if (senderGroup==-1 || recepientGroup==-1) {
        console.log("ERROR in finding visitor ID, terminating..");
        break;
      }
      if (senderGroup!=recepientGroup) {
        //console.log(data[i].from+", "+data[i].to+" joins group "+senderGroup+" and "+recepientGroup);
        var groupsTemp = groups[recepientGroup];
        for (var j=0; j<groupsTemp.idList.length; ++j) {
          groups[senderGroup].idList.push(groupsTemp.idList[j]);
        }

        groups[senderGroup].frequency+=1; // add to frequency
        groups[senderGroup].frequency+=groups[recepientGroup].frequency; // add to frequency
        groups.splice(recepientGroup,1);
      }
      else {
        groups[senderGroup].frequency+=1; // add to frequency
      }

      if (i%1000==0)    // just to keep up with the progress of algorithm
        console.log("groups count so far = "+groups.length);
    }


  }

  // callback function after loading is done. This function manages {data} from loadData()
  function handleData(day){
    console.log("okay loaded!!");
    //console.log(data.Fri);
    generateUniqueIdList(data[day], 2);//data[day].length);
    //generateD3Edges(data[day], data[day].length, uniqueIdList);
    generateGroupings(data[day], 2, uniqueIdList);
    document.getElementById("data-container").innerHTML=JSON.stringify({"nodes": uniqueIdList,"links":d3Edges})

  }



// okay here we go
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
            generateGraph(data["Fri"], data["Fri"][1000]["Timestamp"], data["Fri"][2000]["Timestamp"], ["1248270"], ["Wet Land"])
        }
      });
    }
    else {
      console.log("Already Loaded");
    }
  };

  loadData(data, 2);

  var nodes = [];
  var edges = [];

  // example 1: generateGraph(data["Fri"], timeStamp, null, null);
  // example 2: generateGraph(data["Fri"], timeStamp, ["1234","4534"], null);
  // data, startTime and endTime need to be passed. Oter parameters are used as additional filters
  function generateGraph(data, startTime, endTime, idList, locationList) {
    if (!loadCompleted)
      return;
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
    while ((new Date(data[indexOnEndTime]["Timestamp"])).getTime()<=(new Date(endTime)).getTime()) {
      indexOnEndTime++;
    }

    console.log("indexOnStartTime = "+indexOnStartTime);
    console.log("indexOnEndTime = "+indexOnEndTime);

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

      if (i%1000==0)    // just to keep up with the progress of algorithm
        console.log("nodes count so far = "+nodes.length);
    }
    console.log("nodes count = "+nodes.length);
    console.log(nodes);



  }
})();
