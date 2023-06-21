let gameHeight = 400;
let angle = 0;
let handleLength = 50;
let handleX = 200;
let handleY = gameHeight + 350;
let centerX = 200;
let centerY = 350 + gameHeight;

// hr: Hand Results
let hr;
// ゲームの状態を表す定数
const GAME_STATE_TITLE = 0;
const GAME_STATE_PLAYING = 1;
const GAME_STATE_GAMEOVER = 2;

// 自機の位置とサイズ
let playerX, playerY;
const playerSize = 40;

// ミサイルの位置とサイズ
let missileX, missileY;
const missileSize = 10;
let missileSpeed = 5;
let missileActive = false;

// 敵機の位置とサイズ
let enemyX, enemyY;
const enemySize = 40;
let enemySpeed = 2;

// ゲームのスコアと制限時間
let score = 0;
const gameTime = 60;
let timer;

// ゲームの状態
let gameState = GAME_STATE_TITLE;

let sound_bakuhatsu;
let sound_missile;
let sound_end_bakuhatsu;
let bgm_title;
let bgm_playing;
let bgm_end;

function preload() {
  sound_bakuhatsu = loadSound("./sound/決定ボタンを押す21.mp3");
  sound_missile = loadSound("./sound/8bitショット1.mp3");
  sound_end_bakuhatsu = loadSound("./sound/8bit爆発1.mp3");
  bgm_title = loadSound("./sound/Shooting_02.mp3");
  // bgm_playing = loadSound("./sound/Shooting_01.mp3");
  bgm_playing = loadSound("./sound/かえるのピアノ.mp3");
  bgm_end = loadSound("./sound/Shooting_05.mp3");
}

function setup() {
  sound_bakuhatsu.setVolume(0.3);
  sound_missile.setVolume(0.3);
  sound_end_bakuhatsu.setVolume(0.5);
  bgm_title.setVolume(0.5);
  bgm_playing.setVolume(0.5);
  bgm_end.setVolume(0.5);

  let p5canvas = createCanvas(400, 800);
  p5canvas.parent("#canvas");



  // お手々が見つかると以下の関数が呼び出される．resultsに検出結果が入っている．
  // お手々が見つからない場合はresultsはundefinedになる．
  gotHands = function (results) {
    // hr: Hand Results
    hr = results;
    if (hr.gestures.length > 0) {
      let gesture = hr.gestures[0][0];
      let score = gesture.score;
      let name = gesture.categoryName;
      console.log(name, score);

      // ---------------------------
      // ここに自機を動かす処理を書く
      // ---------------------------
      if (name === 'UP' && !missileActive) {
        sound_missile.play();
        missileX = playerX + playerSize / 2;
        missileY = playerY;
        missileActive = true;
      }

      else if (name === 'DOWN') {
        playerY += 5;
      }
      else if (name === 'BAN') {
        playerY -= 5;
      }

      if (name === 'UP') {
        if (gameState === GAME_STATE_TITLE) {
          // ゲームをリスタートする
          gameState = GAME_STATE_PLAYING;
          timer = gameTime;
          bgm_title.stop();
          bgm_end.stop();
          bgm_playing.loop();


        }
      }


      if (name === 'OK') {

        playerX = 10;
      }

      if (name === 'tyoki') {
        playerX = 390;
      }


    }
  }

  // 初期化
  playerX = width / 2;
  playerY = gameHeight - playerSize;
  missileX = playerX;
  missileY = playerY;
  enemyX = random(width - enemySize);
  enemyY = -enemySize;
  score = 0;
  bgm_title.loop();
}

