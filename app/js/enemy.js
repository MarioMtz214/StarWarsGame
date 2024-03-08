document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var enemyImg = new Image();
    enemyImg.src = '../app/img/front-x-wing.png';

    var currentSize = 0;
    var maxSize = 400;
    var currentPosition = 0;
    var laserCooldown = 0;
    var lasers = [];

    var pointA = { x: canvas.width / 2, y: canvas.height / 2 };
    var pointB = { x: Math.random() * (canvas.width - currentSize), y: Math.random() * (canvas.height - currentSize) };

    function increaseSizeAndMove() {
        currentSize += 2;
        currentPosition += 1;
        laserCooldown += 1;

        if (currentSize > maxSize) {
            currentSize = 0;
            initializeRandomPosition();
        }

        if (currentPosition > distance(pointA, pointB)) {
            currentPosition = 0;
            pointA = { x: canvas.width / 2, y: canvas.height / 2 };
            currentSize = 0;
            initializeRandomPosition();
        }

        draw();
    }

    function initializeRandomPosition() {
        pointB = { x: Math.random() * (canvas.width - currentSize), y: Math.random() * (canvas.height - currentSize) };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#000';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'green';
        ctx.font = '20px Arial';
        ctx.fillText('A', pointA.x, pointA.y);
        ctx.fillText('B', pointB.x, pointB.y);

        ctx.drawImage(enemyImg, pointA.x - currentSize / 2, pointA.y - currentSize / 2, currentSize, currentSize);

        moveTowardsB();

        if (laserCooldown >= 15) {
            fireLaser();
            laserCooldown = 0;
        }

        updateLasers();
        drawLasers();

        requestAnimationFrame(increaseSizeAndMove);
    }

    function moveTowardsB() {
        var angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        pointA.x += Math.cos(angle) * (currentPosition / 10);
        pointA.y += Math.sin(angle) * (currentPosition / 10);
    }

    function fireLaser() {
        lasers.push({ startX: pointA.x, startY: pointA.y });
    }

    function updateLasers() {
        for (var i = 0; i < lasers.length; i++) {
            var laser = lasers[i];
            laser.startX += Math.cos(angleToB(laser)) * 20;
            laser.startY += Math.sin(angleToB(laser)) * 20;

            if (distance({ x: laser.startX, y: laser.startY }, pointB) < 10) {
                lasers.splice(i, 1);
                i--;
            }
        }
    }

    function drawLasers() {
        for (var i = 0; i < lasers.length; i++) {
            var laser = lasers[i];
            drawLaser(laser.startX, laser.startY);
        }
    }

    function drawLaser(startX, startY) {
        ctx.beginPath();
        ctx.arc(startX, startY, 3, 0, 2 * Math.PI); // Ajustado el tamaño de los láseres
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    function angleToB(laser) {
        return Math.atan2(pointB.y - laser.startY, pointB.x - laser.startX);
    }

    function distance(point1, point2) {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw();
});
