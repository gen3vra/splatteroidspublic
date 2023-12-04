var Pool = (function () {
    var create = function (type, size) {
        var obj = Object.create(def);
        obj.init(type, size);

        return obj;
    };

    var def = {
        _type: null,
        _size: null,
        _pointer: null,
        _elements: null,

        init: function (type, size) {
            this._type = type;
            this._size = size;
            this._pointer = size;
            this._elements = [];

            var i = 0;
            var length = this._size;

            for (i; i < length; ++i) {
                this._elements[i] = this._type.create();
            }
        },

        getElement: function () {
            if (this._pointer > 0) return this._elements[--this._pointer];

            return null;
        },

        disposeElement: function (obj) {
            this._elements[this._pointer++] = obj;
        }
    };

    return {
        create: create
    };
}());

var Vec2D = (function () {
    var create = function (x, y) {
        var obj = Object.create(def);
        obj.setXY(x, y);

        return obj;
    };

    var def = {
        _x: 1,
        _y: 0,

        getX: function () {
            return this._x;
        },

        setX: function (value) {
            this._x = value;
        },

        getY: function () {
            return this._y;
        },

        setY: function (value) {
            this._y = value;
        },

        setXY: function (x, y) {
            this._x = x;
            this._y = y;
        },

        getLength: function () {
            return Math.sqrt(this._x * this._x + this._y * this._y);
        },

        setLength: function (length) {
            var angle = this.getAngle();
            this._x = Math.cos(angle) * length;
            this._y = Math.sin(angle) * length;
        },

        getAngle: function () {
            return Math.atan2(this._y, this._x);
        },

        setAngle: function (angle) {
            var length = this.getLength();
            this._x = Math.cos(angle) * length;
            this._y = Math.sin(angle) * length;
        },

        add: function (vector) {
            this._x += vector.getX();
            this._y += vector.getY();
        },

        sub: function (vector) {
            this._x -= vector.getX();
            this._y -= vector.getY();
        },

        mul: function (value) {
            this._x *= value;
            this._y *= value;
        },

        div: function (value) {
            this._x /= value;
            this._y /= value;
        }
    };

    return {
        create: create
    };
}());

var Particle = (function () {
    var create = function () {
        var obj = Object.create(def);
        obj.radius = 2;
        obj.color = playerColor;
        obj.lifeSpan = 0;
        obj.fric = 0.98;
        obj.pos = Vec2D.create(0, 0);
        obj.vel = Vec2D.create(0, 0);
        obj.blacklisted = false;

        return obj;
    };

    var def = {
        radius: null,
        color: null,
        lifeSpan: null,
        fric: null,
        pos: null,
        vel: null,
        blacklisted: null,

        update: function () {
            this.pos.add(this.vel);
            this.vel.mul(this.fric);
            this.radius -= 0.1;

            if (this.radius < 0.1) this.radius = 0.1;

            if (this.lifeSpan-- < 0) {
                this.blacklisted = true;
            }
        },

        reset: function () {
            this.blacklisted = false;
        }
    };

    return {
        create: create
    };
}());

var Bullet = (function () {
    var create = function () {
        var obj = Object.create(def);
        obj.radius = 4;
        obj.color = playerColor;
        obj.pos = Vec2D.create(0, 0);
        obj.vel = Vec2D.create(0, 0);
        obj.blacklisted = false;
        obj.isEnemyBullet = false;
        return obj;
    };

    var def = {
        radius: null,
        color: null,
        pos: null,
        vel: null,
        blacklisted: null,

        initPlayerBullet: function () {
            this.isEnemyBullet = false;
            this.color = playerColor;
        },
        initEnemyBullet: function (enemy) {
            this.isEnemyBullet = true;
            switch (enemy.enemyType) {
                case 0:
                    this.color = enemyColor;
                    break;
                case 1:
                    this.color = enemyOverrideColor;
                    break;
                case 2:
                    this.color = enemyScaryOverrideColor;
                    break;
            }
        },
        update: function () {
            this.pos.add(this.vel);
        },

        renderSelf: function () {
            if (this.blacklisted) return;
            context.beginPath();
            context.strokeStyle = this.color;
            context.arc(this.pos.getX() >> 0, this.pos.getY() >> 0, this.radius, 0, doublePI);
            if (Math.random() > 0.2) context.stroke();
            context.closePath();
        },

        reset: function () {
            this.blacklisted = false;
        }
    };

    return {
        create: create
    };
}());

