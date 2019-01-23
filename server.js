//imports
const express = require("express");
const socket = require("socket.io");

//setup
const app = express();
app.use(express.static("public"));
/*
const server = app.listen(6969, () => {
  console.log("Using port:\t\t 6969");
});
*/
const server = app.listen(6969, "192.168.1.89");
const io = socket(server);

//variables
const playgroundWidth = 2000;
let players = [];
//var idNumber = 0;

//io functions

io.on("connection", socket => {
  connectMessage(socket);
  socket.on("disconnect", removePlayer);
  socket.on("pl_register", data => addPlayer(socket, data));
  socket.on("pos_update", data => processNewPosition(socket, data));
});

function pushNewPlayerData() {
  let dataOfPlayers = [];
  players.forEach(player => {
    dataOfPlayers.push(player.data);
  });
  players.forEach(player => {
    player.emit("pls_update", dataOfPlayers);
  });
}

function removePlayer() {
  let i = players.indexOf(socket);
  players.splice(i, 1);
  disconnectMessage(socket);
  pushNewPlayerData();
}

function addPlayer(socket, data) {
  socket.data = data; //TODO fix
  players.push(socket);
  pushNewPlayerData();
}

function processNewPosition(socket, data) {
  socket.data = data; //data..x = data.x
  //validate
  pushNewPlayerData();
}

//logic

function disconnectMessage(socket) {
  let timeStamp = new Date();
  console.log(
    "Disconnect:\t\t",
    socket.id,
    "\t\t",
    timeStamp.getHours(),
    ":",
    timeStamp.getMinutes(),
    ":",
    timeStamp.getSeconds()
  );
}

function connectMessage(socket) {
  let timeStamp = new Date();
  console.log(
    "New connection:\t\t",
    socket.id,
    "\t\t",
    timeStamp.getHours(),
    ":",
    timeStamp.getMinutes(),
    ":",
    timeStamp.getSeconds()
  );
}

function addedPlayerMessage(playerData) {
  let timeStamp = new Date();
  console.log(
    "New player:\t\t",
    playerData.id,
    "\t\t",
    timeStamp.getHours(),
    ":",
    timeStamp.getMinutes(),
    ":",
    timeStamp.getSeconds()
  );
}

let timeStamp = new Date();
console.log(
  "Server status:\t\t running\t\t\t",
  timeStamp.getHours(),
  ":",
  timeStamp.getMinutes(),
  ":",
  timeStamp.getSeconds()
);
