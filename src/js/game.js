const socket = io.connect("/");
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5], // all left to right
  [6, 7, 8],
  //
  [0, 3, 6],
  [1, 4, 7], // all top to bottom
  [2, 5, 8],
  //
  [0, 4, 8],
  [6, 4, 2], //diagonals
];
//--------------------------------

let username = "Someone";
let turn = true;
let chosenSymbol = "";

socket.on("connect", () => {
  socket.emit("joined room", roomNumber);
});

socket.on("someone joined", () => {
  $("#messages").append(
    `<div class="message"><span class="you">Someone Joined</span></div>`
  );
});

socket.on("message", (data) => {
  $("#messages").append(
    `<div class="message"><span class="rival">${data.username}</span>: ${data.message}</div>`
  );
});

socket.on("user left", (user) => {
  $("#messages").append(
    `<div class="message"><span class="rival">${user}</span> has left</div>`
  );
});

socket.on("someone changed username", (data) => {
  $("#messages").append(
    `<div class="message"><span class="you">"${data.oldName}"</span> is now <span class="you"> "${data.newName}"</span></div>`
  );
});

socket.on("clicked data", (boardData) => {
  const spaces = $("#game-grid").children();
  spaces[0].innerText = boardData[0];
  spaces[1].innerText = boardData[1];
  spaces[2].innerText = boardData[2];
  spaces[3].innerText = boardData[3];
  spaces[4].innerText = boardData[4];
  spaces[5].innerText = boardData[5];
  spaces[6].innerText = boardData[6];
  spaces[7].innerText = boardData[7];
  spaces[8].innerText = boardData[8];
  turn = true;
  $(".subtitle").text("Turn: You");
});

socket.on("event", () => {
  console.log("event");
});

socket.on("lost", () => {
  $("#won-lose-text").text("You lose");
  $("#end-game").css("display", "grid").hide().show(250);
});

socket.on("draw", () => {
  $("#won-lose-text").text("Draw");
  $("#end-game").css("display", "grid").hide().show(250);
});

// Handle picked

socket.on("picked", (data) => {
  $("#picker").css("pointer-events", "none");
  $(data === "X" ? "#selectX" : "#selectO").slideUp(500);

  $(".subtitle").text("Turn: Other");
  $(".subtitle").slideDown(500);
  turn = false;
  chosenSymbol = data === "X" ? "O" : "X";
});

const handleSidePick = () => {
  const picked = (side) => {
    chosenSymbol = side;
    $("#picker").css("pointer-events", "none");
    turn = true;
    $(side === "X" ? "#selectO" : "#selectX").slideUp(500);
    socket.emit("picked", side);
    $(".subtitle").text("Turn: You");
    $(".subtitle").slideDown(500);
  };

  $("#selectX").click(() => picked("X"));
  $("#selectO").click(() => picked("O"));
};

// --------------

$(function () {
  const spaces = $("#game-grid").children();

  handleSidePick();

  $("#message-form").submit(function (e) {
    e.preventDefault(); // Prevents the page from refreshing
    const message = $("#messageBox").val();
    $("#messageBox").val("");
    socket.emit("message", {
      room: roomNumber,
      messageData: { username, message },
    });
    $("#messages").append(
      `<div class="message"><span class="you">You</span>: ${message}</div>`
    );
  });

  $("#name-form").submit(function (e) {
    e.preventDefault(); // Prevents the page from refreshing
    if (!$("#userNameBox").val()) return;
    const oldUsername = username;
    username = $("#userNameBox").val();
    $("#userNameBox").val("");
    $("#userNameBox").attr("placeholder", username);

    socket.emit("changed username", {
      room: roomNumber,
      userData: { oldName: oldUsername, newName: username },
    });
    $("#messages").append(
      `<div class="message">Your username is now is now <span class="you"> ${username}</span></div>`
    );
  });

  for (child of spaces) {
    $(child).hover(
      function () {
        if (!$(this).text()) {
          $(this).append($(`<span class="ghost">${chosenSymbol}</span>`));
        }
      },
      function () {
        if ($(this).children().length !== 0) {
          $(this).empty();
        }
      }
    );

    $(child).click(function () {
      if (turn && chosenSymbol && $(this).find("span.ghost").length !== 0) {
        $(this).text(chosenSymbol);
        $(this).removeClass("ghost");
        turn = false;
        const spacesData = $("#game-grid").children();
        const gameData = [
          spacesData[0].innerText,
          spacesData[1].innerText,
          spacesData[2].innerText,
          spacesData[3].innerText,
          spacesData[4].innerText,
          spacesData[5].innerText,
          spacesData[6].innerText,
          spacesData[7].innerText,
          spacesData[8].innerText,
        ];

        const noEmptySpaces = () => gameData.every((i) => i !== "");
        if (noEmptySpaces()) {
          socket.emit("draw", roomNumber);
          $("#won-lose-text").text("Draw");
          $("#end-game").css("display", "grid").hide().show(250);
        }

        const won = () =>
          winningConditions.some((winSet) => {
            return winSet.every((index) => {
              return gameData[index] === chosenSymbol;
            });
          });

        if (won()) {
          socket.emit("won");
          $("#won-lose-text").text("You win");
          $("#end-game").css("display", "grid").hide().show(250);
        }

        socket.emit("clicked", gameData);
        $(".subtitle").text("Turn: Other");
      }
    });
  }

  const resetAll = () => {
    $("#end-game").hide(250, function () {
      $("#won-lose-text").text("");
    });
    chosenSymbol = "";
    for (let space of $("#game-grid").children()) {
      space.innerText = "";
    }
    $("#selectO").slideDown(500);
    $("#selectX").slideDown(500);
    $("#picker").css("pointer-events", "auto");

    $(".subtitle").slideUp(500, function () {
      $(this).text("");
    });
  };

  $("#reset").click(() => {
    socket.emit("reset");
    resetAll();
  });

  socket.on("reset", () => {
    resetAll();
  });
});