var Asteroid = (function () {
    var create = function () {
        var obj = Object.create(def);
        obj.radius = 40;
        // Per asteroid color
        //obj.color = asteroidColor;
        obj.pos = Vec2D.create(0, 0);
        obj.vel = Vec2D.create(0, 0);
        obj.blacklisted = false;
        obj.type = 'b';
        obj.sides = (Math.random() * 2 + 7) >> 0;
        obj.angle = 0;
        obj.angleVel = (1 - Math.random() * 2) * 0.01;

        return obj;
    };

    var def = {
        radius: null,
        color: null,
        pos: null,
        vel: null,
        blacklisted: null,
        type: null,
        sides: null,
        angle: null,
        angleVel: null,

        update: function () {
            this.pos.add(this.vel);
            this.angle += this.angleVel;
        },
        reset: function () {
            this.blacklisted = false;
        }
    };

    return {
        create: create
    };
}());

var Ship = (function () {
    var create = function (x, y, ref) {
        var obj = Object.create(def);
        obj.ref = ref;
        obj.angle = 0;
        obj.pos = Vec2D.create(x, y);
        obj.vel = Vec2D.create(0, 0);
        obj.thrust = Vec2D.create(0, 0);
        obj.invincible = false;
        obj.hasDied = false;
        obj.radius = 8;
        obj.idleDelay = 0;
        obj.isSpectating = false;

        return obj;
    };

    var def = {
        angle: null,
        pos: null,
        vel: null,
        thrust: null,
        ref: null,
        bulletDelay: null,
        hasDied: null,
        radius: null,

        update: function () {
            this.vel.add(this.thrust);
            this.pos.add(this.vel);

            if (this.vel.getLength() > 5) this.vel.setLength(5);

            ++this.bulletDelay;

            if (this.hasDied) {
                if (++this.idleDelay > 230) {
                    this.idleDelay = 0;
                    this.ref.resetGame();
                }
            }

            if (this.hasDied)
                return;

            if (keySpectate && !globalKeyToggleFrameLock) {
                this.toggleSpectate();
                globalKeyToggleFrameLock = true;
            }
        },

        toggleSpectate: function () {
            this.isSpectating = !this.isSpectating;

            if (this.isSpectating) {
                this.pos.setXY(screenWidth >> 1, screenHeight >> 1);
                this.vel.setXY(0, 0);
                this.invincible = true;
            } else {
                this.invincible = false;
            }
        },

        shoot: function () {
            if (this.bulletDelay > 5) {
                this.ref.generateShot();
                this.bulletDelay = 0;
            }
        },
        doDeath: function () {
            this.hasDied = true;
            gameState = 2;
            generateShipExplosion();

            visualDeaths++;
            updateVisualStats();
            saveLocalData();
        },
        init: function () {

        },
        reset: function () {
            this.pos.setXY(screenWidth >> 1, screenHeight >> 1);
            this.vel.setXY(0, 0);
            this.hasDied = false;
        },

        renderSelf: function () {
            if (this.hasDied)
                return;
            context.save();
            context.translate(this.pos.getX() >> 0, this.pos.getY() >> 0);
            context.rotate(this.angle);
            context.strokeStyle = (this.invincible) ? 'rgba(0,0,0,0)' : playerColor;
            context.lineWidth = (Math.random() > 0.9) ? 4 : 2;
            context.beginPath();
            context.moveTo(10, 0);
            context.lineTo(-10, -10);
            context.lineTo(-10, 10);
            context.lineTo(10, 0);
            context.stroke();
            context.closePath();

            context.restore();
        }
    };

    return {
        create: create
    };
}());

