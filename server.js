var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/src"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", function (_, res) {
  res.render("index");
});

app.get("/room/:number", function (req, res) {
  if (
    req.params.number !== "1" &&
    req.params.number !== "2" &&
    req.params.number !== "3"
  ) {
    return res.redirect("/");
  }
  res.render("game", { roomNumber: req.params.number });
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

  socket.on("joined room", (roomNumber) => {
    socket.join(roomNumber);
    socket.to(roomNumber).emit("someone joined");
    socket.myData = { username: "Someone", roomID: roomNumber };
  });

  socket.on("message", (data) => {
    socket.to(data.room).broadcast.emit("message", {
      message: data.messageData.message,
      username: data.messageData.username,
    });
  });

  socket.on("changed username", (data) => {
    socket.to(data.room).broadcast.emit("someone changed username", {
      oldName: data.userData.oldName,
      newName: data.userData.newName,
    });
    socket.myData.username = data.userData.newName;
  });

  socket.on("draw", (roomNumber) => {
    socket.to(roomNumber).broadcast.emit("draw");
  });

  socket.on("disconnecting", () => {
    const hasJoinedARoom = Object.keys(socket.myData) !== 0;
    if (hasJoinedARoom) {
      socket.to(socket.myData.roomID).emit("user left", socket.myData.username);
    }
  });
});
