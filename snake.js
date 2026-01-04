const startScreen = document.getElementById("startScreen");
const setupScreen = document.getElementById("setupScreen");
const startBtn = document.getElementById("startBtn");
const startGameBtn = document.getElementById("startGameBtn");
const backBtn = document.getElementById("backBtn");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreboard = document.getElementById("scoreboard");
const menuBtn = document.getElementById("menuBtn");
const pauseMenu = document.getElementById("pauseMenu");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");
const exitConfirm = document.getElementById("exitConfirm");
const exitYes = document.getElementById("exitYes");
const exitNo = document.getElementById("exitNo");
const bgMusic = document.getElementById("bgMusic");

const playerCountInput = document.getElementById("playerCount");
const playerNamesDiv = document.getElementById("playerNames");

// ================= GAME VAR =================
const box = 15;
const GAME_SPEED = 120; // Slow down dari 80 ke 120 (semakin besar semakin slow)

let players = [];
let currentPlayerIndex = 0;
let snake = [];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let food = {};
let powerUp = {}; // Tambah variable untuk power-up
let hasPowerUp = false; // Flag untuk menunjukkan jika power-up sedang aktif
let score = 0;
let gameInterval = null;
let isPaused = false;
let lives = 3; // Add lives, starting with 3
let speedMultiplier = 1; // Tambah multiplier untuk speed (untuk slow down)

// Tambah elemen untuk soalan
const questionScreen = document.createElement("div");
questionScreen.id = "questionScreen";
questionScreen.style.position = "absolute";
questionScreen.style.top = "50%";
questionScreen.style.left = "50%";
questionScreen.style.transform = "translate(-50%, -50%)";
questionScreen.style.color = "#fff";
questionScreen.style.textAlign = "center";
questionScreen.style.fontSize = "1.3rem";
questionScreen.style.background = "rgba(0, 0, 0, 0.95)";
questionScreen.style.padding = "30px";
questionScreen.style.borderRadius = "15px";
questionScreen.style.boxShadow = "0 0 30px rgba(0, 255, 255, 0.8)";
questionScreen.style.display = "none";
questionScreen.style.maxWidth = "600px";
questionScreen.style.minWidth = "400px";
questionScreen.style.zIndex = "1000";
document.body.appendChild(questionScreen);

// Tambah elemen untuk countdown
const countdownScreen = document.createElement("div");
countdownScreen.id = "countdownScreen";
countdownScreen.style.position = "absolute";
countdownScreen.style.top = "50%";
countdownScreen.style.left = "50%";
countdownScreen.style.transform = "translate(-50%, -50%)";
countdownScreen.style.color = "#fff";
countdownScreen.style.textAlign = "center";
countdownScreen.style.fontSize = "5rem";
countdownScreen.style.fontWeight = "bold";
countdownScreen.style.background = "rgba(0, 0, 0, 0.9)";
countdownScreen.style.padding = "50px";
countdownScreen.style.borderRadius = "10px";
countdownScreen.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.8)";
countdownScreen.style.display = "none";
document.body.appendChild(countdownScreen);

// ================= PLAYER TURN NOTIFICATION =================
const playerTurnPopup = document.createElement("div");
playerTurnPopup.id = "playerTurnPopup";
playerTurnPopup.style.position = "absolute";
playerTurnPopup.style.top = "50%";
playerTurnPopup.style.left = "50%";
playerTurnPopup.style.transform = "translate(-50%, -50%)";
playerTurnPopup.style.background = "rgba(0, 0, 0, 0.95)";
playerTurnPopup.style.color = "#fff";
playerTurnPopup.style.padding = "40px 60px";
playerTurnPopup.style.borderRadius = "15px";
playerTurnPopup.style.textAlign = "center";
playerTurnPopup.style.fontSize = "2rem";
playerTurnPopup.style.fontWeight = "bold";
playerTurnPopup.style.boxShadow = "0 0 30px cyan";
playerTurnPopup.style.display = "none";
playerTurnPopup.style.zIndex = "1000";
document.body.appendChild(playerTurnPopup);

