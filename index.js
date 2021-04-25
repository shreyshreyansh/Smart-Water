const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));

app.get("/dashboard", function(req, res){
    res.sendFile(__dirname + "/dashboard.html");
});

app.listen(3000, function(){
    console.log("Server is up and running");
});