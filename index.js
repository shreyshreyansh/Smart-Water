const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database Connection
mongoose.connect("mongodb://localhost:27017/smartWaterDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

var activeUserID = "";

const flatSchema = mongoose.Schema({
  _channelID: String,
  userName: String,
  userFlatNumber: String,
  userBuildingNumber: String,
  writeAPIKey: String,
  readAPIKey: String,
  timerChannelID: String,
  timerWriteAPIKey: String,
  timerReadAPIKey: String,
  timer: String,
  consumption: String,
  lastModified: Date,
});
const flatData = mongoose.model("flat", flatSchema);

const flatLoginSchema = mongoose.Schema({
  _channelID: String,
  userName: String,
  userEmail: String,
  userPassword: String,
});
const flatLoginData = mongoose.model("flatLogin", flatLoginSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/", function (req, res) {
  flatLoginData.findOne(
    { _channelID: req.body.channelID },
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        if (
          docs.userEmail === req.body.email &&
          docs.userPassword === req.body.password
        ) {
          activeUserID = req.body.channelID;
          res.redirect("/dashboard");
        } else if (
          docs.userEmail !== req.body.email ||
          docs.userPassword !== req.body.password
        ) {
          res.redirect("/");
        }
      }
    }
  );
});

app.get("/dashboard", function (req, res) {
  if (activeUserID != "") {
    res.sendFile(__dirname + "/dashboard.html");
  } else {
    res.redirect("/");
  }
});

app.get("/timer", function (req, res) {
  if (activeUserID != "") {
    res.sendFile(__dirname + "/timer.html");
  } else {
    res.redirect("/");
  }
});

app.post("/timer", function (req, res) {
  const hours = req.body.hours;
  const minutes = req.body.minutes;
  const seconds = req.body.seconds;
  const timer = hours + ":" + minutes + ":" + seconds;
  flatData.updateOne(
    { _channelID: activeUserID },
    { $set: { timer: timer } },
    function (err, doc) {
      if (err) console.log(err);
      else {
        res.redirect("/timer");
      }
    }
  );
});

app.get("/dashboardData", function (req, res) {
  flatData.findOne({ _channelID: activeUserID }, function (err, doc) {
    if (err) console.log(err);
    else {
      res.send(doc);
    }
  });
});

app.get("/dashboardData/:channelID", function (req, res) {
  const channel_id = req.params.channelID;
  flatData.findOne({ _channelID: channel_id }, function (err, doc) {
    if (err) console.log(err);
    else {
      res.send(doc);
    }
  });
});

//, $set : { "cost" : parseInt(sum)*5 }, $set : { "lastModified" : date }

app.get("/dashboardData/:channelID/:sum/:date", function (req, res) {
  const channel_id = req.params.channelID;
  const sum = req.params.sum;
  const date = req.params.date;

  flatData.updateOne(
    { _channelID: channel_id },
    { $set: { consumption: sum }, $set: { lastModified: date } },
    function (err, doc) {
      if (err) console.log(err);
      else {
        res.redirect("/dashboard");
      }
    }
  );
});

app.get("/logout", function (req, res) {
  activeUserID = "";
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server is up and running");
});
