const socket = io.connect("http://localhost:5000");

let turn = true;
let prevText = "";

socket.on("connect", () => {
  socket.emit("join", "Hello World from client");
});

$(window).on("load", function () {
  const spaces = $(".game-grid").children();
  for (child of spaces) {
    $(child).click(function () {
      $(this).text(turn ? "X" : "O");
      $(this).addClass("occupied");
      $(this).removeClass("ghost");
      turn = !turn;
    });

    $(child).hover(
      function () {
        if (!$(this).hasClass("occupied")) {
          $(this).addClass("ghost");
          prevText = $(this).text();
          $(this).text(turn ? "X" : "O");
        }
      },
      function () {
        if (!$(this).hasClass("occupied")) {
          $(this).removeClass("ghost");
          $(this).text(prevText);
          prevText = "";
        }
      }
    );
  }
});
