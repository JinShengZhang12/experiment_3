let waterCells = [];
let plants = [];
let tempCells = [];
let dragging = null;
let offsetX, offsetY;

function setup() {
  createCanvas(800, 600);
  noStroke();

  // 定义格子
  for (let i = 0; i < 4; i++) {
    waterCells.push({x: 150 * i + 100, y: 300, water: false, heat: false});
  }

  // 定义植物
  for (let i = 0; i < 4; i++) {
    plants.push({x: 150 * i + 100, y: 350, h: 20, speed: 0});
  }

  // 定义水壶和温度计
  tempCells.push({x: 100, y: 500, type: 'water'});
  tempCells.push({x: 200, y: 500, type: 'heat'});
}

function draw() {
  background(220);
  textSize(16);
  fill(0);
  text("拖动水壶或温度计到不同格子", 10, 20);

  // 画格子
  for (let i = 0; i < waterCells.length; i++) {
    let cell = waterCells[i];
    fill(cell.water ? "blue" : cell.heat ? "red" : "white");
    rect(cell.x, cell.y, 80, 80);
  }

  // 画植物
  for (let i = 0; i < plants.length; i++) {
    let p = plants[i];
    fill("green");
    rect(p.x + 35, p.y - p.h, 10, p.h);
    p.h += p.speed * 0.05;
  }

  // 画水壶和温度计
  for (let item of tempCells) {
    fill(item.type === "water" ? "blue" : "red");
    ellipse(item.x, item.y, 50);
  }
}

function computeSpeed(cell) {
  if (!cell.water && !cell.heat) return 0;
  if (cell.water && cell.heat) return 5;
  if (cell.water && !cell.heat) return 2;
  if (!cell.water && cell.heat) return 0.5;
}

function updateSpeeds() {
  for (let i = 0; i < plants.length; i++) {
    plants[i].speed = computeSpeed(waterCells[i]);
  }
}

function startDrag(x, y) {
  for (let item of tempCells) {
    if (dist(x, y, item.x, item.y) < 25) {
      dragging = item;
      offsetX = item.x - x;
      offsetY = item.y - y;
    }
  }
}

function doDrag(x, y) {
  if (dragging) {
    dragging.x = x + offsetX;
    dragging.y = y + offsetY;
  }
}

function endDrag(x, y) {
  if (dragging) {
    for (let cell of waterCells) {
      if (x > cell.x && x < cell.x + 80 && y > cell.y && y < cell.y + 80) {
        if (dragging.type === 'water') cell.water = true;
        if (dragging.type === 'heat') cell.heat = true;
      }
    }
    updateSpeeds();
    dragging = null;
  }
}

// ==== 鼠标事件 ====
function mousePressed() {
  startDrag(mouseX, mouseY);
}

function mouseDragged() {
  doDrag(mouseX, mouseY);
}

function mouseReleased() {
  endDrag(mouseX, mouseY);
}

// ==== 触摸事件（平板兼容）====
function touchStarted() {
  startDrag(touches[0].x, touches[0].y);
  return false;
}

function touchMoved() {
  doDrag(touches[0].x, touches[0].y);
  return false;
}

function touchEnded() {
  if (touches.length === 0) {
    endDrag(mouseX, mouseY);
  } else {
    endDrag(touches[0].x, touches[0].y);
  }
  return false;
}
