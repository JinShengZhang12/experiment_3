let seeds = [];
let pot;
let kettle, thermo;
let startBtn, resetBtn;
let message = "";
let activeSeed = null;
let hoveringCellIndex = -1;
let sprouts = [];
let experimentStarted = false;

function setup() {
  createCanvas(800, 500);
  pot = new Pot(400, 300, 120);
  kettle = new Kettle(150, 320, 80);
  thermo = new Thermo(650, 300, 80);

  for (let i = 0; i < 3; i++) {
    seeds.push(new Seed(100 + i * 80, 100, 20));
  }

  startBtn = createButton("开始实验");
  startBtn.position(350, 450);
  startBtn.mousePressed(startExperiment);

  resetBtn = createButton("重置");
  resetBtn.position(450, 450);
  resetBtn.mousePressed(resetExperiment);
}

function draw() {
  background(240);
  textSize(16);
  fill(0);
  text("请把种子放入花盆中并调整水壶和温度计。", 220, 30);

  kettle.display();
  thermo.display();
  pot.display();

  for (let s of seeds) s.display();
  for (let sprout of sprouts) sprout.display();

  if (experimentStarted) updateGrowth();

  if (message) {
    fill(0);
    textSize(16);
    text(message, 300, 70);
  }
}

function mousePressed() {
  if (!experimentStarted) {
    for (let s of seeds) {
      if (dist(mouseX, mouseY, s.x, s.y) < s.size / 2) {
        activeSeed = s;
      }
    }
  }

  if (dist(mouseX, mouseY, kettle.x, kettle.y) < kettle.size / 2) {
    activeSeed = kettle;
  } else if (dist(mouseX, mouseY, thermo.x, thermo.y) < thermo.size / 2) {
    activeSeed = thermo;
  }
}

function mouseDragged() {
  if (activeSeed) {
    activeSeed.x = mouseX;
    activeSeed.y = mouseY;
  }
}

function mouseReleased() {
  if (activeSeed instanceof Seed && dist(activeSeed.x, activeSeed.y, pot.x, pot.y) < pot.size / 2) {
    pot.addSeed(activeSeed);
  }
  activeSeed = null;
}

function startExperiment() {
  if (pot.seeds.length === 0) {
    message = "请先将种子放入花盆！";
    return;
  }
  experimentStarted = true;
  message = "实验开始，观察种子的生长……";
}

function resetExperiment() {
  experimentStarted = false;
  pot = new Pot(400, 300, 120);
  kettle = new Kettle(150, 320, 80);
  thermo = new Thermo(650, 300, 80);
  sprouts = [];
  message = "";
  for (let i = 0; i < 3; i++) {
    seeds[i].x = 100 + i * 80;
    seeds[i].y = 100;
  }
}

function updateGrowth() {
  let temp = thermo.temperature;
  let water = kettle.waterLevel;

  for (let s of pot.seeds) {
    s.growth += 0.02 * map(temp, 10, 40, 0, 1) * map(water, 0, 100, 0, 1);
    if (s.growth > 1 && !sprouts.includes(s)) {
      sprouts.push(new Sprout(pot.x + random(-30, 30), pot.y - pot.size / 2));
    }
  }
}

// ---- 类定义 ----

class Seed {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.growth = 0;
  }
  display() {
    fill(139, 69, 19);
    ellipse(this.x, this.y, this.size);
  }
}

class Pot {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.seeds = [];
  }
  display() {
    fill(150, 100, 50);
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size / 2, 20);
  }
  addSeed(seed) {
    if (!this.seeds.includes(seed)) this.seeds.push(seed);
  }
}

class Kettle {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.waterLevel = 50;
  }
  display() {
    fill(100, 100, 255);
    ellipse(this.x, this.y, this.size);
    fill(0);
    textSize(12);
    text("水量：" + this.waterLevel, this.x - 25, this.y + 50);
  }
}

class Thermo {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.temperature = 25;
  }
  display() {
    fill(255, 100, 100);
    rectMode(CENTER);
    rect(this.x, this.y, this.size / 3, this.size);
    fill(0);
    textSize(12);
    text("温度：" + this.temperature + "°C", this.x - 30, this.y + 60);
  }
}

class Sprout {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  display() {
    stroke(34, 139, 34);
    strokeWeight(3);
    line(this.x, this.y, this.x, this.y - 20);
    noStroke();
    fill(34, 139, 34);
    ellipse(this.x - 5, this.y - 25, 10, 5);
    ellipse(this.x + 5, this.y - 25, 10, 5);
  }
}

// ============= 兼容触屏操作 =============
function touchStarted() {
  mousePressed();
  return false;
}

function touchMoved() {
  mouseDragged();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}