// ================= LIFE NOTIFICATION =================
const lifePopup = document.createElement("div");
lifePopup.id = "lifePopup";
lifePopup.style.position = "absolute";
lifePopup.style.top = "50%";
lifePopup.style.left = "50%";
lifePopup.style.transform = "translate(-50%, -50%)";
lifePopup.style.background = "rgba(0,0,0,0.9)";
lifePopup.style.color = "#fff";
lifePopup.style.padding = "25px";
lifePopup.style.borderRadius = "10px";
lifePopup.style.textAlign = "center";
lifePopup.style.fontSize = "1.5rem";
lifePopup.style.boxShadow = "0 0 20px cyan";
lifePopup.style.display = "none";
document.body.appendChild(lifePopup);

// ================= CANVAS =================
function resizeCanvas() {
  // Kurangkan sikit supaya tidak terlalu besar, 90% viewport
  canvas.width = window.innerWidth * 0.7;
  canvas.height = window.innerHeight * 0.7;
  // Center the canvas
  canvas.style.display = "block";
  canvas.style.margin = "0 auto";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ================= HELPERS =================
function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function showLifePopup(callback) {
  lifePopup.innerHTML = `
    <p>Nyawa tinggal: ${lives}</p>
    <button id="lifeOkBtn">OK</button>
  `;
  lifePopup.style.display = "block";

  document.getElementById("lifeOkBtn").onclick = () => {
    lifePopup.style.display = "none";
    startCountdown(callback);
  };
}

// Fungsi baru untuk spawn item (makanan atau power-up)
function spawnItem() {
  const isPowerUp = Math.random() < 0.4; // 40% peluang spawn power-up (naik dari 20%)
  const item = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
    isPowerUp: isPowerUp,
  };
  return item;
}

function collision(head, body) {
  return body.some((s) => s.x === head.x && s.y === head.y);
}

function generatePlayerInputs(count) {
  playerNamesDiv.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.placeholder = `Player ${i} Name`;
    input.id = `player${i}`;
    input.type = "text";
    playerNamesDiv.appendChild(input);
  }
}

