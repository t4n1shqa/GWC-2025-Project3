// Start Scene
class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload(){
    this.load.image('background', 'assets/background.png');
    this.load.image('cake-1', 'assets/cake_1_final.png');
    this.load.image('cake-2', 'assets/cake_2_render.png');
    this.load.image('cake-3', 'assets/cake_3_final.png');
  }

  create(){
    // Background
    this.add.image(400, 400, 'background');
    
    // Title
    this.add.image(400, 390, 'background');
    this.add.text(400, 200, 'PIECE OF CAKE!', {
      fontSize: '50px',
      fill: '#c54e2aff',
      fontFamily: '"Press Start 2P"',
      fontStyle: 'bold',
      stroke: '#ffcdb6ff',
      strokeThickness: 7
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(400, 270, 'Stack the cakes as high as you can!', {
    fontSize: '28px',
    fill: '#c54e2aff',
    stroke: '#ffcdb6ff',
    strokeThickness: 3,
    fontFamily: '"Bubblegum Sans"',
    fontStyle: 'italic'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(400, 380, 'Click or press SPACE to stack', {
    fontSize: '24px',
    fill: '#9b372bff',
    fontFamily: '"Gloria Hallelujah"',
    fontStyle: 'Bold Italic'
    }).setOrigin(0.5);

    // Start button with cake image
    let startButton = this.add.image(405, 500, 'cake-1');
    startButton.setScale(0.5);
    startButton.setOrigin(0.5, 0.5);
    startButton.setInteractive({ useHandCursor: true });
    

    const buttonText = this.add.text(400, 500, 'START GAME', {
      fontSize: '32px',
      fill: '#b6603eff',
      stroke: '#552418ff',
      strokeThickness: 5,
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Button hover effect
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0xff8bb5);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0xff6b9d);
    });

    // Button click
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Can also start with spacebar or click
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

  }
  
}

 //get high score!

    function getHighScore() {
      return parseInt(localStorage.getItem('highScore')) || 0;
    }

    function setHighScore(score) {
      localStorage.setItem('highScore', score);
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
    this.movingBlock = this.add.tileSprite(0, newY, this.initialBlockWidth, this.blockHeight, randomCake);
    
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.movingBlock.x = this.direction === 1 ? 0 : 800;
  }

  update(time, delta) {
    if (this.isGameOver || !this.movingBlock) return;
    
    this.movingBlock.x += this.direction * this.speed * (delta / 1000);
    
    if (this.movingBlock.x >= 800 || this.movingBlock.x <= 0) {
      this.direction *= -1;
    }
  }

  placeBlock() {
    if (this.isGameOver || !this.movingBlock) return;
    
    const lastBlock = this.stackedBlocks[this.stackedBlocks.length - 1];
    const movingX = this.movingBlock.x;
    const movingY = this.movingBlock.y;
    
    // Use initialBlockWidth for moving block, lastBlock.width for stacked block
    const leftEdge = Math.max(movingX - this.initialBlockWidth / 2, lastBlock.x - lastBlock.width / 2);
    const rightEdge = Math.min(movingX + this.initialBlockWidth / 2, lastBlock.x + lastBlock.width / 2);
    const overlapWidth = rightEdge - leftEdge;
    
    if (overlapWidth <= 0) {
      this.createFallingPiece(movingX, movingY, this.initialBlockWidth);
      this.movingBlock.destroy();
      this.movingBlock = null;
      this.gameOver();
      return;
    }
    
    const newCenterX = (leftEdge + rightEdge) / 2;
    
    // Left overhang
    if (movingX - this.initialBlockWidth / 2 < leftEdge) {
      const leftOverhang = leftEdge - (movingX - this.initialBlockWidth / 2);
      const leftPieceX = movingX - this.initialBlockWidth / 2 + leftOverhang / 2;
      this.createFallingPiece(leftPieceX, movingY, leftOverhang);
    }
    
    // Right overhang
    if (movingX + this.initialBlockWidth / 2 > rightEdge) {
      const rightOverhang = (movingX + this.initialBlockWidth / 2) - rightEdge;
      const rightPieceX = movingX + this.initialBlockWidth / 2 - rightOverhang / 2;
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
    
    // Increase difficulty
    this.speed = Math.min(400, this.speed + 5);
    if (this.score % 50 === 0 && this.score > 0) {
      this.speed = Math.min(400, this.speed + 75);
    }
    
    this.movingBlock = null;
    
    // Create next block
    this.time.delayedCall(200, () => {
      this.createMovingBlock();
    });
  }
  
  createFallingPiece(x, y, width) {
    // Use the texture from the moving block if available
    const texture = this.movingBlock ? this.movingBlock.texture.key : 'cake1';
    const fallingPiece = this.add.tileSprite(x, y, width, this.blockHeight, texture);
    
    // Falling and fading animation
    this.tweens.add({
      targets: fallingPiece,
      y: y + 500,
      alpha: 0,
      angle: Phaser.Math.Between(-180, 180),
      duration: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => {
        fallingPiece.destroy();
      }
    });
  }
        
  gameOver() {
    this.isGameOver = true;
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
    this.load.image('cake2', 'assets/cake_2_render.png');
    this.load.image('cake3', 'assets/cake_3_final.png');

    // load 3 frames for sprinkle animation
    this.load.image('sprinkles1', 'ani/s1.png');
    this.load.image('sprinkles2', 'ani/s2.png');
    this.load.image('sprinkles3', 'ani/s3.png');

  }

  create(data) {

           // Background
    this.add.image(400, 400, 'background');


// --- HIGH SCORE LOGIC ---
  let previousHighScore = getHighScore();
  let isNewHighScore = data.score > previousHighScore;

  // Save new high score if beaten
  if (isNewHighScore) {
    setHighScore(data.score);
  }

  // Choose correct value to DISPLAY
  let highScoreToShow = isNewHighScore ? data.score : previousHighScore;

  // --- Sprinkle Animation ONLY for new high score ---
  if (isNewHighScore) {
    this.anims.create({
      key: 'sprinkleAnim1',
      frames: [
        { key: 'sprinkles1' },
        { key: 'sprinkles2' },
        { key: 'sprinkles3' }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.sprinkle1 = this.add.sprite(400, 400, 'sprinkles1')
      .setScale(2)
      .setOrigin(0.5);
    this.sprinkle1.play('sprinkleAnim1');
  }

  // High score text (FIXED)
  this.add.text(400, 410, 'High Score: ' + highScoreToShow, {
    fontSize: '32px',
    fill: '#fff267ff',
    stroke: '#c5a042ff',
    strokeThickness: 5,
    fontFamily: '"Coiny"',
    fontStyle: 'bold'
  }).setOrigin(0.5);


    // Game over text
    this.add.text(400, 250, 'GAME OVER', {
      fontSize: '72px',
      fill: '#ff0000',
      fontFamily: '"Press Start 2P"',
      fontStyle: 'bold',
      stroke: '#aa0000ff',
      strokeThickness: 8
    }).setOrigin(0.5);

    
    // Final score
    this.add.text(400, 360, 'Final Score: ' + data.score, {
      fontSize: '40px',
      fill: '#e23b3bff',
      stroke: '#ffbbbbff',
      strokeThickness: 5,
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
      stroke: '#552418ff',
      strokeThickness: 5,
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Main menu button with cake image
    let menuButton = this.add.image(408, 590, 'cake-3');
    menuButton.setScale(0.51);
    menuButton.setOrigin(0.5, 0.5);
    menuButton.setInteractive({ useHandCursor: true });
    
    const menuText = this.add.text(408, 600, 'MAIN MENU', {
      fontSize: '32px',
      fill: '#b6603eff',
      stroke: '#552418ff',
      strokeThickness: 5,
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Button hover effect
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0xff8bb5);
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0xff6b9d);
    });
    
    menuButton.on('pointerdown', () => {
      this.scene.start('StartScene');
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