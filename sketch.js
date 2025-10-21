let seeds = [];
let pot;
let kettle, thermo;
let startBtn, resetBtn;
let message = "";
let activeSeed = null;
let hoveringCellIndex = -1;
let sprouts = [];
let experimentStarted = false;
let cnv; // 存放 canvas 引用

function setup() {
  // 创建 canvas 并确保 z-index 低（不覆盖按钮）
  cnv = createCanvas(900, 600);
  cnv.position(0, 0);
  cnv.style('z-index', '0');

  // 种子
  seeds = [];
  for (let i = 0; i < 8; i++) {
    let sx = 60 + (i % 2) * 40;
    let sy = 100 + Math.floor(i / 2) * 50;
    seeds.push(new Seed(sx, sy, i));
  }

  // 培养皿
  pot = new Pot(width / 2 - 200, height / 2 - 120, 400, 240);

  // 水壶和温度计（初始位置）
  kettle = new Kettle(740, 140);
  thermo = new Thermometer(740, 250);

  // 顶端按钮（创建一次）
  if (!startBtn) {
    startBtn = createButton("开始");
    startBtn.position(30, 20);
    startBtn.style('position', 'absolute');
    startBtn.style('z-index', '1001');
    startBtn.mousePressed(startExp);
  }
  if (!resetBtn) {
    resetBtn = createButton("复原");
    resetBtn.position(100, 20);
    resetBtn.style('position', 'absolute');
    resetBtn.style('z-index', '1001');
    resetBtn.mousePressed(resetExp);
  }

  // 把按钮尺寸放大为“原来”的两倍（尝试从 DOM 读取当前尺寸）
  // 若无法读到（offsetWidth==0），使用后备尺寸
  setTimeout(() => {
    // 延迟一点点确保 DOM 已渲染，避免读到 0
    try {
      let sw = startBtn.elt.offsetWidth || 80;
      let sh = startBtn.elt.offsetHeight || 28;
      startBtn.size(sw * 2, sh * 2);
    } catch (e) {
      startBtn.size(160, 56);
    }
    try {
      let rw = resetBtn.elt.offsetWidth || 80;
      let rh = resetBtn.elt.offsetHeight || 28;
      resetBtn.size(rw * 2, rh * 2);
    } catch (e) {
      resetBtn.size(160, 56);
    }
  }, 30);

  message = "";
  experimentStarted = false;
  sprouts = [];
}

function draw() {
  background(245);
  fill(20);
  textSize(18);
  text("植物种子生长虚拟实验", 200, 35);
  textSize(12);
  fill(60);
  text(
    "拖动种子到格子；拖动水壶到格子上松手 = 加水；点击格子 = 升温/降温；拖动温度计查看格子温度；点击开始发芽。",
    200,
    55
  );

  pot.show();

  if (hoveringCellIndex >= 0) pot.highlightCell(hoveringCellIndex);

  kettle.update();
  kettle.show();

  for (let s of seeds) {
    s.update();
    s.show();
  }

  if (experimentStarted) {
    for (let sp of sprouts) {
      sp.grow();
      sp.show();
    }
  }

  thermo.update();
  thermo.show();

  fill(180, 30, 30);
  textSize(16);
  text(message, 30, height - 20);
}

/* ==================== 类定义 ==================== */
class Seed {
  constructor(x, y, id) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.r = 12;
    this.dragging = false;
    this.offX = 0;
    this.offY = 0;
    this.id = id;
    this.inCell = -1;
  }
  update() {
    if (this.dragging) {
      this.x = mouseX + this.offX;
      this.y = mouseY + this.offY;
    }
  }
  show() {
    push();
    noStroke();
    fill(150, 105, 60);
    ellipse(this.x, this.y, this.r * 2, this.r * 1.6);
    fill(230, 210, 150);
    ellipse(this.x - 3, this.y - 2, this.r * 0.6, this.r * 0.5);
    pop();
  }
  pressed(mx, my) {
    const d = dist(mx, my, this.x, this.y);
    if (d < this.r + 3) {
      this.dragging = true;
      this.offX = this.x - mx;
      this.offY = this.y - my;
      return true;
    }
    return false;
  }
  released() {
    if (!this.dragging) return;
    this.dragging = false;
    const idx = pot.cellIndexAt(this.x, this.y);
    if (idx >= 0) {
      if (pot.cells[idx].seedId == null || pot.cells[idx].seedId === this.id) {
        if (this.inCell >= 0 && this.inCell !== idx)
          pot.cells[this.inCell].seedId = null;
        pot.cells[idx].seedId = this.id;
        this.inCell = idx;
        this.x = pot.cells[idx].cx;
        this.y = pot.cells[idx].cy;
      } else {
        this.goHome();
      }
    } else {
      if (this.inCell >= 0) pot.cells[this.inCell].seedId = null;
      this.inCell = -1;
      this.goHome();
    }
  }
  goHome() {
    this.x = this.homeX;
    this.y = this.homeY;
  }
}