function draw() {
  // 描画処理
  clear(); // これを入れないと下レイヤーにあるビデオが見えなくなる
  noStroke();

  // 各頂点座標を表示する
  // 各頂点座標の位置と番号の対応は以下のURLを確認
  // https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
  if (hr) {
    if (hr.landmarks) {
      for (const landmarks of hr.landmarks) {
        for (let landmark of landmarks) {
          noStroke();
          fill(100, 150, 210); //手の色
          circle(landmark.x * width, landmark.y * gameHeight, 10);
        }
      }
    }
  }

  if (hr) {
    if (hr.landmarks) {
      for (const landmarks of hr.landmarks) {
        for (let i = 0; i < landmarks.length; i++) {
          let landmark = landmarks[i];
          if (i === 4) {
            let oyayubiX = landmark.x * width; // 下の円のX座標
            let oyayubiY = landmark.y * gameHeight; // 下の円のY座標
            console.log("座標:", "x", oyayubiX, "Y:", oyayubiY);
            noStroke();
            fill(0, 0, 250); //手の色
            circle(oyayubiX, oyayubiY, 10);

            // playerX = oyayubiX;
            // playerY = oyayubiY;

            // 中心座標を計算
            centerX = width / 2;
            centerY = gameHeight + 350;

            // マウスのy座標に応じて角度を計算
            let mouseYMapped = map(oyayubiY, 0, 400, -150, 150);
            angle = mouseYMapped;

            // ハンドルの長さを設定
            let handleLength = 50; // ハンドルの長さを設定

            // ハンドルの位置を計算
            handleX = centerX + cos(radians(angle)) * handleLength;
            handleY = centerY + sin(radians(angle)) * handleLength;

            // ハンドルが中心より左に行かないように制限
            handleX = max(handleX, centerX); // handleXがcenterXより小さい場合はcenterXを使用

            strokeWeight(1);
          }
        }
      }
    }
  }

  //background(100);

  if (gameState === GAME_STATE_TITLE) {
    drawTitleScreen();
    AnotherAngle();
  } else if (gameState === GAME_STATE_PLAYING) {
    updateGame();
    drawGame();
    AnotherAngle();
  } else if (gameState === GAME_STATE_GAMEOVER) {
    drawGameOverScreen();
  }

  // キャンバスに枠をつける
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(0, 0, width, height);
  //fill(230, 240, 255);
  rect(0, 0, width, gameHeight);
}

function drawTitleScreen() {
  fill(0);
  textAlign(CENTER);
  textSize(30);
  text("新しい顔を投げよう", width / 2, 100);
  textSize(20);
  text("Press Space to Start", width / 2, 140);

  noStroke();
  fill(255, 200, 200, 180);
  ellipse(200, 250, 150, 150);

  fill(0, 0, 0, 180);
  ellipse(180, 220, 10, 20);
  ellipse(220, 220, 10, 20);

  fill(255, 0, 0, 180);
  ellipse(200, 250, 50, 50);
  //オレンジに塗る
  fill(255, 100, 0, 180);
  ellipse(250, 250, 50, 50);
  ellipse(150, 250, 50, 50);
}

function drawGameOverScreen() {
  fill(0);
  textAlign(CENTER);
  textSize(30);
  text("Game Over", width / 2, gameHeight / 2);
  textSize(20);
  text("Score: " + score, width / 2, gameHeight / 2 + 40);
  text("Press Space to Restart", width / 2, gameHeight / 2 + 80);
}

var theta = 0;

// ミサイルが爆発したかどうかのフラグ
let missileExploded = false;

function updateGame() {
  // 自機の移動
  if (keyIsDown(LEFT_ARROW)) {
    playerX -= 5;
  } else if (keyIsDown(RIGHT_ARROW)) {
    playerX += 5;
  } else if (keyIsDown(UP_ARROW)) {
    playerY -= 5;
  } else if (keyIsDown(DOWN_ARROW)) {
    playerY += 5;
  } //もしをa押したら100,100に移動




  // 自機の範囲制限
  playerX = constrain(playerX, 0, width - playerSize);
  playerY = constrain(playerY, 0, gameHeight - playerSize);

  // ミサイルの発射
  if (keyIsDown(32) && !missileActive) {
    sound_missile.play();
    missileX = playerX + playerSize / 2;
    missileY = playerY;
    missileActive = true;
  }

  // ミサイルの移動
  if (missileActive) {
    missileY -= missileSpeed;

    // ミサイルが画面外に出たら非アクティブにする
    if (missileY < -missileSize) {
      missileActive = false;
    }
  }

  // 敵機の移動
  enemyY += enemySpeed;

  // 敵機が画面外に出たら再配置
  if (enemyY > gameHeight) {
    enemyX = random(width - enemySize);
    enemyY = -enemySize;
  }

  // ミサイルと敵機の衝突判定
  if (
    missileActive &&
    collideRectRect(
      missileX,
      missileY,
      missileSize,
      missileSize,
      enemyX,
      enemyY,
      enemySize,
      enemySize
    )
  ) {
    score += 100;
    missileActive = false;
    missileExploded = true;

    // 敵機が爆発するエフェクト
    fill(255, 0, 0);
    ellipse(
      enemyX + enemySize / 2,
      enemyY + enemySize / 2,
      enemySize,
      enemySize
    );

    sound_bakuhatsu.play();

    // 新しい敵機を生成
    enemyX = random(width - enemySize);
    enemyY = -enemySize;
  }

  // 自機と敵機の衝突判定
  if (
    collideRectRect(
      playerX,
      playerY,
      playerSize,
      playerSize,
      enemyX,
      enemyY,
      enemySize,
      enemySize
    )
  ) {
    sound_end_bakuhatsu.play();

    bgm_playing.stop();
    bgm_end.loop();
    gameState = GAME_STATE_GAMEOVER;
  }

  // 制限時間の計測
  if (gameState === GAME_STATE_PLAYING) {
    if (frameCount % 60 === 0) {
      timer--;
    }
    if (timer === 0) {
      gameState = GAME_STATE_GAMEOVER;
    }
  }
}

