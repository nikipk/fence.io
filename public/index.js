//setup
const socket = io({ transports: ["websocket"], upgrade: false });
socket.connect("http://192.168.1.90:6969");
//console.log("client Started", socket);

//Query DOM
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
//canvas.height = window.innerHeight * 0.99;
canvas.height = 960;
const c = canvas.getContext("2d");

//variables
/**
 * startX, startY, widthPercent, heightPercent, color
 */
let objects = [];
let playerSprites = [];
let backgroundSprite;
let map = [];
/**
 * Constant Variables given by the Server
 */
let gameData;
/**
 * Data of this client
 */
let playerData = {
  x: 850,
  y: 800,
  dx: 0,
  dy: 0,
  direction: "right"
};
let lastKeyPress = 0;
let newKeyPress = 0;
let runSpriteState = 0;

//inits

initMap();
initGameData();
initPlayerSprites();
updateMovement();
registerPlayer();

//logic

document.onkeypress = event => {
  socket.emit("pos_update", playerData);
  if (event.keyCode === 108 || event.keyCode === 76) {
    removeSocketFromServer();
  }
  lastKeyPress = playerData.newKeyPress;
  playerData.newKeyPress = event.keyCode;
};

function updateMovement() {
  setInterval(() => {
    setTimeout(() => {
      if (playerData.newKeyPress === 119 || playerData.newKeyPress === 87) {
        //W
        //jump
        //console.log("W pressed");
        if (
          playerData.y + gameData.playerHeight ===
          getFloorHeightOfPlayer(playerData)
        ) {
          playerData.dy = -10;
        }
        playerData.newKeyPress = lastKeyPress;
      } else if (
        playerData.newKeyPress === 97 ||
        playerData.newKeyPress === 65
      ) {
        //A
        //left
        //console.log("A pressed");
        playerData.dx = -gameData.playerMaxHorSpeed;
        playerData.direction = "left";
      } else if (
        playerData.newKeyPress === 115 ||
        playerData.newKeyPress === 83
      ) {
        //S
        //duck
        //console.log("S pressed");
        //playerData.direction = "down";
      } else if (
        playerData.newKeyPress === 100 ||
        playerData.newKeyPress === 68
      ) {
        //D
        //right
        //console.log("D pressed");
        playerData.dx = gameData.playerMaxHorSpeed;
        playerData.direction = "right";
      } else {
        if (playerData.direction === "right") {
          playerData.dx = gameData.playerMinHorSpeed;
        } else {
          playerData.dx = -gameData.playerMinHorSpeed;
        }
        lastKeyPress = 0;
        playerData.newKeyPress = 0;
      }
      updatePosition();
    }, 20);
  }, 20);
}

function updatePosition() {
  //yPos
  let playerFloorHeight = getFloorHeightOfPlayer(playerData);
  let playerCeiling = getCeilingHeightOfPlayer(playerData);
  if (
    playerData.y + gameData.playerHeight + playerData.dy <
    playerFloorHeight
  ) {
    if (playerData.y + playerData.dy > playerCeiling) {
      playerData.dy += gameData.gravity;
    } else {
      playerData.y = playerCeiling;
      playerData.dy = playerData.dy * -gameData.gravity;
    }
  } else {
    playerData.y = playerFloorHeight - gameData.playerHeight;
    playerData.dy = 0;
  }
  playerData.y += playerData.dy;

  //xPos
  if (playerData.dx !== 0) {
    playerData.x = getNewXOfPlayer();
  }
  pushNewPositionToServer();
}

function getNewXOfPlayer() {
  let nextX = playerData.x + playerData.dx;
  let newX = nextX;
  map.objects.map(object => {
    if (object.width != canvas.width) {
      if (!(playerData.y + gameData.playerHeight <= object.y)) {
        if (!(playerData.y > object.y + object.height)) {
          if (nextX < object.x + object.width && nextX > object.x) {
            newX = object.x + object.width + 0;
          } else if (
            nextX + gameData.playerWidth > object.x &&
            nextX < object.x + object.width
          ) {
            newX = object.x - gameData.playerWidth - 0;
          }
        }
      }
    }
  });
  return newX;
}

function getFloorHeightOfPlayer(player) {
  let floorHeight = canvas.height;
  map.objects.forEach(object => {
    if (
      !(
        player.x >= object.x + object.width ||
        player.x + gameData.playerWidth <= object.x
      )
    ) {
      if (!(object.y + object.height < player.y)) {
        if (object.y < floorHeight) {
          floorHeight = object.y;
        }
      }
    }
  });
  return floorHeight;
}

