function InitChart() {
  var data = [{
      "sale": 202,
      "sd": 5,
      "year": 2000
  }, {
      "sale": 215,
      "sd": 10,
      "year": 2002
  }, {
      "sale": 179,
      "sd": 15,
      "year": 2004
  }, {
      "sale": 199,
      "sd": 12,
      "year": 2006
  }, {
      "sale": 134,
      "sd": 8,
      "year": 2008
  }, {
      "sale": 176,
      "sd": 5,
      "year": 2010
  }];



  var colorList = ["blue","green","red","black","purple"];
  var schoolList = ["ust", "cuhk", "hku", "cityu", "polyu"];
  var sitesList = ["QS_rank", "THE_rank"];

  console.log(rankingData);

  var vis = d3.select("#visualisation"),
      WIDTH = 1000,
      HEIGHT = 500,
      MARGINS = {
          top: 20,
          right: 20,
          bottom: 20,
          left: 50
      },
      xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([2010, 2016]),
      yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0, 300]),
      xAxis = d3.svg.axis()
      .scale(xScale),
      yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left");

  var lineGen = d3.svg.line()
    .x(function(d) {
      console.log("x: "+d.Year);
      return xScale(d.Year);
    })
    .y(function(d) {
      console.log("y: "+d.QS_rank);
      return yScale(mean(d));
    })

  function mean(d) {
    range = 2;//sitesList.length;
    var sum = 0;
    for (var i=0; i<range; ++i) {
      sum+=parseInt(d[sitesList[i]]);
      //console.log(sitesList[i]+" "+d[sitesList[i]]);
    }
    return sum/range;
    //return (parseInt(d.QS_rank)+parseInt(d.THE_rank))/2;
  }
  function sd(d) {
    range = 2;
    var squaredDiffSum = 0;
    for (var i=0; i<range; ++i) {
      squaredDiffSum+=(parseInt(d[sitesList[i]])-mean(d))*(parseInt(d[sitesList[i]])-mean(d));
      //console.log(sitesList[i]+" "+d[sitesList[i]]);
    }
    squaredDiffSum/=range;
    return Math.sqrt(squaredDiffSum)/4;
  }

  var pathGen = function(data) {
    var retVal="";
    var range = data.length;
    for (var i=0; i<range; ++i) {
      if (i>0) {
        retVal+="L"+xScale(data[i].Year)+","+yScale(mean(data[i])-sd(data[i]));
        retVal+="L"+xScale(data[i].Year)+","+yScale(mean(data[i])+sd(data[i]));
        retVal+="L"+xScale(data[i-1].Year)+","+yScale(mean(data[i-1])+sd(data[i-1]));
      }
      if (i<range-1) {
        retVal+="M"+xScale(data[i].Year)+","+yScale(mean(data[i])+sd(data[i]));
        retVal+="L"+xScale(data[i].Year)+","+yScale(mean(data[i])-sd(data[i]));
      }
    }
    console.log(retVal);
    return retVal;
  }


  console.log(rankingData["ust"]);
  console.log(pathGen(data));


  for (var i=0; i<5; ++i) {
    vis.append("svg:path")
        .attr("d", lineGen(rankingData[schoolList[i]]))
        .attr('opacity',0.5)
        .attr("stroke", colorList[i])
        .attr("stroke-width", 2)
        .attr("fill", "none");
    vis.append("svg:path")
        .attr("d",pathGen(rankingData[schoolList[i]]))
        .attr('opacity',0.4)
        .attr('fill',colorList[i]);
  }
  vis.append("svg:path")
      .attr("d",pathGen(data))
      .attr('opacity',0.4)
      .attr('fill',"#000000");

      /*
  vis.append('svg:path')
      .attr('d', lineGen(data2))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');*/
  vis.append("svg:g")
      .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
      .call(xAxis);

  vis.append("svg:g")
      .attr("transform", "translate(" + (MARGINS.left) + ",0)")
      .call(yAxis);
}

var rankingData = {};
var fileNames = ["cityu","polyu","hku","ust","cuhk"];
function loadRankingData(counter) {
  if (counter<0) {
    dataHandler();
    return;
  }
  d3.csv(fileNames[counter]+"Rankings.csv", function(loaded) {
    console.log(loaded);
    rankingData[fileNames[counter]] = loaded;
    loadRankingData(counter-1);
  });
}

function dataHandler(){
  InitChart();
}
loadRankingData(4);
