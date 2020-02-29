/* Map Image Paths */
const titleScreenPath = "./res/map/titlescreen.jpg";
const levelCompletePath = "./res/map/LevelComplete.png";
const forestMapPath = "./res/map/forest.png";
const desertMapPath = "./res/map/desert.png";

/* Enemy Image Paths */
const spearGuyPath = "./res/character/male_knight_spear.png";
const maceGuyPath = "./res/character/male_knight_mace.png";
const desertWarriorDaggerPath = "./res/character/DesertWarriorDagger.png";
const desertWarriorWarAxePath = "./res/character/DesertWarriorWarAxe.png";
const zombieShovelPath = "./res/character/ZombieShovel.png";


/* Terrain Image Paths */
const rock1Path = "./res/terrain/Rock1.png";
const rock2Path = "./res/terrain/Rock2.png";
const dirtHolePath = "./res/terrain/DirtHole.png";
const ivyColumnPath = "./res/terrain/IvyColumn.png";
const coniferousTreePath = "./res/terrain/ConiferousTree.png";
const desertRockSmallPath = "./res/terrain/DesertRockSmall.png";
const desertRockLargePath = "./res/terrain/DesertRockLarge.png";
const desertRubblePath = "./res/terrain/DesertRubble.png";
const desertSpikesDarkPath = "./res/terrain/DesertSpikesDark.png";
const desertSpikesLightPath = "./res/terrain/DesertSpikesLight.png";
const bigCactusPath = "./res/terrain/BigCactus.png";


function Map(game, spritesheet, width, height) {
    this.x = bgX;
    this.y = bgY;
    this.width = width;
    this.height = height;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
}

Map.prototype.draw = function () {
    if(this.game.onTitleScreen) this.ctx.drawImage(this.spritesheet, this.x, this.y);
    else {
        if (this.game.levelComplete) {
            this.spritesheet = ASSET_MANAGER.getAsset(levelCompletePath);
            this.ctx.drawImage(this.spritesheet, 0, 0, 950, 700);
        } else {
            this.ctx.drawImage(this.spritesheet, this.x, this.y, 800 * 2.5, 800 * 2.5);
        }
    }
    if (time <= 0 || hp <= 0) {
        if (this.game.player.currAnimation.isDone()) {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.font = "25px " + font;
            this.ctx.fillStyle = 'white';
            this.ctx.fillText("<GAME OVER>", 425, 350);
            this.ctx.fillText("Refresh to start again!", 370, 450);
            this.game.gameOver = true;
        }
    }
};

Map.prototype.update = function () {
    //this is the scrolling
    //background coordinates for debug
    if (!this.game.onTitleScreen) {
        // Bounds checking for the x axis.
        if (bgX - playerX > 438) {
            this.x = 438;
            boundHitLeft = true;
        } else if (bgX - playerX < -1476) {
            this.x = -1476;
            boundHitRight = true;
        } else {
            boundHitLeft = false;
            boundHitRight = false;
            this.x = bgX - playerX;
        }
        // Bounds checking for the y axis.
        if (bgY - playerY > 303) {
            this.y = 303;
            boundHitUp = true;
        } else if (bgY - playerY < -1550) {
            this.y = -1550;
            boundHitDown = true;
        } else {
            boundHitUp = false;
            boundHitDown = false;
            this.y = bgY - playerY;
        }
    }
};

function mapSetUp(game, assetManager, mapName) {
    let map = undefined;
    let mapDimension = 800 * 2.5;
    game.levelComplete = false;
    switch (mapName) {
        case 'title':
            game.enemies.push(new PlaceHolderEnemy(game, undefined));
            map = new Map(game, assetManager.getAsset(titleScreenPath), 950, 700);
            break;
        case 'forest':
            console.log("Setting up forest map");
            game.clearEntities();
            forestMapGenTerrain(game, assetManager);
            forestMapGenEnemy(game, assetManager);
            map = new Map(game, assetManager.getAsset(forestMapPath), mapDimension, mapDimension);
            break;
        case 'desert':
            console.log("Setting up desert map");
            game.clearEntities();
            desertMapGenEnemy(game, assetManager);
            desertMapGenTerrain(game, assetManager);
            map = new Map(game, assetManager.getAsset(desertMapPath), mapDimension, mapDimension);
            break;
    }

    return map;
}

function titleScreenInit(game, assetManager) {
    game.enemies.push(new PlaceHolderEnemy(game, undefined));
    return new Map(game, assetManager.getAsset(titleScreenPath), 800, 800, 1, titleScreenPath, forestMapPath);
}

function forestMapGenTerrain(game, assetManager) {
    for (let i = 0; i < 8; i ++) {
        game.addTerrain(new Rock1(game, assetManager.getAsset(rock1Path)));
    }
    for (let i = 0; i < 6; i++) {
        game.addTerrain(new Rock2(game, assetManager.getAsset(rock2Path)));
    }
    for (let i = 0; i < 6; i++) {
        game.addTerrain(new DirtHole(game, assetManager.getAsset(dirtHolePath)));
    }
    for (let i = 0; i < 9; i++) {
        game.addTerrain(new IvyColumn(game, assetManager.getAsset(ivyColumnPath)));
    }
    for (let i = 0; i < 6; i++) {
        game.addTerrain(new ConiferousTree(game, assetManager.getAsset(coniferousTreePath)));
    }
}


function forestMapGenEnemy(game, assetManager) {
    for (let i = 0; i < 1; i++) {
        game.addEnemy(new MaleKnightSpear(game, assetManager.getAsset(spearGuyPath)));
    }
    for (let i = 0; i < 1; i++) {
        game.addEnemy(new MaleKnightMace(game, assetManager.getAsset(maceGuyPath)));
    }

}

function desertMapGenTerrain(game, assetManager) {
    for (let i = 0; i < 12; i++) {
        game.addTerrain(new DesertRockSmall(game, assetManager.getAsset(desertRockSmallPath)));
    }
    for (let i = 0; i < 10; i++) {
        game.addTerrain(new DesertRockLarge(game, assetManager.getAsset(desertRockLargePath)));
    }
    for (let i = 0; i < 18; i++) {
        game.addTerrain(new DesertSpikesDark(game, assetManager.getAsset(desertSpikesDarkPath)))
    }
    for (let i = 0; i < 14; i++) {
        game.addTerrain(new DesertSpikesLight(game, assetManager.getAsset(desertSpikesLightPath)))
    }
    for (let i = 0; i < 13; i++) {
        game.addTerrain(new BigCactus(game, assetManager.getAsset(bigCactusPath)));
    }
    for (let i = 0; i < 8; i++) {
        game.addTerrain(new DesertRubble(game, assetManager.getAsset(desertRubblePath)));
    }
}

function desertMapGenEnemy(game, assetManager) {
    for (let i = 0; i < 1; i++) {
        game.addEnemy(new DesertWarriorWarAxe(game, assetManager.getAsset(desertWarriorWarAxePath)));
    }
    for (let i = 0; i < 1; i++) {
        game.addEnemy(new DesertWarriorDagger(game, assetManager.getAsset(desertWarriorDaggerPath)));
    }
    for (let i = 0; i < 1; i++) {
        game.addEnemy(new ZombieShovel(game, assetManager.getAsset(zombieShovelPath)));
    }
}

