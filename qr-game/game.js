// Tetris: Pfeiltasten oder Tippen. Links/rechts tippen = bewegen, Mitte = drehen, unten = fallen lassen.
const W = 100, H = 150, C = 6, COLS = 10, ROWS = 20, OX = 2, OY = 2;
const canvas = document.createElement("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
document.body.style.cssText = "margin:0;background:#112";
document.body.append(canvas);
canvas.style.cssText = "image-rendering:pixelated;display:block;margin:auto;width:min(100vw,calc(100vh*100/150));height:auto";

// 7 Figuren als 4x4-Raster (1 = Block), zeilenweise von oben links
const SHAPES = [
  "0000111100000000", // I
  "1100110000000000", // O
  "0100111000000000", // T
  "0110110000000000", // S
  "1100011000000000", // Z
  "1000111000000000", // J
  "0010111000000000", // L
];
const COLORS = ["#0ff", "#ff0", "#a0f", "#0f0", "#f00", "#44f", "#f80"];

let board = new Array(COLS * ROWS).fill(0);
let cur, px, py, score = 0, lines = 0, over = false, acc = 0;
let last = performance.now();

function rotate(b) {
  const n = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) n[y * 4 + x] = b[(3 - x) * 4 + y];
  return n;
}
function fits(b, x0, y0) {
  for (let i = 0; i < 16; i++) {
    if (!b[i]) continue;
    const x = x0 + (i % 4), y = y0 + ((i / 4) | 0);
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y >= 0 && board[y * COLS + x]) return false;
  }
  return true;
}
function spawn() {
  const k = Math.floor(Math.random() * 7);
  cur = { b: SHAPES[k].split("").map(Number), c: k + 1 };
  px = 3; py = -1;
  if (!fits(cur.b, px, py)) over = true;
}
function lock() {
  for (let i = 0; i < 16; i++)
    if (cur.b[i]) {
      const x = px + (i % 4), y = py + ((i / 4) | 0);
      if (y >= 0) board[y * COLS + x] = cur.c;
    }
  let n = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board.slice(y * COLS, y * COLS + COLS).every(v => v)) {
      board.splice(y * COLS, COLS);
      board.unshift(...new Array(COLS).fill(0));
      n++; y++;
    }
  }
  lines += n;
  score += n * n * 10;
  spawn();
}
function step(dx, dy) {
  if (fits(cur.b, px + dx, py + dy)) { px += dx; py += dy; return true; }
  if (dy) lock();
  return false;
}
function turn() {
  const r = rotate(cur.b);
  for (const k of [0, -1, 1]) if (fits(r, px + k, py)) { cur.b = r; px += k; return; }
}
function drop() { while (step(0, 1)); }

function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); }
function text(s, x, y, c = "#fff") { ctx.fillStyle = c; ctx.font = "6px monospace"; ctx.fillText(s, x, y); }

const keys = {};
addEventListener("keydown", e => {
  if (e.key === " ") drop();
  if (e.key === "ArrowLeft") step(-1, 0);
  if (e.key === "ArrowRight") step(1, 0);
  if (e.key === "ArrowDown") step(0, 1);
  if (e.key === "ArrowUp") turn();
});
canvas.addEventListener("pointerdown", e => {
  if (over) return location.reload();
  const r = canvas.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  if (fy > 0.8) drop();
  else if (fx < 0.3) step(-1, 0);
  else if (fx > 0.7) step(1, 0);
  else turn();
});

spawn();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const level = Math.floor(lines / 10);
  if (!over) {
    acc += dt;
    if (acc > Math.max(0.08, 0.6 - level * 0.05)) { acc = 0; step(0, 1); }
  }
  rect(0, 0, W, H, "#112");
  rect(OX - 1, OY - 1, COLS * C + 2, ROWS * C + 2, "#223");
  for (let i = 0; i < COLS * ROWS; i++)
    if (board[i]) rect(OX + (i % COLS) * C, OY + ((i / COLS) | 0) * C, C - 1, C - 1, COLORS[board[i] - 1]);
  if (!over)
    for (let i = 0; i < 16; i++)
      if (cur.b[i]) {
        const x = px + (i % 4), y = py + ((i / 4) | 0);
        if (y >= 0) rect(OX + x * C, OY + y * C, C - 1, C - 1, COLORS[cur.c - 1]);
      }
  text("Punkte", 64, 10);
  text(String(score), 64, 18, "#ff0");
  text("Zeilen", 64, 30);
  text(String(lines), 64, 38, "#0ff");
  text("Level", 64, 50);
  text(String(level), 64, 58, "#f80");
  if (over) {
    rect(0, 55, W, 30, "#000d");
    text("Game over", 26, 68, "#fff");
    text("Tippen = neu", 20, 78, "#aaa");
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
