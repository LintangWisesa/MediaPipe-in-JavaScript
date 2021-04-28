const video1 = document.getElementsByClassName('input_video1')[0];
const out1 = document.getElementsByClassName('output1')[0];
const controlsElement1 = document.getElementsByClassName('control1')[0];
const canvasCtx1 = out1.getContext('2d');
const fpsControl = new FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function onResultsFace(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();
  canvasCtx1.save();
  canvasCtx1.clearRect(0, 0, out1.width, out1.height);
  canvasCtx1.drawImage(
      results.image, 0, 0, out1.width, out1.height);
  if (results.detections.length > 0) {
    drawRectangle(
        canvasCtx1, results.detections[0].boundingBox,
        {color: 'blue', lineWidth: 4, fillColor: '#00000000'});
    drawLandmarks(canvasCtx1, results.detections[0].landmarks, {
      color: 'red',
      radius: 5,
    });
  }
  canvasCtx1.restore();
}

const faceDetection = new FaceDetection({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
}});
faceDetection.onResults(onResultsFace);

const camera = new Camera(video1, {
  onFrame: async () => {
    await faceDetection.send({image: video1});
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(controlsElement1, {
      selfieMode: true,
      minDetectionConfidence: 0.5,
    })
    .add([
      new StaticText({title: 'MediaPipe Face Detection'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      video1.classList.toggle('selfie', options.selfieMode);
      faceDetection.setOptions(options);
    });