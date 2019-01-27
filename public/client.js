//setup
const socket = io({ transports: ["websocket"], upgrade: false });
socket.connect("http://192.168.1.90:6969");
//console.log("client Started", socket);

//Query DOM
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = 960;
const c = canvas.getContext("2d");

//variables
/**
 * startX, startY, widthPercent, heightPercent, color
 */
let objects = [];
let map = [];
/**
 * Constant Variables given by the Server
 */
let gameData;
/**
 * Data of this client
 */
let playerData;
let runSpriteState = 0;
let playerSprites = [];

//logic

document.getElementById("playerNameButton").addEventListener("click", () => {
  playerData.name = document.getElementById("playerName").value;
  console.log(playerData);
  pushNewDataToServer();
});

document.onkeypress = event => {
  if (event.keyCode === 32) {
    console.log("stab!");
  } else if (event.keyCode === 108 || event.keyCode === 76) {
    removeSocketFromServer();
  }
};

document.onkeydown = event => {
  if (event.keyCode === 119 || event.keyCode === 87) {
    //W
    playerData.wDown = true;
  } else if (event.keyCode === 97 || event.keyCode === 65) {
    //A
    playerData.aDown = true;
  } else if (event.keyCode === 115 || event.keyCode === 83) {
    //S
    playerData.sDown = true;
  } else if (event.keyCode === 100 || event.keyCode === 68) {
    //D
    playerData.dDown = true;
  }
};

document.onkeyup = event => {
  if ((event.keyCode === 119 || event.keyCode === 87) && playerData.wDown) {
    //W
    playerData.wDown = false;
  } else if (
    (event.keyCode === 97 || event.keyCode === 65) &&
    playerData.aDown
  ) {
    //A
    playerData.aDown = false;
  } else if (
    (event.keyCode === 115 || event.keyCode === 83) &&
    playerData.sDown
  ) {
    //S
    playerData.sDown = false;
  } else if (
    (event.keyCode === 100 || event.keyCode === 68) &&
    playerData.dDown
  ) {
    //D
    playerData.dDown = false;
  }
};

updateMovement = () => {
  //console.log("starting game loop!");
  setInterval(() => {
    setTimeout(() => {
      let playerFloorHeight = getFloorHeightOfPlayer(playerData);

      if (playerData.wDown) {
        //W
        //jump
        //console.log("W pressed");
        if (playerData.y + gameData.playerHeight === playerFloorHeight) {
          playerData.dy = -gameData.playerMaxVerSpeed;
        }
      }
      //if (!(playerData.aDown && playerData.dDown)) {
      if (playerData.aDown) {
        //A
        //left
        //console.log("A pressed");
        if (playerData.dx > 0) {
          playerData.dx -= gameData.friction;
        } else if (
          Math.abs(playerData.dx) + gameData.friction <
          gameData.playerMaxHorSpeed
        ) {
          playerData.direction = "left";
          if (playerData.y + gameData.playerHeight === playerFloorHeight) {
            playerData.dx -= gameData.friction;
          }
        }
      }
      if (playerData.dDown) {
        //D
        //right
        //console.log("D pressed");
        if (playerData.dx < 0) {
          playerData.dx += gameData.friction;
        } else if (
          Math.abs(playerData.dx) + gameData.friction <
          gameData.playerMaxHorSpeed
        ) {
          playerData.direction = "right";
          if (playerData.y + gameData.playerHeight === playerFloorHeight) {
            playerData.dx += gameData.friction;
          }
        }
      }
      //}
      if (playerData.sDown) {
        //S
        //duck
        //console.log("S pressed");
        //playerData.direction = "down";
      }
      updatePosition();
    }, gameData.tickRate);
  }, gameData.tickRate);
};

