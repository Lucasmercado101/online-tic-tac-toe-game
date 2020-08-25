var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/src"));

app.get("/", function (_, res) {
  res.sendFile(__dirname + "/src/index.html");
});

io.on("connection", (client) => {
  //   console.log("Client connected...");
  //   client.on("join", (data) => {
  //     console.log(data);
  //   });
});

server.listen(5000);