// Fungsi untuk generate soalan linear algebra mudah
function generateQuestion() {
  const questions = [
    {
      question: "Cari determinant matriks:<br><br>⎡ 1  2 ⎤<br>⎣ 3  4 ⎦",
      answer: -2,
    },
    {
      question: "Cari determinant matriks:<br><br>⎡ 2  1 ⎤<br>⎣ 4  3 ⎦",
      answer: 2,
    },
    {
      question: "Cari determinant matriks:<br><br>⎡ 5  3 ⎤<br>⎣ 2  1 ⎦",
      answer: -1,
    },
    {
      question: "Cari determinant matriks:<br><br>⎡ 3  1 ⎤<br>⎣ 6  2 ⎦",
      answer: 0,
    },
    {
      question: "Cari determinant matriks:<br><br>⎡ 6  2 ⎤<br>⎣ 3  1 ⎦",
      answer: 0,
    },
    {
      question: "Cari determinant matriks:<br><br>⎡ 1  3 ⎤<br>⎣ 2  6 ⎦",
      answer: 0,
    },
    {
      question:
        "Cari trace (jumlah diagonal utama):<br><br>⎡ 2  3 ⎤<br>⎣ 4  5 ⎦",
      answer: 7,
    },
    {
      question:
        "Cari trace (jumlah diagonal utama):<br><br>⎡ 1  2 ⎤<br>⎣ 3  4 ⎦",
      answer: 5,
    },
    {
      question: "Cari trace:<br><br>⎡ 3  5 ⎤<br>⎣ 7  2 ⎦",
      answer: 5,
    },
    {
      question: "Cari trace:<br><br>⎡ 4  1 ⎤<br>⎣ 2  3 ⎦",
      answer: 7,
    },
    {
      question:
        "Jika A = <br><br>⎡ 2  1 ⎤<br>⎣ 0  3 ⎦<br><br>Berapakah elemen a₂₁?",
      answer: 0,
    },
    {
      question:
        "Jika A = <br><br>⎡ 1  4 ⎤<br>⎣ 2  3 ⎦<br><br>Berapakah elemen a₁₂?",
      answer: 4,
    },
    {
      question:
        "Jika A = <br><br>⎡ 5  2 ⎤<br>⎣ 3  1 ⎦<br><br>Berapakah elemen a₁₁?",
      answer: 5,
    },
    {
      question:
        "Jika A = <br><br>⎡ 3  6 ⎤<br>⎣ 1  2 ⎦<br><br>Berapakah elemen a₂₂?",
      answer: 2,
    },
    {
      question:
        "Tambah matriks:<br><br>⎡ 1  2 ⎤   ⎡ 2  1 ⎤<br>⎣ 3  4 ⎦ + ⎣ 1  2 ⎦<br><br>Hasil elemen posisi (1,1)?",
      answer: 3,
    },
    {
      question:
        "Tambah matriks:<br><br>⎡ 5  3 ⎤   ⎡ 1  2 ⎤<br>⎣ 2  4 ⎦ + ⎣ 3  1 ⎦<br><br>Hasil elemen posisi (2,2)?",
      answer: 5,
    },
    {
      question:
        "Tolak matriks:<br><br>⎡ 5  3 ⎤   ⎡ 2  1 ⎤<br>⎣ 2  4 ⎦ - ⎣ 1  2 ⎦<br><br>Hasil elemen posisi (1,1)?",
      answer: 3,
    },
    {
      question:
        "Tolak matriks:<br><br>⎡ 7  5 ⎤   ⎡ 3  2 ⎤<br>⎣ 4  6 ⎦ - ⎣ 1  3 ⎦<br><br>Hasil elemen posisi (2,2)?",
      answer: 3,
    },
    {
      question:
        "Darab skalar:<br><br>2 × ⎡ 1  2 ⎤<br>    ⎣ 3  4 ⎦<br><br>Hasil elemen posisi (2,1)?",
      answer: 6,
    },
    {
      question:
        "Darab skalar:<br><br>3 × ⎡ 2  1 ⎤<br>    ⎣ 0  2 ⎦<br><br>Hasil elemen posisi (1,2)?",
      answer: 3,
    },
    {
      question:
        "Darab skalar:<br><br>2 × ⎡ 3  1 ⎤<br>    ⎣ 2  4 ⎦<br><br>Hasil elemen posisi (1,1)?",
      answer: 6,
    },
    {
      question:
        "Darab skalar:<br><br>4 × ⎡ 1  2 ⎤<br>    ⎣ 3  1 ⎦<br><br>Hasil elemen posisi (2,2)?",
      answer: 4,
    },
    {
      question: "Matriks identiti 2×2 mempunyai determinant = ?",
      answer: 1,
    },
    {
      question: "Matriks sifar 2×2 mempunyai trace = ?",
      answer: 0,
    },
    {
      question: "Berapa dimensi matriks 2×2?",
      answer: 4,
    },
    // ========== 15 SOALAN EIGENVALUE (MUDAH) ==========
    {
      question:
        "Cari eigenvalue untuk matriks diagonal:<br><br>⎡ 3  0 ⎤<br>⎣ 0  5 ⎦<br><br>Eigenvalue terbesar?",
      answer: 5,
    },
    {
      question:
        "Cari eigenvalue untuk matriks diagonal:<br><br>⎡ 2  0 ⎤<br>⎣ 0  7 ⎦<br><br>Eigenvalue terkecil?",
      answer: 2,
    },
    {
      question:
        "Cari eigenvalue untuk matriks diagonal:<br><br>⎡ 4  0 ⎤<br>⎣ 0  4 ⎦<br><br>Eigenvalue (sama)?",
      answer: 4,
    },
    {
      question:
        "Untuk matriks:<br><br>⎡ 2  0 ⎤<br>⎣ 0  3 ⎦<br><br>Jumlah eigenvalue = trace. Berapakah?",
      answer: 5,
    },
    {
      question:
        "Untuk matriks:<br><br>⎡ 1  0 ⎤<br>⎣ 0  6 ⎦<br><br>Hasil darab eigenvalue = determinant. Berapakah?",
      answer: 6,
    },
    {
      question:
        "Matriks identiti:<br><br>⎡ 1  0 ⎤<br>⎣ 0  1 ⎦<br><br>Kedua-dua eigenvalue adalah?",
      answer: 1,
    },
    {
      question:
        "Untuk matriks segitiga atas:<br><br>⎡ 5  2 ⎤<br>⎣ 0  3 ⎦<br><br>Eigenvalue terbesar (dari diagonal)?",
      answer: 5,
    },
    {
      question:
        "Untuk matriks segitiga atas:<br><br>⎡ 4  1 ⎤<br>⎣ 0  2 ⎦<br><br>Eigenvalue terkecil (dari diagonal)?",
      answer: 2,
    },
    {
      question: "Jika λ = 3 adalah eigenvalue, maka det(A - 3I) = ?",
      answer: 0,
    },
    {
      question:
        "Untuk matriks:<br><br>⎡ 0  0 ⎤<br>⎣ 0  0 ⎦<br><br>Semua eigenvalue adalah?",
      answer: 0,
    },
    {
      question:
        "Matriks:<br><br>⎡ 2  1 ⎤<br>⎣ 0  2 ⎦<br><br>mempunyai eigenvalue berulang. Berapakah?",
      answer: 2,
    },
    {
      question:
        "Untuk matriks diagonal:<br><br>⎡ -1  0 ⎤<br>⎣  0  3 ⎦<br><br>Eigenvalue positif adalah?",
      answer: 3,
    },
    {
      question:
        "Jika trace = 8 dan determinant = 15,<br>eigenvalue terkecil untuk matriks 2×2 adalah?<br>(Hint: λ₁ + λ₂ = 8, λ₁×λ₂ = 15, cuba 3 dan 5)",
      answer: 3,
    },
    {
      question:
        "Untuk matriks:<br><br>⎡ 6  0 ⎤<br>⎣ 0  1 ⎦<br><br>Jumlah kedua-dua eigenvalue?",
      answer: 7,
    },
    {
      question:
        "Matriks skalar:<br><br>⎡ 5  0 ⎤<br>⎣ 0  5 ⎦<br><br>Kedua eigenvalue adalah sama = ?",
      answer: 5,
    },
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

// Fungsi untuk show player turn notification
function showPlayerTurnNotification(playerIndex, callback) {
  const playerName = players[playerIndex].name;
  playerTurnPopup.innerHTML = `
    <p style="margin: 0; color: cyan;">Next Turn</p>
    <p style="margin: 10px 0; font-size: 2.5rem;">${playerName}</p>
    <p style="margin: 0; font-size: 1.2rem; color: #aaa;">Get Ready!</p>
  `;
  playerTurnPopup.style.display = "block";

  setTimeout(() => {
    playerTurnPopup.style.display = "none";
    callback();
  }, 2000);
}

// Fungsi countdown
function startCountdown(callback) {
  let count = 3;
  countdownScreen.innerText = count;
  countdownScreen.style.display = "block";
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownScreen.innerText = count;
    } else {
      countdownScreen.innerText = "Go!";
      setTimeout(() => {
        countdownScreen.style.display = "none";
        callback();
        clearInterval(interval);
      }, 500);
    }
  }, 1000);
}

