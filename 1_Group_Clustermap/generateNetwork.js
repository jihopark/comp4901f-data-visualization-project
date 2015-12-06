(function() {

  var data = {};

  //TODO: render graph here!!
  function renderGraph(nodes, edges) {
    console.log("nodes count = "+nodes.length);
    console.log(nodes);
    console.log("edges count = "+edges.length);
    console.log(edges);


    var width = 1600,
    height = 1000;

  function colores(n) {
    var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
  }


var force = d3.layout.force()
    .charge(-40)
    //.linkDistance(30)
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
      //.style("stroke-linecap", "round")

      .style("stroke-width", function(d) { return Math.sqrt(d.frequency); }); //*********** specify stroke width


  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return Math.sqrt((d.sendFrequency)+(d.receiveFrequency)); })         //***************** specify Node Size
      .style("fill", colores(0))  //***************** specify Color d.group
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

    //adjust threshold
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
    var DAY="Fri";

    var startTimeHr=8;
    var startTimeMin=0;
    var endTimeHr=8;
    var endTimeMin=30;

    var idList=["1696241","612957","160360","external","903769","1106999","766183","146240","376187","327024","1075494","119477","839308","1178625","1996962","682679","968967","1633558","821837","1707585","2094648","1495587","618704","1848529","1744503","1426952","1429549","1138286","15712","2050303","1843348","1323905","674952","1828090","1743546","881043","1696753","1649471","1427875","1300247","1514680","286210","821721","36486","1128580","530908","731443","810123","174974","74616","1967769","985277","1399755","291785","703296","1334972","1388162","273492","583339","1623035","1643467","992045","947320","1432187","918738","941906","1250941","856067","289181","1710420","1319731","1563653","1912164","1119534","1220077","117066","842645","11269","183761","1182572","774775","643918","1048798","248178","918404","1088678","1908375","875548","1629590","973062","196239","919935","96972","1607917","1492555","1242773","1709971","217095","2051549","976932","1596977","868222","822936","1914254","1873375","440632","557591","1836265","350693","1844006","1463759","1779722","338530","69348","1997596","1675066","1353005","1357973","733140","49375","48730","38492","581794","128533","580785","1393253","733475","1901765","484248","1508923","1480813","1223310","297404","1116329","15466","1660198","1321359","1997632","74613","1537207","1549219","1267918","1143856","838917","302897","805298","821075","1248261","131876","1280922","1111313","1762242","942816","1274841","1382429","399477","1491001","1910777","1737684","841552","1131984","1318220","546233","1510967","1317574","1742829","938574","580461","2081231","1522107","1394394","702567","647535","473436","1107698","2047018","590785","1982133","1253108","2067907","1991023","1295204","921389","539617","698208","328274","391338","1362210","750540","931476","366288","520109","675710","1039362","1221753","1425469","444761","1800174","462736","220592","1970360","1381640","1912012","779535","393107","496679","245129","870289","749964","656653","1836866","1455313","927280","841314","735477","1879195","205315","187130","669571","737536","675561","1616612","1276675","649981","1075446","855712","765755","1953744","2012017","1685011","1897980","1313613","1629394","410149","128920","1841960","509358","924388","750163","76731","1132076","1000708","46326","1367258","2090691","203184","1898284","1696430","1164505","353069","1656601","869478","675612","686826","1710455","864018","668484","1185012","331284","2065364","1901189","1597848","1600283","2068577","1052726","460630","213290","1618488","1557125","386611","422300","455752","687631","2025656","1216041","164193","4343","608482","1697086","1809394","1966966","963448","1611783","645418","1865549","1631132","1432249","745324","811356","1517572","293920","2064523","1743350","1295158","46423","1998550","1275173","137622","704004","1527648","2087553","1524136","757419","25792","444898","1196426","744541","226280","992800","1388022","1322523","287831","1217734","1880304","651835","1971223","1132521","1783991","637544","1713869","1826870","921294","1730554","849521","1390240","2066168","1617284","1794634","1946929","697057","1210755","925094","1539142","174785","1925213","474236","1950381","973520","1431963","1640316","1381070","711301","103422","1155936","1287048","793595","1011112","851838","1039702","1352405","437077","1025781","949503","620478","1297787","1765818","444736","786425","265730","1496683","1013683","1731611","725044","574013","1822171","121980","1883690","1245603","777006","1887849","1134427","793703","111975","1640943","1130496","1529852","953336","1865282","1728432","1513840","1368389","133205","1326471","1101472","298495","1492009","168587","727998","1632214","970547","1283332","525323","772368","1388440","1521668","1499757","969502","944133","1926243","232274","1668273","863925","2049819","306905","7339","798854","1034322","1196711","1713404","64304","1687201","1324567","1849728","966656","17612","1724998","2672","1713332","1349555","1515197","1594599","2048678","2036467","595748","1673411","1675069","1661506","1934078","279576","1421418","180661","1331654","1973863","2007515","596157","1104264","1027276","1566005","712357","53898","943291","1088488","1098136","408230","813863","1906865","381150","859038","745640","1515466","350758","1363727","184573","887962","1998752","590966","1075202","186358","340936","565653","173232","714076","532442","1010543","1465836","1448056","1028085","637018","1020418","492765","610522","778821","1991592","412282","440242","577571","10371","1392457","40624","1530719","614566","168789","37693","1908621","1875935","1397469","274315","328117","1660730","520054","740139","1349992","1305659","2037299","1008448","510274","6936","2006561","667855","739949","1537249","1202675","104177","724670","239133","398292","1070212","1813981","506678","2040759","2010738","947796","811616","1898006","998575","261021","1784467","590879","963275","886397","535082","936244","1751670","1095099","1237644","612108","1518969","1975667","132781","805435","694491","2035400","108559","2091832","539385","2065333","862889","236573","1320383","974088","774876","1170077","217385","69324","704292","662057","386790","1495961","1877708","1635641","503970","2078034","180539","1369240","923760","959623","1744199","310080","1330769","1195226","62001","127037","1980139","626177","1115919","252796","637839","539386","1027483","87053","468827","394459","836515","312794","1749640","1729147","665529","2010544","1595318","233486","969451","610043","1058644","569764","1234191","1948150","1936551","43833","1882651","291511","1620753","521692","1636226","407458","105331","1180958","1495984","1549032","1565051","958301","1162853","1406469","1613678","359592","1269504","295558","2059961","1767836","1922244","1946546","845135","1823549","231065","522711","207136","100174","1771245","1789535","17914","1983777","411180","105229","1180630","1389673","557868","449821","1517929","1873443","386585","180277","247384","431836","1367089","1265839","511389","173339","1942120","620186","1494544","999107","326279","1614473","845597","302771","113536","238547","1319602","379254","462663","1424087","874887","1076477","277274","715390","1534016","1549439","1902375","1203064","1547860","986349","6534","1208350","832662","757845","1345871","1571183","464830","38622","257896","871111","737575","312564","748592","798869","83986","95161","1892706","591820","756638","1114109","1934504","800878","2042333","1584300","1082547","1410699","1098358","1490672","357245","1449824","970160","1405426","1858381","963148","910939","1224245","970490","1749109","143415","1045021","931049","714380","813636","589598","935776","418150","825466","1692925","1032029","1683303","171002","810735","875863","1346967","90317","708080","1597320","511781","153470","619064","1148243","795970","1243914","848800","827020","664389","1952341","837989","638668","1199860","1335508","174727","1386541","1212680","1776141","896394","1233506","1474864","1346459","1254510","346310","617164","365667","283252","1980233","910527","990811","755822","1406001","884921","1830372","1696282","304586","400555","1351556","1695941","673451","1718771","811009","230498","1198534","1592997","6110","1124046","889064","1596719","1971852","539865","885675","1218201","570267","94067","1735326","1566766","1678214","1491271","757027","1165018","1835505","1809285","1823379","510394","258314","1187902","1523933","40570","1434450","126182","1078699","1588767","1999729","1958194","2075534","893229","330141","2095583","1494148","1279087","268856","1325405","367517","1295908","101592","946134","1281941","1236601","1781105","1740708","527693","444008","669970","1520987","1994529","2083613","149057","357179","819126","1234713","280439","1246650","795257","1979024","575771","1923192","679297","1125646","1865730","1558970","199078","345382","1360715","2037429","114521","1827053","770923","2023392","431280","336328","477168","1626169","254180","533015","1994315","1475524","352434","1202957","1743218","154530","1379586","879813","651950","725559","1375106","513541","163330","2056236","825258","268563","13354","1469128","1058571","1738212","1207988","1822482","973383","217701","1612730","1155666","1180391","1483318","650064","1725488","1353156","372482","591107","487752","594316","1080834","2024863","1880065","297330","979804","2056864","1286459","1444056","579661","281931","1882540","1302430","1470439","1516513","1029542","1273322","891094","2039166","680685","528530","854341","504575","1759070","1501359","1135093","130741","1789454","1632922","961328","299728","1687029","1154392","1862792","264185","598893","861939","470906","1133806","1562191","726657","1334702","1906057","930115","287114","1508277","1583686","163738","2060504","1049333","1480300","1947812","60633","872825","1428997","183920","640904","863916","2059479","214139","1528551","179386","1807119","324556","1346096","644244","2001739","1750125","579897","15715","459917","1846978","333252","1590133","749491","1874212","461118","398618","885299","1589559","1987765","1118450","1234761","1106618","1194932","1618639","1232939","731228","134576","383458","91182","1811210","1306211","1447202","171132","73058","2000496","2047233","861665","549068","937230","736972","531144","77124","491520","726680","1599181","2022703","1456874","288909","2080929","1683856","777171","503822","1188959","1201916","1915520","564293","1016895","746010","1975742","476784","1128427","952202","414676","1461139","1838691","1401601","1434060","1229505","813641","266580","551928","1173915","474586","1690345","1647214","229683","1174929","2057127","835984","1400270","1644063","1812418","292339","587055","874070","274045","1156947","1118070","1233136","198118","590704","77892","1947176","1089957","560114","1065547","1007694","659085","386827","1687109","979599","788576","272624","1711423","1567378","1385557","1447331","1587254","1196605","167470","452524","500451","420345","2049559","1106029","667374","130895","1001533","1567292","1541685","659383","485035","1299176","314102","1526716","904030","1380475","504450","464613","1461327","1455657","629339","1753286","1320651","345707","553559","355366","523977","1122884","1981451","1337430","1679381","1598831","1815116","356121","884260","1848525","297504","1016471","919861","1856188","414954","353418","452016","1416498","1337261","2011396","468242","41289","1376643","1839291","1944302","1908746","56467","770252","886431","1412224","567024","1087254","516163","1099687","854271","434962","709279","1394901","575073","856425","231643","1831051","1772261","1362332","1502547","1400744","19162","1487615","1731054","1051684","634799","133312","2042862","1061215","1350922","685539","154595","137608","1058549","612084","866007","1108132","51893","901652","562597","2050707","1803705","45840","1642096","1658699","1086053","273748","939665","1854510","1365563","1332445","1081552","1257635","1677351","122907","1248154","546321","1088533","1760095","1297877","110075","1134821","1999088","107173","1699262","571588","2072090","797787","1209234","176423","132087","205691","1140789","1906760","1730482","1496312","825652","662174","1136377","127426","1117699","667963","714084","1959069","859113","647751","1382854","1288335","227192","328657","1217112","2090883","2062993","328350","773058","232689","186726","1921770","1085806","928330","31954","1870869","1968164","71472","2085080","941235","917809","288988","1344899","1326348","551078","239673","873143","47327","538711","686158","606198","1513120","1829621","305083","870379","1690685","135051","410496","1523396","1060589","939891","1452686","1357916","125285","1629621","656123","525690","985107","941","1764153","96504","1369183","1648997","400873","1721166","69530","1940907","1820085","671599","910050","1574042","420195","1574616","1356646","953272","1806328","579220","408012","1031660","227163","916428","1737013","1812068","1030805","854137","844319","1183890","11311","639730","638913","67142","1243186","180789","1693514","158275","1079812","735230","518531","1823484","78603","711179","930161","347770","1230079","240120","483809","1177549","730966","861673","998192","1570579","2031799","1803146","1652892","723831","1235058","880619","605020","1621849","934929","593157","1551364","388680","313835","471413","423861","1509635","1358002","13052","270842","457620","603629","1527767","197786","1547652","309261","365191","1095464","1047819","246199","1401128","1182901","1773176","668662","115573","740577","382206","983590","1668783","1901230","560932","1456293","871333","984542","1138406","715332","1833168","1455142","77985","480467","73415","73245","1574967","873560","1243677","1757507","439907","639721","600044","1416116","111758","810212","969955","365286","340699","2028347","383251","1525103","1852033","1706569","443085","1732683","1451127","1770586","1699336","297403","423379","672552","269197","2046019","1182208","1843798","1562186","1127216","67063","159418","1689641","1196253","1836644","1571283","1586794","1613963","1817444","1860592","273602","900405","683323","846631","1594971","1409020","1751308","741636","505182","702236","1116214","1931591","84322","2055411","871672","565351","1883384","20986","2056082","1816522","1635527","242353","647574","1132882","1320644","161781","818140","752231","1293978","120607","1038231","1401329","1009525","1030897","1906065","635075","1520446","736288","1809420","1760129","1310461","2042186","634474","609983","810496","41879","157752","850324","404087","1477221","2007070","1939208","1931368","1760383","1679652","89618","1128912","1853425","443711","1010817","359044","1965716","1272536","816686","1598265","1322472","969256","888391","2016064","1668820","1860913","1059177","1221432","1008236","284296","1189602","272033","1714092","1414051","469296","103653","1790293","1562922","224982","1727869","1713815","956179","867873","1454086","522186","423283","712463","766218","1923055","1576452","1667325","1966429","1585206","1360635","1939292","554218","246860","450819","1758901","947419","1074970","1834564","962522","395694","1685871","1887790","1379445","241275","1685422","1872990","646993","557608","1788664","1988493","1772990","2043478","1478594","1736353","1536714"];
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
