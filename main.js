let ASSET_MANAGER = new AssetManager();
let ON_TITLESCREEN = true;
var font = "VT323"

//For scrolling
//storing both the canvas's coordinates and the player coordinates
let bgX = 0;
let bgY = 0;
let playerX = 0;
let playerY = 0;
let boundHitLeft = false;
let boundHitRight = false;
let boundHitUp = false;
let boundHitDown = false;

//Character Stats
let hp = 100;
let def = 10;
let atk = 10;

function IsOnTitleScreen() { return ON_TITLESCREEN; }

//! ******** Animation Definition ******** */
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }

    let frame = this.currentFrame();
    let xindex = frame % this.sheetWidth;
    let yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth + this.startX,
        yindex * this.frameHeight + this.startY,
        this.frameWidth,
        this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);

    if (this.hitbox !== undefined) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
    }
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

//! ******** Background Definition ******** */
function Background(game, spritesheet) {
    this.x = bgX;
    this.y = bgY;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
}

Background.prototype.draw = function () {
    if(ON_TITLESCREEN) this.ctx.drawImage(this.spritesheet, this.x, this.y);
    else this.ctx.drawImage(this.spritesheet, this.x, this.y, 800 * 2.5, 800 * 2.5);
};

Background.prototype.update = function () {
    if (this.game.userInput.includes(' ')) {
        if(IsOnTitleScreen()) {
            this.spritesheet = ASSET_MANAGER.getAsset("./res/map/Floor1.png");
            document.getElementById('audio').play();
            document.getElementById('audio').volume = 0.5;
            ON_TITLESCREEN = false;
        }
    }

    //this is the scrolling
    //background coordinates for debug
    // console.log("x = " + this.x);
    // console.log("y = " + this.y);
    if(!ON_TITLESCREEN) {
        // Bounds checking for the x axis.
        if (bgX - playerX > 454) {
            this.x = 454;
            boundHitLeft = true;
        } else if (bgX - playerX < -1496) {
            this.x = -1496
            boundHitRight = true;
        } else {
            boundHitLeft = false;
            boundHitRight = false;
            this.x = bgX - playerX;
        }
        // Bounds checking for the y axis.
        if (bgY - playerY > 323) {
            this.y = 323;
            boundHitUp = true;
        } else if (bgY - playerY < -1579) {
            this.y = -1579;
            boundHitDown = true;
        } else {
            boundHitUp = false;
            boundHitDown = false;
            this.y = bgY - playerY;
        }
    }
    
};


//! ******** Skeleton Dagger Sprite Definition ******** */
function SkeletonDagger(game, spritesheet) {
    entityAnimationInit(this, spritesheet);
    this.x = -250;
    this.y = -50;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.baseSpeed = 200;
    this.changeX = false;
    this.changeY = false;
    this.game = game;
    this.ctx = game.ctx;
    this.direction = 'down';
    this.isAttacking = false;
    this.isRecoiling = false;
    this.titleScreenComp = true;
    this.currAnimation = this.animations['idleDown'];
    this.hitbox = new Hitbox(this.x, this.y, 50, 32);
    this.invincibilityFrames = 0;
}

function entityAnimationInit(entity, spritesheet) {
  let animations = [];

  /* Idle animations. */
  animations['idleUp'] = new Animation(spritesheet, 0, 0, 64, 62, 512, 0.6, 2, true, 1);
  animations['idleDown'] = new Animation(spritesheet, 0, 128, 64, 62, 512, 0.5, 2, true, 1);
  animations['idleLeft'] = new Animation(spritesheet, 0, 64, 64, 62, 512, 0.6, 2, true, 1);
  animations['idleRight'] = new Animation(spritesheet, 0, 192, 64, 62, 512, 0.6, 2, true, 1);

  /* Walking animations. */
  animations['walkUp'] = new Animation(spritesheet, 0, 512, 64, 62, 9, 0.15, 9, true, 1);
  animations['walkDown'] = new Animation(spritesheet, 0, 640, 64, 62, 9, 0.15, 9, true, 1);
  animations['walkLeft'] = new Animation(spritesheet, 0, 576, 64, 62, 9, 0.15, 9, true, 1);
  animations['walkRight'] = new Animation(spritesheet, 0, 704, 64, 62, 9, 0.15, 9, true, 1);

  /* Attack animations. */
  animations['attackUp'] = new Animation(spritesheet, 62, 1411, 189, 121, 6, 0.05, 6, true, 1);
  animations['attackDown'] = new Animation(spritesheet, 64, 1790, 189, 121, 6, 0.05, 6, true, 1);
  animations['attackLeft'] = new Animation(spritesheet, 66, 1603, 189, 121, 6, 0.05, 6, true, 1);
  animations['attackRight'] = new Animation(spritesheet, 66, 1985, 189, 121, 6, 0.05, 6, true, 1);

  entity.animations = animations;
}