class Pot {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cells = [];
    const cols = 4,
      rows = 2;
    const cw = w / cols,
      ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = x + c * cw;
        const cy = y + r * ch;
        this.cells.push({
          x: cx,
          y: cy,
          w: cw,
          h: ch,
          cx: cx + cw / 2,
          cy: cy + ch / 2,
          water: false,
          heat: false,
          seedId: null,
        });
      }
    }
  }
  show() {
    push();
    noStroke();
    fill(230);
    rect(this.x - 8, this.y + this.h, this.w + 16, 18, 6);
    fill(255);
    stroke(60);
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h, 10);
    for (let c of this.cells) {
      noStroke();
      if (c.water && c.heat) {
        fill(80, 140, 255, 170);
        rect(c.x, c.y, c.w, c.h / 2);
        fill(255, 150, 60, 170);
        rect(c.x, c.y + c.h / 2, c.w, c.h / 2);
      } else if (c.water) {
        fill(80, 140, 255, 150);
        rect(c.x, c.y, c.w, c.h);
      } else if (c.heat) {
        fill(255, 150, 60, 150);
        rect(c.x, c.y, c.w, c.h);
      }
      noFill();
      stroke(100);
      rect(c.x, c.y, c.w, c.h);
    }
    fill(0);
    textSize(16);
    textAlign(CENTER);
    text("培养皿", this.x + this.w / 2, this.y + this.h + 35);
    pop();
  }
  highlightCell(idx) {
    const c = this.cells[idx];
    push();
    noFill();
    stroke(30, 180, 255);
    strokeWeight(3);
    rect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, 6);
    pop();
  }
  cellIndexAt(px, py) {
    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h)
        return i;
    }
    return -1;
  }
  toggleHeat(mx, my) {
    const idx = this.cellIndexAt(mx, my);
    if (idx >= 0) {
      this.cells[idx].heat = !this.cells[idx].heat;
    }
  }
  addWaterTo(idx) {
    if (idx >= 0) this.cells[idx].water = true;
  }
}

class Kettle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 70;
    this.h = 80;
    this.dragging = false;
    this.offX = 0;
    this.offY = 0;
  }
  spoutPos() {
    return { sx: this.x + this.w * 0.9, sy: this.y + this.h * 0.35 };
  }
  show() {
    push();
    fill(0, 100, 255, 200);
    stroke(50);
    strokeWeight(2);
    rect(this.x + this.w * 0.2, this.y + this.h * 0.2, this.w * 0.6, this.h * 0.65, 12);
    fill(0, 80, 200);
    rect(this.x + this.w * 0.28, this.y + this.h * 0.1, this.w * 0.44, this.h * 0.12, 8);
    ellipse(this.x + this.w * 0.5, this.y + this.h * 0.1, 10, 8);
    noFill();
    stroke(50);
    strokeWeight(6);
    arc(this.x + this.w * 0.2, this.y + this.h * 0.5, this.w * 0.7, this.h * 0.9, PI * 0.6, PI * 1.9);
    fill(0, 100, 255);
    beginShape();
    vertex(this.x + this.w * 0.78, this.y + this.h * 0.28);
    vertex(this.x + this.w * 0.95, this.y + this.h * 0.34);
    vertex(this.x + this.w * 0.95, this.y + this.h * 0.42);
    vertex(this.x + this.w * 0.78, this.y + this.h * 0.48);
    endShape(CLOSE);
    pop();
  }
  update() {
    if (this.dragging) {
      this.x = mouseX + this.offX;
      this.y = mouseY + this.offY;
      const { sx, sy } = this.spoutPos();
      hoveringCellIndex = pot.cellIndexAt(sx, sy);
    } else hoveringCellIndex = -1;
  }
  pressed(mx, my) {
    const inBody = mx > this.x + this.w * 0.2 && mx < this.x + this.w * 0.8 && my > this.y + this.h * 0.2 && my < this.y + this.h * 0.85;
    const inSpout = mx > this.x + this.w * 0.75 && mx < this.x + this.w && my > this.y + this.h * 0.25 && my < this.y + this.h * 0.5;
    if (inBody || inSpout) {
      this.dragging = true;
      this.offX = this.x - mx;
      this.offY = this.y - my;
      return true;
    }
    return false;
  }
  released() {
    if (!this.dragging) return;
    this.dragging = false;
    if (hoveringCellIndex >= 0) pot.addWaterTo(hoveringCellIndex);
  }
}

