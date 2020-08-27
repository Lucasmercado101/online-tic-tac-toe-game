const socket = io.connect("http://localhost:5000");
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5], // all left to right
  [6, 7, 8],
  // ----
  [0, 3, 6],
  [1, 4, 7], // all top to bottom
  [2, 5, 8],
  //
  [0, 4, 8],
  [6, 4, 2], //diagonals
];

// testData.some() // research about this Some method

//--------------------------------

let turn = true;
let chosenSymbol = "";

socket.on("connect", () => {
  // socket.emit("join", "Hello World from client");
  // socket.on('disconnect', () => {
  //   console.log('user disconnected');
  // });
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

socket.on("lost", () => {
  $("#won-lose-text").text("You lose");
  $("#end-game").css("display", "grid").hide().show(250);
});

// Handle picked

socket.on("picked", (data) => {
  console.log("picked");
  $("#picker").slideUp(500);
  chosenSymbol = data === "X" ? "O" : "X";
});

const handleSidePick = () => {
  const picked = (side) => {
    chosenSymbol = side;
    $("#picker").css("pointer-events", "none");
    $("#picker").slideUp(500, () => $("#picker").css("pointer-events", "auto"));
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
      if (turn && chosenSymbol) {
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
    $("#picker").slideDown(500);
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
