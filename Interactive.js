const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameOver = false;
let highScore = 0; 
let backgroundImage = new Image();
let animationFrame = 0; 
let characterImage1 = new Image();
let characterImage2 = new Image();
let floorImage = new Image();
let explosionImage = new Image(); 
function loadAssets(callback) {
    backgroundImage.src = 'waterbackground.png';
    backgroundImage.onload = function () {
        characterImage1.src = 'character1.png'; 
        characterImage1.onload = function () {
            characterImage2.src = 'character2.png';
            characterImage2.onload = function () {
                floorImage.src = 'waterfloor.png';
                floorImage.onload = function () {
                    explosionImage.src = 'watersplash1.png'; 
                    explosionImage.onload = function () {
                        callback();
                    };
                };
            };
        };
    };
}



const equations1 = [
    { equation: '2 * 3', answer: 6 },
    { equation: '4 * 5', answer: 20 },
    { equation: '6 * 6', answer: 36 },
    { equation: '7 * 8', answer: 56 },
    { equation: '9 * 9', answer: 81 },
    { equation: '3 * 4', answer: 12 },
    { equation: '5 * 7', answer: 35 },
    { equation: '8 * 9', answer: 72 },
    { equation: '3 * 9', answer: 27 },
    { equation: '6 * 8', answer: 48 },
    { equation: '7 * 9', answer: 63 },
    { equation: '4 * 6', answer: 24 },
    { equation: '5 * 9', answer: 45 },
    { equation: '2 * 7', answer: 14 },
    { equation: '8 * 7', answer: 56 }
];

const equations2 = [
    { equation: '10 / 2', answer: 5 },
    { equation: '15 / 3', answer: 5 },
    { equation: '20 / 4', answer: 5 },
    { equation: '25 / 5', answer: 5 },
    { equation: '30 / 6', answer: 5 },
    { equation: '35 / 7', answer: 5 },
    { equation: '40 / 8', answer: 5 },
    { equation: '45 / 9', answer: 5 },
    { equation: '50 / 10', answer: 5 },
    { equation: '55 / 11', answer: 5 },
    { equation: '60 / 12', answer: 5 },
    { equation: '65 / 13', answer: 5 },
    { equation: '70 / 14', answer: 5 },
    { equation: '75 / 15', answer: 5 },
    { equation: '80 / 16', answer: 5 }
];


let currentEquations = equations1;

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    update: function () {
        this.x = player.x - this.width / 2;


        if (this.x < 0) {
            this.x = 0;
        }
    },
};

const player = {
    x: 50,
    y: canvas.height - 150 - 50, 
    width: 30,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    speed: 4,
    jumpHeight: 12,
    score: 0,
    currentImage: null,
    explosionCounter: 0, 
};

function setPlayerPositionOnPlatform(platform) {
    player.x = platform.x;
    player.y = platform.y - player.height;
}

class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;


        const radius = 10;


        ctx.beginPath();
        ctx.moveTo(this.x + radius, this.y);
        ctx.lineTo(this.x + this.width - radius, this.y);
        ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + radius);
        ctx.lineTo(this.x + this.width, this.y + this.height - radius);
        ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height);
        ctx.lineTo(this.x + radius, this.y + this.height);
        ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - radius);
        ctx.lineTo(this.x, this.y + radius);
        ctx.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle = 'white'; 
        ctx.lineWidth = 2; 
        ctx.stroke(); 
    }
}

class Coin {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.rotation = 0; 
    }

    draw() {

        this.rotation += 0.1;
        if (this.rotation >= Math.PI * 2) {
            this.rotation = 0;
        }


        const currentWidth = this.radius * (1 - 0.5 * Math.abs(Math.sin(this.rotation)));


        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            this.x - camera.x,
            this.y,
            currentWidth,
            this.radius,
            0,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.fill();
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const platforms = [];

function generatePlatforms() {

    if (platforms.length === 0 || platforms[platforms.length - 1].x - camera.x < canvas.width - 200) {
        const platformWidth = 200;
        const platformHeight = 20;
        const platformColor = getRandomColor(); 
        let minHeight = canvas.height / 2;
        let maxHeight = canvas.height - 150;
        const minGap = 50;
        const maxGap = 200;


        const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        const xPos = platforms.length === 0 ? player.x + randomGap : platforms[platforms.length - 1].x + platformWidth + randomGap;

        let yPos;
        if (platforms.length === 0) {
            yPos = player.y;
        } else {

            const lastPlatformHeight = platforms[platforms.length - 1].y;
            const reachableMinHeight = Math.max(minHeight, lastPlatformHeight - player.jumpHeight * 2);
            const reachableMaxHeight = Math.min(maxHeight, lastPlatformHeight + player.jumpHeight * 2);
            yPos = Math.floor(Math.random() * (reachableMaxHeight - reachableMinHeight + 1) + reachableMinHeight);
        }


        platforms.push(new Platform(xPos, yPos, platformWidth, platformHeight, platformColor));

 
        if (platforms.length === 1) {
            setPlayerPositionOnPlatform(platforms[0]);
        }


        generateCoins();
    }
}

const coins = [];

function generateCoins() {
    platforms.forEach((platform) => {
        if (!platform.coinsGenerated) {
            const numberOfCoins = Math.floor(Math.random() * 4) + 1;
            const coinSpacing = platform.width / (numberOfCoins + 1);

            for (let i = 0; i < numberOfCoins; i++) {
                const coinX = platform.x + coinSpacing * (i + 1);
                const coinY = platform.y - 25;
                coins.push(new Coin(coinX, coinY, 10, 'gold'));
            }
            platform.coinsGenerated = true;
        }
    });
}

const keys = {};

window.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW', 'Space'].includes(event.code)) {
        event.preventDefault();
    }
    keys[event.code] = true;
});

