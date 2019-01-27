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
printMessage("Server status:\t", "running\t");

//variables
const maxNumberPlayers = 20;
const playgroundWidth = 3000;
let players = [];
let mapLoad = 0;
let gameLoad = 0;
let playerLoad = 0;

//io functions

io.on("connection", socket => {
  printMessage("New connection:", socket.handshake.address + "\t");
  if (players.length + 1 <= maxNumberPlayers) {
    pushGameData(socket);
    pushMapData(socket);
    pushPlayerSpriteList(socket);
    let playerData = loadPlayerData(playerLoad);
    pushPlayer(socket, playerData);
    console.log(players.length);
    socket.on("disconnect", () => removePlayer(socket));
    socket.on("pos_update", data => processNewPosition(socket, data));
  }
});

pushPlayerSpriteList = socket => {
  //console.log("pushing map to player!", map);
  let playerSpriteList = loadPlayerSpriteList();
  socket.emit("plr_sprites_set", playerSpriteList);
};

pushMapData = socket => {
  //console.log("pushing map to player!");
  let map = loadMapData(mapLoad);
  socket.emit("map_set", map);
};

pushGameData = socket => {
  //console.log("pushing gameData to player!", gameData);
  let gameData = loadGameData(gameLoad);
  socket.emit("gme_set", gameData);
};

pushNewPlayerData = () => {
  //console.log("pushing new PLayerData", players.length);
  let dataOfPlayers = [];
  players.forEach(player => {
    dataOfPlayers.push(player.data);
  });
  players.forEach(player => {
    player.emit("pls_update", dataOfPlayers);
  });
};

removePlayer = socket => {
  printMessage("Disconnected:\t", socket.handshake.address + "\t");
  printMessage("Removed player:", socket.id);
  let i = players.indexOf(socket);
  players.splice(i, 1);
  printMessage("Number PLayers:", players.length + "\t\t");
  pushNewPlayerData();
};

pushPlayer = (socket, data) => {
  printMessage("New player:\t", socket.id);
  socket.data = data;
  players.push(socket);
  socket.emit("plr_register", data);
  printMessage("Number Players:", players.length + "\t\t");
};

processNewPosition = (socket, data) => {
  socket.data = data;
  //validate
  pushNewPlayerData();
};

//logic

function printMessage(text1, text2) {
  let timeStamp = new Date();
  console.log(
    text1,
    "\t",
    text2,
    "\t\t",
    timeStamp.getHours(),
    ":",
    timeStamp.getMinutes(),
    ":",
    timeStamp.getSeconds()
  );
}

loadGameData = gameLoad => {
  let gameData;
  if (gameLoad === 0) {
    gameData = {
      playerMaxHorSpeed: 10,
      playerMaxVerSpeed: 10,
      playerHeight: 50,
      playerWidth: 30,
      gravity: 0.3,
      friction: 0.4,
      tickRate: 20
    };
  } else if (gameLoad === 1) {
    gameData = {
      playerMaxHorSpeed: 5,
      playerMaxVerSpeed: 10,
      playerHeight: 20,
      playerWidth: 10,
      gravity: 0.2,
      friction: 0.1,
      tickRate: 20
    };
  } else if (gameLoad === 2) {
    gameData = {
      playerMaxHorSpeed: 5,
      playerMaxVerSpeed: 10,
      playerHeight: 30,
      playerWidth: 20,
      gravity: 0.3,
      friction: 0.1,
      tickRate: 20
    };
  }
  return gameData;
};

loadMapData = mapLoad => {
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
      x: -500,
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
      height: 70,
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
};

loadPlayerData = playerLoad => {
  let playerData;
  if (playerLoad === 0) {
    playerData = {
      x: 850,
      y: 800,
      dx: 0,
      dy: 0,
      direction: "right",
      wDown: false,
      aDown: false,
      sDown: false,
      dDown: false,
      name: "Player"
    };
  }
  return playerData;
};

loadPlayerSpriteList = () => {
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
      "slide_right",
      "slide_left",
      "jump_right",
      "jump_left",
      "glide_right",
      "glide_left"
    ]
  };
  return PlayerSpriteList;
};
