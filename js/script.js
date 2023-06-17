// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import {
  GestureRecognizer,
  HandLandmarker,
  FilesetResolver,
} from "./vision_bundle.js";
document.getElementById("message").innerHTML = "Loading model...";
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let gestureRecognizer;
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks("./wasm");
  // const vision = await FilesetResolver.forVisionTasks(
  //     "./wasm"
  // );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "./models/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 2,
  });
  document.getElementById("message").innerHTML += "done";
};
createGestureRecognizer();

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("canvas");

// Check if webcam access is supported.
const hasGetUserMedia = () => {
  var _a;
  return !!((_a = navigator.mediaDevices) === null || _a === void 0
    ? void 0
    : _a.getUserMedia);
};
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!gestureRecognizer) {
    console.log("Wait! gestureRecognizer not loaded yet.");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}
let lastVideoTime = -1;
let results = undefined;

async function predictWebcam() {
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await gestureRecognizer.setOptions({
      runningMode: "VIDEO",
    });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, startTimeMs);

    // ミラーリング変換
    for (let landmarks of results.landmarks) {
      for (let landmark of landmarks) {
        landmark.x = 1.0 - landmark.x;
      }
    }
  }
  gotHands(results);
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
