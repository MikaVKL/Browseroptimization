// Fang-Spiel: Fallende Punkte mit dem Korb einfangen. Pfeiltasten oder Klick/Tippen.
const W = 100, H = 150;
const canvas = document.createElement("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
document.body.style.cssText = "margin:0;background:#112";
document.body.append(canvas);
canvas.style.cssText = "image-rendering:pixelated;display:block;margin:auto;width:min(100vw,calc(100vh*100/150));height:auto";

let basket = 50, drops = [], score = 0, lives = 3, over = false, t = 0;
let keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);
const setX = e => {
  const r = canvas.getBoundingClientRect();
  basket = Math.max(0, Math.min(W - 16, (e.clientX - r.left) / r.width * W - 8));
};
canvas.addEventListener("pointermove", setX);
canvas.addEventListener("pointerdown", e => over ? location.reload() : setX(e));

function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); }
function text(s, x, y, c) { ctx.fillStyle = c; ctx.font = "7px monospace"; ctx.fillText(s, x, y); }

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  t += dt;
  if (!over) {
    if (keys.ArrowLeft) basket -= 80 * dt;
    if (keys.ArrowRight) basket += 80 * dt;
    basket = Math.max(0, Math.min(W - 16, basket));
    if (Math.random() < dt * (1 + score / 15)) drops.push({ x: Math.random() * (W - 4), y: -4, v: 30 + score * 2 + Math.random() * 20 });
    for (const d of drops) d.y += d.v * dt;
    drops = drops.filter(d => {
      if (d.y > H - 16 && d.y < H - 8 && d.x + 4 > basket && d.x < basket + 16) { score++; return false; }
      if (d.y >= H) { lives--; if (lives <= 0) over = true; return false; }
      return true;
    });
  }
  rect(0, 0, W, H, "#112");
  for (const d of drops) rect(d.x, d.y, 4, 4, "#fd3");
  rect(basket, H - 8, 16, 4, "#4cf");
  text("Punkte " + score, 2, 8, "#fff");
  text("Leben " + lives, 2, 16, "#f66");
  if (over) { rect(0, 60, W, 30, "#000c"); text("Game over", 30, 74, "#fff"); text("Tippen = neu", 22, 84, "#aaa"); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