class Thermometer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 150;
    this.dragging = false;
    this.offX = 0;
    this.offY = 0;
  }
  update() {
    if (this.dragging) {
      this.x = mouseX + this.offX;
      this.y = mouseY + this.offY;
    }
  }
  pressed(mx, my) {
    if (mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h) {
      this.dragging = true;
      this.offX = this.x - mx;
      this.offY = this.y - my;
      return true;
    }
    return false;
  }
  released() {
    this.dragging = false;
  }
  show() {
    push();
    stroke(100);
    fill(220);
    rect(this.x, this.y, this.w, this.h, 6);
    stroke(0);
    for (let i = 0; i <= 5; i++) {
      let y0 = this.y + i * (this.h / 5);
      line(this.x, y0, this.x + this.w, y0);
    }
    let temp = 5;
    for (let c of pot.cells) {
      if (this.x + this.w / 2 >= c.x && this.x + this.w / 2 <= c.x + c.w && this.y + this.h >= c.y && this.y + this.h <= c.y + c.h) {
        temp = c.heat ? 25 : 5;
      }
    }
    const fillH = map(temp, 0, 30, 0, this.h);
    fill(255, 50, 50);
    noStroke();
    rect(this.x, this.y + this.h - fillH, this.w, fillH);
    fill(255, 0, 0);
    stroke(0);
    ellipse(this.x + this.w / 2, this.y + this.h + 10, 20, 20);
    fill(0);
    textSize(12);
    text(`${temp}℃`, this.x + this.w + 10, this.y + this.h - 10);
    pop();
  }
}

class Sprout {
  constructor(seed, cell) {
    this.x = cell.cx;
    this.y = cell.cy - 12;
    this.height = 0;
    this.maxHeight = 50;
    this.speed = this.computeSpeed(cell);
    this.angle = random(-0.1, 0.1);
  }
  computeSpeed(cell) {
    if (!cell.water && !cell.heat) return 0;
    if (cell.water && cell.heat) return 5;
    return 1;
  }
  grow() {
    if (this.height < this.maxHeight) this.height += this.speed * 0.2;
    this.angle = 0.05 * sin(frameCount * 0.1);
  }
  show() {
    if (this.speed === 0) return;
    push();
    stroke(50, 180, 50);
    strokeWeight(3);
    translate(this.x, this.y);
    rotate(this.angle);
    line(0, 0, 0, -this.height);
    line(0, -this.height * 0.5, -5, -this.height * 0.7);
    line(0, -this.height * 0.5, 5, -this.height * 0.7);
    pop();
  }
}

/* ==================== 事件 ==================== */
function mousePressed() {
  handlePress(mouseX, mouseY);
}
function mouseReleased() {
  handleRelease();
}

/* ---- 触屏兼容 ---- */
function touchStarted() {
  if (touches && touches.length > 0) {
    handlePress(touches[0].x, touches[0].y);
  }
  // 不要 return false —— 以免阻止按钮的点击事件在某些浏览器被吞掉
  return true;
}
function touchEnded() {
  handleRelease();
  return true;
}

function handlePress(mx, my) {
  // 若点击位置恰好在按钮 DOM 上，直接返回（避免 canvas 拦截）
  // 使用 document.elementFromPoint 判断（页面坐标，mx,my 即为 canvas 内坐标，canvas 在页面左上角）
  try {
    const el = document.elementFromPoint(mx, my);
    if (el === startBtn.elt || el === resetBtn.elt || startBtn.elt.contains(el) || resetBtn.elt.contains(el)) {
      return;
    }
  } catch (e) {
    // ignore
  }

  if (thermo.pressed(mx, my)) return;
  if (kettle.pressed(mx, my)) return;
  for (let i = seeds.length - 1; i >= 0; i--) {
    if (seeds[i].pressed(mx, my)) {
      activeSeed = seeds[i];
      const s = seeds.splice(i, 1)[0];
      seeds.push(s);
      activeSeed = s;
      return;
    }
  }
  pot.toggleHeat(mx, my);
}

function handleRelease() {
  if (activeSeed) {
    activeSeed.released();
    activeSeed = null;
  }
  kettle.released();
  thermo.released();
}

// “开始” 按钮逻辑不变
function startExp() {
  const allHasSeed = pot.cells.every((c) => c.seedId !== null);
  if (!allHasSeed) {
    message = "❌ 操作错误：所有格子必须各有一粒种子！";
    return;
  }
  message = "✅ 实验开始！";
  sprouts = [];
  for (let c of pot.cells) {
    if (c.seedId !== null) sprouts.push(new Sprout(seeds[c.seedId], c));
  }
  experimentStarted = true;
}

// 改写后的重置函数：只重置状态，不重复创建 canvas 与按钮
function resetExp() {
  // 重置培养皿格子状态
  for (let c of pot.cells) {
    c.water = false;
    c.heat = false;
    c.seedId = null;
  }
  // 重置种子位置与 inCell
  for (let s of seeds) {
    s.inCell = -1;
    s.goHome();
    s.dragging = false;
  }
  // 重置水壶和温度计回到初始位置
  kettle.x = 740;
  kettle.y = 140;
  kettle.dragging = false;
  thermo.x = 740;
  thermo.y = 250;
  thermo.dragging = false;

  // 重置实验状态与消息
  sprouts = [];
  experimentStarted = false;
  message = "";
}



