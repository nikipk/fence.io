//setup
const socket = io.connect("http://192.168.1.89:6969");
//console.log("client Started", socket);

//Query DOM
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
//canvas.height = window.innerHeight * 0.99;
canvas.height = 960;
const c = canvas.getContext("2d");

//variables
const id = socket.id;
/**
 * startX, startY, widthPercent, heightPercent, color
 */
let objects = [];
/**
 * Data of this client
 */
let playerData = {
  x: canvas.width / 2,
  y: 800,
  dx: 0,
  dy: 0,
  verSpeed: 5,
  horSpeed: 5,
  lastKeyPress: 0,
  newKeyPress: 0,
  direction: "", //hit direction
  width: 20, //hit box
  height: 30, //hit box
  color: getRandomColor()
};

//inits

registerPlayer();
initMap();
updateMovement();
drawBackground();
displayObjects();

//logic

document.onkeypress = event => {
  socket.emit("pos_update", playerData);
  if (event.keyCode === 108 || event.keyCode === 76) {
    removeSocketFromServer();
  }
  playerData.lastKeyPress = playerData.newKeyPress;
  playerData.newKeyPress = event.keyCode;
};

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updateMovement() {
  setInterval(() => {
    setTimeout(() => {
      if (playerData.newKeyPress === 119 || playerData.newKeyPress === 87) {
        //W
        //jump
        //console.log("W pressed");
        if (playerData.y + playerData.height === getFloorHeightOfPlayer()) {
          playerData.dy = -10;
        }
        playerData.direction = "up";
        playerData.newKeyPress = playerData.lastKeyPress;
      } else if (
        playerData.newKeyPress === 97 ||
        playerData.newKeyPress === 65
      ) {
        //A
        //left
        //console.log("A pressed");
        playerData.dx = -playerData.horSpeed;
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
        playerData.dx = playerData.horSpeed;
        playerData.direction = "right";
      } else {
        playerData.dx = 0;
        playerData.lastKeyPress = 0;
        playerData.newKeyPress = 0;
      }
      updatePosition();
    }, 20);
  }, 20);
}