var EnemyShip1 = (function () {
    var create = function (x, y, ref) {
        var obj = Object.create(def);
        obj.ref = ref;
        obj.angle = 0;
        obj.pos = Vec2D.create(x, y);
        obj.vel = Vec2D.create(0, 0);
        obj.thrust = Vec2D.create(0, 0);
        obj.hasDied = false;
        obj.enemyRadius = 13;
        obj.radius = obj.enemyRadius;
        obj.idleDelay = 0;
        obj.isMovingForward = false;
        obj.isRotatingLeft = false;
        obj.isRotatingRight = false;
        obj.isShooting = false;
        obj.boringTimes = 0;
        return obj;
    };

    var def = {
        angle: null,
        pos: null,
        vel: null,
        thrust: null,
        ref: null,
        bulletDelay: null,
        hasDied: null,
        radius: null,
        enemyRadius: null,
        actionTimerMin: null,
        actionTimerMax: null,
        actionTimerCurrent: 999,
        actionTimer: 0,
        enemyType: 0,
        overrideColor: null,

        update: function () {
            if (this.hasDied)
                return;
            this.vel.add(this.thrust);
            this.pos.add(this.vel);

            if (this.vel.getLength() > 3 && this.enemyType != 2)
                this.vel.setLength(3);
            else if (this.vel.getLength() > 1 && this.enemyType == 2)
                this.vel.setLength(0.5);

            ++this.bulletDelay;
            ++this.actionTimer;

            if (this.enemyType != 2) {
                if (this.actionTimer > this.actionTimerCurrent) {
                    this.actionTimer = 0;
                    this.actionTimerCurrent = Math.random() * (this.actionTimerMax - this.actionTimerMin) + this.actionTimerMin;
                    this.chooseRandomAction();
                }
            }

            if (this.enemyType == 2) {
                var roughAsteroidPositions = [];
                for (var i = 0; i < asteroids.length; i++) {
                    var asteroid = asteroids[i];
                    if (asteroid.radius > 1) {
                        roughAsteroidPositions.push(asteroid.pos);
                    }
                }


                this.isMovingForward = false;
                this.isRotatingLeft = false;
                this.isRotatingRight = false;

                for (var i = 0; i < roughAsteroidPositions.length; i++) {
                    var asteroidPos = roughAsteroidPositions[i];

                    var distanceToAsteroid = Math.sqrt(Math.pow(this.pos.getX() - asteroidPos.getX(), 2) + Math.pow(this.pos.getY() - asteroidPos.getY(), 2));
                    var angleToAsteroid = Math.atan2(asteroidPos.getY() - this.pos.getY(), asteroidPos.getX() - this.pos.getX());
                    if (distanceToAsteroid < 400) {
                        this.shoot();
                        shouldBeMoving = true;

                        if (this.angle + 5 > angleToAsteroid && this.actionTimer > this.actionTimerCurrent) {
                            this.isRotatingLeft = true;
                            this.isRotatingRight = false;
                        } else if (this.angle - 5 < angleToAsteroid && this.actionTimer > this.actionTimerCurrent) {
                            this.isRotatingLeft = false;
                            this.isRotatingRight = true;
                        }

                        this.isMovingForward = true;
                    }
                }
                if (this.actionTimerCurrent > this.actionTimerCurrent) {
                    this.actionTimerCurrent = Math.random() * (this.actionTimerMax - this.actionTimerMin) + this.actionTimerMin;
                    this.actionTimer = 0;
                }
            }
        },

        shoot: function () {
            let enemyBulletDelay = 100;
            if (this.enemyType == 2) {
                enemyBulletDelay = 25;
            }
            if (this.bulletDelay > enemyBulletDelay) {
                this.ref.generateEnemyShot(this);
                this.bulletDelay = 0;
            }
        },
        chooseRandomAction: function () {
            if (this.enemyType == 1) {
                this.isMovingForward = false;
                this.isRotatingLeft = false;
                this.isRotatingRight = false;
                this.isShooting = false;
            }

            var randomAction = Math.floor(Math.random() * 4);
            if (this.boringTimes > 2) {
                randomAction = 0;
                this.boringTimes = 0;
            }
            switch (randomAction) {
                case 0:
                    this.isMovingForward = true;
                    break;
                case 1:
                    this.isRotatingLeft = true;
                    this.boringTimes++;
                    break;
                case 2:
                    this.isRotatingRight = true;
                    this.boringTimes++;
                    break;
                case 3:
                    this.isShooting = true;
                    break;
            }
            if (this.enemyType == 0) {
                if (Math.random() > 0.75) {
                    this.isMovingForward = false;
                }
                if (Math.random() > 0.225) {
                    this.isRotatingLeft = false;
                }
                if (Math.random() > 0.225) {
                    this.isRotatingRight = false;
                }
                if (Math.random() > 0.3) {
                    this.isShooting = false;
                }
            }
        },
        renderSelf: function () {
            if (this.hasDied)
                return;
            context.save();
            context.translate(this.pos.getX() >> 0, this.pos.getY() >> 0);
            context.rotate(this.angle);

            switch (this.enemyType) {
                case 0:
                    context.strokeStyle = enemyColor;
                    break;
                case 1:
                    context.strokeStyle = enemyOverrideColor;
                    break;
                case 2:
                    context.strokeStyle = enemyScaryOverrideColor;
                    break;
            }
            context.lineWidth = (Math.random() > 0.9) ? 2 : 1;
            context.beginPath();
            context.moveTo(10, 0);
            context.lineTo(-10, -10);
            context.lineTo(-10, 10);
            context.lineTo(10, 0);
            context.stroke();
            context.closePath();

            context.restore();

        },
        doDeath: function () {
            this.hasDied = true;
            generateEnemyExplosion(this);
            this.isMovingForward = false;
            this.isRotatingLeft = false;
            this.isRotatingRight = false;
            this.isShooting = false;
            this.radius = null;
            this.angle = 0;
            visualEnemyShips++;
            saveLocalData();
            updateVisualStats();
        },
        setenemyType: function () {
            let randomenemyType = Math.random();
            if (randomenemyType > 0.9) {
                this.enemyType = 2;
                this.actionTimerMin = 1;
                this.actionTimerMax = 50;
                this.overrideColor = enemyScaryOverrideColor;
            } else if (randomenemyType > 0.7) {
                this.enemyType = 1;
                this.actionTimerMin = 1;
                this.actionTimerMax = 50;
                this.overrideColor = enemyOverrideColor;

                this.isMovingForward = true;
            } else {
                this.enemyType = 0;
                this.actionTimerMin = 5;
                this.actionTimerMax = 75;
                this.actionTimer = 999;
                this.chooseRandomAction();
            }

            if (this.enemyType == 0)
                this.overrideColor = null;

        },
        init: function () {
            this.setenemyType();
        },
        reset: function () {
            this.pos.setXY(Math.random() * screenWidth, Math.random() * screenHeight);
            this.vel.setXY(0, 0);
            this.hasDied = false;
            this.radius = this.enemyRadius;
            this.setenemyType();
        }
    };

    return {
        create: create
    };
}());