function drawGame() {
  // 自機の描画 茶色
  fill(209, 109, 19);
  rect(playerX, playerY, playerSize, playerSize);


  // ミサイルの描画 黄色
  if (missileActive) {
    fill(200, 200, 0);
    stroke(0, 0, 0);
    rect(missileX, missileY, missileSize, missileSize);
  }

  // 敵機の描画
  fill(255, 0, 0);
  noStroke();
  rect(enemyX, enemyY, enemySize, enemySize);
  //黄色の四角をかく
  fill(255, 255, 0);
  rect(enemyX, enemyY, enemySize, 20);


  // スコアの表示
  fill(0);
  textAlign(RIGHT);
  textSize(20);
  text("Score: " + score, width - 20, 30);

  // 残り時間の表示
  textAlign(RIGHT);
  textSize(20);
  text("Time: " + timer, width - 20, 60);

  // ミサイルの爆発描画
  if (missileExploded) {
    fill(255, 0, 0);
    ellipse(200, 700, 100, 100);
    missileExploded = false; // 爆発描画後にフラグをリセットする
  }
}

function handle() {
  // 円を描画
  strokeWeight(2);
  fill(255, 255, 255);
  circle(centerX, centerY, handleLength * 2);

  //範囲
  strokeWeight(2);
  stroke(0);
  fill(255, 255, 255);
  circle(centerX, centerY + 50, 10);
  circle(centerX + 43, centerY + 25, 10); //した
  circle(centerX + 43, centerY - 25, 10);
  circle(centerX, centerY - 50, 10);
  circle(centerX - 43, centerY + 25, 10); //した
  circle(centerX - 43, centerY - 25, 10);

  // ハンドルの点を描画
  fill(0, 0, 0);
  noStroke();
  circle(handleX, handleY, 15);

  // 線を描画
  stroke(0, 0, 100);
  strokeWeight(5);
  line(centerX, centerY, handleX, handleY); // ハンドルに向かう線
  line(
    centerX,
    centerY,
    centerX - (handleX - centerX),
    centerY - (handleY - centerY)
  ); // 円の中心から反対方向に向かう線

  // ハンドルによる自機の移動
  if (handleY > centerY + 25 && handleY < centerY + 45) {
    playerX += 3;
  } else if (handleY < centerY - 25 && handleY > centerY - 45) {
    playerX -= 3;
  } else if (handleY > centerY + 45) {
    playerX += 5;
  } else if (handleY < centerY - 45) {
    playerX -= 5;
  }




}