// ================= UI =================
startBtn.onclick = () => {
  startScreen.style.display = "none";
  setupScreen.style.display = "flex";
  generatePlayerInputs(playerCountInput.value);
};

backBtn.onclick = () => {
  setupScreen.style.display = "none";
  startScreen.style.display = "flex";
};

playerCountInput.onchange = () => {
  let c = Math.min(4, Math.max(1, playerCountInput.value));
  generatePlayerInputs(c);
};

startGameBtn.onclick = () => {
  players = [];
  currentPlayerIndex = 0;

  const playerCount = parseInt(playerCountInput.value);
  for (let i = 1; i <= playerCount; i++) {
    players.push({
      name: document.getElementById(`player${i}`).value || `Player ${i}`,
      score: 0,
    });
  }

  console.log("Total players:", players.length); // Debug log

  setupScreen.style.display = "none";
  gameScreen.style.display = "block";
  bgMusic.play();

  // Tunjuk player turn notification untuk player pertama
  showPlayerTurnNotification(0, () => {
    startCountdown(() => startPlayerTurn(0));
  });
};

// ================= INSTRUCTIONS UI =================
// Added the instructions screen and button handlers
const instructionsBtn = document.getElementById("instructionsBtn");
const closeInstructionsBtn = document.getElementById("closeInstructionsBtn");
const instructionsScreen = document.getElementById("instructionsScreen");