var playerColor = '#f1b8f2';
var asteroidColor = '#f79588';
var enemyColor = '#8896f7';
var enemyBulletColor = '#f97079';
var enemyOverrideColor = '#f97079';
var enemyScaryOverrideColor = '#FF0000';
var bgColor = '#000000';

var canvas;
var context;
var screenWidth;
var screenHeight;
var doublePI = Math.PI * 2;

// Game
// Game state can be stopped, running, or game over
// 0 = start/stopped, 1 = running, 2 = game over
var gameState = 0;
var ship;

var enemyShipArray = [];

var particlePool;
var particles;

var bulletPool;
var bullets;

var asteroidPool;
var asteroids = [];

var hScan;
var asteroidVelFactor = 0;
var enemySpawnTimer = 1000 * 8;

// Controls
var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;
var keySpace = false;
var keyShift = false;
var keySpectate = false;
var globalKeyToggleFrameLock = false;

window.getAnimationFrame = function (callback) {
    window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    window.setTimeout(callback, 1);
}

window.onload = function () {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    window.onresize();

    setupGame();
};

window.onresize = function () {
    if (!canvas) return;

    screenWidth = canvas.clientWidth;
    screenHeight = canvas.clientHeight;

    canvas.width = screenWidth;
    canvas.height = screenHeight;

    hScan = (screenHeight / 4) >> 0;
};

// load localStorage numbers for 'rocks', 'deaths', 'enemyShips'
function loadLocalData() {
    if (localStorage.getItem("rocks") != null) {
        visualRocks = localStorage.getItem("rocks");
    }
    if (localStorage.getItem("deaths") != null) {
        visualDeaths = localStorage.getItem("deaths");
    }
    if (localStorage.getItem("enemyShips") != null) {
        visualEnemyShips = localStorage.getItem("enemyShips");
    }

    if (localStorage.getItem("customPlayerColor") != null) {
        playerColor = localStorage.getItem("customPlayerColor");
    }
    if (localStorage.getItem("customAsteroidColor") != null) {
        asteroidColor = localStorage.getItem("customAsteroidColor");
    }
    if (localStorage.getItem("customEnemyColor") != null) {
        enemyColor = localStorage.getItem("customEnemyColor");
    }
    if (localStorage.getItem("customEnemyColor2") != null) {
        enemyOverrideColor = localStorage.getItem("customEnemyColor2");
    }
    if (localStorage.getItem("customEnemyColor3") != null) {
        enemyScaryOverrideColor = localStorage.getItem("customEnemyColor3");
    }

    updateVisualStats();
    updateSettingsStart();
}

function saveLocalData() {
    localStorage.setItem("rocks", visualRocks);
    localStorage.setItem("deaths", visualDeaths);
    localStorage.setItem("enemyShips", visualEnemyShips);

    localStorage.setItem("customPlayerColor", playerColor);
    localStorage.setItem("customAsteroidColor", asteroidColor);
    localStorage.setItem("customEnemyColor", enemyColor);
    localStorage.setItem("customEnemyColor2", enemyOverrideColor);
    localStorage.setItem("customEnemyColor3", enemyScaryOverrideColor);
}

function hasUpdatedCustomColors() {
    saveLocalData();
}

// Start all game logic
function setupGame() {
    loadLocalData();
    keyboardInit();
    particleInit();
    bulletInit();
    shipInit();
    enemyInit();
    asteroidInit();

    loop();
}

