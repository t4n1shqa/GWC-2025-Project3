// Start Scene
class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

   preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('cake1', 'assets/cake_1_final.png');
    this.load.image('cake2', 'assets/cake_2_render.png');
    this.load.image('cake3', 'assets/cake_3_final.png');



    // cake images can be loaded here later
  }

  create() {
    // Title
    this.add.image(400, 390, 'background');


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
      fill: '#333',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Instructions 
    this.add.text(400, 380, 'Click or press SPACE to stack', {
      fontSize: '20px',
      fill: '#666',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Start button

    let stand = this.add.image(409, 495, 'cake1');
    stand.setScale(0.5);
    stand.setOrigin(0.5,0.5);

    const startButton = stand;
    //startButton.setStrokeStyle(4, 0x000000);
    startButton.setInteractive({ useHandCursor: true });
    

    const buttonText = this.add.text(400, 500, 'START GAME', {
      fontSize: '32px',
      fill: '#b6603eff',
      stroke: '#000000ff',
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

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Can also start with spacebar or click
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
    this.load.image('stand','assets/stand.png');

    // cake images can be loaded here later
  }

  create() {
    this.add.image(400, 390, 'background');
    //this.add.image(400,390,'stand');
    
    let stand = this.add.image(400, 450, 'stand');
    //stand.setScale(1.5);
    //stand.setOrigin(0.5,0.5);

  
    // Game variables
    this.score = 0;
    this.blockHeight = 30;
    this.blockWidth = 200;
    this.baseY = 700;
    this.direction = 1;
    this.speed = 200;
    this.stackedBlocks = [];
    this.isGameOver = false;
    this.cameraOffset = 0;
    
    // Score text
    this.scoreText = this.add.text(400, 40, 'Score: 0', {
      fontSize: '32px',
      fill: '#333',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.scoreText.setScrollFactor(0);
    
    // Create base block
    const baseBlock = this.add.rectangle(400, this.baseY, this.blockWidth, this.blockHeight, 0xff6b9d);
    baseBlock.setStrokeStyle(2, 0x000000);
    this.stackedBlocks.push({
      x: 400,
      y: this.baseY,
      width: this.blockWidth,
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
    
    this.movingBlock = this.add.rectangle(0, newY, this.blockWidth, this.blockHeight, 0xff6b9d);
    this.movingBlock.setStrokeStyle(2, 0x000000);
    
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
    
    const leftEdge = Math.max(movingX - this.blockWidth / 2, lastBlock.x - lastBlock.width / 2);
    const rightEdge = Math.min(movingX + this.blockWidth / 2, lastBlock.x + lastBlock.width / 2);
    const overlapWidth = rightEdge - leftEdge;
    
    if (overlapWidth <= 0) {
      this.createFallingPiece(movingX, movingY, this.blockWidth);
      this.movingBlock.destroy();
      this.movingBlock = null;
      this.gameOver();
      return;
    }
    
    const newCenterX = (leftEdge + rightEdge) / 2;
    
    // Left overhang
    if (movingX - this.blockWidth / 2 < leftEdge) {
      const leftOverhang = leftEdge - (movingX - this.blockWidth / 2);
      const leftPieceX = movingX - this.blockWidth / 2 + leftOverhang / 2;
      this.createFallingPiece(leftPieceX, movingY, leftOverhang);
    }
    
    // Right overhang
    if (movingX + this.blockWidth / 2 > rightEdge) {
      const rightOverhang = (movingX + this.blockWidth / 2) - rightEdge;
      const rightPieceX = movingX + this.blockWidth / 2 - rightOverhang / 2;
      this.createFallingPiece(rightPieceX, movingY, rightOverhang);
    }
    
    // Update moving block to stacked position
    this.movingBlock.x = newCenterX;
    this.movingBlock.displayWidth = overlapWidth;
    
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
    
    // Update block width for next block
    this.blockWidth = overlapWidth;
    
    // Move tower down if it gets too high (remove bottom block)
    if (movingY < 150) {
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
    
    this.movingBlock = null;
    
    // Create next block
    this.time.delayedCall(200, () => {
      this.createMovingBlock();
    });
  }
  
  createFallingPiece(x, y, width) {
    const color = this.movingBlock ? this.movingBlock.fillColor : 0xff6b9d;
    const fallingPiece = this.add.rectangle(x, y, width, this.blockHeight, color);
    fallingPiece.setStrokeStyle(2, 0x000000);
    
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

  

  create(data) {
    // Background

    this.add.image(400, 390, 'background');
        
    // this.add.rectangle(400, 400, 800, 800, 0xd9ffff);

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
      fill: '#333',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Play again button
    //const button = this.add.image(400, 500, 250, 70, 0x4CAF50);
    //button.setStrokeStyle(4, 0x000000);
    //button.setInteractive({ useHandCursor: true });

    let button= this.add.image(410, 493, 'cake2');
    button.setScale(0.5);
    button.setOrigin(0.5,0.5);

    const endButton = button;
    //startButton.setStrokeStyle(4, 0x000000);
    endButton.setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(410, 500, 'PLAY AGAIN', {
      fontSize: '32px',
      fill: '#b6603eff',
      stroke: '#000000ff',
      strokeThickness: 5,
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Button hover effect
    button.on('pointerover', () => {
      button.setFillStyle(0x5DBF63);
    });
    
    button.on('pointerout', () => {
      button.setFillStyle(0x4CAF50);
    });
    
    button.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Main menu button
    //const menuButton = this.add.rectangle(400, 600, 250, 70, 0xff6b9d);
    //menuButton.setStrokeStyle(4, 0x000000);
    //menuButton.setInteractive({ useHandCursor: true });

    let menuButton= this.add.image(408, 590, 'cake3');
    menuButton.setScale(0.51);
    menuButton.setOrigin(0.5,0.5);

    const menButton = menuButton;
    //startButton.setStrokeStyle(4, 0x000000);
    menButton.setInteractive({ useHandCursor: true });
    
    const menuText = this.add.text(408, 600, 'MAIN MENU', {
      fontSize: '32px',
      fill: '#b6603eff',
      stroke: '#000000ff',
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