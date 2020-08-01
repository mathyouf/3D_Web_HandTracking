async function getVideoPermissions() {
  let video = document.querySelector('video')
  if (navigator.mediaDevices.getUserMedia) {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({ video: true })
      video.srcObject = stream;
      return video
    } catch(err) {
      return err
    }
  }
}
async function main() {
  // Query and store the A-frame scene selector for use during render calls
  const scene  = document.querySelector('a-scene');
  
  // Get video permissions to begin rendering what's seen in the user camera
  const video = await getVideoPermissions()
  
  // Load the MediaPipe handpose model.
  const model = await handpose.load();
  
  let count = 0
  let first = true
  let points = []
  while(count<1000 | first===true){
    //Obtain hand prediction from the MediaPipe graph.
    const predictions = await model.estimateHands(video);
    console.log(predictions)
    const render = await renderFingers(predictions, scene, first, points)
    // const wait = await new Promise((resolve, reject)=>{setTimeout(()=>{resolve('waited')},200)})
    if(first===true){
      if(render.length>0){
        first = false
        points = render
      }
    }
    count++
  }
  // const render = await renderFingers(predictions)
  // if (predictions.length > 0) {
    /*
    `predictions` is an array of objects describing each detected hand, for example:
    [
      {
        handInViewConfidence: 1, // The probability of a hand being present.
        boundingBox: { // The bounding box surrounding the hand.
          topLeft: [162.91, -17.42],
          bottomRight: [548.56, 368.23],
        },
        landmarks: [ // The 3D coordinates of each hand landmark.
          [472.52, 298.59, 0.00],
          [412.80, 315.64, -6.18],
          ...
        ],
        annotations: { // Semantic groupings of the `landmarks` coordinates.
          thumb: [
            [412.80, 315.64, -6.18]
            [350.02, 298.38, -7.14],
            ...
          ],
          ...
        }
      }
    ]
    */

//     for (let i = 0; i < predictions.length; i++) {
//       const keypoints = predictions[i].landmarks;

//       // Log hand keypoints.
//       for (let i = 0; i < keypoints.length; i++) {
//         const [x, y, z] = keypoints[i];
//         console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
//       }
//     }
//  }
}

async function renderFingers(predictions, scene, first, points){
  if(first === true){
    let pointsNodes = []
    let handCenter = document.createElement('a-entity')
    handCenter.classList.add('handCenter')
    handCenter.setAttribute('position', '3 0 0')
    // for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[predictions.length-1].landmarks;
        // Log hand keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          let [x, y, z] = keypoints[i];
          let spherePoint = document.createElement('a-sphere')
          spherePoint.classList.add(i+'fingerPoint')
          spherePoint.setAttribute('radius', 0.2)
          handCenter.appendChild(spherePoint)
          spherePoint.setAttribute('position', {x: -x/100, y:(500-y)/100, z:z/50})
          pointsNodes.push(spherePoint)
        // }
      scene.appendChild(handCenter)
    }
    return pointsNodes
  } else {
    if(predictions.length > 0){
      for (let i = 0; i < predictions.length; i++) {
        points.forEach((point, j) => {
          const keypoints = predictions[i].landmarks
          let [x, y, z] = predictions[i].landmarks[j]
          console.log(x,y,z)
          point.setAttribute('position', {x: -x/100, y:(500-y)/100, z:z/50})
        })
      }
      return true
    }
  }
}
main()