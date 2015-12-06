(function() {

  var data = {};

  //TODO: render graph here!!
  function renderGraph(nodes, edges) {
    console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);


    var width = 3000,
    height = 2500;

function colores(n) {
    var colores_g = ["#3366cc", "#dc3912", "#FFFF00", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
  }

var force = d3.layout.force()
    .charge(-70)
    //.linkDistance(function(d) {return 2000/(d.frequency)})
    .linkDistance(50)
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
      .attr("class", "link");
      


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

  }

  // TODO: this is just an example usage
  //function generateGraph(data, startTime, endTime, idList, locationList, callback)
  function dataHandler() {
    ///////////////////////////////
    var DAY="Fri";
    
    var startTimeHr=13;
    var startTimeMin=0;
    var endTimeHr=14;
    var endTimeMin=30;

    var idList= null;
    var locationList=null;
    var exclusionList= ['839736','1278894', 'external'];
    //['839736','1278894','external'];
    ////////////////////////////////
    
    var dayStart = d3.time.day(new Date(data[DAY][0]["Timestamp"]));
    var startTime = d3.time.minute.offset(dayStart, (startTimeHr *60 + startTimeMin));
    var endTime = d3.time.minute.offset(dayStart, (endTimeHr *60 + endTimeMin));
    
    
    generateGraph(data[DAY], startTime, endTime, idList, exclusionList, locationList, renderGraph);
    // or
    //generateGraph(data["Sun"], data["Sun"][0]["Timestamp"], data["Sun"][10]["Timestamp"], null, null, renderGraph);
    console.log("generateGraph DONE");
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
    var staffList=[1278894, 839736, 1231028,626177,1281941,96504,256620,656123,1295204,1688081,953336,142394,1242773,477978,856067,315002,1399755,1207988,1255453,69530,2057936,37693,974601,1358002,1846010,2022703,469296,1865282,885675,1648997,1412631,284296,1138420,210814,565351,682679,173102,1683303,998192,44403,1298361,999011,1940907,989161,1191435,1745223,1234191,864018,667855,1861684,1697086,1272536,1926243,1687109,714238,90317,51893,795501,1523396,1028556,875548,1912012,1156155,986021,804851,1332962,629470,840221,933372,1535130,74616,266349,939665,572263,1342819,1527872,1692925,969502,1017164,525932,1063775,1789454,928330,1432249,1576297,1540944,766183,297403,71472,1489409,1220077,674952,1529852,883344,1509307,1058644,1804735,280592,2050707,1690335,938463,1837146,1632922,1106029,32672,755822,662174,709279,762079,171002,1452626,837989,345707,942451,110075,2018684,423456,470762,304161,659085,459917,1187902,531144,174727,1499959,1732683,1128427,1241160,1537207,20448,6936,424481,1739364,1958194,766528,1196426,843401,772368,1426952,1435805,1878167,822246,1620753,1106618,1060589,1276675,1512997,405929,725019,1631284,312564,1455313,538702,1672782,1394918,525690,2060106,567024,232274,1693514,738239,863925,990529,1241725,821251,153470,426427,956339,1643467,1759022,813636,1182901,521065,639466,649692,189481,103653,2026615,1589559,1508277,1863437,871672,2010176,1323375,6534,287675,1229660,750143,1679345,579661,754085,923529,48628,1599181,612957,499367,306076,1086555,203445,1838691,415477,1947812,1836075,1595784,1425469,1947176,1562191,1993152,912895,1991168,179386,1765818,1143856,668662,1452405,1649471,1607547,969955,1523933,1152233,1224245,1081927,1714092,165328,1221753,1269351,1468447,291511,859113,73245,635075,538957,1083305,669571,2081131,1314084,1629590,1013683,1180289,327024,506678,1977746,198118,823913,41879,543168,297504,156781,992800,779535,846631,896394,1759695,702236,1808716,742371,1491271,2091426,925094,519503,231643,1866264,1494697,67063,986349,1790293,726121,707627,1991023,775678,1727579,539385,1817444,1174929,399477,569764,1128580,1257635,1297882,1144228,1860913,1988755,755524,1363727,266280,583339,233616,1176667,1932614,2037429,2042540,1524498,737536,1998032,658416,735424,418150,1595210,1728164,1234713,33417,1245273,1570944,647751,1713332,1366676,1492679,1937657,1862455,159418,1578455,220550,1991646,558149,1317709,896648,820425,288050,849521,240120,223773,638913,2060916,1372177,511389,1843161,1039362,1791838,1689641,304586,1024085,795970,1116329,614267,1379586,938197,1554678,105151,1185685,1678214,1234605,603629,392869,1525975,321318,1119534,258535,1349217,1562922,993195,557868,1629621,590879,1208350,350758,391338,73436,380345,870379,504304,1758610,224982,595748,38622,1760383,1797310,1141064,1636226,49375,1223224,520054,1544742,1246313,593615,959427,1517802,390887,1310766,921294,1587850,1807119,393354,1168815,1418361,1363381,1644063,1509021,1760129,1678785,1246785,1727869,1035709,1230148,1346459,2041384,1547652,1087254,1419751,1931591,434962,1713904,855830,125303,18134,667078,575771,1690345,246199,1679381,1612579,184869,140461,1172390,1732392,1657440,1510830,1039702,738277,1258137,2006561,1382429,247384,1014820,1612584,1267964,563629,1058571,1425352,1737684,677612,1949435,580785,1954532,2015129,115680,1800174,193629,1979024,46326,1129455,6110,765755,1010543,614566,1562105,670093,419467,675612,851838,275872,1447331,473066,970490,620478,1865730,533015,491520,1134424,535082,97241,97456,724670,328117,43833,410025,1357174,1939735,427660,646215,598158,1970360,254809,626699,1279087,995301,551078,686826,65109,1208151,1936551,105732,1251090,637544,900022,356972,270842,2044615,471413,1724998,206661,1250941,1925213,124408,1197655,1145752,787796,313835,1931368,524677,1400270,398618,1446246,748592,104177,184573,1067572,844319,349848,1976367,1061778,2050303,731282,892885,661319,616205,1111313,562597,10371,101816,134366,1490672,767374,712357,1943228,234387,1382854,1639202,365191,1574616,121745,1713815,168703,1090219,272624,1432187,1280922,856425,1912459,1589400,238279,939891,2040759,1321359,442534,1437636,821572,742301,119477,1684033,1583686,745640,900405,874070,1515197,316323,1362210,570267,824998,1783991,1197774,485743,1667873,1616612,797872,498009,644063,40608,997011,1514680,1687029,581794,916428,492974,1051684,1830983,229683,1773283,1675069,1874792,1062596,209832,2039166,1646758,642982,1511459,2049819,1606070,589598,810123,963275,793703,95161,1216465,297336,151265,1754028,956179,1082547,1514367,410149,1388162,1988049,992045,1181215,1953744,867873,1743546,319867,448873,810392,1882651,1365332,345382,1454086,1910777,1367258,1543979,1814880,1051158,1730482,1288335,123962,33707,1859190,1152246,1968164,795257,1647214,822936,1121586,1492009,647535,1108472,813540,1946546,510274,1118450,2010383,87264,1413637,1305795,1603900,659383,1770468,821721,216278,1325295,827020,1615550,838917,1300247,686348,522186,739949,1519004,660200,1019609,1678204,682629,386790,686158,2052043,1293978,992334,1042280,1573358,1821472,410496,813641,1401601,69348,1045234,1353005,168789,1762248,639721,1873375,83986,1923055,1698283,710220,1604756,952821,1902375,1430803,1640943,855712,1652057,1341575,1574967,1934504,1993180,626101,1059549,1107890,741411,798869,756638,2019668,1932219,1574806,1198534,1230079,896242,885299,612084,365667,340936,398292,62001,1380475,48730,269197,283252,462663,1614473,461118,1164505,2047880,1728432,1696430,1243677,484248,211020,715390,66039,1446356,217385,1741651,1299176,809736,1858381,1562534,590966,1729573,1246530,856573,591820,183920,186358,227163,80317,665529,1246650,884260,821075,1740991,1508923,1513120,733140,213290,973062,887962];

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
            nodes[j]["groupColor"]= 5;
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
          nodes.push(VisitorObject(data[i].from, 5, data[i].Timestamp, true, data[i].location, data[i].to));
        
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
            nodes[j]["groupColor"]= 5;
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
          nodes.push(VisitorObject(data[i].to, 5, data[i].Timestamp, false, data[i].location));
        
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
