document.getElementById("load").innerHTML =
  '<div class="loader"></div><div class="loaderHead">Loading...</div>';
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

makeRequest("/holymoly", function (data) {
  var data = JSON.parse(data.responseText);
  console.log(data);
  for (var i = 0; i < data.length; i++) {
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
      start = yyyy + "-" + (mm - 1) + "-" + dd;
    }
    var url =
      "https://api.thingspeak.com/channels/" +
      data[i]._channelID +
      "/feeds.json?api_key=" +
      data[i].readAPIKey +
      "&start=" +
      start +
      "%2000:00:00&end=" +
      end +
      "%2000:00:00";
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();
    var data1 = JSON.parse(xhttp.responseText);

    var op = data1.feeds.map(function (item) {
      if (item.field1 != null) return item.field1;
      else return 0;
    });
    var dates = data1.feeds.map(function (item) {
      var h = parseInt(item.created_at.substring(11, 13));
      var m = parseInt(item.created_at.substring(14, 16));
      if (m + 30 > 60) {
        h = (h + 6) % 24;
        m = (m + 30) % 60;
      } else {
        h = (h + 5) % 24;
        m = (m + 30) % 60;
      }
      if (h < 10) h = "0" + h;
      if (m < 10) m = "0" + m;
      var rest = h + ":" + m + item.created_at.substring(16, 19);
      return item.created_at.substring(0, 10) + "(" + rest + ")";
    });
    add = function (arr) {
      return arr.reduce((a, b) => +a + +b, 0);
    };
    var sum = add(op);
    console.log(sum);
    var d = new Date();
    if (d.getMinutes() + 30 > 60) {
      d.setHours((d.getHours() + 6) % 24);
      d.setMinutes((d.getMinutes() + 30) % 60);
    } else {
      d.setHours((d.getHours() + 5) % 24);
      d.setMinutes((d.getMinutes() + 30) % 60);
    }
    console.log(d);
    var n = d.toISOString();
    console.log(n);
    var link = "/dashboardData/" + data[i]._channelID + "/" + sum + "/" + n;
    console.log(link);
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", link, false);
    xhttp.send();
  }
});

makeRequest("/holymoly", function (data) {
  var load = document.getElementById("load");
  var gum =
    "<div class='sidenav'>" +
    "<div class='heading'>SW &nbsp; &nbsp; SMART WATER</div>" +
    "<hr class='hrLine1' />" +
    "<a href='/dashboard'><i class='fa fa-cube fa-lg subHeading1' aria-hidden='true'></i>SET PROFILE</a>" +
    "<a href='https://marvelapp.com/contact-us' target='_blank'><i class='fa fa-phone fa-lg subHeading3' aria-hidden='true'></i>CONTACT US</a>" +
    "<a href='/logout'><i class='fa fa-cog fa-lg subHeading3' aria-hidden='true'></i>LOG OUT</a>" +
    "<hr class='hrLine2' />" +
    "<div class='dropdown'>" +
    "<div class='image col-xs-2'>" +
    "<img id='loginImg' class='userImg' />" +
    "</div>" +
    "<div class='Description col-xs-8'>" +
    "<div id='loginName' class='dropbtn userName'></div>" +
    "<div id='loginDescription' class='userDescription'></div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "<div id='main'></div>";
  load.innerHTML = gum;

  var data = JSON.parse(data.responseText);
  console.log(data);

  var twoDimensionalArray = [];

  for (var i = 0; i < 2; i++) {
    var dat = [];
    for (var j = 0; j < data.length; j++) {
      if (data[j].userBuildingNumber == String.fromCharCode(65 + i)) {
        dat.push(data[j]);
      }
    }

    twoDimensionalArray.push(dat);
  }

  console.log(parseInt(twoDimensionalArray[0][0].consumption));

  var main = document.getElementById("main");
  var cum = "<h1 class='mainHeading'>Bill</h1>";
  for (var i = 0; i < 2; i++) {
    var s = 0;
    for (var j = 0; j < 2; j++) {
      s += parseInt(twoDimensionalArray[i][j].consumption) * 5;
    }
    cum +=
      "<button type='button' class='billingCollapsible'><div class='left'>Building " +
      String.fromCharCode(65 + i) +
      "</div>" +
      "<div class='right'>" +
      "₹" +
      s +
      "</div>" +
      "</button>" +
      "<div class='billingContent'>" +
      "<table>" +
      "<tr>" +
      "<th>Users</th>" +
      "<th>Cost</th>" +
      "</tr>";
    for (var j = 0; j < 2; j++) {
      var url = "/companyDashboard/" + twoDimensionalArray[i][j]._channelID;
      console.log(url);
      cum +=
        "<tr>" +
        "<td>" +
        "<a href='" +
        url +
        "' target='_blank' class='link'>" +
        twoDimensionalArray[i][j].userFlatNumber +
        "</a>" +
        "</td>" +
        "<td>" +
        "₹" +
        parseInt(twoDimensionalArray[i][j].consumption) * 5 +
        "</td>" +
        "</tr>";
    }
    cum += "</table>" + "</div>";
  }
  main.innerHTML = cum;

  var coll = document.getElementsByClassName("billingCollapsible");
  console.log(coll);
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
});