function keyboardInit() {
    window.onkeydown = function (e) {
        switch (e.keyCode) {
            //key A or LEFT
            case 65:
            case 37:
                keyLeft = true;
                break;
            //key W or UP
            case 87:
            case 38:
                keyUp = true;
                break;
            //key D or RIGHT
            case 68:
            case 39:
                keyRight = true;
                break;
            //key S or DOWN
            case 83:
            case 40:
                keyDown = true;
                break;
            //key Space
            case 32:
            case 75:
                keySpace = true;
                break;
            //key Shift
            case 16:
                keyShift = true;
                break;
            // key spectate (F4)
            case 115:
                keySpectate = true;
                break;
        }

        e.preventDefault();
    };

    window.onkeyup = function (e) {
        switch (e.keyCode) {
            //key A or LEFT
            case 65:
            case 37:
                keyLeft = false;
                break;
            //key W or UP
            case 87:
            case 38:
                keyUp = false;
                break;
            //key D or RIGHT
            case 68:
            case 39:
                keyRight = false;
                break;
            //key S or DOWN
            case 83:
            case 40:
                keyDown = false;
                break;
            //key Space
            case 75:
            case 32:
                keySpace = false;
                break;
            //key Shift
            case 16:
                keyShift = false;
                break;
            // key spectate (F4)
            case 115:
                keySpectate = false;
                globalKeyToggleFrameLock = false;
                break;
        }

        e.preventDefault();
    };
}

function particleInit() {
    particlePool = Pool.create(Particle, 500);
    particles = [];
}

function bulletInit() {
    bulletPool = Pool.create(Bullet, 100);
    bullets = [];

}

function asteroidInit() {
    asteroidPool = Pool.create(Asteroid, 25);
    asteroids = [];
}

function shipInit() {
    ship = Ship.create(screenWidth >> 1, screenHeight >> 1, this);
    ship.init();
}

function enemyInit() {
    createNewEnemy();
    setInterval(function () {
        if (enemyShipArray.length < 2) {
            createNewEnemy();
        } else {
            for (var i = 0; i < enemyShipArray.length; i++) {
                var enemyShip = enemyShipArray[i];
                if (enemyShip.hasDied) {
                    enemyShip.reset();
                    break;
                }
            }
        }
    }, enemySpawnTimer);
}

function createNewEnemy(type) {
    if (type)
        console.log("unimplemented");

    var enemyShip = EnemyShip1.create(Math.random() * screenWidth, Math.random() * screenHeight, this);
    enemyShip.init();
    enemyShipArray.push(enemyShip);

    enemySpawnTimer -= 100;
    if (enemySpawnTimer < 5000) enemySpawnTimer = 5000;
}

function loop() {
    if (gameState != 1) {
        if (keySpace && gameState == 0 || isMobile) {
            gameState = 1;
            if (isMobile)
                ship.toggleSpectate();
        } else if (!keySpace && gameState == 0) {
            renderIntroMenu();
            getAnimationFrame(loop);
            return;
        }
        if (gameState == 2) {
            renderGameOver();
        }
    }

    updateShip();
    updateEnemyShips();
    updateParticles();
    updateBullets();
    updateAsteroids();

    checkCollisions();

    render();

    getAnimationFrame(loop);
}

function renderIntroMenu() {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, screenWidth, screenHeight);
    context.fillStyle = playerColor;

    context.font = "bold 30px monospace";
    context.fillText("Splatteroids", screenWidth / 2 - 75, screenHeight / 2);
    context.font = "16px monospace";
    context.fillText("Press Space to Start", screenWidth / 2 - 75, screenHeight / 2 + 30);
    context.font = "12px monospace";
    context.fillText("Gen 🌹", screenWidth / 2 - 75, screenHeight / 2 + 50);
}
function renderGameOver() {
    context.fillStyle = enemyOverrideColor;
    context.font = "bold 30px monospace";
    context.fillText("Exploded", screenWidth / 2 - 75, screenHeight / 2);
    context.font = "16px monospace";
    context.fillText("Game restarting...", screenWidth / 2 - 75, screenHeight / 2 + 30);
}

function updateShip() {
    ship.update();

    if (ship.hasDied) return;

    if (keySpace) ship.shoot();
    if (keyLeft && keyShift) ship.angle -= 0.1;
    else if (keyLeft) ship.angle -= 0.05;
    if (keyRight && keyShift) ship.angle += 0.1;
    else if (keyRight) ship.angle += 0.05;

    if (keyUp) {
        ship.thrust.setLength(0.1);
        ship.thrust.setAngle(ship.angle);

        generateThrustParticle();
    } else {
        ship.vel.mul(0.94);
        ship.thrust.setLength(0);
    }

    if (ship.pos.getX() > screenWidth) ship.pos.setX(0);
    else if (ship.pos.getX() < 0) ship.pos.setX(screenWidth);

    if (ship.pos.getY() > screenHeight) ship.pos.setY(0);
    else if (ship.pos.getY() < 0) ship.pos.setY(screenHeight);
}

