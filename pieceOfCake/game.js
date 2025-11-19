// Start Scene
class StartScene extends Phaser.Scene {
 constructor() {
   super('StartScene');
 }


 preload() {
   this.load.image('background', 'assets/background.png');
   this.load.image('cake-1', 'assets/cake_1_final.png');
   this.load.image('cake-2', 'assets/cake_2_render.png');
   this.load.image('cake-3', 'assets/cake_3_final.png');
   this.load.audio('bgm', 'assets/happytune.mp3');
   this.load.audio('click', 'assets/pop.mp3');
   this.load.audio('squish', 'assets/squish.mp3');
 }


 create() {
   this.bgm = this.sound.add('bgm', {
       loop: true,
       volume: 0.2
   });
   this.bgm.play();


   // Background
   this.add.image(400, 400, 'background');
  
   // Title
   this.add.text(400, 200, 'PIECE OF CAKE!', {
     fontSize: '72px',
     fill: '#ff6b9d',
     fontFamily: 'Arial',
     fontStyle: 'bold',
     stroke: '#ffffff',
     strokeThickness: 8
   }).setOrigin(0.5);


   // Subtitle
   this.add.text(400, 300, 'Stack the cakes as high as you can!', {
     fontSize: '24px',
     fill: '#6d2b4bff',
     fontFamily: 'Arial'
   }).setOrigin(0.5);


   // Instructions
   this.add.text(400, 380, 'Click or press SPACE to stack', {
     fontSize: '20px',
     fill: '#94426bff',
     fontFamily: 'Arial',
     fontStyle: 'italic'
   }).setOrigin(0.5);


   // Start button with cake image
   let startButton = this.add.image(400, 495, 'cake-1');
   startButton.setScale(0.5);
   startButton.setOrigin(0.5, 0.5);
   startButton.setInteractive({ useHandCursor: true });


   const buttonText = this.add.text(400, 500, 'START GAME', {
     fontSize: '32px',
     fill: '#b6603eff',
     stroke: '#000000ff',
     strokeThickness: 5,
     fontFamily: 'Arial',
     fontStyle: 'bold'
   }).setOrigin(0.5);


   // Button click
   startButton.on('pointerdown', () => {
     this.scene.start('GameScene');
     this.sound.play('click');
   });


   // Can also start with spacebar
   this.input.keyboard.on('keydown-SPACE', () => {
     this.scene.start('GameScene');
   });
 }
}


// Game Scene
class GameScene extends Phaser.Scene {
 constructor() {
   super('GameScene');
 }


 preload() {
   this.load.image('background', 'assets/background.png');
   this.load.image('stand', 'assets/stand.png');
   this.load.image('cake1', 'images/cake1r.png');
   this.load.image('cake2', 'images/cake2r.png');
   this.load.image('cake3', 'images/cake3r.png');
   this.load.image('cake4', 'images/cake4r.png');
  
   // Error handling
   this.load.on('loaderror', (file) => {
     console.error('Failed to load:', file.src);
   });
 }


 create() {
   // Background
   this.add.image(400, 400, 'background');
  
   // Stand (optional - uncomment if you want it)
   let stand = this.add.image(400, 450, 'stand');
  
   // Game variables
   this.score = 0;
   this.blockHeight = 120;
   this.initialBlockWidth = 260; // FULL width for new cakes
   this.blockWidth = 260; // Current stacked width
   this.baseY = 660;
   this.direction = 1;
   this.speed = 200;
   this.stackedBlocks = [];
   this.isGameOver = false;
   this.cameraOffset = 0;
   this.cakeImages = ['cake1', 'cake2', 'cake3', 'cake4'];
   this.wobbleIntensity = 0; // Track wobble intensity


   // Darkening Overlay
   this.darknessOverlay = this.add.rectangle(400, 400, 800, 800, 0x000000);
   this.darknessOverlay.alpha = 0;
   this.darknessOverlay.setScrollFactor(0);


   // Darkening the cakes
   this.darknessLevel = 0;


  
   // Score text
   this.scoreText = this.add.text(400, 40, 'Score: 0', {
     fontSize: '32px',
     fill: '#333',
     fontFamily: 'Arial',
     fontStyle: 'bold'
   }).setOrigin(0.5);
   this.scoreText.setScrollFactor(0);
  
   // Create base block using tileSprite for proper cropping
   const baseBlock = this.add.tileSprite(400, this.baseY, this.initialBlockWidth, this.blockHeight, 'cake1');


   // Applys tint to cakes
   baseBlock.setTint(this.calculateTint());


  
   this.stackedBlocks.push({
     x: 400,
     y: this.baseY,
     width: this.initialBlockWidth,
     rect: baseBlock
   });
  
   // Create moving block
   this.createMovingBlock();
  
   // Input handling
   this.input.on('pointerdown', () => this.placeBlock());
   this.input.keyboard.on('keydown-SPACE', () => this.placeBlock());
 }