SkeletonDagger.prototype.update = function () {
    handleInput(this);
    // player coordinates for debug
    // console.log("playerX = " + playerX);
    // console.log("playerY = "  + playerY);
    if (this.changeX) {
        playerX += this.game.clockTick * this.xSpeed;
        if(boundHitLeft) playerX = -454;
        if(boundHitRight) playerX = 1496;
    }
    if (this.changeY) {
        playerY += this.game.clockTick * this.ySpeed;
        if(boundHitUp) playerY = -323;
        if(boundHitDown) playerY = 1579;
    }
    

    updatePlayerHitbox(this);
    drawDebugHitbox(this);
    checkForCollisions(this);
    updateInvincibilityFrames(this);

    // if (this.x > 1024) {
    //     this.x = -64
    // } else if (this.x < -64) {
    //     this.x = 1024;
    // } else if (this.y > 1088) {
    //     this.y = 0;
    // } else if (this.y < 0) {
    //     this.y = 1088;
    // }

    this.changeX = this.changeY = false;

    Entity.prototype.update.call(this);
};

SkeletonDagger.prototype.draw = function () {
    this.currAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
};

function MaleKnightSpear(game,spritesheet) {
    this.x = -200;
    this.y = 80;
    this.speed = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.direction = 'down';
    this.state = "walkDown";
    this.titleScreenComp = true;
    this.currAnimation = new Animation(spritesheet, 0, 384, 64, 62, 512, 0.1, 8, true, 1);
    this.hitbox = new Hitbox(this.x, this.y, 62, 64);
}

MaleKnightSpear.prototype.update = function() {
    let key = this.game.userInput[0];
    switch (key) {
        case ' ':
            this.x = 650;
            break;
    }
    //TODO: make the integers into variables to make it work when they are moving by themselves.
    //NOTE: this is essentially moving the entity furthur or closer to the person according to the postion of the
    //player.
    if(!ON_TITLESCREEN) {
        this.x = 650 - playerX;
        this.y = 80 - playerY;
    }
    updateHitbox(this);
    Entity.prototype.update.call(this);
}

