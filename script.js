const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const heroImg = new Image();
heroImg.src = 'hero.png';
const meteorImg = new Image();
meteorImg.src = 'meteor.png';

const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.3;

let spaceship = { x: canvas.width / 2, y: canvas.height - 150, width: 80, height: 80 }; 
let meteors = [];
let score = 0;
let lives = 3; 
let running = false;
let playerName = '';
let leaderboardData = JSON.parse(localStorage.getItem('leaderboardData')) || []; 

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && spaceship.x > 0) spaceship.x -= 20;
  if (e.key === 'ArrowRight' && spaceship.x < canvas.width - spaceship.width) spaceship.x += 20;
});

function spawnMeteor() {
  const isFast = Math.random() < 0.3; 
  meteors.push({
    x: Math.random() * (canvas.width - 80),
    y: -100,
    size: 70 + Math.random() * 30, 
    speed: isFast ? 10 + Math.random() * 5 : 5 + Math.random() * 2, 
  });
}

function gameLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(heroImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);

  meteors.forEach((meteor, index) => {
    meteor.y += meteor.speed;
    ctx.drawImage(meteorImg, meteor.x, meteor.y, meteor.size, meteor.size);

    if (
      meteor.x < spaceship.x + spaceship.width &&
      meteor.x + meteor.size > spaceship.x &&
      meteor.y < spaceship.y + spaceship.height &&
      meteor.y + meteor.size > spaceship.y
    ) {
      lives--; 

      if (lives <= 0) {
        running = false;
        updateLeaderboard(playerName, score);
        alert(`Game Over! Your score: ${score}`);
        resetGame();
      } else {

        alert(`Ouch! Lives remaining: ${lives}`);
      }

      meteors.splice(index, 1); 
    }

    if (meteor.y > canvas.height) meteors.splice(index, 1);
  });

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Lives: ${lives}`, 10, 60);

  requestAnimationFrame(gameLoop);
}

function incrementScore() {
  setInterval(() => {
    if (running) score++;
  }, 2000); 
}

function increaseDifficulty() {
  setInterval(() => {
    if (running) {
      spawnMeteor();
      if (Math.random() < 0.5) spawnMeteor(); 
    }
  }, 1000); 
}

function updateLeaderboard(name, score) {
  leaderboardData.push({ name, score });
  leaderboardData.sort((a, b) => b.score - a.score);
  leaderboardData = leaderboardData.slice(0, 10); 
  localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
  renderLeaderboard();
}

function renderLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';
  leaderboardData.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function resetGame() {
  spaceship.x = canvas.width / 2;
  meteors = [];
  score = 0;
  lives = 3; 
  running = false;
}

document.getElementById('submit-name-btn').addEventListener('click', () => {
  const playerNameInput = document.getElementById('player-name');
  playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('Please enter your name to start!');
    return;
  }
  document.getElementById('name-prompt').classList.add('hidden');
  backgroundMusic.play();
  running = true;
  spawnMeteor();
  gameLoop();
  incrementScore();
  increaseDifficulty();
});

document.getElementById('leaderboard-btn').addEventListener('click', () => {
  document.getElementById('leaderboard').classList.toggle('hidden');
});

document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
  document.getElementById('leaderboard').classList.add('hidden');
});

window.onload = () => {
  document.getElementById('name-prompt').classList.remove('hidden');
  renderLeaderboard();
};