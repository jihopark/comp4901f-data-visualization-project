(function() {

  var data = {};


  var uniqueIdList = [];
  var d3Edges = [];
  var groups = [];


  // @input param = data
  // @output = uniqueIdList = visitorList
  function generateUniqueIdList(data, dataRange)
  {
    function VisitorObject(id,firstSeen,isSender, location){
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
          break;
        }
      }
      if (isIdUnique) {
        // register as sender
        uniqueIdList.push(VisitorObject(data[i].from, data[i].Timestamp, true, data[i].location));
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
    generateUniqueIdList(data[day], 10);//data[day].length);
    generateD3Edges(data[day], 10, uniqueIdList);
    generateGroupings(data[day], 10, uniqueIdList);
    document.getElementById("data-container").innerHTML=JSON.stringify({"nodes": uniqueIdList,"links":d3Edges})

  }

  function loadData(day, data, callback) {
    var fileName = "/data/comm-data-" + day + ".csv";
    if (!data[day]) {
      console.log("Need to load data for " + day);
      d3.csv("/data/comm-data-Fri.csv", function(loaded) {
        data[day] = loaded;
        console.log("Data Load Done. Total Row:" + data[day].length);
        callback(day);
      });
    }
    else {
      console.log("Already Loaded");
    }
  };

  loadData("Fri", data, handleData);


})();