function updateEnemyShips() {
    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        enemyShip.update();
    }

    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        if (enemyShip.isMovingForward) {
            enemyShip.thrust.setLength(0.1);
            enemyShip.thrust.setAngle(enemyShip.angle);
            generateEnemyParticle(enemyShip);
        } else {
            enemyShip.vel.mul(0.94);
            enemyShip.thrust.setLength(0);
        }
        if (enemyShip.isRotatingLeft) enemyShip.angle -= 0.1;
        if (enemyShip.isRotatingRight) enemyShip.angle += 0.1;
        if (enemyShip.isShooting) enemyShip.shoot();
    }

    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        if (enemyShip.pos.getX() > screenWidth) enemyShip.pos.setX(0);
        else if (enemyShip.pos.getX() < 0) enemyShip.pos.setX(screenWidth);

        if (enemyShip.pos.getY() > screenHeight) enemyShip.pos.setY(0);
        else if (enemyShip.pos.getY() < 0) enemyShip.pos.setY(screenHeight);
    }
}

function generateThrustParticle() {
    var p = particlePool.getElement();

    if (!p) return;

    p.radius = Math.random() * 3 + 2;
    p.color = playerColor;
    p.lifeSpan = 50;
    p.pos.setXY(ship.pos.getX() + Math.cos(ship.angle) * -14, ship.pos.getY() + Math.sin(ship.angle) * -14);
    p.vel.setLength(8 / p.radius);
    p.vel.setAngle(ship.angle + (1 - Math.random() * 2) * (Math.PI / 18));
    p.vel.mul(-1);

    particles[particles.length] = p;
}

function generateEnemyParticle(enemy) {
    var p = particlePool.getElement();

    if (!p) return;

    p.radius = Math.random() * 3 + 2;
    switch (enemy.enemyType) {
        case 0:
            p.color = enemyColor;
            break;
        case 1:
            p.color = enemyOverrideColor;
            break;
        case 2:
            p.color = enemyScaryOverrideColor;
            break;
    }
    p.lifeSpan = 40;
    p.pos.setXY(enemy.pos.getX() + Math.cos(enemy.angle) * -14, enemy.pos.getY() + Math.sin(enemy.angle) * -14);
    p.vel.setLength(8 / p.radius);
    p.vel.setAngle(enemy.angle + (1 - Math.random() * 2) * (Math.PI / 18));
    p.vel.mul(-1);

    particles[particles.length] = p;
}


function updateParticles() {
    var i = particles.length - 1;

    for (i; i > -1; --i) {
        var p = particles[i];

        if (p.blacklisted) {
            p.reset();

            particles.splice(particles.indexOf(p), 1);
            particlePool.disposeElement(p);

            continue;
        }

        p.update();
    }
}

function updateBullets() {
    var i = bullets.length - 1;

    for (i; i > -1; --i) {
        var b = bullets[i];

        if (b.blacklisted) {
            b.reset();

            bullets.splice(bullets.indexOf(b), 1);
            bulletPool.disposeElement(b);

            continue;
        }

        b.update();

        if (b.pos.getX() > screenWidth) b.blacklisted = true;
        else if (b.pos.getX() < 0) b.blacklisted = true;

        if (b.pos.getY() > screenHeight) b.blacklisted = true;
        else if (b.pos.getY() < 0) b.blacklisted = true;
    }
}

function updateAsteroids() {
    var i = asteroids.length - 1;

    for (i; i > -1; --i) {
        var a = asteroids[i];

        if (a.blacklisted) {
            a.reset();

            asteroids.splice(asteroids.indexOf(a), 1);
            asteroidPool.disposeElement(a);

            continue;
        }

        a.update();

        if (a.pos.getX() > screenWidth + a.radius) a.pos.setX(-a.radius);
        else if (a.pos.getX() < -a.radius) a.pos.setX(screenWidth + a.radius);

        if (a.pos.getY() > screenHeight + a.radius) a.pos.setY(-a.radius);
        else if (a.pos.getY() < -a.radius) a.pos.setY(screenHeight + a.radius);
    }

    if (asteroids.length < 5) {
        var factor = (Math.random() * 2) >> 0;

        generateAsteroid(screenWidth * factor, screenHeight * factor, 60, 'b');
    }
}

function generateAsteroid(x, y, radius, type) {
    var a = asteroidPool.getElement();

    if (!a) return;

    a.radius = radius;
    a.type = type;
    a.pos.setXY(x, y);
    a.vel.setLength(0.3 + asteroidVelFactor);
    a.vel.setAngle(Math.random() * (Math.PI * 2));

    asteroids[asteroids.length] = a;
    asteroidVelFactor += 0.05;
    if (asteroidVelFactor > 2.25) asteroidVelFactor = 2.25;
}

function checkCollisions() {
    checkBulletCollisions();
    checkShipAsteroidCollisions();
    checkShipOnShipCollision();
}

