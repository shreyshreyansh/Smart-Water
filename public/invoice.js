function print_today() {
  var now = new Date();
  var months = new Array(
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  );
  var date = (now.getDate() < 10 ? "0" : "") + now.getDate();
  function fourdigits(number) {
    return number < 1000 ? number + 1900 : number;
  }
  var today =
    months[now.getMonth()] + " " + date + ", " + fourdigits(now.getYear());
  return today;
}

function roundNumber(number, decimals) {
  var newString; // The new rounded number
  decimals = Number(decimals);
  if (decimals < 1) {
    newString = Math.round(number).toString();
  } else {
    var numString = number.toString();
    if (numString.lastIndexOf(".") == -1) {
      // If there is no decimal point
      numString += "."; // give it one at the end
    }
    var cutoff = numString.lastIndexOf(".") + decimals; // The point at which to truncate the number
    var d1 = Number(numString.substring(cutoff, cutoff + 1)); // The value of the last decimal place that we'll end up with
    var d2 = Number(numString.substring(cutoff + 1, cutoff + 2)); // The next decimal, after the last one we want
    if (d2 >= 5) {
      // Do we need to round up at all? If not, the string will just be truncated
      if (d1 == 9 && cutoff > 0) {
        // If the last digit is 9, find a new cutoff point
        while (cutoff > 0 && (d1 == 9 || isNaN(d1))) {
          if (d1 != ".") {
            cutoff -= 1;
            d1 = Number(numString.substring(cutoff, cutoff + 1));
          } else {
            cutoff -= 1;
          }
        }
      }
      d1 += 1;
    }
    if (d1 == 10) {
      numString = numString.substring(0, numString.lastIndexOf("."));
      var roundedNum = Number(numString) + 1;
      newString = roundedNum.toString() + ".";
    } else {
      newString = numString.substring(0, cutoff) + d1.toString();
    }
  }
  if (newString.lastIndexOf(".") == -1) {
    // Do this again, to the new string
    newString += ".";
  }
  var decs = newString.substring(newString.lastIndexOf(".") + 1).length;
  for (var i = 0; i < decimals - decs; i++) newString += "0";
  //var newNumber = Number(newString);// make it a number if you like
  return newString; // Output the result to the form field (change for your purposes)
}

function update_total() {
  var total = 0;
  console.log($(".price"));
  $(".price").each(function (i) {
    console.log($(this).html());
    price = $(this).html().replace("₹", "");
    if (!isNaN(price)) total += Number(price);
  });

  total = roundNumber(total, 2);

  $("#subtotal").html("₹" + total);
  $("#total").html("₹" + total);

  update_balance();
}

function update_balance() {
  var due =
    $("#total").html().replace("₹", "") - $("#paid").val().replace("₹", "");
  due = roundNumber(due, 2);

  $(".due").html("₹" + due);
}

function update_price() {
  var row = $(this).parents(".item-row");
  var price = row.find(".cost").val().replace("₹", "") * row.find(".qty").val();
  price = roundNumber(price, 2);
  isNaN(price)
    ? row.find(".price").html("N/A")
    : row.find(".price").html("₹" + price);

  update_total();
}

function bind() {
  $(".cost").blur(update_price);
  $(".qty").blur(update_price);
}

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

$(document).ready(function () {
  makeRequest("/invoiceData", function (data) {
    var data = JSON.parse(data.responseText);
    console.log(data);
    $("#date").html(print_today());
    var cum =
      "<b>" +
      data.userName +
      "</b><br/>123 Appleseed Street Appleville, WI 53719<br/><b>" +
      data.userEmail +
      "</br>";
    $("#receiver-address").html(cum);
    cum = "₹" + roundNumber(data.consumption, 2) * 5 + ".00";
    console.log(cum);
    $("#paid").html("₹0.00");
    $(".due").html(cum);
    $(".cost").html("₹5/L");
    $(".price").html(cum);
    var date = print_today();
    cum =
      "Monthly water cost for (" +
      date.substring(0, date.length - 9) +
      " 01 - " +
      date +
      ")";
    $(".description").html(cum);
    $(".qty").html(roundNumber(data.consumption, 2));
    update_total();
  });
});