updatePosition = () => {
  //yPos
  let playerFloorHeight = getFloorHeightOfPlayer(playerData);
  let playerCeiling = getCeilingHeightOfPlayer(playerData);
  if (
    playerData.y + gameData.playerHeight + playerData.dy <
    playerFloorHeight
  ) {
    //gravity
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
  if (playerData.y + gameData.playerHeight === playerFloorHeight) {
    //friction
    if (
      (!playerData.aDown && !playerData.dDown) ||
      (playerData.aDown && playerData.dDown)
    ) {
      if (playerData.dx != 0) {
        if (Math.round(playerData.dx * 10) / 10 < gameData.friction) {
          playerData.dx += gameData.friction;
        } else if (Math.round(playerData.dx * 10) / 10 > gameData.friction) {
          playerData.dx -= gameData.friction;
        } else {
          playerData.dx = 0;
        }
      }
    }
  }
  playerData.x = getNewXOfPlayer();
  pushNewDataToServer();
};

getNewXOfPlayer = () => {
  let nextX = playerData.x + playerData.dx;
  let newX = nextX;
  map.objects.map(object => {
    if (object.width != canvas.width) {
      if (!(playerData.y + gameData.playerHeight <= object.y)) {
        if (!(playerData.y > object.y + object.height)) {
          if (nextX < object.x + object.width && nextX > object.x) {
            newX = object.x + object.width;
            playerData.dx = 0;
          } else if (
            nextX + gameData.playerWidth > object.x &&
            nextX < object.x + object.width
          ) {
            newX = object.x - gameData.playerWidth;
            playerData.dx = 0;
          }
        }
      }
    }
  });
  return newX;
};

getFloorHeightOfPlayer = player => {
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
};

getCeilingHeightOfPlayer = player => {
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
};

getNewPlayerName = () => {
  fetch("https://randomuser.me/api/?inc=name&nat=ch,de,gb,us")
    .then(output => {
      return output.json();
    })
    .then(data => {
      let name = data.results[0].name.first + " " + data.results[0].name.last;
      playerData.name = name;
      document.getElementById("playerName").value = name;
    });
};

//io functions

socket.on("plr_register", data => {
  //console.log("received playerData!", data);
  clearCanvas();
  playerData = data;
  playerData.name = getNewPlayerName();
  updateMovement();
});

socket.on("map_set", data => {
  //console.log("received mapData!", data);
  map.id = data.id;
  let image = new Image();
  image.src = data.background;
  map.background = image;
  map.objects = [];
  data.objects.forEach(object => {
    image = new Image();
    image.src = object.image;
    object.image = image;
    map.objects.push(object);
  });
});

socket.on("gme_set", data => {
  //console.log("received gameData!", data);
  gameData = data;
});

socket.on("plr_sprites_set", data => {
  //console.log("received playerSpriteList!", data);
  let image;
  data.sprites.forEach(sprite => {
    image = new Image();
    let link = data.folder + sprite + data.dataType;
    image.src = link;
    playerSprites[sprite] = image;
  });
});

socket.on("pls_update", data => {
  //console.log("updating players!", data);
  clearCanvas();
  drawBackground();
  displayMap();
  displayPlayers(data);
});

pushNewDataToServer = () => {
  //console.log("pushing: ", playerData);
  socket.emit("pos_update", playerData);
};

removeSocketFromServer = () => {
  socket.close();
  clearCanvas();
};

//canvas functions

drawBackground = () => {
  c.drawImage(map.background, 0, 0, canvas.width, canvas.height);
};

displayPlayers = players => {
  players.map(player => {
    //drawPlayerHitBox(player);
    drawPlayerSprite(player);
  });
};

drawPlayerHitBox = player => {
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
};

drawPlayerSprite = player => {
  let playerFloor = getFloorHeightOfPlayer(player);
  let playerSprite;
  if (player.y + gameData.playerHeight != playerFloor) {
    if (player.dx > 0 && player.aDown) {
      playerSprite = "glide_right";
    } else if (player.dx < 0 && player.dDown) {
      playerSprite = "glide_left";
    } else {
      playerSprite = "jump_" + player.direction;
    }
  } else {
    if (player.dx === 0) {
      playerSprite = "standard_" + player.direction;
    } else {
      if (player.dx > 0 && player.aDown) {
        playerSprite = "slide_right";
      } else if (player.dx < 0 && player.dDown) {
        playerSprite = "slide_left";
      } else {
        playerSprite = "run_" + player.direction + "_" + runSpriteState;
        runSpriteState++;
        runSpriteState = runSpriteState % 10;
      }
    }
  }
  c.drawImage(
    playerSprites[playerSprite],
    player.x,
    player.y,
    gameData.playerWidth,
    gameData.playerHeight
  );
  c.font = "20px Arial";
  //c.fillStyle = "black";
  c.textAlign = "center";
  c.fillText(
    player.name,
    player.x + gameData.playerWidth / 2,
    player.y - 25,
    200
  );
};

displayMap = () => {
  map.objects.forEach(object => {
    //drawObjectHitBox(object);
    c.drawImage(object.image, object.x, object.y, object.width, object.height);
  });
};

drawObjectHitBox = object => {
  c.beginPath();
  c.fillStyle = object.color;
  c.fillRect(object.x, object.y, object.width, object.height);
  c.stroke();
  c.closePath();
};

clearCanvas = () => {
  c.clearRect(0, 0, canvas.width, canvas.height);
};
