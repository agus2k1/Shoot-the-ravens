/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let ravenAlive = 0;
ctx.font = "50px impact"

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX =  Math.random() * 5 + 5.5; // horizontal speed
        this.directionY =  Math.random() * 5 - 3.5; // vertical speed
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "images/raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255,), Math.floor(Math.random() * 255,)];
        this.color = "rgb(" + this.randomColors[0] + "," + this.randomColors[1] + "," + this.randomColors[2] + ")";
        this.hasTrail = Math.random() > 0.5;
        this.isGolden = Math.random() > 0.8;
    }
    update(time) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;

        if (this.x < 0 - this.width){
            this.markedForDeletion = true;
        }
        this.timeSinceFlap += time;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                if (this.isGolden) {
                    for (let i = 0; i < 5; i++) {
                        particles.push(new Particle(this.x, this.y, this.width, "rgb(239, 184, 16)"));
                    }
                    this.directionX = Math.random() * 5 + 15;
                } else {
                    for (let i = 0; i < 5; i++) {
                        particles.push(new Particle(this.x, this.y, this.width, this.color));
                    }
                }
            } 
        }
        if (this.x < 0 - this.width) {
            heart.lives--;
            ravenAlive++;
        }
    } 
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.image = new Image();
        this.image.src = "images/boom.png";
        this.sound = new Audio();
        this.sound.src = "audio/boom.wav";
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200; // ms
        this.markedForDeletion = false;
    }
    update(time) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += time;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) {
                this.markedForDeletion = true;
            }
        }
    }
    draw() {
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}

let particles = [];
class Particle {
    constructor(x, y, size, color){
        this.size = size;
        this.x = x + this.size/1.5 + Math.random() * 50 - 25;
        this.y = y + this.size/3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update() {
        this.x += this.speedX;
        this.radius += 0.5;
        if (this.radius > this.maxRadius - 5) {
            this.markedForDeletion = true;
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Heart {
    constructor() {
        this.spriteWidth = 300.33;
        this.spriteHeight = 300;
        this.x = 25;
        this.y = 10;
        this.image = new Image();
        this.image.src = "images/heart.png";
        this.lives = 2;
    }
    update() {
        if (this.lives === 0) {
            setTimeout(() => {
                gameOver = true;
            }, 1);  
        }
    }
    draw() {
        ctx.drawImage(this.image, this.spriteWidth * ravenAlive, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.spriteWidth/3, this.spriteHeight/3);
    }
}

const heart = new Heart();

function drawScore() {
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 50, 795);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 50, 800);
}

function drawGameOver() {
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("GAME OVER, your score is " + score, canvas.width/2, canvas.height/2 - 5);
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER, your score is " + score, canvas.width/2, canvas.height/2);
}

function drawLives() {
    ctx.fillStyle = "black";
    ctx.fillText(heart.lives, 140, 77);
    ctx.fillStyle = "white";
    ctx.fillText(heart.lives, 140, 80);
}

window.addEventListener("click", (e) => {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pixelColor = detectPixelColor.data;
    ravens.forEach(raven => {
        if (raven.randomColors[0] === pixelColor[0] && raven.randomColors[1] === pixelColor[1] && raven.randomColors[2] === pixelColor[2]) {
            // collision detected
            raven.markedForDeletion = true;
            explosions.push(new Explosion(raven.x, raven.y, raven.width));
            if (raven.hasTrail) score += 1;
            if (raven.isGolden) score += 19;
            else score++;
        }
    });
});

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval){
        ravens.push(new Raven ());
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
            return a.width - b.width;
        });
    }
    drawLives();
    drawScore();
    [...particles, ...ravens, ...explosions].forEach(raven => {
        raven.update(deltaTime);
        raven.draw();
    });
    ravens = ravens.filter(raven => !raven.markedForDeletion);
    explosions = explosions.filter(explosion => !explosion.markedForDeletion);
    particles = particles.filter(particle => !particle.markedForDeletion);
    heart.update();
    heart.draw();
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

animate(0);