// Function to display the instructions
instructionsBtn.onclick = () => {
  instructionsScreen.style.display = "flex"; // Show instructions
};

// Function to hide the instructions
closeInstructionsBtn.onclick = () => {
  instructionsScreen.style.display = "none"; // Hide instructions
};

// ================= CONTROLS (INSTANT) =================
window.addEventListener("keydown", (e) => {
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
    return;
  e.preventDefault();

  if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
  if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
  if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
  if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
});

// ================= MOBILE SWIPE CONTROLS (ADDED, NOTHING REMOVED) =================
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
  "touchstart",
  (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  },
  false,
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault(); // elak scroll phone
  },
  { passive: false },
);

canvas.addEventListener(
  "touchend",
  (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && direction !== "LEFT") nextDirection = "RIGHT";
      if (dx < 0 && direction !== "RIGHT") nextDirection = "LEFT";
    } else {
      if (dy > 0 && direction !== "UP") nextDirection = "DOWN";
      if (dy < 0 && direction !== "DOWN") nextDirection = "UP";
    }
  },
  false,
);

// ================= PAUSE =================
menuBtn.onclick = () => {
  isPaused = true;
  pauseMenu.style.display = "flex";
  bgMusic.pause();
};

resumeBtn.onclick = () => {
  pauseMenu.style.display = "none";
  startCountdown(() => {
    isPaused = false;
    bgMusic.play();
  });
};

restartBtn.onclick = () => {
  bgMusic.pause();
  location.reload();
};

exitBtn.onclick = () => {
  pauseMenu.style.display = "none";
  exitConfirm.style.display = "flex";
  bgMusic.pause();
};

exitYes.onclick = () => {
  bgMusic.pause();
  location.reload();
};

exitNo.onclick = () => {
  exitConfirm.style.display = "none";
  pauseMenu.style.display = "flex";
  bgMusic.play();
};

// ================= GAME =================
function startPlayerTurn(index) {
  clearInterval(gameInterval);

  // Reset semua state
  isPaused = false;
  speedMultiplier = 1;
  hasPowerUp = false;

  snake = [
    {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    },
  ];

  direction = "RIGHT";
  nextDirection = "RIGHT";
  food = spawnItem(); // Tukar kepada spawnItem
  powerUp = {}; // Reset power-up
  score = 0;
  lives = 3; // Reset nyawa setiap pemain
  updateScoreboard();

  gameInterval = setInterval(draw, GAME_SPEED * speedMultiplier);
}

