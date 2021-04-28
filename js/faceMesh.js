const video2 = document.getElementsByClassName('input_video2')[0];
const out2 = document.getElementsByClassName('output2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];
const canvasCtx = out2.getContext('2d');

const fpsControl = new FPS();
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function onResultsFaceMesh(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, out2.width, out2.height);
  canvasCtx.drawImage(
      results.image, 0, 0, out2.width, out2.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_TESSELATION,
          {color: '#C0C0C070', lineWidth: 1});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_RIGHT_EYE,
          {color: '#FF3030'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW,
          {color: '#FF3030'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_LEFT_EYE,
          {color: '#30FF30'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW,
          {color: '#30FF30'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_FACE_OVAL,
          {color: '#E0E0E0'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_LIPS,
          {color: '#E0E0E0'});
    }
  }
  canvasCtx.restore();
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
}});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({image: video2});
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(controlsElement2, {
      selfieMode: true,
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    .add([
      new StaticText({title: 'MediaPipe Face Mesh'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider({
        title: 'Max Number of Faces',
        field: 'maxNumFaces',
        range: [1, 4],
        step: 1
      }),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      video2.classList.toggle('selfie', options.selfieMode);
      faceMesh.setOptions(options);
    });