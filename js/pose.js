const video5 = document.getElementsByClassName('input_video5')[0];
const out5 = document.getElementsByClassName('output5')[0];
const controlsElement5 = document.getElementsByClassName('control5')[0];
const canvasCtx5 = out5.getContext('2d');

const fpsControl = new FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function zColor(data) {
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}


var prev_nose;
var previous_wrist_left;
var previous_wrist_right;


function onResultsPose(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();
  
  var wrist_right = results.poseLandmarks[16];
  var wrist_left = results.poseLandmarks[15];
  var nose = results.poseLandmarks[0];
  var shoulder_right = results.poseLandmarks[11];
  var shoulder_left = results.poseLandmarks[12];

  var hip_right = results.poseLandmarks[23];
  var knee_right = results.poseLandmarks[25];
  var ankle_right = results.poseLandmarks[27];
  
  var hip_left = results.poseLandmarks[24];
  var knee_left = results.poseLandmarks[26];
  var ankle_left = results.poseLandmarks[28];
  
  var standing;
  var moving;
  var sleeping;

  //Scale all variables according to shoulder width

  //Detect if Person (if less than 50% confidence on landmarks above hips, assume no person)
  textContent=document.getElementsByClassName("pose_results")[0];
  var j; 
  var visibility_count = 0;
  for(j = 0; j < 25; j++){
    if(results.poseLandmarks[j].visibility > 0.7) visibility_count++;
  }
  if(visibility_count > 15) textContent.innerHTML = 'visible nodes: ' + visibility_count + ' -> Able to determine posture';
  else textContent.innerHTML = 'visible nodes: ' + visibility_count + ' -> Unable to determine posture!';

  //STATICS ------------------------------
  
  //Lie down detection
  textContent=document.getElementsByClassName("pose_results")[1];
  //var scale = Math.sqrt((shoulder_right.y-shoulder_left.y)**2 + (shoulder_right.x-shoulder_left.x)**2)
  var shoulder_average = (shoulder_left.y + shoulder_right.y) / 2;
  var hip_average = (hip_left.y + hip_right.y) / 2;
  //var difference = (hip_average - shoulder_average) / scale;
  var difference = (hip_average - shoulder_average);
  //textContent.innerHTML = difference;

  if(difference> 0.1){
    textContent.innerHTML = 'Not lying down, difference: ' + difference ;
    standing = 1;
    sleeping = 0;
  } else {
    textContent.innerHTML = 'Lying down, difference: ' + difference;
    standing = 0;
    sleeping = 1;
  }

  //Sitting vs standing detection - bent knees 
  textContent=document.getElementsByClassName("pose_results")[2];
  var knee_average = (knee_left.y + knee_right.y) / 2;
  var hip_average = (hip_left.y + hip_right.y) / 2;
  difference = knee_average - hip_average;
  if(difference> 0.1){
    textContent.innerHTML = 'Not sitting, difference: ' + difference;
    standing = 1;
  } else {
    textContent.innerHTML = 'Sitting, difference: ' + difference;
    standing = 0;
  }

  //Sitting vs standing detection - bent knees 
  textContent=document.getElementsByClassName("pose_results")[3];
  var left_hand_difference =  nose.y - wrist_left.y;
  var right_hand_difference = nose.y - wrist_right.y;
  textContent.innerHTML = 'Right hand raised: ' + right_hand_difference;



  textContent.innerHTML = 'No hand raised';
  if(sleeping == 0){
    if(right_hand_difference > 0){
      textContent.innerHTML = 'Right hand raised: ' + right_hand_difference;
    } 
    if(left_hand_difference > 0){
      textContent.innerHTML = 'left hand raised: ' + left_hand_difference;
    }   
    if(right_hand_difference > 0 && left_hand_difference > 0){
      textContent.innerHTML = 'Both hands raised';
    } 
  }  
 
  //-------------------------------------

  //MOVING-------------------------------
  /*
  //Hand movement detection (exercise)
  textContent=document.getElementsByClassName("pose_results")[3];
  var avg_hand_movement = (DISTANCE(wrist_left.x, wrist_left.y, previous_wrist_left.x, previous_wrist_left.y) + DISTANCE(wrist_right.x, wrist_right.y, previous_wrist_right.x, previous_wrist_right.y)) / 2;
 
  previous_wrist_right.x = wrist_right.x;
  previous_wrist_left.x = wrist_left.x;
  previous_wrist_right.y = wrist_right.y;
  previous_wrist_left.y = wrist_left.y;

  if(standing == 1){
    if(avg_hand_movement> 0.3){
      textContent.innerHTML = 'Exercising, Hand Movement: ' + avg_hand_movement;
    } 
    else {
      textContent.innerHTML = 'Not exercising, Hand Movement: ' + avg_hand_movement;
    }  
  } else {
    textContent.innerHTML = 'Not exercising, Hand Movement: ' + avg_hand_movement;
  }  
*/
/*
  //Walking fast detection 
  textContent=document.getElementsByClassName("pose_results")[4];
  var shoulder_average_movement = DISTANCE(shoulder_average, previous_shoulder_average);
  if(sleeping == 0){
    if(difference> 0.3){
      textContent.innerHTML = 'Hand Movement: ' + difference + ' -> exercising';
    } 
    else {
      textContent.innerHTML = 'Hand Movement: ' + difference + ' -> not exercising';
    }  
  } else {
    textContent.innerHTML = 'Hand Movement: ' + difference + ' -> not exercising';
  }  
  */

  //-----------------------------------


  //console.log(results.poseLandmarks[0]);

  canvasCtx5.save();
  canvasCtx5.clearRect(0, 0, out5.width, out5.height);
  canvasCtx5.drawImage(
      results.image, 0, 0, out5.width, out5.height);
  drawConnectors(
      canvasCtx5, results.poseLandmarks, POSE_CONNECTIONS, {
        color: (data) => {
          const x0 = out5.width * data.from.x;
          const y0 = out5.height * data.from.y;
          const x1 = out5.width * data.to.x;
          const y1 = out5.height * data.to.y;

          const z0 = clamp(data.from.z + 0.5, 0, 1);
          const z1 = clamp(data.to.z + 0.5, 0, 1);

          const gradient = canvasCtx5.createLinearGradient(x0, y0, x1, y1);
          gradient.addColorStop(
              0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
          gradient.addColorStop(
              1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
          return gradient;
        }
      });
  drawLandmarks(
      canvasCtx5,
      Object.values(POSE_LANDMARKS_LEFT)
          .map(index => results.poseLandmarks[index]),
      {color: zColor, fillColor: '#FF0000'});
  drawLandmarks(
      canvasCtx5,
      Object.values(POSE_LANDMARKS_RIGHT)
          .map(index => results.poseLandmarks[index]),
      {color: zColor, fillColor: '#00FF00'});
  drawLandmarks(
      canvasCtx5,
      Object.values(POSE_LANDMARKS_NEUTRAL)
          .map(index => results.poseLandmarks[index]),
      {color: zColor, fillColor: '#AAAAAA'});
  canvasCtx5.restore();
}


function DISTANCE(ax, bx, ay, by)
{
  return Math.sqrt((ax-bx)**2 + (ay-by)**2);
}

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
}});
pose.onResults(onResultsPose);

const camera = new Camera(video5, {
  onFrame: async () => {
    await pose.send({image: video5});
  },
  width: 480,
  height: 480
});
camera.start();


new ControlPanel(controlsElement5, {
      selfieMode: false,
      upperBodyOnly: false,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    .add([
      new StaticText({title: 'MediaPipe Pose'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Toggle({title: 'Upper-body Only', field: 'upperBodyOnly'}),
      new Toggle({title: 'Smooth Landmarks', field: 'smoothLandmarks'}),
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
      video5.classList.toggle('selfie', options.selfieMode);
      pose.setOptions(options);
    });