function draw() {
  if (isPaused) return;

  // Clear the canvas with solid black background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render makanan biasa (magenta)
  if (!food.isPowerUp) {
    ctx.fillStyle = "magenta";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "magenta";
    ctx.fillRect(food.x, food.y, box, box);
  } else {
    // Render power-up (biru, bentuk bulat)
    ctx.fillStyle = "cyan";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "cyan";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  direction = nextDirection;

  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  snake.unshift(head);

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    collision(head, snake.slice(1))
  ) {
    // Tolak 1 nyawa sahaja
    lives--;

    // Pause game immediately
    isPaused = true;
    clearInterval(gameInterval);

    // Reset snake position ke tengah canvas
    const centerX = Math.floor(canvas.width / 2 / box) * box;
    const centerY = Math.floor(canvas.height / 2 / box) * box;

    snake = [{ x: centerX, y: centerY }];
    direction = "RIGHT";
    nextDirection = "RIGHT";

    updateScoreboard();

    // Kalau masih ada nyawa
    if (lives > 0) {
      showLifePopup(() => {
        isPaused = false;

        // Slowkan movement untuk 3 saat (safety period)
        speedMultiplier = 2; // 120 * 2 = 240ms (slower)
        clearInterval(gameInterval);
        gameInterval = setInterval(draw, GAME_SPEED * speedMultiplier);

        // Selepas 3 saat, kembali normal
        setTimeout(() => {
          speedMultiplier = 1;
          clearInterval(gameInterval);
          gameInterval = setInterval(draw, GAME_SPEED * speedMultiplier);
        }, 3000);
      });
    }
    // Kalau nyawa habis → baru game over
    else {
      isPaused = false; // Reset pause state
      players[currentPlayerIndex].score = score;

      console.log("Player", currentPlayerIndex + 1, "game over. Score:", score); // Debug
      console.log(
        "Next index will be:",
        currentPlayerIndex + 1,
        "Total players:",
        players.length,
      ); // Debug

      setTimeout(() => {
        currentPlayerIndex++;
        console.log(
          "Moving to player index:",
          currentPlayerIndex,
          "of",
          players.length,
        ); // Debug

        if (currentPlayerIndex < players.length) {
          // Tunjuk player turn notification sebelum start turn
          showPlayerTurnNotification(currentPlayerIndex, () => {
            startCountdown(() => startPlayerTurn(currentPlayerIndex));
          });
        } else {
          console.log("All players done, showing final ranking"); // Debug
          showFinalRanking();
        }
      }, 600);
    }

    return;
  }

  if (head.x === food.x && head.y === food.y) {
    if (!food.isPowerUp) {
      // Makanan biasa: tambah skor tanpa soalan
      score++;
      food = spawnItem();
      // Don't pop, so snake grows
    } else {
      // Power-up: tunjuk soalan
      isPaused = true; // Pause game
      const q = generateQuestion();
      questionScreen.innerHTML = `<p style="font-family: monospace; line-height: 1.8; margin-bottom: 20px;">${q.question}</p>`;
      const answerInput = document.createElement("input");
      answerInput.type = "text";
      answerInput.id = "answerInput";
      answerInput.placeholder = "Jawapan anda";
      answerInput.style.width = "80%";
      answerInput.style.padding = "10px";
      answerInput.style.fontSize = "1.1rem";
      answerInput.style.border = "2px solid cyan";
      answerInput.style.borderRadius = "5px";
      answerInput.style.background = "rgba(0, 0, 0, 0.8)";
      answerInput.style.color = "white";
      answerInput.style.marginBottom = "15px";
      answerInput.style.textAlign = "center";
      questionScreen.appendChild(answerInput);
      const submitBtn = document.createElement("button");
      submitBtn.id = "submitAnswer";
      submitBtn.innerText = "Hantar";
      submitBtn.style.padding = "10px 30px";
      submitBtn.style.fontSize = "1.1rem";
      submitBtn.style.background = "rgba(0, 255, 255, 0.8)";
      submitBtn.style.border = "none";
      submitBtn.style.borderRadius = "5px";
      submitBtn.style.color = "black";
      submitBtn.style.fontWeight = "bold";
      submitBtn.style.cursor = "pointer";
      submitBtn.style.marginTop = "10px";
      questionScreen.appendChild(submitBtn);
      const feedback = document.createElement("p");
      feedback.id = "feedback";
      feedback.style.marginTop = "15px";
      feedback.style.fontSize = "1rem";
      questionScreen.appendChild(feedback);
      questionScreen.style.display = "block";
      answerInput.focus(); // Auto-focus the input

      submitBtn.onclick = () => {
        const userAnswer = answerInput.value.trim();

        // Hanya terima integer
        const parsedAnswer = parseInt(userAnswer);
        const correct = !isNaN(parsedAnswer) && parsedAnswer === q.answer;

        if (correct) {
          feedback.innerText = "Jawapan betul! Power-up diaktifkan.";
          feedback.style.color = "green";
          // Apply buff rawak
          const buff = Math.random() < 0.5 ? "life" : "slow";
          if (buff === "life") {
            lives++;
            feedback.innerText += " Nyawa bertambah!";
          } else {
            speedMultiplier = 1.5; // Slow down (120 * 1.5 = 180)
            hasPowerUp = true;
            setTimeout(() => {
              speedMultiplier = 1; // Reset speed selepas 10 saat
              hasPowerUp = false;
              clearInterval(gameInterval);
              gameInterval = setInterval(draw, GAME_SPEED * speedMultiplier);
            }, 10000);
            feedback.innerText += " Pergerakan dilambatkan!";
          }
          food = spawnItem();
          updateScoreboard();
          // Don't pop, so snake grows
          setTimeout(() => {
            questionScreen.style.display = "none";
            isPaused = false;
          }, 1000);
        } else {
          lives--;
          feedback.innerText = `Jawapan salah! Nyawa berkurang. Nyawa tinggal: ${lives}. Jawapan sebenar: ${q.answer}`;
          feedback.style.color = "red";

          // Pop snake supaya tak grow bila salah
          snake.pop();

          updateScoreboard(); // Update display nyawa

          setTimeout(() => {
            questionScreen.style.display = "none";

            if (lives < 1) {
              // Game over untuk pemain ini bila nyawa habis
              isPaused = false; // Reset pause state
              clearInterval(gameInterval);
              players[currentPlayerIndex].score = score;

              console.log(
                "Player",
                currentPlayerIndex + 1,
                "game over (from question). Score:",
                score,
              ); // Debug
              console.log(
                "Next index will be:",
                currentPlayerIndex + 1,
                "Total players:",
                players.length,
              ); // Debug

              // Tunggu sikit sebelum next player atau final ranking
              setTimeout(() => {
                currentPlayerIndex++;
                console.log(
                  "Moving to player index:",
                  currentPlayerIndex,
                  "of",
                  players.length,
                ); // Debug

                if (currentPlayerIndex < players.length) {
                  // Tunjuk player turn notification sebelum start turn
                  showPlayerTurnNotification(currentPlayerIndex, () => {
                    startCountdown(() => startPlayerTurn(currentPlayerIndex));
                  });
                } else {
                  console.log("All players done, showing final ranking"); // Debug
                  showFinalRanking();
                }
              }, 600);
            } else {
              // Masih ada nyawa, continue game
              isPaused = false;
            }
          }, 2000);
        }
      };
    }
  } else {
    snake.pop(); // Normal move, maintain length
  }

  snake.forEach((s, i) => {
    const hue = (i * 18 + 180) % 360;
    ctx.fillStyle = `hsl(${hue},100%,55%)`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(s.x, s.y, box, box);
  });

  updateScoreboard();

  // ================= WATERMARK =================
  ctx.font = "20px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // White with some transparency
  ctx.textAlign = "right"; // Align text to the right
  ctx.fillText("Game made by 4mula1", canvas.width - 20, canvas.height - 20); // Position at bottom-right
}

