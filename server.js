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
const server = app.listen(6969, "192.168.1.90");
const io = socket(server);

//variables
const playgroundWidth = 2000;
let players = [];
let mapLoad = 0;
let gameLoad = 0;

//io functions

io.on("connection", socket => {
  connectMessage(socket);
  socket.on("disconnect", () => removePlayer(socket));
  socket.on("plr_register", data => addPlayer(socket, data));
  socket.on("pos_update", data => processNewPosition(socket, data));
  socket.on("plr_sprites_get", () => pushPlayerData(socket));
  socket.on("map_get", () => pushMapData(socket));
  socket.on("gme_get", () => pushGameData(socket));
});

function pushPlayerData(socket) {
  //console.log("pushing map to player!", map);
  let playerSpriteList = loadPlayerSpriteList();
  socket.emit("plr_sprites_set", playerSpriteList);
}

function pushMapData(socket) {
  //console.log("pushing map to player!");
  let map = loadMapData(mapLoad);
  socket.emit("map_set", map);
}

function pushGameData(socket) {
  //console.log("pushing gameData to player!", gameData);
  let gameData = loadGameData(gameLoad);
  socket.emit("gme_set", gameData);
}

function pushNewPlayerData() {
  //console.log("pushing new PLayer Data");
  let dataOfPlayers = [];
  players.forEach(player => {
    dataOfPlayers.push(player.data);
  });
  players.forEach(player => {
    player.emit("pls_update", dataOfPlayers);
  });
}

function removePlayer(socket) {
  console.log("Remove player:\t\t", socket.id);
  //console.log(players.length);
  let i = players.indexOf(socket);
  players.splice(i, 1);
  disconnectMessage(socket);
  console.log("Number PLayers:\t\t", players.length);
  pushNewPlayerData();
}

function addPlayer(socket, data) {
  console.log("New player:\t\t", socket.id);
  socket.data = data;
  //console.log(players.length);
  players.push(socket);
  console.log("Number PLayers:\t\t", players.length);
  pushNewPlayerData();
}

function processNewPosition(socket, data) {
  //console.log(players.length);
  socket.data = data; //data..x = data.x
  //console.log(players.length);
  //validate
  pushNewPlayerData();
}

//logic

function disconnectMessage(socket) {
  let timeStamp = new Date();
  console.log(
    "Disconnect connection:\t",
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

//Data
function loadGameData(gameLoad) {
  let gameData;
  if (gameLoad === 0) {
    gameData = {
      playerMaxHorSpeed: 5,
      playerMinHorSpeed: 0,
      playerHeight: 30,
      playerWidth: 20,
      gravity: 0.3
    };
  } else if (gameLoad === 1) {
    gameData = {
      playerMaxHorSpeed: 5,
      playerMinHorSpeed: 0,
      playerHeight: 20,
      playerWidth: 10,
      gravity: 0.2
    };
  }
  return gameData;
}

function loadMapData(mapLoad) {
  let objects = [];
  let map = {
    id: -1,
    background: -1,
    objects: objects
  };
  if (mapLoad === 0) {
    //id
    map.id = "0";
    //background
    map.background =
      "/sprites/maps/map_" + map.id + "/background/background.png";
    //objects
    let ground = {
      image: "/sprites/maps/map_" + map.id + "/objects/ground_1.png",
      x: 0,
      y: 900,
      width: playgroundWidth,
      height: 60,
      color: "#333333"
    };
    objects.push(ground);
    const boxHeight = 25;
    const boxColor = "#777777";
    const boxImage = "/sprites/maps/map_" + map.id + "/objects/box_1.png";
    let box1 = {
      image: boxImage,
      x: 750,
      y: 830,
      width: boxHeight * 2,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box1);
    let box2 = {
      image: boxImage,
      x: 550,
      y: 700,
      width: boxHeight,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box2);
    let box3 = {
      image: boxImage,
      x: 400,
      y: 550,
      width: boxHeight * 2,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box3);
    let box4 = {
      image: boxImage,
      x: 700,
      y: 490,
      width: boxHeight,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box4);
    let box5 = {
      image: boxImage,
      x: 920,
      y: 580,
      width: boxHeight,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box5);
    let box6 = {
      image: boxImage,
      x: 1200,
      y: 600,
      width: boxHeight * 2,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box6);
    let box7 = {
      image: boxImage,
      x: 1300,
      y: 450,
      width: boxHeight * 2,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box7);
    let box8 = {
      image: boxImage,
      x: 1100,
      y: 320,
      width: boxHeight * 2,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box8);
    let box9 = {
      image: boxImage,
      x: 900,
      y: 200,
      width: boxHeight,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box9);
    let box10 = {
      image: boxImage,
      x: 630,
      y: 300,
      width: boxHeight * 2,
      height: boxHeight,
      color: boxColor
    };
    objects.push(box10);
    let goal = {
      image: "/sprites/maps/map_" + map.id + "/objects/finish_1.jpg",
      x: 190,
      y: 310,
      width: 100,
      height: boxHeight,
      color: "#00A86B"
    };
    objects.push(goal);
    map.objects = objects;
  }
  return map;
}

function loadPlayerSpriteList() {
  let PlayerSpriteList = {
    folder: "/sprites/player/",
    dataType: ".png",
    sprites: [
      "standard_right",
      "standard_left",
      "run_right_0",
      "run_left_0",
      "run_right_1",
      "run_left_1",
      "run_right_2",
      "run_left_2",
      "run_right_3",
      "run_left_3",
      "run_right_4",
      "run_left_4",
      "run_right_5",
      "run_left_5",
      "run_right_6",
      "run_left_6",
      "run_right_7",
      "run_left_7",
      "run_right_8",
      "run_left_8",
      "run_right_9",
      "run_left_9",
      "jump_right",
      "jump_left",
      "glide_right",
      "glide_left"
    ]
  };
  return PlayerSpriteList;
}
