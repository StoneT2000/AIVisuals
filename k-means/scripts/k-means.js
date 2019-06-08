var givenData = []; //all data {x:,y:,label:}
var originalData = [];
var originalLabelCounts = 2;
//randomly give a number from r1 to r2, r1 < r2
var predictedData = [];
function randomRange(r1,r2) {
  return Math.random()*(r2-r1) + r1;
}
function randomItem(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

//returns a normally distributed random number
function boxMullerTransform() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}
async function generateSyntheticData(numPoints = 50, clusters = 4, spread = 0.1, generator = normalCircleGen) {
  var randomXs = [];
  var randomYs = [];
  givenData = [];
  originalData = [];
  originalLabelCounts = clusters;
  //randomly choose cluster centers
  var centers = [];
  for (let i = 0; i < clusters; i++) {
    centers.push({x:randomRange(0.1,0.9),y:randomRange(0.1,0.9),label:i});
  }
  for (let i = 0; i < numPoints; i++) {
    var clusterCenter = randomItem(centers);
    let c = generator(clusterCenter.x,clusterCenter.y,spread);//denseCircleGen(clusterCenter.x,clusterCenter.y,0.2);
    randomXs.push(c.x);
    randomYs.push(c.y);
    givenData.push({x:randomXs[i],y:randomYs[i],label:clusterCenter.label});
    originalData.push({x:randomXs[i],y:randomYs[i],label:clusterCenter.label});
  }
  return true;
}

function normalCircleGen(x1,y1, spread) {
  //The distance from the center is normally distributed
  let ang = randomRange(0,2*Math.PI);
  let r = spread-spread*Math.pow(Math.E, -1 * Math.pow(randomRange(0,1),2));
  r = spread * boxMullerTransform();
  return {x:x1+Math.cos(ang)*r,y:y1+Math.sin(ang)*r};
}
function randomCircleGen(x1,y1, radius) {
  //The distance from the center is normally distributed
  let ang = randomRange(0,2*Math.PI);
  let r = randomRange(0,radius);
  return {x:x1+Math.cos(ang)*r,y:y1+Math.sin(ang)*r};
}
function boxGen(x1,y1,width) {
  let hw = width/2;
  let x2 = randomRange(x1-hw,x1+hw);
  let y2 = randomRange(y1-hw,y1+hw);
  return {x:x2,y:y2};
}

function randomMeansInitialization(data, meanCount) {
  if (meanCount > data.length) {
    console.log("More clusters asked for than data points available")
    return false;
  }
  FisherYatesShuffle2(data,originalData);
  var means = [];
  for (let i = 0; i < meanCount; i++) {
    means.push({x:data[i].x,y:data[i].y});
  }
  return means;
}

//Implementation of the original k-means ++ initialization 
function kmeansppInitialization(data, meanCount) {
  if (meanCount > data.length) {
    console.log("More clusters asked for than data points available")
    return false;
  }
  //randomly choose at random from among the data points
  var means = [];
  means.push(randomItem(data));
  for (let i = 1; i < meanCount; i++) {
    //compute distance to nearest mean already chosen
    let distances = [];
   
    //console.log("Means:" + JSON.stringify(means));
    for (let k = 0;k < data.length; k++) {
      let min = Infinity;
      let point = data[k];
      for (let j = 0; j < means.length; j++) {
        let mean = means[j];
        //console.log(dist2(mean.x,mean.y, point.x,point.y));
        min = Math.min(min, dist2(mean.x,mean.y, point.x,point.y));
      }
      //console.log("Point,min:" + JSON.stringify(point),min);
      if (distances.length > 0){
        distances.push(min + distances[distances.length-1]); //cumulative
      }
      else {
        distances.push(min);
      }
    }
    let num = randomRange(0, distances[distances.length-1]);
    //console.log(distances);
    //console.log("Num " + num);
    //binary search through distances array to find k s.t distances[k] < num <= distances[k+1]
    //then we select point k+1;
    let l = 0;
    let r = distances.length-1;
    let broke = false;
    let mid = Math.floor((l + r)/2);
    while (l < r) {
      mid = Math.floor((l + r)/2);
      if (distances[mid] < num && num <= distances[mid+1]) {
        means.push(data[mid+1]);
        broke = true;
        break;
      }
      else if (num <= distances[mid]){
        r = mid;
      }
      else {
        l = mid + 1;
      }
    }
    //if we didn't break and we stopped due to l < r condition being not met, then we push the data[mid], which is data[0] or data[data.length-1];
    if (broke == false) {
      means.push(data[mid]);
    }
  }
  return means;
}
function dist2(x1,y1,x2,y2) {
  return Math.pow(x2-x1,2) + Math.pow(y2-y1,2);
}
//performs one iteration of k-means algorithm, updates data, means in place and returns data and the newMeans
async function kMeansIterate(data, means) {
  //loop through all data points and assign each data point to nearest cluster
  var newMeans = new Array(means.length);
  var clusterSizes = new Array(means.length);
  for (let i = 0; i < newMeans.length; i++) {
    newMeans[i] = {x:0,y:0};
    clusterSizes[i] = 0;
  }
  for (let i = 0 ; i < data.length; i++) {
    let p = [data[i].x,data[i].y];
    let label = data[i].label;
    let min = Infinity;
    for (let j = 0; j < means.length; j++)  {
      let d = sqDist(p[0],p[1],means[j].x,means[j].y);
      if (d <= min) {
        min = d;
        label = j;
      }
    }
    newMeans[label].x += p[0];
    newMeans[label].y += p[1];
    data[i].label = label;
    clusterSizes[label] += 1;
  }
  //recalculate the new means and return the newly labeled data and means
  for (let i = 0; i < newMeans.length; i++) {
    newMeans[i].x /= clusterSizes[i];
    newMeans[i].y /= clusterSizes[i];
  }
  return {data:data,means:newMeans};
}
function sqDist(x1,y1,x2,y2) {
  return Math.pow(x2-x1,2)+Math.pow(y2-y1,2);
}
function FisherYatesShuffle(data) {
  for (let i = 0; i < data.length-1; i++) {
    let temp = data[i];
    let j = Math.floor(Math.random()*(data.length - i)) + i;
    //exchange j and i
    data[i] = data[j];
    data[j] = temp;
  }
  return data;
}
//shuffles two arrays of the same size in the same permutation
function FisherYatesShuffle2(data,data2) {
  for (let i = 0; i < data.length-1; i++) {
    let temp = data[i];
    let temp2 = data2[i];
    let j = Math.floor(Math.random()*(data.length - i)) + i;
    //exchange j and i
    data[i] = data[j];
    data[j] = temp;
    data2[i] = data2[j];
    data2[j] = temp2;
  }
  return data,data2;
}