import Phaser from 'phaser'

const LOW_CLOUD_BARRIER = 680;
const HIGH_CLOUD_BARRIER = 100;
const HIGH_PLANE_BARRIER = 10;
const LOW_PLANE_BARRIER = 700;
export default class Game extends Phaser.Scene {

    preload (){
        //load plane image
        this.load.image('plane', '../static/plane-rayanair.png');
        //load coin image
        this.load.image('coin', '../static/coinPlaceholder.png');
        //load cloud images
        for (let i=1;i<=9;i++){
            this.load.image('cloud'+i, '../static/clouds/cloud'+i+'.png');

        }

        //animation


        // if(Math.random()>=0.5){
        // if(Math.random()>=0.5)
        //     this.load.image('bg', '../static/france.png');
        // }else{
        this.load.image('bg', '../static/italy.png');
        // }


        this.load.spritesheet('coinSpritesheet','../static/animation/coin.png', {frameWidth:64, frameHeight: 64, endFrame: 64});
        this.load.spritesheet('seagullSpritesheet','../static/animation/seagull.png', {frameWidth:120, frameHeight: 240});
        this.load.spritesheet('fuelSpritesheet','../static/animation/fuel.png', {frameWidth:101, frameHeight: 117});
        this.load.audio('birdSound','../static/bird.wav');
        this.load.audio('fuelSound','../static/fuel.wav');
        this.load.audio('coinSound','../static/coin.wav');
        this.load.audio('planeSound','../static/plane.wav');
    }

    setup(){
        this.CLOUD_SPAWN_TIME = 900
        this.COIN_SPAWN_TIME = 5000
        this.SEAGULL_SPAWN_TIME = 2200
        this.BASE_CLOUD_SPEED = 200
        this.FUEL_SPAWN_TIME = 8000;

        this.interval = setInterval(()=>{
            this.CLOUD_SPAWN_TIME= Math.max(this.CLOUD_SPAWN_TIME-1,200);
            this.BASE_CLOUD_SPEED+=1
        },100);

        this.COLISION_SPEED = 120
    }


    create (){
        this.score = 0;
        this.lives = 4;
        this.fuelAmount = 5000;
        this.birdSound=this.sound.add('birdSound');
        this.fuelSound=this.sound.add('fuelSound');
        this.coinSound=this.sound.add('coinSound');
        this.planeSound=this.sound.add('planeSound');
        this.planeSound.play();


        this.bgs = this.add.group();
        // console.log(window.innerWidth, window.innerHeight);
        this.bg1 = this.physics.add.image(window.innerWidth/2,window.innerHeight/2,'bg');
        this.bg1.setFrame(window.innerWidth,window.innerHeight);
        // this.bg1.setScale(0.53)

        this.bg2 = this.physics.add.image(window.innerWidth/2 + this.bg1.getBounds().width,window.innerHeight/2,'bg');
        this.bg2.setFrame(window.innerWidth,window.innerHeight);
        // this.bg2.setScale(0.53)
        this.bgs.add(this.bg1);
        this.bgs.add(this.bg2);


        this.bg1.setDepth(0);
        //plane
        this.physicsPlane = this.physics.add.sprite(400, window.innerHeight / 2, 'plane');
        this.physicsPlane.setScale(0.14);
        this.physicsPlane.setDepth(1);
        this.physicsPlane.body.setCircle(220);
        this.physicsPlane.body.setOffset(90,-40);
        this.setup();

        //setup variables useful for clouds and coins
        this.lastTimeSpawnedCloud = 0;
        this.lastTimeSpawnedCoin = 0;
        this.lastTimeSpawnedSeagull = 0;
        this.lastTimeSpawnedFuel = 0;

        this.clouds = this.add.group();
        this.clouds.setDepth(3);
        this.coins = this.add.group();
        this.seagulls = this.add.group();
        this.seagulls.setDepth(2);
        this.coins.setDepth(2);
        this.fuels=this.add.group();
        this.fuels.setDepth(2);
        //coin overlapping

        this.physics.add.overlap(this.physicsPlane, this.coins, (A,B) =>{
            this.coins.remove(B);
            B.destroy();
            this.score++;
            this.scoreText.setText(`score: ${this.score}`);
            this.coinSound.play();
        });

      this.physics.add.overlap(this.physicsPlane, this.fuels, (A,B) =>{
            this.fuels.remove(B);
            B.destroy();
            this.fuelAmount+=1000;
            this.fuelText.setText(`fuel: ${this.fuelAmount}`);
            this.fuelSound.play();
        });

        this.physics.add.overlap(this.physicsPlane, this.seagulls, (A,B) =>{
            this.seagulls.remove(B);
            B.destroy();
            this.lives--;
            this.livesText.setText(`lives: ${this.lives}`);
            this.birdSound.play();
        });


        //cloud setup
        for (let i=1;i<=27;i++){
            let y = (i%9)+1;

            let cl = this.physics.add.image(3000, Math.max(LOW_CLOUD_BARRIER, Math.min(LOW_CLOUD_BARRIER, 100*y)),'cloud'+y)
            cl.baseVelocity = -((Math.random()*200)+200);
            this.clouds.add(cl);
            this.clouds.killAndHide(cl)
        }

        this.scoreText = this.scene.scene.add.text(16, 16, `score: ${this.score}`, { fontSize: '32px', fill: '#000' });
        this.fuelText = this.scene.scene.add.text(16, 50, `fuel: ${this.fuelAmount}`, { fontSize: '32px', fill: '#000' });
        this.livesText = this.scene.scene.add.text(16, 84, `lives: ${this.lives}`, { fontSize: '32px', fill: '#000' });


        //Plane overlaps clouds
        this.physics.add.overlap(this.physicsPlane, this.clouds, (el) => {
            clearTimeout(this.timeout);
            this.planeOverlaps = true;
            this.timeout = setTimeout(() => {
                this.planeOverlaps = false
            }, 50)
        });




        //animation


        var coinAnimConfig = {
            key: 'coinAnim',
            frames: this.anims.generateFrameNumbers('coinSpritesheet', {start:0, end:8, first: 8}),
            frameRate: 12,
            repeat: -1
        };

        var seagullAnimConfig = {
            key: 'seagullAnim',
            frames: this.anims.generateFrameNumbers('seagullSpritesheet', {start:0, end:4}),
            frameRate: 6,
            repeat: -1
        };
        var fuelAnimConfig = {
            key: 'fuelAnim',
            frames: this.anims.generateFrameNumbers('fuelSpritesheet', {start:0, end:2}),
            frameRate: 6,
            repeat: -1
        };

        this.anims.create(coinAnimConfig);
        this.anims.create(seagullAnimConfig);
        this.anims.create(fuelAnimConfig);

        this.interval2 = setInterval(() => {
            // window.vm.$store.commit('addScore')
        }, 500)
    }