 createMovingBlock() {
   if (this.isGameOver) return;
  
   const lastBlock = this.stackedBlocks[this.stackedBlocks.length - 1];
   const newY = lastBlock.y - this.blockHeight;
  
   // Pick a random cake image
   const randomCake = Phaser.Utils.Array.GetRandom(this.cakeImages);
  
   // Always create at FULL width
   //this.movingBlock = this.add.tileSprite(0, newY, this.initialBlockWidth, this.blockHeight, randomCake);


   // Create block using the width of the last stacked cake
   this.movingBlock = this.add.tileSprite(0, newY, lastBlock.width, this.blockHeight, randomCake);


   // Apply tint to moving block
   this.movingBlock.setTint(this.calculateTint());
  
   this.direction = Math.random() > 0.5 ? 1 : -1;
   this.movingBlock.x = this.direction === 1 ? 0 : 800;
 }


 update(time, delta) {
   if (this.isGameOver || !this.movingBlock) return;
  
   this.movingBlock.x += this.direction * this.speed * (delta / 1000);
  
   if (this.movingBlock.x >= 800 || this.movingBlock.x <= 0) {
     this.direction *= -1;
   }
  
   // Apply wobble effect to all stacked blocks based on score
   if (this.wobbleIntensity > 0) {
     const wobble = Math.sin(time / 100) * this.wobbleIntensity;
     for (let block of this.stackedBlocks) {
       block.rect.x = block.x + wobble;
     }
   }
 }


 calculateTint() {
   const minRGB = 100;
   const maxRGB = 255;
  
   const colorValue = Phaser.Math.Linear(maxRGB, minRGB, this.darknessLevel);
   const component = Math.floor(colorValue);


   return (component << 16) | (component << 8) | component;
 }




