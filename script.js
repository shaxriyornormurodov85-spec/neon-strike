const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

let score = 0;
let lives = 3;
let lastTime = 0;
let spawnTimer = 0;
let gameOver = false;

const keys = {};

const player = {
  width: 42,
  height: 30,
  x: canvas.width / 2 - 21,
  y: canvas.height - 50,
  speed: 6,
};

const bullets = [];
const enemies = [];

function resetGame() {
  score = 0;
  lives = 3;
  bullets.length = 0;
  enemies.length = 0;
  player.x = canvas.width / 2 - player.width / 2;
  gameOver = false;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y - 12,
    width: 4,
    height: 12,
    speed: 8,
  });
}

function spawnEnemy() {
  const size = 18 + Math.random() * 18;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 1.2 + Math.random() * 2.2,
  });
}

function update(dt) {
  if (gameOver) return;

  if (keys["ArrowLeft"] || keys["a"]) {
    player.x -= player.speed;
  }

  if (keys["ArrowRight"] || keys["d"]) {
    player.x += player.speed;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed * dt * 0.06;
    if (bullets[i].y + bullets[i].height < 0) {
      bullets.splice(i, 1);
    }
  }

  spawnTimer += dt;
  if (spawnTimer > 700) {
    spawnEnemy();
    spawnTimer = 0;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed * dt * 0.06;

    if (enemies[i].y + enemies[i].height > canvas.height) {
      enemies.splice(i, 1);
      lives -= 1;
      livesEl.textContent = lives;
      if (lives <= 0) {
        gameOver = true;
        alert("Game Over! Press OK to restart.");
        resetGame();
      }
      continue;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      const enemy = enemies[i];

      const overlap =
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y;

      if (overlap) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        scoreEl.textContent = score;
        break;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0a162f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1ee8ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#ff4db8";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  ctx.fillStyle = "#ffd166";
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  }
}

function frame(timestamp) {
  const dt = timestamp - lastTime || 16;
  lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(frame);
}

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;

  if (event.code === "Space") {
    shoot();
  }
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

resetGame();
requestAnimationFrame(frame);
