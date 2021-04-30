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

makeRequest("/dashboardData", function (data) {
  var data = JSON.parse(data.responseText);
  console.log(data);
  document.getElementById("loginName").innerHTML = data.userName;
  document.getElementById("loginDescription").prepend(data.userEmail);
  document.getElementById("loginImg").style.backgroundImage =
    "url(" + data.userPhotoLink + ")";
  (function () {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el, all = false) => {
      el = el.trim();
      if (all) {
        return [...document.querySelectorAll(el)];
      } else {
        return document.querySelector(el);
      }
    };

    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
      let selectEl = select(el, all);
      if (selectEl) {
        if (all) {
          selectEl.forEach((e) => e.addEventListener(type, listener));
        } else {
          selectEl.addEventListener(type, listener);
        }
      }
    };

    /**
     * Countdown timer
     */
    var timer = data.timer;
    let countdown = select(".countdown");
    const output = countdown.innerHTML;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const countDownDate = function () {
      let timeleft =
        new Date(countdown.getAttribute("data-count")).getTime() -
        new Date().getTime();

      let hours = timer.substring(0, 2);
      let minutes = timer.substring(3, 5);
      let seconds = timer.substring(6, 8);

      countdown.innerHTML = output
        .replace("%h", hours)
        .replace("%m", minutes)
        .replace("%s", seconds);
      var sec =
        parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      sec = sec * 1000;
      var link =
        "https://api.thingspeak.com/update?api_key=" +
        data.timerWriteAPIKey +
        "&field1=" +
        sec;
      var xhttp = new XMLHttpRequest();
      console.log(link);
      xhttp = new XMLHttpRequest();
      xhttp.open("GET", link, false);
      xhttp.send();
    };
    countDownDate();
  })();
});
