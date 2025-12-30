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
const GAME_SPEED = 80; // Speed up snake movement from 160 to 80

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
questionScreen.style.fontSize = "1.5rem";
questionScreen.style.background = "rgba(0, 0, 0, 0.9)";
questionScreen.style.padding = "20px";
questionScreen.style.borderRadius = "10px";
questionScreen.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.8)";
questionScreen.style.display = "none";
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

// ================= CANVAS =================
function resizeCanvas() {
  // Kurangkan sikit supaya tidak terlalu besar, 90% viewport
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
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

// Fungsi baru untuk spawn item (makanan atau power-up)
function spawnItem() {
  const isPowerUp = Math.random() < 0.2; // 20% peluang spawn power-up
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
      question: "Cari determinant matriks [[1, 2], [3, 4]]",
      answer: -2,
    },
    {
      question: "Cari determinant matriks [[2, 1], [4, 3]]",
      answer: 2,
    },
    {
      question: "Cari determinant matriks [[5, 3], [2, 1]]",
      answer: -1,
    },
    {
      question: "Cari determinant matriks [[4, 2], [3, 1]]",
      answer: -2,
    },
    {
      question: "Cari determinant matriks [[3, 1], [6, 2]]",
      answer: 0,
    },
    {
      question:
        "Cari hasil darab matriks [[1, 0], [0, 1]] dengan [[2, 3], [4, 5]] (nyatakan sebagai array 1D: [a,b,c,d])",
      answer: [2, 3, 4, 5],
    },
    {
      question:
        "Cari hasil darab matriks [[2, 0], [0, 2]] dengan [[1, 2], [3, 4]] (nyatakan sebagai array 1D: [a,b,c,d])",
      answer: [2, 4, 6, 8],
    },
    {
      question:
        "Selesaikan sistem linear: x + y = 3, 2x - y = 1. Nyatakan x dan y sebagai [x,y]",
      answer: [1, 2],
    },
    {
      question:
        "Selesaikan sistem linear: x + y = 5, x - y = 1. Nyatakan x dan y sebagai [x,y]",
      answer: [3, 2],
    },
    {
      question:
        "Selesaikan sistem linear: 2x + y = 7, x + y = 4. Nyatakan x dan y sebagai [x,y]",
      answer: [3, 1],
    },
    {
      question: "Cari trace (jumlah diagonal utama) matriks [[2, 3], [4, 5]]",
      answer: 7,
    },
    {
      question: "Cari trace (jumlah diagonal utama) matriks [[1, 2], [3, 4]]",
      answer: 5,
    },
    {
      question:
        "Transpose matriks [[1, 2], [3, 4]] menghasilkan elemen posisi (1,2) = ?",
      answer: 3,
    },
    {
      question:
        "Jika A = [[2, 1], [0, 3]], berapakah elemen a₂₁ (baris 2, kolum 1)?",
      answer: 0,
    },
    {
      question: "Cari determinant matriks [[6, 2], [3, 1]]",
      answer: 0,
    },
    {
      question: "Cari determinant matriks [[1, 3], [2, 6]]",
      answer: 0,
    },
    {
      question: "Cari determinant matriks [[7, 2], [3, 1]]",
      answer: 1,
    },
    {
      question:
        "Tambah matriks [[1, 2], [3, 4]] + [[2, 1], [1, 2]]. Cari elemen posisi (1,1)?",
      answer: 3,
    },
    {
      question:
        "Tambah matriks [[5, 3], [2, 4]] + [[1, 2], [3, 1]]. Cari elemen posisi (2,2)?",
      answer: 5,
    },
    {
      question:
        "Tolak matriks [[5, 3], [2, 4]] - [[2, 1], [1, 2]]. Cari elemen posisi (1,1)?",
      answer: 3,
    },
    {
      question: "Darab skalar 2 × [[1, 2], [3, 4]]. Cari elemen posisi (2,1)?",
      answer: 6,
    },
    {
      question: "Darab skalar 3 × [[2, 1], [0, 2]]. Cari elemen posisi (1,2)?",
      answer: 3,
    },
    {
      question:
        "Selesaikan sistem linear: 3x + y = 10, x + y = 4. Nyatakan x dan y sebagai [x,y]",
      answer: [3, 1],
    },
    {
      question:
        "Selesaikan sistem linear: 2x + 3y = 13, x + y = 5. Nyatakan x dan y sebagai [x,y]",
      answer: [2, 3],
    },
    {
      question: "Cari trace matriks [[3, 5], [7, 2]]",
      answer: 5,
    },
    {
      question: "Transpose matriks [[2, 5], [3, 4]]. Cari elemen posisi (2,1)?",
      answer: 5,
    },
    {
      question:
        "Jika A = [[1, 4], [2, 3]], berapakah elemen a₁₂ (baris 1, kolum 2)?",
      answer: 4,
    },
    {
      question: "Matriks identiti 2×2 mempunyai determinant = ?",
      answer: 1,
    },
  ];
  return questions[Math.floor(Math.random() * questions.length)];
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

  for (let i = 1; i <= playerCountInput.value; i++) {
    players.push({
      name: document.getElementById(`player${i}`).value || `Player ${i}`,
      score: 0,
    });
  }

  setupScreen.style.display = "none";
  gameScreen.style.display = "block";
  bgMusic.play();
  startCountdown(() => startPlayerTurn(currentPlayerIndex));
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
  hasPowerUp = false;
  score = 0;
  lives = 3; // Reset nyawa setiap pemain
  speedMultiplier = 1; // Reset speed
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
    collision(head, snake.slice(1)) // Avoid self-collision with new head
  ) {
    clearInterval(gameInterval);
    players[currentPlayerIndex].score = score;

    setTimeout(() => {
      currentPlayerIndex++;
      if (currentPlayerIndex < players.length) {
        startCountdown(() => startPlayerTurn(currentPlayerIndex));
      } else {
        showFinalRanking(); // Papar ranking
      }
    }, 600);
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
      questionScreen.innerHTML = `<p>${q.question}</p>`;
      const answerInput = document.createElement("input");
      answerInput.type = "text";
      answerInput.id = "answerInput";
      answerInput.placeholder = "Jawapan anda";
      questionScreen.appendChild(answerInput);
      const submitBtn = document.createElement("button");
      submitBtn.id = "submitAnswer";
      submitBtn.innerText = "Hantar";
      questionScreen.appendChild(submitBtn);
      const feedback = document.createElement("p");
      feedback.id = "feedback";
      questionScreen.appendChild(feedback);
      questionScreen.style.display = "block";
      answerInput.focus(); // Auto-focus the input

      submitBtn.onclick = () => {
        const userAnswer = answerInput.value.trim();
        let correct = false;
        if (Array.isArray(q.answer)) {
          // Untuk array, parse sebagai JSON atau split
          try {
            const parsed = JSON.parse(userAnswer);
            correct = JSON.stringify(parsed) === JSON.stringify(q.answer);
          } catch {
            correct = false;
          }
        } else {
          correct = parseFloat(userAnswer) === q.answer;
        }

        if (correct) {
          feedback.innerText = "Jawapan betul! Power-up diaktifkan.";
          feedback.style.color = "green";
          // Apply buff rawak
          const buff = Math.random() < 0.5 ? "life" : "slow";
          if (buff === "life") {
            lives++;
            feedback.innerText += " Nyawa bertambah!";
          } else {
            speedMultiplier = 1.5; // Slow down (80 * 1.5 = 120)
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
          // Don't pop, so snake grows
          setTimeout(() => {
            questionScreen.style.display = "none";
            isPaused = false;
          }, 1000);
        } else {
          lives--;
          const correctAnswerText = Array.isArray(q.answer)
            ? JSON.stringify(q.answer)
            : q.answer;
          feedback.innerText = `Jawapan salah! Nyawa berkurang. Nyawa tinggal: ${lives}. Jawapan sebenar: ${correctAnswerText}`;
          feedback.style.color = "red";

          // Pop snake supaya tak grow bila salah
          snake.pop();

          updateScoreboard(); // Update display nyawa

          setTimeout(() => {
            questionScreen.style.display = "none";

            if (lives < 1) {
              // Game over untuk pemain ini bila nyawa kurang dari 1
              clearInterval(gameInterval);
              players[currentPlayerIndex].score = score;
              setTimeout(() => {
                currentPlayerIndex++;
                if (currentPlayerIndex < players.length) {
                  startCountdown(() => startPlayerTurn(currentPlayerIndex));
                } else {
                  showFinalRanking();
                }
              }, 600);
            } else {
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
  let buffText = hasPowerUp ? " (Slowed)" : "";
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
  }, 5000);
}
