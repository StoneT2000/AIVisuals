var givenData = [];
var predictedData = [];
var randomXs = [];
var randomYs = [];
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
var tfCoeffs = [tf.variable(tf.scalar(randomRange(-1,1))),tf.variable(tf.scalar(randomRange(-1,1))),tf.variable(tf.scalar(randomRange(-1,1))),tf.variable(tf.scalar(randomRange(-1,1)))];
function randomizeTrainingVars(range = [-1,1]){
  tfCoeffs = [tf.variable(tf.scalar(randomRange(range[0], range[1]))),tf.variable(tf.scalar(randomRange(range[0], range[1]))),tf.variable(tf.scalar(randomRange(range[0], range[1]))),tf.variable(tf.scalar(randomRange(range[0], range[1])))];
}
generateSyntheticData(50, 0.2, polyC, [-1,1]);

var xs = tf.tensor2d(randomXs, [randomXs.length, 1]);
var ys = tf.tensor2d(randomYs, [randomYs.length, 1]);
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

async function train(xs, ys, numIterations = 75, lr) {

  const learningRate = lr;
  const optimizer = tf.train.sgd(learningRate);

  for (let iter = 0; iter < numIterations; iter++) {
    optimizer.minimize(() => {
      const predsYs = predict(xs);
      return loss(predsYs, ys);
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