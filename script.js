// 游戏常量
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 150;

// 游戏变量
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let level = 1;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
    ];
    
    // 初始化方向
    direction = 'right';
    nextDirection = 'right';
    
    // 生成食物
    generateFood();
    
    // 重置分数和等级
    score = 0;
    level = 1;
    updateScore();
    updateLevel();
    
    // 更新最高分显示
    highScoreElement.textContent = highScore;
    
    // 隐藏游戏结束界面
    gameOverElement.classList.add('hidden');
    
    // 开始游戏循环
    gameRunning = true;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, getSpeed());
}

// 游戏主循环
function gameLoop() {
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (checkFoodCollision()) {
        eatFood();
        generateFood();
        updateScore();
        updateLevel();
    }
    
    // 绘制游戏
    drawGame();
}

// 移动蛇
function moveSnake() {
    // 创建新的蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 添加新的蛇头
    snake.unshift(head);
    
    // 如果没有吃到食物，移除蛇尾
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查食物碰撞
function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// 吃到食物
function eatFood() {
    score += 10;
    
    // 每吃10个食物升一级
    if (score % 100 === 0) {
        level++;
        updateLevel();
        
        // 更新游戏速度
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, getSpeed());
        
        // 添加升级动画效果
        levelElement.classList.add('pulse');
        setTimeout(() => {
            levelElement.classList.remove('pulse');
        }, 500);
    }
    
    // 添加得分动画效果
    scoreElement.classList.add('pulse');
    setTimeout(() => {
        scoreElement.classList.remove('pulse');
    }, 300);
}

// 生成食物
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
        
        // 检查食物是否生成在蛇身上
        for (const segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 绘制网格（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#2d3047';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= CANVAS_SIZE; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE);
        ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_SIZE; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_SIZE, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4ecdc4'; // 蛇头颜色
        } else {
            // 蛇身使用渐变颜色
            const colorValue = Math.max(100, 255 - index * 10);
            ctx.fillStyle = `rgb(78, ${colorValue}, 196)`;
        }
        
        // 绘制圆角矩形
        drawRoundedRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE, 
            GRID_SIZE, 
            4
        );
        
        // 绘制蛇眼睛（只在蛇头上）
        if (index === 0) {
            ctx.fillStyle = '#1a1a2e';
            
            // 根据方向绘制眼睛
            const eyeSize = 3;
            const eyeOffset = 4;
            
            if (direction === 'right') {
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'left') {
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'up') {
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
            } else if (direction === 'down') {
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });
}

// 绘制圆角矩形
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// 绘制食物
function drawFood() {
    // 绘制闪烁的食物
    const blink = Math.sin(Date.now() / 200) > 0;
    
    if (blink) {
        // 红色食物主体
        ctx.fillStyle = '#e63946';
        drawRoundedRect(
            food.x * GRID_SIZE + 2, 
            food.y * GRID_SIZE + 2, 
            GRID_SIZE - 4, 
            GRID_SIZE - 4, 
            3
        );
        
        // 食物高光
        ctx.fillStyle = '#ff6b6b';
        drawRoundedRect(
            food.x * GRID_SIZE + 4, 
            food.y * GRID_SIZE + 4, 
            GRID_SIZE - 8, 
            GRID_SIZE - 8, 
            2
        );
    } else {
        // 黄色食物主体
        ctx.fillStyle = '#ffd166';
        drawRoundedRect(
            food.x * GRID_SIZE + 2, 
            food.y * GRID_SIZE + 2, 
            GRID_SIZE - 4, 
            GRID_SIZE - 4, 
            3
        );
        
        // 食物高光
        ctx.fillStyle = '#f9c74f';
        drawRoundedRect(
            food.x * GRID_SIZE + 4, 
            food.y * GRID_SIZE + 4, 
            GRID_SIZE - 8, 
            GRID_SIZE - 8, 
            2
        );
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新等级显示
function updateLevel() {
    levelElement.textContent = level;
}

// 获取当前速度
function getSpeed() {
    return Math.max(50, INITIAL_SPEED - (level - 1) * 10);
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 重新开始游戏
restartBtn.addEventListener('click', initGame);

// 触摸控制（移动设备支持）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault();
});

canvas.addEventListener('touchmove', (event) => {
    if (!gameRunning) return;
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (diffX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (diffY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
    
    event.preventDefault();
});

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    initGame();
    
    // 添加一些初始动画效果
    setTimeout(() => {
        document.querySelector('.game-header h1').classList.add('pulse');
        setTimeout(() => {
            document.querySelector('.game-header h1').classList.remove('pulse');
        }, 1000);
    }, 500);
});

// 防止页面滚动
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
});