function checkBulletCollisions() {
    var i = bullets.length - 1;
    var j;

    for (i; i > -1; --i) {
        j = asteroids.length - 1;

        for (j; j > -1; --j) {
            var b = bullets[i];
            var a = asteroids[j];

            if (checkDistanceCollision(b, a)) {
                b.blacklisted = true;

                destroyAsteroid(a);
            }
        }

        var s = ship;

        if (checkDistanceCollision(b, s)) {
            b.blacklisted = true;
            if (!s.hasDied && !s.invincible && b.isEnemyBullet) {
                s.doDeath();

                generateShipExplosion();
            }
        }

        for (var k = 0; k < enemyShipArray.length; k++) {
            var enemyShip = enemyShipArray[k];
            if (checkDistanceCollision(b, enemyShip)) {
                b.blacklisted = true;
                if (enemyShip.hasDied) continue;

                enemyShip.doDeath();

                generateEnemyExplosion(enemyShip);
            }
        }
    }
}

function checkShipAsteroidCollisions() {
    var i = asteroids.length - 1;

    for (i; i > -1; --i) {
        var a = asteroids[i];
        var s = ship;

        if (checkDistanceCollision(a, s)) {
            if (s.hasDied || s.invincible) continue;

            s.doDeath();

            destroyAsteroid(a);
        }
    }

    // check enemies with asteroids
    /*
    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        for (var j = 0; j < asteroids.length; j++) {
            var a = asteroids[j];
            if (checkDistanceCollision(a, enemyShip)) {
                if (enemyShip.hasDied) continue;

                enemyShip.doDeath();

                generateEnemyExplosion(enemyShip);
                destroyAsteroid(a);
            }
        }
    }*/
}

function checkShipOnShipCollision() {
    var s = ship;
    // check every ship
    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        if (checkDistanceCollision(s, enemyShip)) {
            if ((s.hasDied || s.invincible) || enemyShip.hasDied) continue;

            s.doDeath();
            enemyShip.doDeath();
        }
    }
    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        for (var j = 0; j < enemyShipArray.length; j++) {
            var enemyShip2 = enemyShipArray[j];
            if (enemyShip == enemyShip2) continue;
            if (checkDistanceCollision(enemyShip, enemyShip2)) {
                if (enemyShip.hasDied || enemyShip2.hasDied) continue;

                enemyShip.doDeath();
                enemyShip2.doDeath();
            }
        }
    }
}

function generateShipExplosion() {
    var i = 18;

    for (i; i > -1; --i) {
        var p = particlePool.getElement();

        if (!p) return;

        p.radius = Math.random() * 6 + 2;
        p.lifeSpan = 80;
        p.color = playerColor;
        p.vel.setLength(20 / p.radius);
        p.vel.setAngle(ship.angle + (1 - Math.random() * 2) * doublePI);
        p.pos.setXY(ship.pos.getX() + Math.cos(p.vel.getAngle()) * (ship.radius * 0.8), ship.pos.getY() + Math.sin(p.vel.getAngle()) * (ship.radius * 0.8));

        particles[particles.length] = p;
    }
}

function generateEnemyExplosion(enemy) {
    var i = 18;

    for (i; i > -1; --i) {
        var p = particlePool.getElement();

        if (!p) return;

        p.radius = Math.random() * 6 + 2;
        p.lifeSpan = 40;
        switch (enemy.enemyType) {
            case 0:
                p.color = enemyColor;
                break;
            case 1:
                p.color = enemyOverrideColor;
                break;
            case 2:
                p.color = enemyScaryOverrideColor;
                break;
        }
        p.vel.setLength(20 / p.radius);
        p.vel.setAngle(enemy.angle + (1 - Math.random() * 2) * doublePI);
        p.pos.setXY(enemy.pos.getX() + Math.cos(p.vel.getAngle()) * (enemy.radius * 0.8), enemy.pos.getY() + Math.sin(p.vel.getAngle()) * (enemy.radius * 0.8));

        particles[particles.length] = p;
    }
}

function checkDistanceCollision(obj1, obj2) {
    var vx = obj1.pos.getX() - obj2.pos.getX();
    var vy = obj1.pos.getY() - obj2.pos.getY();
    var vec = Vec2D.create(vx, vy);

    if (vec.getLength() < obj1.radius + obj2.radius) {
        return true;
    }

    return false;
}

function destroyAsteroid(asteroid) {
    asteroid.blacklisted = true;

    generateAsteroidExplosion(asteroid);
    resolveAsteroidType(asteroid);

    visualRocks++;
    updateVisualStats();
    saveLocalData();
}