function AnotherAngle() {
  // この範囲に描画　茶色に塗る
  fill(209, 109, 19);
  rect(0, gameHeight, 400, 400);

  // 窓 水色
  fill(100, 200, 255);
  stroke(0);
  rect(10, gameHeight, 380, 300);

  // 敵機の描画（相対位置）
  fill(0, 255, 0);
  let relativeEnemyX = (enemyX - playerX) * 5 + 200;
  let enemyDistance = enemyY - playerY;
  let relativeEnemyY = map(
    enemyDistance,
    0,
    -400,
    150 + gameHeight,
    gameHeight
  );

  if (enemyDistance <= 0) {
    let scaledEnemySize = map(enemyDistance, 0, -400, 150, 0); // サイズを調整（enemyDistanceを負の値に変更）
    let faceSize = scaledEnemySize; // 顔のサイズを設定

    // 顔を描画　肌色に塗る
    fill(255, 200, 200);
    ellipse(relativeEnemyX, 150 + gameHeight, faceSize, faceSize);

    // 左目を描画
    let eyeSize = faceSize * 0.1; // 目のサイズを設定
    fill(0, 0, 0);
    ellipse(
      relativeEnemyX - faceSize * 0.15,
      150 + gameHeight - faceSize * 0.1,
      eyeSize * 1.5,
      eyeSize / 3
    );

    // 右目を描画
    ellipse(
      relativeEnemyX + faceSize * 0.15,
      150 + gameHeight - faceSize * 0.1,
      eyeSize * 1.5,
      eyeSize / 3
    );

    // 口を描画
    let mouthSize = faceSize * 0.3; // 口のサイズを設定
    fill(255, 0, 0);
    ellipse(
      relativeEnemyX,
      150 + gameHeight + faceSize * 0.1,
      mouthSize,
      mouthSize
    );
    //オレンジに塗る
    fill(255, 100, 0);
    ellipse(
      relativeEnemyX + mouthSize,
      150 + gameHeight + faceSize * 0.1,
      mouthSize,
      mouthSize
    );
    ellipse(
      relativeEnemyX - mouthSize,
      150 + gameHeight + faceSize * 0.1,
      mouthSize,
      mouthSize
    );
    //アンコ 茶色に塗る
    fill(209, 109, 19);
    ellipse(
      relativeEnemyX + mouthSize * 0.8,
      150 + gameHeight - faceSize * 0.3,
      mouthSize,
      mouthSize / 2
    );
  }

  // 十字を書く
  stroke(0);
  line(200, 20 + gameHeight, 200, 280 + gameHeight);
  line(50, 150 + gameHeight, 350, 150 + gameHeight);
  noFill();
  ellipse(200, 150 + gameHeight, 80, 80);
  ellipse(200, 150 + gameHeight, 150, 150);

  // stroke(166, 222, 240);
  // ellipse(200, 150 + gameHeight, 150, 150);

  // 右側に右三角矢印を描く
  if (relativeEnemyX >= 400) {
    fill(255);
    noStroke();
    triangle(
      350,
      relativeEnemyY,
      350,
      relativeEnemyY - 20,
      370,
      relativeEnemyY - 10
    );
  }

  // 左側に左三角矢印を描く
  if (relativeEnemyX <= 0) {
    fill(255);
    noStroke();
    triangle(
      50,
      relativeEnemyY,
      50,
      relativeEnemyY - 20,
      30,
      relativeEnemyY - 10
    );
  }

  if (missileExploded) {
    fill(255, 0, 0);
    ellipse(200, 700 + gameHeight, 100, 100);
    missileExploded = false; // 爆発描画後にフラグをリセットする
  }

  handle();

  //もしmissileactiveがtrueなら、アンパンを描く
  if (missileActive) {
    noStroke();
    fill(255, 200, 200, 180);
    ellipse(200, 150 + gameHeight, 150, 150);

    fill(0, 0, 0, 180);
    ellipse(180, 120 + gameHeight, 10, 20);
    ellipse(220, 120 + gameHeight, 10, 20);

    fill(255, 0, 0, 180);
    ellipse(200, 150 + gameHeight, 50, 50);
    //オレンジに塗る
    fill(255, 100, 0, 180);
    ellipse(250, 150 + gameHeight, 50, 50);
    ellipse(150, 150 + gameHeight, 50, 50);
  }
}


function startGame() {
  // 初期化
  playerX = width / 2;
  playerY = gameHeight - playerSize;
  missileX = playerX;
  missileY = playerY;
  enemyX = random(width - enemySize);
  enemyY = -enemySize;
  score = 0;
  bgm_title.stop();
  bgm_end.stop();
  bgm_playing.loop();
  gameState = GAME_STATE_PLAYING;
  timer = gameTime;


}

function titleGame() {
  bgm_title.play();
  bgm_end.stop();
  bgm_playing.stop();
  gameState = GAME_STATE_TITLE;
}

function keyPressed() {
  if (keyCode === 32) {
    if (gameState === GAME_STATE_TITLE || gameState === GAME_STATE_GAMEOVER) {
      // ゲームをリスタートする
      gameState = GAME_STATE_PLAYING;
      timer = gameTime;
      enemyY = 0;
      playerX = 150;
      playerY = 800;

      bgm_title.stop();
      bgm_playing.loop();
    }
  }
}
