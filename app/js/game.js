document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    document.body.style.margin = "0";

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Establecer el fondo del body con la imagen de espacio
    document.body.style.backgroundImage = 'url("../app/img/space1.jpg")';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = '0px 0px'; // Inicialmente sin desplazamiento

    // Velocidad de desplazamiento del fondo
    let backgroundSpeed = 1;

    function moveBackground() {
        const currentBackgroundPosition = document.body.style.backgroundPosition.split(' ');
        const currentX = parseInt(currentBackgroundPosition[0].replace('px', ''));
        const currentY = parseInt(currentBackgroundPosition[1].replace('px', ''));

        const newX = currentX - backgroundSpeed;
        document.body.style.backgroundPosition = `${newX}px ${currentY}px`;

        requestAnimationFrame(moveBackground);
    }

    moveBackground();

    // Imagend de nave TIE usuario
    const tieImage = new Image();
    tieImage.src = "../app/img/TIE-window.png";
    // Imágenes de las naves xwing
    const enemyImg = new Image();
    enemyImg.src = '../app/img/front-x-wing.png';

    let lives = 5;
    let hitted = false; 


    let currentSize = 0;
    const maxSize = 400;
    let currentPosition = 0;
    let laserCooldown = 0;
    const lasers = [];

    let pointA = { x: canvas.width / 2, y: canvas.height / 2 };
    let pointB = { x: Math.random() * (canvas.width - currentSize), y: Math.random() * (canvas.height - currentSize) };

    const crosshair = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 20,
    };

    const userlaser = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        speed: 30,
        isShooting: false,
    };

    document.addEventListener("mousemove", function (event) {
        crosshair.x = event.clientX;
        crosshair.y = event.clientY;
    });

    document.addEventListener("keydown", function (event) {
        console.log("Key pressed: ", event.code);
        if (event.code === "Space") {
            const dx = crosshair.x - canvas.width / 2;
            const dy = crosshair.y - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log("Distance: ", distance);
            if (distance <= 550) {
                userlaser.targetX = crosshair.x;
                userlaser.targetY = crosshair.y;
                userlaser.isShooting = true;
            }
        }
    });
    
    function drawUserLaser(startX, startY, targetX, targetY) {
        console.log("Drawing laser from (" + startX + ", " + startY + ") to (" + targetX + ", " + targetY + ")");
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 6;

        ctx.shadowColor = "green";
        ctx.shadowBlur = 50;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;

        ctx.stroke();
        ctx.closePath();

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function drawCrosshair() {
        const dx = crosshair.x - canvas.width / 2;
        const dy = crosshair.y - canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 550) {
            ctx.beginPath();
            ctx.rect(crosshair.x - crosshair.width / 2, crosshair.y - crosshair.height / 2, crosshair.width, crosshair.height);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.rect(crosshair.x - crosshair.width / 2 - 1, crosshair.y - crosshair.height / 2 - 1, crosshair.width + 2, crosshair.height + 2);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }

    
      // Imagen de explosión
      const explosionImage = new Image();
      explosionImage.src = '../app/img/explo2.png';
  
      function drawExplosion(x, y) {
        const explosionSize = 100;  // Ajusta el tamaño de la explosión según tus necesidades
        const explosionDuration = 2000;  // Duración de la explosión en milisegundos (2 segundos)
    
        const startTime = Date.now();
    
        function animateExplosion() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
    
            if (elapsed < explosionDuration) {
                // Dibuja la explosión mientras esté dentro del tiempo de duración
                ctx.drawImage(explosionImage, x - explosionSize / 2, y - explosionSize / 2, explosionSize, explosionSize);
    
                // Continúa animando
                requestAnimationFrame(animateExplosion);
            } else {
                // La explosión ha terminado, puedes realizar otras acciones si es necesario
                // Por ejemplo, borrar la imagen de explosión
                ctx.clearRect(x - explosionSize / 2, y - explosionSize / 2, explosionSize, explosionSize);
            }
        }
    
        // Inicia la animación
        animateExplosion();
    }

    let collisionDetected = false;

    function updateUserLaser() {
        if (userlaser.isShooting && !collisionDetected) {
            const dx = userlaser.targetX - canvas.width / 2;
            const dy = userlaser.targetY - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance > 0 && distance <= 550) {
                // Check if the crosshair is on target
                const crosshairOnTarget = checkCollision(userlaser.targetX, userlaser.targetY, pointA.x, pointA.y, currentSize);
    
                if (crosshairOnTarget) {
                    // Increment the score and update the text
                    score++;
                    document.getElementById('score').innerHTML = `<h1>X-${score}`;
    
                    // Draw explosion in place of the X-wing
                    drawExplosion(pointA.x, pointA.y);
    
                    // Set collisionDetected to true
                    collisionDetected = true;
    
                    // Reset user laser position
                    userlaser.isShooting = false;
                    userlaser.x = canvas.width / 2;
                    userlaser.y = canvas.height / 2;
                } else {
                    // Move the user laser toward the crosshair
                    userlaser.x += (dx / distance) * userlaser.speed;
                    userlaser.y += (dy / distance) * userlaser.speed;
                }
            }
    
            if (Math.abs(userlaser.x - userlaser.targetX) < userlaser.speed && Math.abs(userlaser.y - userlaser.targetY) < userlaser.speed) {
                // Reset user laser position when it reaches the crosshair
                userlaser.isShooting = false;
                userlaser.x = canvas.width / 2;
                userlaser.y = canvas.height / 2;
            }
        }
    }
    

