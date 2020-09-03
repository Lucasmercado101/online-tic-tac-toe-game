const socket = io.connect("/");

socket.on("update rooms", (roomsData) => {
  $(".card p").each(function (i) {
    console.log(roomsData, i);
    $(this).empty().append(`${roomsData[i]} <br> Players`);
  });
});