// ================= SCORE =================
function updateScoreboard() {
  let buffText = "";
  if (hasPowerUp) {
    buffText = " (Power-up Active)";
  } else if (speedMultiplier > 1) {
    buffText = " (Safe Mode)";
  }
  scoreboard.innerText = `${players[currentPlayerIndex].name} | Score: ${score} | Lives: ${lives}${buffText}`;
}

// ================= FINAL RANKING =================
function showFinalRanking() {
  const rankingScreen = document.createElement("div");
  rankingScreen.style.position = "absolute";
  rankingScreen.style.top = "50%";
  rankingScreen.style.left = "50%";
  rankingScreen.style.transform = "translate(-50%, -50%)";
  rankingScreen.style.color = "#fff";
  rankingScreen.style.textAlign = "center";
  rankingScreen.style.fontSize = "2rem";
  rankingScreen.style.background = "rgba(0, 0, 0, 0.8)";
  rankingScreen.style.padding = "30px";
  rankingScreen.style.borderRadius = "10px";
  rankingScreen.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.8)";

  let rankingText = "Final Rankings:\n";
  players
    .sort((a, b) => b.score - a.score)
    .forEach((player, index) => {
      rankingText += `${index + 1}. ${player.name} - ${player.score} points\n`;
    });

  rankingScreen.innerText = rankingText;

  document.body.appendChild(rankingScreen);

  setTimeout(() => {
    if (confirm("Would you like to play again?")) {
      location.reload();
    } else {
      rankingScreen.style.display = "none";
    }
  }, 5001);
}
