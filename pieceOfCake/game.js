// Start Scene
class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
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
    const startButton = this.add.rectangle(400, 500, 250, 70, 0xff6b9d);
    startButton.setStrokeStyle(4, 0x000000);
    startButton.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(400, 500, 'START GAME', {
      fontSize: '32px',
      fill: '#ffffff',
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
    this.load.image('cake1', 'images/cake1.png');
    this.load.image('cake2', 'images/cake2.png');
    this.load.image('cake3', 'images/cake3.png');
    this.load.image('cake4', 'images/cake4.png');
    
    // Error handling
    this.load.on('loaderror', (file) => {
      console.error('Failed to load:', file.src);
    });
    
    // After loading, scale down the textures
    this.load.on('complete', () => {
      ['cake1', 'cake2', 'cake3', 'cake4'].forEach(key => {
        const texture = this.textures.get(key);
        const source = texture.getSourceImage();
        
        // Create a scaled down version
        const canvas = document.createElement('canvas');
        //const scaleX = 310 / source.width;
        //const scaleY = 110 / source.height;
        //const scale = Math.max(scaleX, scaleY); // Use max to cover the area
        
        //canvas.width = source.width * scale;
        //canvas.height = source.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        
        // Replace the texture with scaled version
        this.textures.remove(key);
        this.textures.addCanvas(key, canvas);
      });
    });
  }

  create() {
    // Game variables
    this.score = 0;
    this.blockHeight = 150;
    this.blockWidth = 300;
    this.baseY = 700;
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
    const baseBlock = this.add.tileSprite(400, this.baseY, this.blockWidth, this.blockHeight, 'cake1');
    
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
    
    // Pick a random cake image
    const randomCake = Phaser.Utils.Array.GetRandom(this.cakeImages);
    
    this.movingBlock = this.add.tileSprite(0, newY, this.blockWidth, this.blockHeight, randomCake);
    
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.movingBlock.x = this.direction === 1 ? 0 : 800;
    
    console.log('Created moving block at y:', newY); // Debug log
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
    this.movingBlock.width = overlapWidth;  // Use width instead of displayWidth for tileSprite
    
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
    if (this.score % 50 == 0){
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

  
    // Makes stack and table move
    if (this.score % 100 == 0 && !this.moving){
      this.moving = true;
      this.direction = Math.random() > 0.5 ? 1 : -1;
    }

    if(this.moving){
      const speed = 2;
      this.stackedBlocks.x += this.direction * speed;

      if (this.stackedBlocks.x >= 50 || this.stackedBlocks.x <= -50) {
        this.direction *= -1;
      }
    }

    if(this.score % 100 !== 0){
      this.moving = false;
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
    this.add.rectangle(400, 400, 800, 800, 0xd9ffff);

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
    const button = this.add.rectangle(400, 500, 250, 70, 0x4CAF50);
    button.setStrokeStyle(4, 0x000000);
    button.setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(400, 500, 'PLAY AGAIN', {
      fontSize: '32px',
      fill: '#ffffff',
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
    const menuButton = this.add.rectangle(400, 600, 250, 70, 0xff6b9d);
    menuButton.setStrokeStyle(4, 0x000000);
    menuButton.setInteractive({ useHandCursor: true });
    
    const menuText = this.add.text(400, 600, 'MAIN MENU', {
      fontSize: '32px',
      fill: '#ffffff',
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