    update(time,delta){
        this.respawnClouds();
        this.removeCloudsWhenOffScreen();
        this.respawnCoins();
        this.removeCoinsWhenOffScreen();
        this.respawnSeagulls()
        this.removeSeagullsWhenOffScreen()
        this.handleCloudsOverlapingByPlane();
        this.respawnFuel();
        this.fuelAmount--;
        this.fuelText.setText(`fuel: ${this.fuelAmount}`);


        if (this.input.activePointer.isDown) {
            let rad = Math.atan2(Math.min(LOW_PLANE_BARRIER,this.input.activePointer.y) - this.physicsPlane.y, Math.max(this.physicsPlane.x,Math.abs(this.input.activePointer.x - this.physicsPlane.x)));
            if(this.physicsPlane.y<LOW_PLANE_BARRIER){
                this.physicsPlane.setRotation(rad);

            }else {
                this.physicsPlane.setRotation(0);
            }
            this.physicsPlane.setVelocityY(this.BASE_CLOUD_SPEED* 1.5 * Math.sin(rad))
            //this.manageSpeed(rad)
        }

        this.physicsPlane.y = Math.max(HIGH_PLANE_BARRIER, Math.min(LOW_PLANE_BARRIER, this.physicsPlane.y));
        this.checkForGameOver();

        this.bgs.getChildren().forEach((el)=>{
            el.setVelocityX(-this.BASE_CLOUD_SPEED*0.3);
            if(el.getBounds().x + el.getBounds().width < 0){
                el.x = el.getBounds().width * 1.5
            }
        })

    }

    manageSpeed(rad){
        this.clouds.getChildren().forEach((el)=> el.setVelocityX(Math.min(Math.cos(rad) * 0.5 * el.baseVelocity,0.7*el.baseVelocity)))
    }

    handleCloudsOverlapingByPlane(){
        if (this.planeOverlaps){
            this.physicsPlane.setVelocityX(-this.COLISION_SPEED)
        }else{
            if(this.physicsPlane.x > window.innerWidth / 2){
                this.physicsPlane.setVelocityX(0)
            }else {
                this.physicsPlane.setVelocityX(10)
            }
        }
    }

    respawnClouds(){
        if (this.time.now - this.lastTimeSpawnedCloud > this.CLOUD_SPAWN_TIME){
            this.lastTimeSpawnedCloud = this.time.now;
            let x = window.innerWidth;
            let y = Math.max(HIGH_CLOUD_BARRIER, Math.min(LOW_CLOUD_BARRIER, (Math.random()*(window.innerHeight+50))-50));
            let cl = this.clouds.getFirstDead(false, x, y);
            if (cl!==null){
                cl.x += cl.frame.width / 2;
                cl.active=true;
                cl.setVisible(true);
                cl.setVelocityX(-((Math.random()*200)+this.BASE_CLOUD_SPEED));
                cl.baseVelocity = -((Math.random()*200)+this.BASE_CLOUD_SPEED);
                cl.setScale((Math.random()*1)+0.4);
                cl.setSize(cl.frame.width/1.3, cl.frame.height/ 1.3);
                cl.setOffset((cl.frame.width - cl.frame.width/1.3) /2 ,(cl.frame.height - cl.frame.height/ 1.3)/2);
            }
        }
    }