function generateAsteroidExplosion(asteroid) {
    var i = 18;

    for (i; i > -1; --i) {
        var p = particlePool.getElement();

        if (!p) return;

        p.radius = Math.random() * (asteroid.radius >> 2) + 2;
        p.lifeSpan = 40;
        p.color = asteroidColor;
        p.vel.setLength(10 / p.radius);
        p.vel.setAngle(ship.angle + (1 - Math.random() * 2) * doublePI);
        p.pos.setXY(asteroid.pos.getX() + Math.cos(p.vel.getAngle()) * (asteroid.radius * 0.8), asteroid.pos.getY() + Math.sin(p.vel.getAngle()) * (asteroid.radius * 0.8));

        particles[particles.length] = p;
    }
}

function resolveAsteroidType(asteroid) {
    switch (asteroid.type) {
        case 'b':
            generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 40, 'm');
            generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 40, 'm');

            break;

        case 'm':
            generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 20, 's');
            generateAsteroid(asteroid.pos.getX(), asteroid.pos.getY(), 20, 's');

            break;
    }
}

function render() {
    context.fillStyle = bgColor;
    context.globalAlpha = 0.27;
    context.fillRect(0, 0, screenWidth, screenHeight);
    context.globalAlpha = 1;
    renderShip();
    renderEnemyShips();
    renderParticles();
    renderBullets();
    renderAsteroids();
}

function resetRender() {
    context.fillStyle = bgColor;
    context.globalAlpha = 1;
    context.fillRect(0, 0, screenWidth, screenHeight);
}

function renderShip() {
    ship.renderSelf();
}

function renderEnemyShips() {
    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        enemyShip.renderSelf();
    }
}

function renderParticles() {
    var i = particles.length - 1;

    for (i; i > -1; --i) {
        var p = particles[i];

        context.beginPath();
        context.strokeStyle = p.color;
        context.arc(p.pos.getX() >> 0, p.pos.getY() >> 0, p.radius, 0, doublePI);
        if (Math.random() > 0.4) context.stroke();
        context.closePath();
    }
}

function renderBullets() {
    var i = bullets.length - 1;

    for (i; i > -1; --i) {
        var b = bullets[i];
        b.renderSelf();
    }
}

function renderAsteroids() {
    var i = asteroids.length - 1;

    for (i; i > -1; --i) {
        var a = asteroids[i];

        context.beginPath();
        context.lineWidth = (Math.random() > 0.2) ? 4 : 3;
        context.strokeStyle = asteroidColor;

        var j = a.sides;

        context.moveTo((a.pos.getX() + Math.cos(doublePI * (j / a.sides) + a.angle) * a.radius) >> 0, (a.pos.getY() + Math.sin(doublePI * (j / a.sides) + a.angle) * a.radius) >> 0);

        for (j; j > -1; --j) {
            context.lineTo((a.pos.getX() + Math.cos(doublePI * (j / a.sides) + a.angle) * a.radius) >> 0, (a.pos.getY() + Math.sin(doublePI * (j / a.sides) + a.angle) * a.radius) >> 0);

        }
        context.stroke();
        context.closePath();
    }
}

function renderScanlines() {
    var i = hScan;

    context.globalAlpha = 0.05;
    context.lineWidth = 1;

    for (i; i > -1; --i) {
        context.beginPath();
        context.moveTo(0, i * 4);
        context.lineTo(screenWidth, i * 4);
        context.strokeStyle = (Math.random() > 0.0001) ? '#FFF' : '#222';
        context.stroke();
    }

    context.globalAlpha = 1;
}

function generateShot() {
    var b = bulletPool.getElement();
    b.initPlayerBullet();

    if (!b) return;

    b.radius = 1;
    b.pos.setXY(ship.pos.getX() + Math.cos(ship.angle) * 14, ship.pos.getY() + Math.sin(ship.angle) * 14);
    b.vel.setLength(11);
    b.vel.setAngle(ship.angle);

    bullets[bullets.length] = b;
}

function generateEnemyShot(enemy) {
    var b = bulletPool.getElement();
    b.initEnemyBullet(enemy);

    if (!b) return;

    b.radius = 1;
    b.pos.setXY(enemy.pos.getX() + Math.cos(enemy.angle) * 14, enemy.pos.getY() + Math.sin(enemy.angle) * 14);

    switch (enemy.enemyType) {
        case 0:
            b.vel.setLength(6);
            break;
        case 1:
            b.vel.setLength(8);
            break;
        case 2:
            b.vel.setLength(3);
            break;
    }

    b.vel.setAngle(enemy.angle);

    bullets[bullets.length] = b;
}

function resetGame() {
    asteroidVelFactor = 0;

    ship.reset();
    for (var i = 0; i < enemyShipArray.length; i++) {
        var enemyShip = enemyShipArray[i];
        enemyShip.reset();
    }
    resetRender();
    resetAsteroids();
    gameState = 1;
}

function resetAsteroids() {
    var i = asteroids.length - 1;

    for (i; i > -1; --i) {
        var a = asteroids[i];
        a.blacklisted = true;
    }
}