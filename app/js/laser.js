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
     const backgroundSpeed = 1;
     
     // Imágenes de las naves xwing


     function moveBackground() {
         const currentBackgroundPosition = document.body.style.backgroundPosition.split(" ");
         const currentX = parseInt(currentBackgroundPosition[0].replace("px", ""));
         const currentY = parseInt(currentBackgroundPosition[1].replace("px", ""));
 
         // Actualizar la posición del fondo
         const newX = currentX - backgroundSpeed;
         document.body.style.backgroundPosition = `${newX}px ${currentY}px`;
 
         requestAnimationFrame(moveBackground);
     }
 
     // Iniciar el movimiento del fondo
     moveBackground();

    const laser = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        speed: 30,
        isShooting: false,
    };

    const crosshair = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 20,
    };

    const tieImage = new Image();
    tieImage.src = "../app/img/TIE-window.png";

    document.addEventListener("mousemove", function (event) {
        crosshair.x = event.clientX;
        crosshair.y = event.clientY;
    });

    document.addEventListener("keydown", function (event) {
        // Verificar si la tecla presionada es la barra de espacio
        if (event.code === "Space") {
            // Verificar si el clic está dentro del círculo antes de activar el disparo
            const dx = crosshair.x - canvas.width / 2;
            const dy = crosshair.y - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 550) {
                laser.targetX = crosshair.x;
                laser.targetY = crosshair.y;
                laser.isShooting = true;
            }
        }
    });

    function drawLaser(startX, startY, targetX, targetY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(targetX, targetY);

        // Establecer el estilo del láser
        ctx.strokeStyle = "green";
        ctx.lineWidth = 6;

        // Agregar un borde verde al láser
        ctx.shadowColor = "green";
        ctx.shadowBlur = 50;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;

        ctx.stroke();
        ctx.closePath();

        // Restaurar las configuraciones de sombra a los valores predeterminados
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function drawCrosshair() {
        // Solo dibuja el rectángulo si el centro del círculo está dentro del círculo
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

            // Dibuja un borde blanco alrededor del rectángulo
            ctx.beginPath();
            ctx.rect(crosshair.x - crosshair.width / 2 - 1, crosshair.y - crosshair.height / 2 - 1, crosshair.width + 2, crosshair.height + 2);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }

    function updateLaser() {
        if (laser.isShooting) {
            const dx = laser.targetX - canvas.width / 2;
            const dy = laser.targetY - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance <= 550) {
                laser.x += (dx / distance) * laser.speed;
                laser.y += (dy / distance) * laser.speed;
            }

            if (Math.abs(laser.x - laser.targetX) < laser.speed && Math.abs(laser.y - laser.targetY) < laser.speed) {
                laser.isShooting = false;
                laser.x = canvas.width / 2;
                laser.y = canvas.height / 2;
            }
        }
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar la imagen de la nave
        ctx.drawImage(tieImage, 0, 0, canvas.width, canvas.height);

        // Dibujar un círculo con un borde blanco
        ctx.beginPath();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 550;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Calcular las esquinas del cuadrado grande
        const squareWidth = 900;
        const squareHeight = 250;

        const squareTopLeft = { x: centerX - squareWidth / 2, y: centerY - squareHeight / 2 };
        const squareTopRight = { x: centerX + squareWidth / 2, y: centerY - squareHeight / 2 };
        const squareBottomLeft = { x: centerX - squareWidth / 2, y: centerY + squareHeight / 2 };
        const squareBottomRight = { x: centerX + squareWidth / 2, y: centerY + squareHeight / 2 };

        // Calcular las esquinas del rectángulo del puntero
        const rectTopLeft = { x: crosshair.x - crosshair.width / 2, y: crosshair.y - crosshair.height / 2 };
        const rectTopRight = { x: crosshair.x + crosshair.width / 2, y: crosshair.y - crosshair.height / 2 };
        const rectBottomLeft = { x: crosshair.x - crosshair.width / 2, y: crosshair.y + crosshair.height / 2 };
        const rectBottomRight = { x: crosshair.x + crosshair.width / 2, y: crosshair.y + crosshair.height / 2 };

        // Verificar si el láser debe dispararse
        if (laser.isShooting) {
            // Disparar láser desde cada esquina del cuadrado grande hacia cada esquina del rectángulo del puntero
            drawLaser(squareTopLeft.x, squareTopLeft.y, rectTopLeft.x, rectTopLeft.y);
            drawLaser(squareTopRight.x, squareTopRight.y, rectTopRight.x, rectTopRight.y);
            drawLaser(squareBottomLeft.x, squareBottomLeft.y, rectBottomLeft.x, rectBottomLeft.y);
            drawLaser(squareBottomRight.x, squareBottomRight.y, rectBottomRight.x, rectBottomRight.y);
        }

        // Agregar lógica adicional del juego
        drawCrosshair();
        updateLaser();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
