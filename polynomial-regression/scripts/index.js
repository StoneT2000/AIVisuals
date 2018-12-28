var chart;
var ctx;
$(document).ready(function () {
  
  //generateSyntheticData(50, 0.2, polyC);
  constructDataPoints().then(function(){
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
            radius:0,
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
      generating = true;
      let generated = generateSyntheticData()
      randomizeTrainingVars();
      generating = !generated;
      constructDataPoints().then(function(){
        chart.data.datasets[0].data = predictedData;
        chart.data.datasets[1].data = givenData;
        chart.update();
        enable('generateData', 'Generate Data')
      })
    }
  });
  $("#fitCurve").on('click', function(){
    if (inTraining === false && generating === false) {
      stopAnimation = false;
      disable('generateData')
      disable('fitCurve', 'Fitting...')
    }
  })
})

var stopAnimation = false;
var inTraining = false;
var generating = false;
function animateChart(xs, ys, bsize, currentEpoch, maxEpoch, learningRate) {
  if (currentEpoch === 1) {
    log('Starting training')
  }
  
  if (currentEpoch === maxEpoch + 1) {
    
    return;
  }
  if (stopAnimation === true) {
    return;
  }
  log('Epoch ' + currentEpoch + ' / ' + maxEpoch)
  inTraining = true;
  train(xs, ys, bsize, learningRate).then(function(){
    constructDataPoints().then(function(){
      chart.data.datasets[0].data = predictedData;
      chart.data.datasets[1].data = givenData;
      chart.update();
      return animateChart(xs, ys, bsize, currentEpoch+1, maxEpoch, learningRate)
    });
  })
  
  
}

function log(message){
  console.log(message);
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
  if (type === 'int') return parseInt($("#"+id).val())
  if (type === 'float') return parseFloat($("#"+id).val())
}