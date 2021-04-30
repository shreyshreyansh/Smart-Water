function makeRequest(url, callback) {
  var request;
  if (window.XMLHttpRequest) {
    request = new XMLHttpRequest(); // IE7+, Firefox, Chrome, Opera, Safari
  } else {
    request = new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
  }
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      callback(request);
    }
  };
  request.open("GET", url, true);
  request.send();
}

// https://api.thingspeak.com/channels/1354031/feeds.json?api_key=2Y8N4DNDSEPCD4BR&start=2021-04-01%2000:00:00&end=2021-04-28%2000:00:00&sum=daily

makeRequest("/dashboardData", function (data) {
  var data = JSON.parse(data.responseText);
  console.log(data);
  var innerText =
    "<div class='container-fluid'>" +
    "<div class='row justify-content-md-center'>" +
    "<div class='col col-sm-4 gauge'>" +
    "<div class='gaugeHead'>Current month consumption</div>" +
    "<div id='chartdiv'></div>" +
    "</div>" +
    "<div class='col col-sm-3 cost'>" +
    "<div id='costHead'>₹<span id='costValue'></span></div>" +
    "<div class='costBody'>Current month cost</div>" +
    "<div id='costFooter' class='costFoot'></div>" +
    "</div>" +
    "<div class='col col-sm-4 usage'>" +
    "<div class='usageHead'>Recent Usage</div>" +
    "<div id='table'></div>" +
    "</div>" +
    "</div>" +
    "<div class='row'>" +
    "<div class='graph'>" +
    "<canvas id='myChart' width='900' height='310'></canvas>" +
    "</div>" +
    "</div>" +
    "</div>";
  document.getElementById("loginName").innerHTML = data.userName;
  document.getElementById("loginDescription").prepend(data.userEmail);
  document.getElementById("loginImg").style.backgroundImage =
    "url(" + data.userPhotoLink + ")";
  var end = new Date();
  var dd = String(end.getDate()).padStart(2, "0");
  var mm = String(end.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = end.getFullYear();

  end = yyyy + "-" + mm + "-" + dd;
  if (mm == 01) {
    yyyy--;
    mm = 12;
    dd = 01;
    start = yyyy + "-" + mm + "-" + dd;
  } else {
    dd = 01;
    start = yyyy + "-" + mm + "-" + dd;
  }
  var url =
    "https://api.thingspeak.com/channels/" +
    data._channelID +
    "/feeds.json?api_key=" +
    data.readAPIKey +
    "&start=" +
    start +
    "%2000:00:00&end=" +
    end +
    "%2000:00:00";
  console.log(url);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      document.getElementById("main").innerHTML = innerText;
    } else {
      document.getElementById("main").innerHTML = '<div class="loader"></div>';
    }
  };

  xhttp.open("GET", url, false);
  xhttp.send();
  var data1 = JSON.parse(xhttp.responseText);

  var op = data1.feeds.map(function (item) {
    if (item.field1 != null) return item.field1;
    else return 0;
  });
  console.log(op);

  var dates = data1.feeds.map(function (item) {
    return (
      item.created_at.substring(0, 10) +
      "(" +
      item.created_at.substring(11, 19) +
      ")"
    );
  });
  add = function (arr) {
    return arr.reduce((a, b) => +a + +b, 0);
  };
  var sum = add(op);
  console.log(sum);

  am4core.ready(function () {
    // Themes begin
    am4core.useTheme(am4themes_dark);
    am4core.useTheme(am4themes_animated);
    // Themes end

    // create chart
    var chart = am4core.create("chartdiv", am4charts.GaugeChart);
    chart.innerRadius = am4core.percent(85);

    /**
     * Normal axis
     */

    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = 0;
    axis.max = sum * 5;
    axis.strictMinMax = true;
    axis.renderer.radius = am4core.percent(80);
    axis.renderer.inside = true;
    axis.renderer.line.strokeOpacity = 1;
    axis.renderer.ticks.template.disabled = false;
    axis.renderer.ticks.template.strokeOpacity = 1;
    axis.renderer.ticks.template.length = 10;
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.radius = 25;
    axis.renderer.labels.template.adapter.add("text", function (text) {
      return text + "L";
    });
    /**
     * Axis for ranges
     */

    var colorSet = new am4core.ColorSet();

    var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
    axis2.min = 0;
    axis2.max = sum * 5;
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = true;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = false;

    var range0 = axis2.axisRanges.create();
    range0.value = 0;
    range0.endValue = sum * 2.5;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = colorSet.getIndex(0);

    var range1 = axis2.axisRanges.create();
    range1.value = sum * 2.5;
    range1.endValue = sum * 5;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = colorSet.getIndex(2);

    /**
     * Label
     */

    var label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = 15;
    label.x = am4core.percent(50);
    label.y = am4core.percent(100);
    label.horizontalCenter = "middle";
    label.verticalCenter = "bottom";
    label.text = "50%";

    /**
     * Hand
     */

    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.axis = axis2;
    hand.innerRadius = am4core.percent(20);
    hand.startWidth = 10;
    hand.pin.disabled = true;
    hand.value = 0;

    hand.events.on("propertychanged", function (ev) {
      range0.endValue = ev.target.value;
      range1.value = ev.target.value;
      label.text = axis2.positionToValue(hand.currentPosition).toFixed(1);
      axis2.invalidate();
    });

    var animation = new am4core.Animation(
      hand,
      {
        property: "value",
        to: sum,
      },
      1500,
      am4core.ease.cubicOut
    ).start();
    document.getElementById("costValue").innerHTML = (sum * 5).toFixed(0);
    var table = document.getElementById("table");
    var cum =
      "<table>" +
      "<tr>" +
      "<th> Created At </th>" +
      "<th> Amount </th>" +
      "</tr>";
    for (let i = data1.feeds.length - 1; i > data1.feeds.length - 12; i--) {
      //var date = new Date(data1.feeds[i].created_at);
      //console.log(data1.feeds[i].created_at.substring(0, 10));
      //console.log(time);
      cum +=
        "<tr>" +
        "<td>" +
        data1.feeds[i].created_at.substring(0, 10) +
        "(" +
        data1.feeds[i].created_at.substring(11, 19) +
        ")" +
        "</td>" +
        "<td>" +
        data1.feeds[i].field1 +
        "</td>" +
        "</tr>";
    }
    var q = new Date();
    var z = q.toISOString();
    document.getElementById("costFooter").innerHTML =
      "<i class='fa fa-spinner' aria-hidden='true'></i>" +
      " Last updated " +
      z.substring(0, 10) +
      "(" +
      z.substring(11, 19) +
      ")";
    cum += "</table>";
    table.innerHTML = cum;
    var ctx = document.getElementById("myChart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Litres",
            data: op,
            borderColor: ["rgba(103, 183, 220, 1)", "rgba(54, 162, 235, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              color: "#6671db",
            },
          },
          x: {
            ticks: {
              color: "#6671db",
            },
          },
        },
      },
    });
  });
  var d = new Date();
  var n = d.toISOString();
  console.log(n);
  var link = "/dashboardData/" + data._channelID + "/" + sum + "/" + n;
  console.log(link);
  xhttp = new XMLHttpRequest();
  xhttp.open("GET", link, false);
  xhttp.send();
}); // end am4core.ready()
