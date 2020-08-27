var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/src"));

app.get("/", function (_, res) {
  res.sendFile(__dirname + "/src/index.html");
});

app.get("*", function (_, res) {
  res.redirect("/");
});

server.listen(process.env.PORT || 5000);

io.on("connection", (socket) => {
  socket.on("clicked", (data) => {
    socket.broadcast.emit("clicked data", data);
  });
  socket.on("picked", (data) => {
    socket.broadcast.emit("picked", data);
  });
  socket.on("won", () => {
    socket.broadcast.emit("lost");
  });
  socket.on("reset", () => {
    socket.broadcast.emit("reset");
  });
});
