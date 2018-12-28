var chart;
var ctx;
var lrPopper;
$(document).ready(function () {
  
  setInterval(function(){$(".commandLine").addClass('indicator')},1000)
  setTimeout(function(){setInterval(function(){$(".commandLine").removeClass('indicator')},1000)},500)
  lrReference = document.getElementById('learningRate');
  popperDiv = document.getElementById('popperDiv')
  lrPopper = new Popper(lrReference, popperDiv, {
    placement: 'bottom',
  });
  $("#popperDiv").css("opacity", "0");

  //generateSyntheticData(50, 0.2, polyC);
  $("#batchSize").val(30);
  $("#learningRate").val(0.35);
  $("#maxEpoch").val(5);
  for (let i = 0; i < coefficients.length; i++) {
    $("#coeff" + i).val(coefficients[i]);
  }
  $("#numPoints").val(50);
  $("#displacementFactor").val(0.2);
  $("#x0").val(-1.0);
  $("#x1").val(1.0);
  constructDataPoints().then(function(){
    updateResults();
    ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'scatter',

      // The data for our dataset
      data: {
        datasets: [
          {
          label: "Machine learned fit",
          backgroundColor: 'rgb(99, 99, 255)',
          borderColor: 'rgb(99, 99, 255)',
          data: predictedData,
            showLine:true,
            fill:false,
            pointRadius:0,
            hitRadius:3
            
          },{
          label: "Generated Data",
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: givenData
          }]
      },

      // Configuration options go here
      options: {maintainAspectRatio:false}
    });
  });
  $("#generateData").on('click', function(){
    if (inTraining === false && generating === false) {
      disable('generateData', 'Generating...')
      disable('fitCurve')
      generating = true;
      for (let i = 0; i < coefficients.length; i++) {
        coefficients[i] = parseInput('coeff' + i, 'float');
      }
      let numPoints = parseInput('numPoints','int');
      let displacement = parseInput('displacementFactor', 'float');
      let x0 = parseInput('x0','float');
      let x1 = parseInput('x1','float');
      generateSyntheticData(numPoints, displacement, polyC,[x0,x1])
      randomizeTrainingVars([x0,x1]);
      xs = tf.tensor2d(randomXs, [randomXs.length, 1]);
      ys = tf.tensor2d(randomYs, [randomYs.length, 1]);
      
      
      log('~ ML.fit$ generateData('+numPoints+', '+displacement+', '+ '['+x0+', '+x1+'])')
      $(".commandLine").css('display','none');
      constructDataPoints().then(function(){
        chart.data.datasets[0].data = predictedData;
        chart.data.datasets[1].data = givenData;
        chart.update();
        enable('generateData', 'Generate Data')
        generating = false;
        enable('fitCurve');
        $(".commandLine").css('display','block');
        scrollDown();
        updateResults();
      })
    }
  });
  $("#fitCurve").on('click', function(){
    if (inTraining === false && generating === false) {
      stopAnimation = false;
      disable('generateData')
      disable('fitCurve', 'Fitting...')
      
      
      let bsize = parseInput('batchSize','int')
      let maxEpoch = parseInput('maxEpoch','int')
      let learningRate = parseInput('learningRate','float')
      log('~ ML.fit$ fitCurve(xs,ys, '+bsize+', '+maxEpoch+', '+learningRate+')')
      $(".commandLine").css('display','none');
      setTimeout(function(){animateChart(xs, ys, bsize, 1, maxEpoch, learningRate)},500)
    }
  });
  $("#stopTraining").on('click', function(){
    stopTraining()
  });
  $("#learningRate").on('focus', function(){
    $("#popperDiv").css('opacity', 0);
  });
})

var stopAnimation = false;
var inTraining = false;
var generating = false;
async function animateChart(xs, ys, bsize, currentEpoch, maxEpoch, learningRate) {
  if (currentEpoch === 1) {
    log('Starting training with batchsize = ' + bsize + ', ' + maxEpoch + ' epochs, learning rate = ' + learningRate);
  }
  
  if (currentEpoch === maxEpoch + 1) {
    finishTraining();
    return;
  }
  if (stopAnimation === true) {
    finishTraining();
    return;
  }
  
  inTraining = true;
  train(xs, ys, bsize, learningRate).then(function(){
    constructDataPoints().then(function(){
      chart.data.datasets[0].data = predictedData;
      chart.data.datasets[1].data = givenData;
      chart.update();
      updateResults();
      log('Epoch ' + currentEpoch + ' / ' + maxEpoch)
      return animateChart(xs, ys, bsize, currentEpoch+1, maxEpoch, learningRate)
    });
  })
  
  
}

function log(message){
  $(".outputMessages").append('<span class="consoleMessageLine">' + message + '</span>');
  var elem = $(".console")[0];
  elem.scrollTop = elem.scrollHeight;
}
function scrollDown(){
  var elem = $(".console")[0];
  elem.scrollTop = elem.scrollHeight;
}
function disable(id, msg) {
  $("#" + id).addClass("disabled");
  if (msg) $("#" + id).text(msg);
}
function enable(id, msg){
  $("#" + id).removeClass("disabled");
  if (msg) $("#" + id).text(msg);
}
function parseInput(id, type){
  let val = 0;
  if (type === 'int'){
    val = parseInt($("#"+id).val());
    
  }
  if (type === 'float'){
    val = parseFloat($("#"+id).val());
  }
  $("#" + id).val(val);
  return val;
}
function stopTraining() {
  stopAnimation = true;
  log('Stopping training...');
  $(".commandLine").css('display','block');
  scrollDown();
}
async function updateResults() {
  let logError = false;
  for (let i = 0; i < coefficients.length; i++) {
    let thisCoeff = await tfCoeffs[i].data();
    $("#rCoeff" + i).val(thisCoeff[0].toFixed(4));
    if (isNaN(thisCoeff[0])){
      logError = true;
    }
  }
  let predsYs = predict(xs);
  let rmse = await loss(predsYs, ys).data();
  $("#rmse").val(rmse[0].toFixed(4));
  if (logError) {
    //Try reducing learning rate
    $("#popperDiv").css("opacity", "1");


  }
}
async function finishTraining(){
  inTraining = false;
  updateResults();
  enable('fitCurve', 'Fit Curve');
  enable('generateData');
  $(".commandLine").css('display','block');
  scrollDown();
}