function getCeilingHeightOfPlayer(player) {
  let ceilingHeight = 0;
  map.objects.forEach(object => {
    if (
      !(
        player.x >= object.x + object.width ||
        player.x + gameData.playerWidth <= object.x
      )
    ) {
      if (object.y + object.height < player.y) {
        if (object.y + object.height > ceilingHeight) {
          ceilingHeight = object.y + object.height;
        }
      }
    }
  });
  return ceilingHeight;
}

//io functions

function registerPlayer() {
  //console.log("registering!");
  socket.emit("plr_register", playerData);
}

function initMap() {
  //console.log("getting map from Server!");
  socket.emit("map_get");
}

socket.on("map_set", mapData => {
  //console.log("received mapData!", mapData);
  map.id = mapData.id;
  let image = new Image();
  image.src = mapData.background;
  map.background = image;
  map.objects = [];
  mapData.objects.forEach(object => {
    image = new Image();
    image.src = object.image;
    object.image = image;
    map.objects.push(object);
  });
  drawBackground();
  displayMap();
});

function initGameData() {
  socket.emit("gme_get");
}

socket.on("gme_set", data => {
  //console.log("received gameData!");
  gameData = data;
});

function initPlayerSprites() {
  socket.emit("plr_sprites_get");
}
socket.on("plr_sprites_set", playerSpriteList => {
  //console.log("received playerSpriteList!");
  let image;
  playerSpriteList.sprites.forEach(sprite => {
    image = new Image();
    let link = playerSpriteList.folder + sprite + playerSpriteList.dataType;
    image.src = link;
    playerSprites[sprite] = image;
  });
});

socket.on("pls_update", players => {
  //console.log("updating players!");
  clearCanvas();
  drawBackground();
  displayMap();
  displayPlayers(players);
});

socket.on("pl_setID", id => {
  //console.log("received ID: ", id);
  playerData.id = id;
});

function pushNewPositionToServer() {
  //console.log("pushing: ", playerData);
  socket.emit("pos_update", playerData);
}

function removeSocketFromServer() {
  socket.close();
  clearCanvas();
}

//canvas functions

function drawBackground() {
  c.drawImage(map.background, 0, 0, canvas.width, canvas.height);
}

function displayPlayers(players) {
  players.map(player => {
    //drawPlayerHitBox(player);
    drawPlayerSprite(player);
  });
}

function drawPlayerHitBox(player) {
  let playerFloor = getFloorHeightOfPlayer(player);
  c.beginPath();
  c.fillStyle = "#cc33ff";
  c.fillRect(player.x, player.y, gameData.playerWidth, gameData.playerHeight);
  c.stroke();
  c.fillStyle = "#grey";
  if (player.y + gameData.playerHeight < playerFloor) {
    c.fillRect(player.x + gameData.playerWidth / 2 - 2, player.y - 20, 4, 20);
  } else if (player.direction === "left") {
    c.fillRect(player.x - 20, player.y, 20, 4);
  } else if (player.direction === "right") {
    c.fillRect(player.x + gameData.playerWidth - 2, player.y, 20, 4);
  } else if (player.y + gameData.playerHeight < playerFloor) {
    c.fillRect(player.x + gameData.playerWidth / 2 - 2, player.y - 20, 4, 20);
  }
  c.stroke();
  c.closePath();
}

function drawPlayerSprite(player) {
  let playerFloor = getFloorHeightOfPlayer(player);
  let playerSprite;
  if (player.y + gameData.playerHeight != playerFloor) {
    if (player.dy < 0) {
      playerSprite = "jump_" + player.direction;
    } else {
      playerSprite = "glide_" + player.direction;
    }
  } else {
    if (player.dx === 0) {
      playerSprite = "standard_" + player.direction;
    } else {
      playerSprite = "run_" + player.direction + "_" + runSpriteState;
      runSpriteState++;
      runSpriteState = runSpriteState % 10;
    }
  }
  c.drawImage(
    playerSprites[playerSprite],
    player.x,
    player.y,
    gameData.playerWidth,
    gameData.playerHeight
  );
}

function displayMap() {
  map.objects.forEach(object => {
    //drawObjectHitBox(object);
    c.drawImage(object.image, object.x, object.y, object.width, object.height);
  });
}

function drawObjectHitBox(object) {
  c.beginPath();
  c.fillStyle = object.color;
  c.fillRect(object.x, object.y, object.width, object.height);
  c.stroke();
  c.closePath();
}

function clearCanvas() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}
