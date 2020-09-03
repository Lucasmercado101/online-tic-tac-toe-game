const socket = io.connect("/");

socket.on("update rooms", (roomsData) => {
  $(".card p").each(function (i) {
    $(this).empty().append(`${roomsData[i]} <br> Players`);
  });
});