 placeBlock() {
   this.sound.play('squish', { volume: 1.0 });
   if (this.isGameOver || !this.movingBlock) return;
  
   const lastBlock = this.stackedBlocks[this.stackedBlocks.length - 1];
   const movingX = this.movingBlock.x;
   const movingY = this.movingBlock.y;
  
   // Use initialBlockWidth for moving block, lastBlock.width for stacked block
   //const leftEdge = Math.max(movingX - this.initialBlockWidth / 2, lastBlock.x - lastBlock.width / 2);
   //const rightEdge = Math.min(movingX + this.initialBlockWidth / 2, lastBlock.x + lastBlock.width / 2);
   const leftEdge = Math.max(movingX - lastBlock.width / 2, lastBlock.x - lastBlock.width / 2);
   const rightEdge = Math.min(movingX + lastBlock.width / 2, lastBlock.x + lastBlock.width / 2);
   const overlapWidth = rightEdge - leftEdge;
  
   if (overlapWidth <= 0) {
     // Complete miss - make the piece fall with gravity
     this.isGameOver = true;
    
     // Don't destroy movingBlock yet - animate it falling
     this.tweens.add({
       targets: this.movingBlock,
       y: this.movingBlock.y + 900,
       alpha: 0.3,
       angle: Phaser.Math.Between(-360, 360),
       duration: 800,
       ease: 'Cubic.easeIn',
       onComplete: () => {
         this.movingBlock.destroy();
         this.movingBlock = null;
         this.gameOver();
       }
     });
    
     return;
   }
  
   const newCenterX = (leftEdge + rightEdge) / 2;
  
   // Left overhang - check if the moving block extends past the left edge
   //const movingBlockLeft = movingX - this.initialBlockWidth / 2;
   //const movingBlockRight = movingX + this.initialBlockWidth / 2;
   const movingBlockLeft = movingX - lastBlock.width / 2;
   const movingBlockRight = movingX + lastBlock.width / 2;
  
   console.log('Checking overhang - Left:', movingBlockLeft, 'vs', leftEdge, 'Right:', movingBlockRight, 'vs', rightEdge);
  
   if (movingBlockLeft < leftEdge) {
     const leftOverhang = leftEdge - movingBlockLeft;
     const leftPieceX = movingBlockLeft + leftOverhang / 2;
     console.log('Creating left overhang piece with width:', leftOverhang);
     this.createFallingPiece(leftPieceX, movingY, leftOverhang);
   }
  
   // Right overhang - check if the moving block extends past the right edge
   if (movingBlockRight > rightEdge) {
     const rightOverhang = movingBlockRight - rightEdge;
     const rightPieceX = movingBlockRight - rightOverhang / 2;
     console.log('Creating right overhang piece with width:', rightOverhang);
     this.createFallingPiece(rightPieceX, movingY, rightOverhang);
   }
  
   // Update moving block to stacked position
   this.movingBlock.x = newCenterX;
   this.movingBlock.width = overlapWidth;
  
   // Add to stacked blocks
   this.stackedBlocks.push({
     x: newCenterX,
     y: movingY,
     width: overlapWidth,
     rect: this.movingBlock
   });
  
   // Update score
   this.score += 10;
   this.scoreText.setText('Score: ' + this.score);
  
   // Update wobble intensity based on score
   if (this.score >= 200) {
     this.wobbleIntensity = 3;
   } else if (this.score >= 100) {
     this.wobbleIntensity = 1.5;
   }
  
   // Bounce animation
   this.tweens.add({
     targets: this.movingBlock,
     scaleY: 0.8,
     duration: 100,
     yoyo: true,
     ease: 'Quad.easeInOut'
   });
  
   // Move tower down if it gets too high (remove bottom block)
   if (movingY < 250) {
     if (this.stackedBlocks.length > 1) {
       const bottomBlock = this.stackedBlocks.shift();
      
       // Fade out and destroy bottom block
       this.tweens.add({
         targets: bottomBlock.rect,
         alpha: 0,
         duration: 300,
         onComplete: () => {
           bottomBlock.rect.destroy();
         }
       });
      
       // Move all remaining blocks down
       for (let block of this.stackedBlocks) {
         this.tweens.add({
           targets: block.rect,
           y: block.rect.y + this.blockHeight,
           duration: 300,
           ease: 'Quad.easeOut'
         });
         block.y += this.blockHeight;
       }
      
       // Move the moving block down too
       if (this.movingBlock) {
         this.tweens.add({
           targets: this.movingBlock,
           y: this.movingBlock.y + this.blockHeight,
           duration: 300,
           ease: 'Quad.easeOut'
         });
       }
     }
   }
  
   // Increase difficulty and darken the background every 50 points
   if (this.score % 50 == 0 && this.score > 0){
     // Increases speed
     this.speed = Math.min(400, this.speed + 75);


     // Darkens screen and cakes
     const maxAlpha = 0.8;
     const increaseAmount = 0.1;


     this.darknessLevel = Math.min(1.0, this.darknessLevel + increaseAmount);


     this.tweens.add({
       targets: this.darknessOverlay,
       alpha: Math.min(maxAlpha, this.darknessOverlay.alpha + increaseAmount),
       duration: 500,
       ease: 'Linear'
     });


     const newTint = this.calculateTint();
     for (let block of this.stackedBlocks) {
       block.rect.setTint(newTint);
     }
   }


   this.movingBlock = null;
  
   // Create next block
   this.time.delayedCall(200, () => {
     this.createMovingBlock();
   });
 }
  createFallingPiece(x, y, width) {
   if (width <= 0.5) return; // nothing to show
   width = Math.max(2, width); // ensure minimum visible width


   const texture = this.movingBlock.texture.key;
   //const fallingPiece = this.add.tileSprite(x, y, width, this.blockHeight, texture);


   const fallingPiece = this.add.sprite(x, y, texture);
   fallingPiece.setOrigin(0.5, 0.5);
   fallingPiece.setCrop(0, 0, width, this.blockHeight);


   // Match the tint of the moving block
   fallingPiece.setTint(this.movingBlock.tintTopLeft);


   this.tweens.add({
     targets: fallingPiece,
     y: y + 900,
     alpha: 0.3,
     angle: Phaser.Math.Between(-360, 360),
     duration: 800,
     ease: 'Cubic.easeIn',
     onComplete: () => {
       fallingPiece.destroy();
     }
   });
 }
      