// Función para verificar colisión entre dos objetos circulares
function checkCollision(x1, y1, x2, y2, radius) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius;
}
   

    function angleToB(laser) {
        return Math.atan2(pointB.y - laser.startY, pointB.x - laser.startX);
    }

    function distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function increaseSizeAndMove() {
        currentSize += 2;
        currentPosition += 2;
        laserCooldown += 1;

        if (currentSize > maxSize) {
            currentSize = 0;
            initializeRandomPosition();
            collisionDetected = false;  // Reset the collision detection
        }

        if (currentPosition > distance(pointA, pointB) || collisionDetected) {
            currentPosition = 0;
            if (collisionDetected) {
                drawExplosion(pointA.x, pointA.y);
            }

            // Reiniciar posición central
            pointA = { x: canvas.width / 2, y: canvas.height / 2 };
            currentSize = 0;
            initializeRandomPosition();
            collisionDetected = false;  // Reset the collision detection
        }

        // Draw explosion and reset position if collision is detected
        

        draw();
    }


    function initializeRandomPosition() {
        const minDistanceFromCenter = 600;  // Ajusta según sea necesario
        
        // Establecer nueva posición de B que esté fuera del círculo de acción del userLaser
        do {
            pointB = { x: Math.random() * (canvas.width - currentSize), y: Math.random() * (canvas.height - currentSize) };
        } while (distance(pointA, pointB) < minDistanceFromCenter);
    }

    function moveTowardsB() {
        const angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        pointA.x += Math.cos(angle) * (currentPosition / 30);
        pointA.y += Math.sin(angle) * (currentPosition / 30);
    
        currentPosition += 2;
        if (currentPosition > distance(pointA, pointB)) {
            currentPosition = 0;
            if (!collisionDetected) {
                // Restablecer la posición central solo si no ha habido colisión
                pointA = { x: canvas.width / 2, y: canvas.height / 2 };
            }
            currentSize = 0;
            initializeRandomPosition();
            collisionDetected = false;
        }
    }
    

    let score = 0;


    function updateLasers() {
        for (let i = 0; i < lasers.length; i++) {
            const laser = lasers[i];
            laser.startX += Math.cos(angleToB(laser)) * 20;
            laser.startY += Math.sin(angleToB(laser)) * 20;

            if (distance({ x: laser.startX, y: laser.startY }, pointB) < 10) {
                lasers.splice(i, 1);
                i--;
            }
        }
    }


    function fireLaser() {
        lasers.push({ startX: pointA.x - currentSize / 2, startY: pointA.y - currentSize / 2 });
    }

    function drawLasers() {
        for (let i = 0; i < lasers.length; i++) {
            const laser = lasers[i];
            drawLaser(laser.startX, laser.startY);
        }
    }

    function drawLaser(startX, startY) {
        ctx.beginPath();
        ctx.arc(startX, startY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    function draw() {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        drawCrosshair();

        ctx.fillStyle = 'green';
        ctx.font = '20px Arial';
        ctx.fillText('A', pointA.x, pointA.y);
        ctx.fillText('B', pointB.x, pointB.y);

        if (enemyImg.complete && tieImage.complete) {
            ctx.drawImage(enemyImg, pointA.x - currentSize / 2, pointA.y - currentSize / 2, currentSize, currentSize * (enemyImg.height / enemyImg.width));

            drawLasers();
            ctx.drawImage(tieImage, 0, 0, canvas.width, canvas.height);
        }

        moveTowardsB();

        if (laserCooldown >= 15) {
            fireLaser();
            laserCooldown = 0;
        }

        updateLasers();
        updateUserLaser();
        
        requestAnimationFrame(increaseSizeAndMove);
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(tieImage, 0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 550;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        const squareWidth = 900;
        const squareHeight = 250;

        const squareTopLeft = { x: centerX - squareWidth / 2, y: centerY - squareHeight / 2 };
        const squareTopRight = { x: centerX + squareWidth / 2, y: centerY - squareHeight / 2 };
        const squareBottomLeft = { x: centerX - squareWidth / 2, y: centerY + squareHeight / 2 };
        const squareBottomRight = { x: centerX + squareWidth / 2, y: centerY + squareHeight / 2 };

        const rectTopLeft = { x: crosshair.x - crosshair.width / 2, y: crosshair.y - crosshair.height / 2 };
        const rectTopRight = { x: crosshair.x + crosshair.width / 2, y: crosshair.y - crosshair.height / 2 };
        const rectBottomLeft = { x: crosshair.x - crosshair.width / 2, y: crosshair.y + crosshair.height / 2 };
        const rectBottomRight = { x: crosshair.x + crosshair.width / 2, y: crosshair.y + crosshair.height / 2 };

        if (userlaser.isShooting) {
            console.log("User is shooting!");
            drawUserLaser(squareTopLeft.x, squareTopLeft.y, rectTopLeft.x, rectTopLeft.y);
            drawUserLaser(squareTopRight.x, squareTopRight.y, rectTopRight.x, rectTopRight.y);
            drawUserLaser(squareBottomLeft.x, squareBottomLeft.y, rectBottomLeft.x, rectBottomLeft.y);
            drawUserLaser(squareBottomRight.x, squareBottomRight.y, rectBottomRight.x, rectBottomRight.y);
        }

        drawCrosshair();
        updateUserLaser();
        

        requestAnimationFrame(gameLoop);
    }
    

    gameLoop();
    requestAnimationFrame(increaseSizeAndMove);
});
