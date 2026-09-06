const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const timerEl = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');

// Game Objects
let player = { x: 200, y: 500, w: 50, h: 100, vx: 0, vy: 0, health: 100, isCrouching: false, isAttacking: false, attackTimer: 0, facing: 1 };
let enemy = { x: 800, y: 500, w: 50, h: 100, vx: 0, vy: 0, health: 100, isCrouching: false, isAttacking: false, attackTimer: 0, facing: -1 };

// Game State
let keys = {};
let gameOver = false;
let timeLeft = 60;

// Event Listeners
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if(e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', e => keys[e.code] = false);

// Touch Controls
document.querySelectorAll('.ctrl-btn, .act-btn').forEach(btn => {
    btn.addEventListener('touchstart', e => {
        e.preventDefault();
        const key = btn.getAttribute('data-key');
        keys[key] = true;
        if(key === 'Space') startGame();
    });
    btn.addEventListener('touchend', e => {
        e.preventDefault();
        const key = btn.getAttribute('data-key');
        keys[key] = false;
    });
});

// Start Game function
function startGame() {
    if (gameOver) return;
    startScreen.style.display = 'none';
    gameOver = true; // To prevent repeated calling
    
    // AI logic timer
    setInterval(updateAI, 1000);
    setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if(timeLeft <= 0) checkWinner();
    }, 1000);
}

// Bot AI Logic
function updateAI() {
    if (enemy.health <= 0 || player.health <= 0) return;

    const dx = player.x - enemy.x;
    
    // Move towards player
    if (dx > 100) enemy.vx = 2; 
    else if (dx < -100) enemy.vx = -2;
    else enemy.vx = 0;

    // Attack
    if (Math.abs(dx) < 100 && Math.random() < 0.5) {
        enemy.isAttacking = true;
        enemy.attackTimer = 20;
    } else {
        enemy.isAttacking = false;
    }
}

function checkWinner() {
    if (player.health > enemy.health) {
        alert("YOU WIN!");
    } else if (player.health < enemy.health) {
        alert("AI WINS!");
    } else {
        alert("DRAW!");
    }
    location.reload();
}

// Collision Detection
function checkAttack(attacker, defender) {
    const attackBox = {
        x: attacker.x + (attacker.facing > 0 ? attacker.w : -40),
        y: attacker.y + 20,
        w: 40,
        h: 40
    };
    if (attackBox.x < defender.x + defender.w &&
        attackBox.x + attackBox.w > defender.x &&
        attackBox.y < defender.y + defender.h &&
        attackBox.y + attackBox.h > defender.y) {
        defender.health -= 5;
        return true;
    }
    return false;
}

// Game Loop
function update() {
    if (player.health <= 0 || enemy.health <= 0) return;
    player.isCrouching = keys['ArrowDown'];
    
    // Player Movement
    player.vx = 0;
    if (keys['ArrowLeft']) player.vx = -5;
    if (keys['ArrowRight']) player.vx = 5;
    if (keys['ArrowUp'] && player.y >= 400) player.vy = -15;
    if (keys['Space'] && !player.isAttacking) {
        player.isAttacking = true;
        player.attackTimer = 20;
    }
    
    // Gravity
    player.vy += 0.8;
    player.y += player.vy;
    if (player.y > 500) { player.y = 500; player.vy = 0; }

    // Clamp positions
    player.x += player.vx;
    player.x = Math.max(0, Math.min(1230, player.x));

    // Enemy Physics
    enemy.x += enemy.vx;
    enemy.x = Math.max(0, Math.min(1230, enemy.x));
    if (Math.random() < 0.05) enemy.isCrouching = !enemy.isCrouching;
    
    // Update Health Bars
    playerHealthBar.style.width = player.health + '%';
    enemyHealthBar.style.width = enemy.health + '%';

    // Attack Timers and Collisions
    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) player.isAttacking = false;
        else checkAttack(player, enemy);
    }
    
    if (enemy.isAttacking) {
        enemy.attackTimer--;
        if (enemy.attackTimer <= 0) enemy.isAttacking = false;
        else checkAttack(enemy, player);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 600, canvas.width, 120);

    // Draw Player
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(player.x, player.y + (player.isCrouching ? 20 : 0), player.w, player.h - (player.isCrouching ? 20 : 0));
    
    if (player.isAttacking) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(player.x + (player.facing > 0 ? player.w : -40), player.y + 20, 40, 40);
    }

    // Draw Enemy
    ctx.fillStyle = '#f44336';
    ctx.fillRect(enemy.x, enemy.y + (enemy.isCrouching ? 20 : 0), enemy.w, enemy.h - (enemy.isCrouching ? 20 : 0));
    
    if (enemy.isAttacking) {
        ctx.fillStyle = 'orange';
        ctx.fillRect(enemy.x + (enemy.facing > 0 ? enemy.w : -40), enemy.y + 20, 40, 40);
    }
}

function gameLoop() {
    if (gameOver) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