    removeCloudsWhenOffScreen(){
        this.clouds.getChildren().forEach(el => {
            if (el.x + el.frame.width < 0){
                this.clouds.killAndHide(el)
            }
        })
    }

    respawnCoins(){
        if (this.time.now - this.lastTimeSpawnedCoin > this.COIN_SPAWN_TIME){
            this.lastTimeSpawnedCoin = this.time.now;
            let x = window.innerWidth;
            let y = Math.min(LOW_PLANE_BARRIER,Math.random()*window.innerHeight);
            let coin = this.physics.add.sprite(x, y, 'coinSpriteSheet');
            coin.anims.play('coinAnim');
            if (coin!==null){
                this.coins.add(coin);
                coin.setVelocityX(-(this.BASE_CLOUD_SPEED + 50));
                coin.baseVelocity = -((Math.random()*200)+200);
                coin.x +=coin.frame.width / 2;
                coin.setCircle(coin.frame.width/2,-10,-6);
                coin.setScale(0.3)
            }
        }
    }

    respawnSeagulls(){
        if (this.time.now - this.lastTimeSpawnedSeagull > this.SEAGULL_SPAWN_TIME){
            this.lastTimeSpawnedSeagull = this.time.now;
            this.SEAGULL_SPAWN_TIME -= 50
            this.SEAGULL_SPAWN_TIME = this.SEAGULL_SPAWN_TIME < 500 ? 500 : this.SEAGULL_SPAWN_TIME
            let x = window.innerWidth;
            let y = Math.min(LOW_PLANE_BARRIER,Math.random()*window.innerHeight);
            this.spawnSingleSeagull(x,y)
            if (this.SEAGULL_SPAWN_TIME < 1000){
                y = Math.min(LOW_PLANE_BARRIER,Math.random()*window.innerHeight);
                this.spawnSingleSeagull(x + Math.random() * 200 -100 ,y)
            }
            if (this.SEAGULL_SPAWN_TIME < 2000){
                y = Math.min(LOW_PLANE_BARRIER,Math.random()*window.innerHeight);
                this.spawnSingleSeagull(x + Math.random() * 200 -100,y)
            }
        }
    }

    spawnSingleSeagull(x,y) {
        let seagull = this.physics.add.sprite(x, y, 'seagullSpriteSheet');
        seagull.anims.play('seagullAnim');
        if (seagull !== null) {
            this.seagulls.add(seagull);
            seagull.setVelocityX(-(this.BASE_CLOUD_SPEED + 50));
            seagull.baseVelocity = -((Math.random() * 200) + 200);
            seagull.x += seagull.frame.width / 2;
            seagull.setCircle(seagull.frame.width / 2, -10, -6);
            seagull.setScale(0.3)
        }
    }

    respawnFuel() {
        if (this.time.now - this.lastTimeSpawnedFuel > this.FUEL_SPAWN_TIME) {
            this.lastTimeSpawnedFuel = this.time.now;
            let x = window.innerWidth;
            let y = Math.min(LOW_CLOUD_BARRIER, Math.random() * window.innerHeight);
            let fuel = this.physics.add.sprite(x, y, 'fuelSpriteSheet');
            fuel.anims.play('fuelAnim');
            if (fuel !== null) {
                this.fuels.add(fuel);
                fuel.setVelocityX(-(this.BASE_CLOUD_SPEED + 50));
                fuel.baseVelocity = -((Math.random() * 200) + 200);
                fuel.x += fuel.frame.width / 2;
                // coin.setCircle(coin.frame.width/2,-10,-6);
                fuel.setScale(0.3)
            }
        }
    }

    checkForGameOver(){
        if (this.physicsPlane.x + this.physicsPlane.getBounds().width / 2 < 0 || this.lives <= 0 || this.fuelAmount <= 0){
            clearInterval(this.interval);
            clearInterval(this.interval2);
            this.restart();
            // window.vm.$router.push({ name: 'GameOver' })
        }
    }

    restart(){
        this.score = 0;
        this.lives = 4;
        this.scene.restart();
    }

    removeSeagullsWhenOffScreen(){
        this.seagulls.getChildren().forEach(el => {
            if (el.x + el.frame.width < 0){
                this.seagulls.remove(el);
                el.destroy()
            }
        })
    }

    removeCoinsWhenOffScreen(){
        this.coins.getChildren().forEach(el => {
            if (el.x + el.frame.width < 0){
                this.coins.remove(el);
                el.destroy()
            }
        })
    }
}