 gameOver() {
   this.scene.start('GameOverScene', { score: this.score });
 }
}


// Game Over Scene
class GameOverScene extends Phaser.Scene {
 constructor() {
   super('GameOverScene');
 }


 preload() {
   this.load.image('background', 'assets/background.png');
   this.load.image('cake-2', 'assets/cake_2_render.png');
   this.load.image('cake-3', 'assets/cake_3_final.png');
 }


 create(data) {
   // Background
   this.add.image(400, 400, 'background');


   // Game over text
   this.add.text(400, 250, 'GAME OVER', {
     fontSize: '72px',
     fill: '#ff0000',
     fontFamily: 'Arial',
     fontStyle: 'bold',
     stroke: '#ffffff',
     strokeThickness: 8
   }).setOrigin(0.5);
  
   // Final score
   this.add.text(400, 360, 'Final Score: ' + data.score, {
     fontSize: '40px',
     fill: '#94426bff',
     fontFamily: 'Arial',
     fontStyle: 'bold'
   }).setOrigin(0.5);
  
   // Play again button with cake image
   let playButton = this.add.image(410, 493, 'cake-2');
   playButton.setScale(0.5);
   playButton.setOrigin(0.5, 0.5);
   playButton.setInteractive({ useHandCursor: true });
  
   const buttonText = this.add.text(410, 500, 'PLAY AGAIN', {
     fontSize: '32px',
     fill: '#b6603eff',
     stroke: '#000000ff',
     strokeThickness: 5,
     fontFamily: 'Arial',
     fontStyle: 'bold'
   }).setOrigin(0.5);
  
   playButton.on('pointerdown', () => {
     this.scene.start('GameScene');
     this.sound.play('click');
   });


   // Main menu button with cake image
   let menuButton = this.add.image(408, 590, 'cake-3');
   menuButton.setScale(0.51);
   menuButton.setOrigin(0.5, 0.5);
   menuButton.setInteractive({ useHandCursor: true });
  
   const menuText = this.add.text(408, 600, 'MAIN MENU', {
     fontSize: '32px',
     fill: '#b6603eff',
     stroke: '#000000ff',
     strokeThickness: 5,
     fontFamily: 'Arial',
     fontStyle: 'bold'
   }).setOrigin(0.5);
  
   menuButton.on('pointerdown', () => {
     this.scene.start('StartScene');
     this.sound.play('click');
   });


   // Can also restart with spacebar
   this.input.keyboard.on('keydown-SPACE', () => {
     this.scene.start('GameScene');
   });
 }
}


// Phaser Configuration
const config = {
 type: Phaser.AUTO,
 width: 800,
 height: 800,
 backgroundColor: '#d9ffff',
 scene: [StartScene, GameScene, GameOverScene]
};


new Phaser.Game(config);