generatePlatforms();

window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

function handlePlayerMovement() {

    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
        player.velocityX = -player.speed; 
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
        player.velocityX = player.speed; 
    } else {
        player.velocityX = 0; 
    }


    if (player.x < 0) {
        player.x = 0;
    }
}

function handlePlayerVerticalMovement() {

    player.velocityY += 0.5; 
    player.y += player.velocityY;


    let onPlatform = false;
    const floorHeight = 50;
    if (player.y + player.height >= canvas.height - floorHeight) {
        onPlatform = true;
        player.y = canvas.height - player.height - floorHeight;
        player.velocityY = 0;
    }
    platforms.forEach((platform) => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y - 5 &&
            player.y + player.height <= platform.y + platform.height
        ) {
            onPlatform = true;
            player.y = platform.y - player.height;
            player.velocityY = 0; 
        }
    });


    if (
        (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) &&
        onPlatform
    ) {
        player.velocityY = -player.jumpHeight;
    }
}


function detectPlatformCollision() {
    const prevY = player.y - player.velocityY;

    let onPlatform = false;

    platforms.forEach((platform) => {

        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x
        ) {

            if (
                prevY + player.height <= platform.y &&
                player.y + player.height >= platform.y &&
                player.velocityY >= 0
            ) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                onPlatform = true;
            }

            else if (
                prevY >= platform.y + platform.height &&
                player.y <= platform.y + platform.height
            ) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }


        if (
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height
        ) {

            if (
                player.x + player.width >= platform.x &&
                player.x + player.width <= platform.x + 5
            ) {
                player.x = platform.x - player.width;
            }

            else if (
                player.x <= platform.x + platform.width &&
                player.x >= platform.x + platform.width - 5
            ) {
                player.x = platform.x + platform.width;
            }
        }
    });

    if (onPlatform) {
        player.isJumping = false;
    }
}



function checkGroundCollision() {
    const floorHeight = 50;

    if (player.y + player.height > canvas.height - floorHeight) {
        player.y = canvas.height - player.height - floorHeight;
        player.velocityY = 0;
    }
}

function resetGame() {
    console.log("Resetting the game..."); 
    gameOver = false;
    player.x = 50;
    player.y = canvas.height - 150 - 50;
    player.velocityX = 0;
    player.velocityY = 0;
    player.score = 0;
    camera.x = 0;
    platforms.length = 0;
    coins.length = 0;
    generatePlatforms();
    player.explosionDrawn = false;
    player.explosionCounter = 0;
    coinsCollected = 0;
    equationsCounter = 0;


    if (popup) {
        popup.remove();
    }


    if (countdownTimer) {
        console.log("Clearing the countdown timer..."); 
        clearInterval(countdownTimer);
    }
}


function update() {
    if (!gameOver) {
        handlePlayerVerticalMovement();
        detectPlatformCollision();
        checkGroundCollision();
        detectCoinCollision();


        let onPlatform = false;
        platforms.forEach((platform) => {
            if (
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height === platform.y
            ) {
                onPlatform = true;
            }
        });
        player.isJumping = !onPlatform;

        const prevX = player.x; 
        handlePlayerMovement();
        generateCoins();
        detectCoinCollision();


        player.velocityX = player.x - prevX;

        camera.update();


        if (player.isJumping) {
            player.currentImage = characterImage1;
            animationFrame = 0; 
        } else {
            if (keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD']) {

                animationFrame++;
            } else {
                animationFrame = 0;
            }
            if (animationFrame % 20 < 10) {
                player.currentImage = characterImage1;
            } else {
                player.currentImage = characterImage2;
            }
        }


        generatePlatforms();
    }


    if (player.y + player.height >= canvas.height - 50) {
        gameOver = true;
        if (player.score > highScore) {
            highScore = player.score;
        }
    }
}