MaleKnightSpear.prototype.draw = function() {
    this.currAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function MaleKnightMace(game,spritesheet) {
    this.x = -200;
    this.y = 80;
    this.speed = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.direction = 'down';
    this.state = "walkDown";
    this.titleScreenComp = true;
    this.currAnimation = new Animation(spritesheet, 0, 1744, 190, 123, 6, 0.1, 6, true, 1);
    this.hitbox = new Hitbox(this.x, this.y, 62, 44);
}

MaleKnightMace.prototype.update = function() {
    let key = this.game.userInput[0];
    switch (key) {
        case ' ':
            this.x = 690;
            break;
    }
    //TODO: make the integers into variables to make it work when they are moving by themselves.
    //NOTE: this is essentially moving the entity furthur or closer to the person according to the postion of the
    //player.
    if(!ON_TITLESCREEN) {
        this.x = 690 - playerX;
        this.y = 80 - playerY;
    }
    Entity.prototype.update.call(this);
};

MaleKnightMace.prototype.draw = function() {
    this.currAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
};


//UI stuff below
function SkeletonHealthUI(game, spritesheet) {
    this.x = -10;
    this.y = -20;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    console.log("drawing ui");
}

SkeletonHealthUI.prototype.draw = function () {
    if(!IsOnTitleScreen()) {
        console.log("drawing ui 2")
        this.ctx.drawImage(this.spritesheet, this.x, this.y, 90, 90);
        this.ctx.font = "25px " + font;
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(hp.toString() + " HP", 52, 33);
    }
}
 
SkeletonHealthUI.prototype.update = function () {};

function SkeletonDefUI(game, spritesheet) {
    this.x = 19;
    this.y = 35;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    console.log("drawing ui");
}

SkeletonDefUI.prototype.draw = function () {
    if(!IsOnTitleScreen()) {
        console.log("drawing ui 2")
        this.ctx.drawImage(this.spritesheet, this.x, this.y, 30, 30);
        this.ctx.font = "25px " + font;
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(def.toString() + " DEF", 52, 56);
    }
}
 
SkeletonDefUI.prototype.update = function () {};

function SkeletonAtkUI(game, spritesheet) {
    this.x = 19;
    this.y = 65;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    console.log("drawing ui");
}

SkeletonAtkUI.prototype.draw = function () {
    if(!IsOnTitleScreen()) {
        console.log("drawing ui 2")
        this.ctx.drawImage(this.spritesheet, this.x, this.y, 25, 25);
        this.ctx.font = "25px " + font;
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(atk.toString() + " ATK", 52, 82);
    }
}
 
SkeletonAtkUI.prototype.update = function () {};
//! ******** Volume Toggle Definition ******** */
function VolumeToggle(game, spritesheet) {
    this.audio = document.getElementById('audio');
    this.spritesheet = spritesheet;
    this.ctx = game.ctx;
    this.state = 'on';
}

VolumeToggle.prototype.update = function () {};

/**
 * Draws the volume on/off icon depending on state.
 * @see https://webplatform.github.io/docs/concepts/programming/drawing_images_onto_canvas/
 *      for overloaded drawImage() parameters
 */
VolumeToggle.prototype.draw = function () {
    if (!IsOnTitleScreen()) {
        if (this.state === 'on') {
            this.ctx.drawImage(this.spritesheet, 48, 0, 47 ,47, 900, 650, 30, 30);
        } else if (this.state === 'off') {
            this.ctx.drawImage(this.spritesheet, 0, 0, 47 ,47, 900, 650, 30, 30);
        }
    }
};

/**
 * Toggles volume state to ON if not playing; sets it to OFF and restarts audio track if it is playing.
 */
VolumeToggle.prototype.flipVolume = function () {
    if(!IsOnTitleScreen()) {
        let isON = this.state == 'on' ? true : false;
        if (isON) {
            this.state = 'off';
            this.audio.pause();
            this.audio.currentTime = 0;
        } else {
            this.state = 'on'
            this.audio.play();
        }
    }
}



//! ******** QUEUE ASSET DOWNLOAD ******** */
// Background images
ASSET_MANAGER.queueDownload("./res/map/titlescreen.jpg");
ASSET_MANAGER.queueDownload("./res/map/proto_map.jpg");
ASSET_MANAGER.queueDownload("./res/map/Floor1.png")
// Character sprites
ASSET_MANAGER.queueDownload("./res/character/skeleton_sword.png");
ASSET_MANAGER.queueDownload("./res/character/male_knight_spear.png");
ASSET_MANAGER.queueDownload("./res/character/male_knight_mace.png");
ASSET_MANAGER.queueDownload("./res/character/skeleton_life.png");
ASSET_MANAGER.queueDownload("./res/character/def_ui.png");
ASSET_MANAGER.queueDownload("./res/character/sword_ui.png");
// Audio assets
ASSET_MANAGER.queueDownload("./res/audio/megalovania.mp3");
ASSET_MANAGER.queueDownload("./res/audio/volume_bgON.png");
ASSET_MANAGER.queueDownload("./res/audio/volume_bgOFF.png");


ASSET_MANAGER.downloadAll(function () {
    WebFontConfig = {
        google:{ families: [font] },
      };
      (function(){
        var wf = document.createElement("script");
        wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js";
        wf.async = 'true';
        document.head.appendChild(wf);
      })();

    let canvas = document.getElementById('gameWorld');
    let ctx = canvas.getContext('2d');

    let gameEngine = new GameEngine();

    gameEngine.init(ctx);
    gameEngine.startInput();

    
    gameEngine.setBackground(new Background(gameEngine, ASSET_MANAGER.getAsset("./res/map/titlescreen.jpg")));
    gameEngine.addEnemy(new MaleKnightSpear(gameEngine, ASSET_MANAGER.getAsset("./res/character/male_knight_spear.png")));
    gameEngine.addEnemy(new MaleKnightMace(gameEngine, ASSET_MANAGER.getAsset("./res/character/male_knight_mace.png")));
    gameEngine.setPlayer(new SkeletonDagger(gameEngine, ASSET_MANAGER.getAsset("./res/character/skeleton_sword.png")));
    let volumeToggle = new VolumeToggle(gameEngine, ASSET_MANAGER.getAsset("./res/audio/volume_bgON.png"));
    gameEngine.setVolumeToggle(volumeToggle);
    gameEngine.addEntity(volumeToggle);
    let healthUI = new SkeletonHealthUI(gameEngine, ASSET_MANAGER.getAsset("./res/character/skeleton_life.png"))
    gameEngine.setHealthUI(healthUI);
    gameEngine.addEntity(healthUI);
    let defUI = new SkeletonDefUI(gameEngine, ASSET_MANAGER.getAsset("./res/character/def_ui.png"));
    gameEngine.setDefUI(defUI);
    gameEngine.addEntity(defUI);
    let atkUI = new SkeletonAtkUI(gameEngine, ASSET_MANAGER.getAsset("./res/character/sword_ui.png"));
    gameEngine.setAtkUI(atkUI);
    gameEngine.addEntity(atkUI);

    

    gameEngine.start();
});
