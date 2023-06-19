let gameHeight = 400;

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
  sound_bakuhatsu = loadSound("./sound/8bit爆発2.mp3");
  sound_missile = loadSound("./sound/8bitショット1.mp3");
  sound_end_bakuhatsu = loadSound("./sound/8bit爆発1.mp3");
  bgm_title = loadSound("./sound/Shooting_02.mp3");
  bgm_playing = loadSound("./sound/Shooting_01.mp3");
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
      let score = hr.gestures[0][0].score;
      let name = hr.gestures[0][0].categoryName;
      console.log(name, score);
    }
    // ---------------------------
    // ここに自機を動かす処理を書く
    // ---------------------------
  };

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
  text("Space War", width / 2, gameHeight / 2);
  textSize(20);
  text("Press Space to Start", width / 2, gameHeight / 2 + 40);
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
  }

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
    rect(200, 150 + gameHeight, enemySize, enemySize);
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
  // 自機の描画
  fill(0, 255, 0);
  rect(playerX, playerY, playerSize, playerSize);

  // ミサイルの描画
  if (missileActive) {
    fill(0, 0, 255);
    rect(missileX, missileY, missileSize, missileSize);
  }

  // 敵機の描画
  fill(255, 0, 0);
  rect(enemyX, enemyY, enemySize, enemySize);

  // スコアの表示
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

let angle = 0;
let handleLength = 50;

function handle() {
  // 中心座標を計算
  let centerX = width / 2;
  let centerY = gameHeight + 350;

  // マウスのy座標に応じて角度を計算
  let mouseYMapped = map(mouseY, 0, height, 0, 400);
  angle = mouseYMapped;

  // ハンドルの長さを設定
  let handleLength = 50; // ハンドルの長さを設定

  // ハンドルの位置を計算
  let handleX = centerX + cos(radians(angle)) * handleLength;
  let handleY = centerY + sin(radians(angle)) * handleLength;

  // ハンドルが中心より左に行かないように制限
  handleX = max(handleX, centerX); // handleXがcenterXより小さい場合はcenterXを使用

  // 円を描画
  strokeWeight(2);
  circle(centerX, centerY, handleLength * 2);

  // ハンドルの点を描画
  fill(255, 0, 0);
  noStroke();
  circle(handleX, handleY, 10);

  // 線を描画
  stroke(255, 0, 0);
  line(centerX, centerY, handleX, handleY); // ハンドルに向かう線
  line(
    centerX,
    centerY,
    centerX - (handleX - centerX),
    centerY - (handleY - centerY)
  ); // 円の中心から反対方向に向かう線
}

function AnotherAngle() {
  // この範囲に描画
  fill(106, 109, 130);
  rect(0, gameHeight, 400, 400);

  // 窓
  fill(0, 0, 0);
  stroke(0);
  rect(10, gameHeight, 380, 300);

  // 自機の描画
  fill(0, 255, 0);
  ellipse(200, 350 + gameHeight, playerSize, playerSize);

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
    ellipse(relativeEnemyX, 150 + gameHeight, scaledEnemySize, scaledEnemySize);
  }

  // 十字を書く
  stroke(255);
  line(200, 20 + gameHeight, 200, 280 + gameHeight);
  line(50, 150 + gameHeight, 350, 150 + gameHeight);
  noFill();
  ellipse(200, 150 + gameHeight, 80, 80);
  ellipse(200, 150 + gameHeight, 150, 150);

  // 右側に右三角矢印を描く
  if (relativeEnemyX >= 400) {
    fill(255);
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
}

function keyPressed() {}

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