function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();


    ctx.save();
    ctx.translate(-camera.x, 0);
    platforms.forEach((platform) => platform.draw());
    drawFloor();
    ctx.restore();
    coins.forEach((coin) => coin.draw());


    drawCharacter();


    drawScoreBox();
    drawHighScoreBox();


    drawGameOverAndReset();
}

function drawCharacter() {
    const characterHeight = player.height;
    const characterWidth = (characterImage1.width / characterImage1.height) * characterHeight;

    if (!gameOver) {
        ctx.save();
        ctx.translate(-camera.x, 0);

  
        if (player.velocityX < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                player.currentImage,
                -player.x - characterWidth + characterWidth, 
                player.y,
                -characterWidth,
                characterHeight
            );
        } else {
            ctx.drawImage(
                player.currentImage,
                player.x,
                player.y,
                characterWidth,
                characterHeight
            );
        }

        ctx.restore();
    }


    if (gameOver && player.explosionCounter < 50) { 
        const explosionWidth = characterWidth * 2; 
        const explosionHeight = characterHeight * 2; 

        ctx.save();
        ctx.translate(-camera.x, 0);
        ctx.drawImage(
            explosionImage,
            player.x - (explosionWidth - characterWidth) / 2, 
            player.y - (explosionHeight - characterHeight) / 2, 
            explosionWidth,
            explosionHeight
        );
        ctx.restore();

        player.explosionCounter++; 
    }
}

function drawFloor() {
    const tileWidth = floorImage.width;
    const tileHeight = floorImage.height;
    const numTiles = Math.ceil(canvas.width / tileWidth) + 1;

    const startX = Math.floor(camera.x / tileWidth) * tileWidth;

    for (let i = 0; i < numTiles; i++) {
        ctx.drawImage(
            floorImage,
            startX + i * tileWidth,
            canvas.height - 50,
            tileWidth,
            tileHeight
        );
    }
}