function updatePosition() {
  //yPos
  let playerFloorHeight = getFloorHeightOfPlayer();
  let playerCeiling = getCeilingHeightOfPlayer();
  if (playerData.y + playerData.height + playerData.dy < playerFloorHeight) {
    if (playerData.y + playerData.dy > playerCeiling) {
      playerData.dy += 0.3;
    } else {
      playerData.y = playerCeiling + 1; //remove + 1
      playerData.dy = playerData.dy * -0.3;
    }
  } else {
    playerData.y = playerFloorHeight - playerData.height;
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
  objects.map(object => {
    if (object.width != canvas.width) {
      if (!(playerData.y + playerData.height <= object.y)) {
        if (!(playerData.y > object.y + object.height)) {
          if (nextX < object.x + object.width && nextX > object.x) {
            newX = object.x + object.width + 0;
          } else if (
            nextX + playerData.width > object.x &&
            nextX < object.x + object.width
          ) {
            newX = object.x - playerData.width - 0;
          }
        }
      }
    }
  });
  return newX;
}

function getFloorHeightOfPlayer() {
  let floorHeight = canvas.height;
  objects.forEach(object => {
    if (
      !(
        playerData.x >= object.x + object.width ||
        playerData.x + playerData.width <= object.x
      )
    ) {
      if (!(object.y + object.height < playerData.y)) {
        if (object.y < floorHeight) {
          floorHeight = object.y;
        }
      }
    }
  });
  return floorHeight;
}

function getCeilingHeightOfPlayer() {
  let ceilingHeight = 0;
  objects.forEach(object => {
    if (
      !(
        playerData.x >= object.x + object.width ||
        playerData.x + playerData.width <= object.x
      )
    ) {
      if (object.y + object.height < playerData.y) {
        if (object.y + object.height > ceilingHeight) {
          ceilingHeight = object.y + object.height;
        }
      }
    }
  });
  return ceilingHeight;
}

function initMap() {
  let ground = {
    type: "ground_1",
    x: 0,
    y: 900,
    width: canvas.width,
    height: 60,
    color: "#333333"
  };
  objects.push(ground);
  const boxHeight = 25;
  const boxColor = "#777777";
  let box1 = {
    type: "box_1",
    x: 750,
    y: 830,
    width: boxHeight * 2,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box1);
  let box2 = {
    type: "box_1",
    x: 550,
    y: 700,
    width: boxHeight,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box2);
  let box3 = {
    type: "box_1",
    x: 400,
    y: 550,
    width: boxHeight * 2,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box3);
  let box4 = {
    type: "box_1",
    x: 700,
    y: 490,
    width: boxHeight,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box4);
  let box5 = {
    type: "box_1",
    x: 920,
    y: 580,
    width: boxHeight,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box5);
  let box6 = {
    type: "box_1",
    x: 1200,
    y: 600,
    width: boxHeight * 2,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box6);
  let box7 = {
    type: "box_1",
    x: 1300,
    y: 450,
    width: boxHeight * 2,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box7);
  let box8 = {
    type: "box_1",
    x: 1100,
    y: 320,
    width: boxHeight * 2,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box8);
  let box9 = {
    type: "box_1",
    x: 900,
    y: 200,
    width: boxHeight,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box9);
  let box10 = {
    type: "box_1",
    x: 630,
    y: 300,
    width: boxHeight * 2,
    height: boxHeight,
    color: boxColor
  };
  objects.push(box10);
  let goal = {
    type: "finish_1",
    x: 190,
    y: 310,
    width: 100,
    height: boxHeight,
    color: "#00A86B"
  };
  objects.push(goal);
}

//io functions

function registerPlayer() {
  //console.log("registering!");
  socket.emit("pl_register", playerData);
}

socket.on("pls_update", players => {
  //console.log("updating players", players);
  clearCanvas();
  drawBackground();
  displayObjects();
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
  let image = new Image();
  image.src = "./sprites/background_1.png";
  c.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function displayPlayers(players) {
  //console.log("drawing", players);
  players.map(player => {
    //drawPlayerHitBox(player);
    drawSpriteOfPlayer(player);
  });
}

function drawPlayerHitBox(player) {
  c.beginPath();
  c.fillStyle = player.color;
  c.fillRect(player.x, player.y, player.width, player.height);
  c.stroke();
  if (player.y + player.height < getFloorHeightOfPlayer()) {
    c.fillStyle = "grey";
    c.fillRect(player.x + player.width / 2 - 2, player.y - 20, 4, 20);
  } else if (player.direction === "left") {
    c.fillStyle = "grey";
    c.fillRect(player.x - 20, player.y, 20, 4);
  } else if (player.direction === "right") {
    c.fillStyle = "grey";
    c.fillRect(player.x + player.width - 2, player.y, 20, 4);
  } else if (player.y + player.height < getFloorHeightOfPlayer()) {
    c.fillStyle = "grey";
    c.fillRect(player.x + player.width / 2 - 2, player.y - 20, 4, 20);
  }
  c.stroke();
  c.closePath();
}

function drawSpriteOfPlayer(player) {
  let playerFloor = getFloorHeightOfPlayer();
  let image = new Image();
  if (player.dx === 0 && player.y + player.height === playerFloor) {
    if (player.direction === "right") {
      image.src = "./sprites/standard_right.png";
    } else {
      image.src = "./sprites/standard_left.png";
    }
  } else if (player.dx != 0 && player.y + player.height === playerFloor) {
    if (player.direction === "right") {
      image.src = "./sprites/run_right.png";
    } else {
      image.src = "./sprites/run_left.png";
    }
  } else {
    if (player.direction === "right") {
      if (player.dy < 0) {
        image.src = "./sprites/jump_right.png";
      } else {
        image.src = "./sprites/glide_right.png";
      }
    } else {
      if (player.dy < 0) {
        image.src = "./sprites/jump_left.png";
      } else {
        image.src = "./sprites/glide_left.png";
      }
    }
  }
  c.drawImage(image, player.x, player.y, player.width, player.height);
}

function displayObjects() {
  objects.map(object => {
    drawSpriteOfObject(object);
    //drawObjectHitBox(object);
  });
}

function drawObjectHitBox(object) {
  c.beginPath();
  c.fillStyle = object.color;
  c.fillRect(object.x, object.y, object.width, object.height);
  c.stroke();
  c.closePath();
}

function drawSpriteOfObject(object) {
  let image = new Image();
  if (object.type === "ground_1") {
    image.src = "./sprites/ground_1.png";
  } else if (object.type === "box_1") {
    image.src = "./sprites/box_1.png";
  } else if (object.type === "finish_1") {
    image.src = "./sprites/finish_1.jpg";
  }
  c.drawImage(image, object.x, object.y, object.width, object.height);
}

function clearCanvas() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}
