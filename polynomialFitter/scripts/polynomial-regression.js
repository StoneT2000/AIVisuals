var givenData = []; //the entire dataset of x and y values for use by Chart.js
var predictedData = []; //predicted data for use by Chart.js to dynamically show the machine learning
var randomXs = []; //the entire dataset of x values
var randomYs = []; //the entire dataset of y values
var testXs = []; //the test batch of data x values;
var testYs = []; //the test batch of data y values
var minx = 0;
var maxx = 0;
var coefficients = [0.9,0.2,-0.1,0.2];

function polyC(x){
  let polyResult = 0;
  for (let i = 0; i < coefficients.length; i++) {
    polyResult += coefficients[i] * Math.pow(x, coefficients.length - 1 - i);
  }
  return polyResult;
}

function generateSyntheticData(numPoints = 50, displacement = 0.2, generator = polyC, r) {
  randomXs = [];
  randomYs = [];
  givenData = [];
  for (let i = 0; i < numPoints; i++) {
    let x = randomRange(r[0], r[1]);
    randomXs.push(x);
    let y = generator(x) + Math.random() * displacement;
    randomYs.push(y);
  }
  minx = randomXs.reduce(function(acc,curr){return (acc < curr ? acc : curr);})
  maxx = randomXs.reduce(function(acc,curr){return (acc > curr ? acc : curr);})
  for (let i = 0; i < randomXs.length; i++) {
    givenData.push({x:randomXs[i],y:randomYs[i]});
  }
  return true;
}

function shuffleData(arr){
  let finalArr = [];
  let arrCopy = JSON.parse(JSON.stringify(arr));
  let numIterations = arrCopy.length
  for (let i = 0; i < numIterations; i++) {
    let randIndex = Math.floor(Math.random()*arrCopy.length)
    finalArr.push(arrCopy[randIndex]);
    arrCopy.splice(randIndex,1);
  }
  return finalArr;
}

function nextTrainingBatch(batchNum, batchSize,xs,ys) {
  let dataXs = randomXs.slice((batchNum-1)*batchSize, (batchNum)*batchSize);
  let dataYs = randomYs.slice((batchNum-1)*batchSize, (batchNum)*batchSize);
  let batchXs = tf.tensor2d(dataXs, [dataXs.length, 1]); 
  let batchYs = tf.tensor2d(dataYs, [dataYs.length, 1]); 

  return [batchXs, batchYs];
}

var tfCoeffs = [tf.variable(tf.scalar(randomRange(-1,1))),tf.variable(tf.scalar(randomRange(-1,1))),tf.variable(tf.scalar(randomRange(-1,1))),tf.variable(tf.scalar(randomRange(-1,1)))];
function randomizeTrainingVars(range = [-1,1]){
  tfCoeffs = [tf.variable(tf.scalar(randomRange(range[0], range[1]))),tf.variable(tf.scalar(randomRange(range[0], range[1]))),tf.variable(tf.scalar(randomRange(range[0], range[1]))),tf.variable(tf.scalar(randomRange(range[0], range[1])))];
}
generateSyntheticData(5000, 0.2, polyC, [-1,1]);

var xs = tf.tensor2d(randomXs, [randomXs.length, 1]); //tensor2d data of entire dataset x values
var ys = tf.tensor2d(randomYs, [randomYs.length, 1]); //tensor2d data of entire dataset y values
function predict(x) {
  // y = a * x ^ 3 + b * x ^ 2 + c * x + d
  return tf.tidy(() => {
    return tfCoeffs[0].mul(x.pow(tf.scalar(3))) // a * x^3
      .add(tfCoeffs[1].mul(x.square())) // + b * x ^ 2
      .add(tfCoeffs[2].mul(x)) // + c * x
      .add(tfCoeffs[3]); // + d
  });
}
function loss(predictions, labels) {
  // Subtract our labels (actual values) from predictions, square the results,
  // and take the mean.
  const meanSquareError = predictions.sub(labels).square().mean();
  return meanSquareError;
}

//Trains the model by running one entire epoch over the dataset of xs and ys.
async function train(xs, ys, batchSize, numBatches, lr) {

  const learningRate = lr;
  const optimizer = tf.train.sgd(learningRate);
  for (let bnum = 1; bnum <= numBatches; bnum++){
    let nextBatch = nextTrainingBatch(bnum, batchSize, xs, ys);
    optimizer.minimize(() => {
      const predsYs = predict(nextBatch[0]);
      return loss(predsYs, nextBatch[1]);
    });
  }
}
//randomly give a number from r1 to r2, r1 < r2
function randomRange(r1,r2) {
  return Math.random()*(r2-r1) + r1;
}

async function constructDataPoints(){
  predictedData = [];
  let range = maxx - minx;
  for (let i = 0; i <= 100; i++) {
    let xval = minx + (i/100)*range;
    let yval = await predict(tf.scalar(xval)).data();
    predictedData.push({x:xval, y: yval[0]})
  }
}

//web worker work
/*
onmessage = function(e) {
  console.log('Message received from main script');
  xs = e.data[0];
  ys = e.data[1];
  let bsize = e.data[2];
  let numBatches = e.data[3];
  let learningRate = e.data[4];
  train(xs, ys, bsize, numBatches, learningRate).then(function(){
    constructDataPoints().then(function(){
      chart.data.datasets[0].data = predictedData;
      chart.data.datasets[1].data = givenData.slice(0,75)
      chart.update();
      updateResults();
      log('Epoch ' + currentEpoch + ' / ' + maxEpoch)
      return animateChart(xs, ys, bsize, numBatches, currentEpoch+1, maxEpoch, learningRate)
    });
  })
  var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
  console.log('Posting message back to main script');
  postMessage(workerResult);
}
*/