function drawScoreBox() {
    drawRoundedRect(5, 5, 150, 35, 5, 'white', 'black', 3);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${player.score}`, 10, 30);
}

function drawHighScoreBox() {
    drawRoundedRect(canvas.width - 185, 5, 180, 35, 5, 'white', 'black', 3);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 180, 30);
}

function drawGameOverAndReset() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);

        ctx.fillStyle = 'blue';
        ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 20, 120, 40);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Reset', canvas.width / 2 - 25, canvas.height / 2 + 45);
    }
}

function drawBackground() {
    const scale = canvas.height / backgroundImage.height;
    const scaledWidth = backgroundImage.width * scale;
    const numImages = Math.ceil(canvas.width / scaledWidth) + 1;


    let offsetX = (camera.x * 0.5) % scaledWidth;
    for (let i = 0; i < numImages; i++) {
        ctx.drawImage(backgroundImage, i * scaledWidth - offsetX, 0, scaledWidth, canvas.height);
    }
}

function drawRoundedRect(x, y, width, height, radius, fillColor, borderColor, borderWidth) {
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

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (borderColor && borderWidth) {
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

generatePlatforms();
loadAssets(function () {

    gameLoop();
});

window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyN') {
        switchLevel();
    }
});



let coinsCollected = 0;
let currentEquationIndex = -1;
let popup;
let countdownTimer; 
let equationsCounter = 0;

function detectCoinCollision() {
    coins.forEach((coin, index) => {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const distance = Math.sqrt((playerCenterX - coin.x) ** 2 + (playerCenterY - coin.y) ** 2);
        if (distance < player.width / 2 + coin.radius) {
            player.score += 1;
            coins.splice(index, 1);
            coinsCollected++;

            if (coinsCollected === 10) {
                coinsCollected = 0;
                equationsCounter++;
                pauseGameAndShowMathEquation();
            }
        }
    });
}

function resetGame() {
    gameOver = false;
    player.x = 50;
    player.y = canvas.height - 150 - 50;
    player.velocityX = 0;
    player.velocityY = 0;
    player.score = 0;
    camera.x = 0;
    platforms.length = 0;
    coins.length = 0;
    generatePlatforms();
    player.explosionDrawn = false;
    player.explosionCounter = 0;
    coinsCollected = 0;
    equationsCounter = 0;

 
    if (popup) {
        popup.remove();
    }


    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
}



const introText = document.createElement('div');
introText.innerHTML = 'Click on either "Multiplication" or "Division"<br>during the game for the teacher or another student<br>to play and interact with the main user.';
introText.style.fontSize = '14px';
introText.style.marginTop = '20px';


document.body.appendChild(introText);


const multiplicationButton = document.createElement('button');
multiplicationButton.textContent = 'Multiplication';
multiplicationButton.style.padding = '10px 20px';
multiplicationButton.style.margin = '10px';
multiplicationButton.style.fontSize = '18px';
multiplicationButton.style.borderRadius = '5px';
multiplicationButton.style.border = '2px solid #ccc';
multiplicationButton.style.backgroundColor = '#4CAF50';
multiplicationButton.style.color = 'white';
multiplicationButton.style.cursor = 'pointer';


multiplicationButton.addEventListener('click', function () {
    multiplicationButton.style.backgroundColor = '#45a049';
    setTimeout(function () {
        multiplicationButton.style.backgroundColor = '#4CAF50';
    }, 100);
});

document.body.appendChild(multiplicationButton);

const divisionButton = document.createElement('button');
divisionButton.textContent = 'Division';
divisionButton.style.padding = '10px 20px';
divisionButton.style.margin = '10px';
divisionButton.style.fontSize = '18px';
divisionButton.style.borderRadius = '5px';
divisionButton.style.border = '2px solid #ccc';
divisionButton.style.backgroundColor = '#4CAF50';
divisionButton.style.color = 'white';
divisionButton.style.cursor = 'pointer';


divisionButton.addEventListener('click', function () {
    divisionButton.style.backgroundColor = '#45a049';
    setTimeout(function () {
        divisionButton.style.backgroundColor = '#4CAF50';
    }, 100);
});

document.body.appendChild(divisionButton);




multiplicationButton.addEventListener('click', function () {

    handleMultiplicationEquations();
});

divisionButton.addEventListener('click', function () {

    handleDivisionEquations();
});


function handleMultiplicationEquations() {

    equations = equations1;
}


function handleDivisionEquations() {

    equations = equations2;
}

function checkAnswer(correctAnswer) {
    const userAnswer = parseFloat(document.getElementById('answer').value);

    if (userAnswer === correctAnswer) {
        console.log('Correct answer!');

        const message = document.createElement('div');
        message.textContent = 'Correct answer!';
        document.body.appendChild(message);


        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);

 
        document.getElementById('answer').value = '';

    
        clearInterval(countdownTimer);


        gameState = 'playing';
        currentEquationIndex = -1;
        popup.remove();
    } else {
        console.log('Incorrect answer. Try again.');
 
        const message = document.createElement('div');
        message.textContent = 'Incorrect answer. Try again.';
        document.body.appendChild(message);

        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);


        document.getElementById('answer').value = '';
    }
}

function pauseGameAndShowMathEquation() {
    gameState = 'paused'; 


    const equationData = getEquation();
    const { equation, answer } = equationData;


    popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
    <div style="border: 4px solid #4CAF50; border-radius: 10px; padding: 20px;">
        <h2 style="text-align: center; font-weight: bold; font-family: 'Arial', sans-serif;">Can You Solve This?</h2>
        <div style="text-align: center; font-family: 'Arial', sans-serif;">
            <p style="margin-bottom: 10px;">It's Math Time! Solve this equation to continue:</p>
            <p style="font-size: 20px;">${equation} = ?</p>
            <input type="text" id="answer" style="padding: 10px; margin-top: 10px; font-size: 18px; border-radius: 5px; border: 2px solid #ccc;" />
            <button id="submitAnswerButton" style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; margin-top: 10px; font-size: 18px; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">Submit</button>
            <div id="countdown" style="font-size: 24px; font-weight: bold; margin-top: 20px;"></div>
        </div>
    </div>
  `;


    const submitButton = popup.querySelector('#submitAnswerButton');
    submitButton.addEventListener('click', () => {
        checkAnswer(answer);
    });

    const centerX = canvas.width / 2 - popup.clientWidth / 2;
    const centerY = canvas.height / 2 - popup.clientHeight / 2;
    popup.style.left = `${centerX}px`;
    popup.style.top = `${centerY}px`;

    document.body.appendChild(popup);

    startCountdown(10); 
}

function startCountdown(seconds) {
    let countdownElement = document.getElementById('countdown');
    countdownElement.textContent = seconds; 

    countdownTimer = setInterval(() => {
        seconds--;
        countdownElement.textContent = seconds;

        if (seconds === 0) {

            clearInterval(countdownTimer);
            resetGame(); 
        }
    }, 1000);
}


function resetCountdown() {

    clearInterval(countdownTimer);
    let countdownElement = document.getElementById('countdown');
    countdownElement.textContent = 10;
}

canvas.addEventListener('click', (event) => {
    if (gameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const buttonX = canvas.width / 2 - 60;
        const buttonY = canvas.height / 2 + 20;
        const buttonWidth = 120;
        const buttonHeight = 40;

        if (
            x >= buttonX &&
            x <= buttonX + buttonWidth &&
            y >= buttonY &&
            y <= buttonY + buttonHeight
        ) {
            resetGame();
        }
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getEquation() {

    const shuffledEquations = shuffleArray(equations);


    const equation = shuffledEquations[0];


    shuffledEquations.shift();

    return equation;
}
