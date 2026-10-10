const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpPower: 12,
    onGround: false
};

const ground = {
    x: 0,
    y: 350,
    width: 800,
    height: 50
};

const platform = {
    x: 250,
    y: 280,
    width: 100,
    height: 10
};

const coin = {
    x: 290,
    y: 250,
    width: 20,
    height: 20,
    collected: false
};

const gravity = 0.8;
let score = 0;

function drawPlayer() {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(player.x + 5, player.y + 5, 10, 10);
}

function drawGround() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(ground.x, ground.y, ground.width, 5);
}

function drawPlatform() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(platform.x, platform.y, platform.width, 2);
}

function drawCoin() {
    if (!coin.collected) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(coin.x + 10, coin.y + 10, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(coin.x + 10, coin.y + 10, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Moedas: ' + score, 10, 25);
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    player.onGround = false;

    if (player.y + player.height >= ground.y) {
        player.y = ground.y - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    if (checkCollision(player, platform) && player.dy > 0 && player.y + player.height < platform.y + 20) {
        player.y = platform.y - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    if (!coin.collected && checkCollision(player, coin)) {
        coin.collected = true;
        score++;
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlatform();
    drawCoin();
    drawPlayer();
    drawScore();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    }
    if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && player.onGround) {
        player.dy = -player.jumpPower;
    }
});

document.addEventListener('keyup', function(e) {
    if ((e.key === 'ArrowLeft' || e.key === 'a') && player.dx < 0) {
        player.dx = 0;
    }
    if ((e.key === 'ArrowRight' || e.key === 'd') && player.dx > 0) {
        player.dx = 0;
    }
});

update();