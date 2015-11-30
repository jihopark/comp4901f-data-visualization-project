(function() {

  var data = {};


  var uniqueIdList = [];
  var d3Edges = [];
  var dayStart = d3.time.day(new Date(data[0]["Timestamp"]));
  var startTime = d3.time.minute.offset(dayStart, 600);
  var endTime = d3.time.minute.offset(dayStart, 690);

  // @input param = data
  // @output = uniqueIdList = visitorList
  function generateUniqueIdList(data, dataRange)
  {


  	//console.log("startTime: "+startTime);
  	//console.log("endTime: "+endTime);

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

      var isIdUnique = true;
      var isNOTInInterval=false;
	  var curTime = new Date(data[i]["Timestamp"]);
	    //console.log("CurTime: "+curTime);

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
        //console.log("Time: "+data[i].Timestamp);
          if(curTime < startTime  || curTime > endTime){
          	//console.log("not in interval");
            isNOTInInterval=true;
          }
        if(isNOTInInterval==false){
          uniqueIdList.push(VisitorObject(data[i].from, data[i].Timestamp, true, data[i].location));
        }
        isNOTInInterval=false;
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
        isNOTInInterval=false;
          if(curTime < startTime  || curTime > endTime){
            isNOTInInterval=true;
          }
        if(!isNOTInInterval){
          uniqueIdList.push(VisitorObject(data[i].to, data[i].Timestamp, false, data[i].location));
        }
        isNOTInInterval=false;
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
    console.log(data);

    for (var i=0; i<dataRange; ++i)
    {
	  var curTime = new Date(data[i]["Timestamp"]);

      // find source index
      var sourceIndex = -1;
      if(startTime < curTime && curTime <endTime){
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
	  }
	  
      if (i%1000==0)    // just to keep up with the progress of algorithm
        console.log("edges count so far = "+d3Edges.length);
    }

    console.log("edges count = "+d3Edges.length);
    console.log(d3Edges);
    //console.log(JSON.stringify(d3Edges));



  }



  // callback function after loading is done. This function manages {data} from loadData()
  function handleData(day){
    console.log("okay loaded!!");
    //console.log(data.Fri);
    generateUniqueIdList(data[day], 948739);
    generateD3Edges(data[day], 948739, uniqueIdList);
    document.getElementById("data-container").innerHTML=JSON.stringify({"nodes": uniqueIdList,"links":d3Edges})

  }

  function loadData(day, data, callback) {
    var fileName = "/data/comm-data-" + day + ".csv";
    if (!data[day]) {
      console.log("Need to load data for " + day);
      d3.csv("/data/comm-data-Sun.csv", function(loaded) {	//////////////////////////////////Day Data
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
