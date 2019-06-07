var chart;
var originalChart;
var ctx;
var lrPopper;
var means = [];
var numPoints = 400;
var numClusters = 3;
var standardDeviation = 0.1;
var numMeans = 3;
$(document).ready(function () {
  $(".popupMessage").css('display','none');
  
  //Initialize settings
  $("#numOfPoints").val(numPoints);
  $("#numOfClusters").val(numClusters);
  $("#numOfMeans").val(numMeans);
  $("#std").val(standardDeviation);
  
  //generateSyntheticData(10).then(displayPredictedData(givenData,[0,1]));
  generateSyntheticData(numPoints, numClusters,standardDeviation).then(displayRawUnlabeledData(originalData));
  displayOriginalLabels(originalData);
  $("#generate_random_popup").on('click', function(){
    $("#popupMessageWrapper").css('display','block');
    $("#pageCover").css('display','block');
    $("#generatePopup").css('display','block');
  })
  
  
  
  $("#iterate").on('click', function() {
    displayAndIterate(givenData,means);
    //let acc = calculateAccuracy(givenData,originalData);
    //$("#accuracy").text(acc.toFixed(4));
  });
  $("#initialize_means_popup").on('click', function(){
    $("#popupMessageWrapper").css('display','block');
    $("#pageCover").css('display','block');
    $("#initializePopup").css('display','block');
  });
})
function initializeMeansButton() {
  
  numMeans = parseInt($("#numOfMeans").val());
  means = randomMeansInitialization(givenData, numMeans);
  displayRawUnlabeledData(originalData);
  for (let i = 0; i < originalData.length; i++) {
    givenData[i].label = originalData[i].label;
  }
  unlabeledDataDisplayed = true;
  displayMeans(means);

  $("#popupMessageWrapper").css('display','none');
  $("#pageCover").css('display','none');
  $(".popupMessage").css('display','none');
}
function generateDataButton() {
  chart.destroy();
  numPoints = parseInt($("#numOfPoints").val());
  numClusters = parseInt($("#numOfClusters").val());
  let genType = $("#selectGenerator").val()
  if (genType == "Normal Distribution Around Center") {
    
  }
  else if (genType == "Complete Random about Center within range") {
    
  }
  standardDeviation = parseFloat($("#std").val());
  generateSyntheticData(numPoints, numClusters,standardDeviation).then(displayRawUnlabeledData(givenData));
  displayOriginalLabels(originalData);
  unlabeledDataDisplayed = true;
  $("#popupMessageWrapper").css('display','none');
  $("#pageCover").css('display','none');
  $(".popupMessage").css('display','none');
}
function parseThis(a){
  
}

var unlabeledDataDisplayed = true;
function calculateAccuracy(data,originalData) {
  let correct = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].label == originalData[i].label) {
      correct += 1;
    }
  }
  return correct/data.length;
}
//Display original labels in chart originalChart
function displayOriginalLabels(originalData) {
  if (originalChart){
    originalChart.destroy();
  }
  let datasets = [];
  for (let i = 0; i < originalLabelCounts; i++) {
    datasets.push(
    {
        label: "Label " + (i+1),
        backgroundColor: 'rgba(255, 99, 132,0)',
        borderColor: colors[i % colors.length],
        data: (originalData.filter( a => a.label == i ? true : false)),
        pointBorderWidth: 1,
        pointBorderColor:colors[i % colors.length],
    });
    
  }
  ctx = document.getElementById('origChart').getContext('2d');
  originalChart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'scatter',

    // The data for our dataset
    data: {
      datasets: datasets
    },
    options: {
      maintainAspectRatio:false,
      tooltips: {
          callbacks: {
              label: function(tooltipItem, data) {
                  var label = data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                      label += ': (';
                  }
                  label += tooltipItem.xLabel.toFixed(3);
                  label += ', ' +  tooltipItem.yLabel.toFixed(3) + ')';
                  return label;
              }
          }
      },
      legend:legendOption
    }
  });
}

//Iterate with k-means and display the predicted labels
async function displayAndIterate(data,meansArr) {
  if (means.length == 0) {
    alert("Means not initialized yet");
  }
  let res = await kMeansIterate(data,meansArr);
  data = res.data;
  means = res.means;
  console.log(data,means);
  displayPredictedData(data,means);
}

var colors = ['rgb(255, 99, 132)','rgb(55, 159, 255)','#3cbbb1','rgb(155, 99, 255)', '#a4ddac','#ff8469','#c7cfd1','#ffaa5a']
var colorsMeans = ['rgb(205, 89, 122)','#2366a3','#2c8981','#56378c', '#57755b','#d1634a','#9fa6a7','#ba7c42']
async function displayPredictedData(data, means){
  //updateResults();
  
  let datasets = [];
  for (let i = 0 ; i< means.length; i++) {
    datasets.push(
    {
        label: "Mean " + (i+1),
        backgroundColor: 'rgba(255, 99, 132,0)',
        borderColor: colorsMeans[i % colorsMeans.length],
        data: ([means[i]]),
        pointBorderWidth: 3,
        pointBorderColor:colorsMeans[i % colorsMeans.length],
        pointStyle: 'crossRot',
        pointRadius: 10,
        pointHoverRadius: 12,
    });
    datasets.push(
    {
        label: "Label " + (i+1),
        backgroundColor: 'rgba(255, 99, 132,0)',
        borderColor: colors[i % colors.length],
        data: (data.filter( a => a.label == i ? true : false)),
        pointBorderWidth: 1,
        pointBorderColor:colors[i % colors.length],
        hoverRadius: 10,
    });
    
  }
  
  ctx = document.getElementById('chart').getContext('2d');
  if (unlabeledDataDisplayed === true) {
    chart.destroy();

    chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'scatter',

      // The data for our dataset
      data: {
        datasets: datasets
      },
      options: {
        maintainAspectRatio:false,
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ': (';
                    }
                    label += tooltipItem.xLabel.toFixed(3);
                    label += ', ' +  tooltipItem.yLabel.toFixed(3) + ')';
                    return label;
                }
            }
        },
        legend:legendOption
      }
    });
    unlabeledDataDisplayed = false;
  }
  else {
    //chart.data.datasets =  datasets;
    for (let k = 0; k < chart.data.datasets.length; k+=2) {
      //remove the old labels and move them to new label, same object
      var i = 0;
      for (; i < datasets[k+1].data.length; i++) {
        if (i < chart.data.datasets[k+1].data.length){
          chart.data.datasets[k+1].data[i] = datasets[k+1].data[i]; 
        }
        else {
          chart.data.datasets[k+1].data.push(datasets[k+1].data[i]);
        }
      }
      chart.data.datasets[k+1].data.splice(i,chart.data.datasets[k+1].data.length);
      
      chart.data.datasets[k].data[0].x = datasets[k].data[0].x;
      chart.data.datasets[k].data[0].y = datasets[k].data[0].y;
    }
    chart.update();
  }
}
async function displayRawUnlabeledData(data){
  //updateResults();
  if (chart) {
    chart.destroy();
  }
  let datasets = [];
  datasets.push(
  {
      label: "Unlabeled Data",
      backgroundColor: 'rgba(255, 99, 132,0)',
      borderColor: 'rgba(133,133,133)',
      data: data.map(function(a){return {x:a.x,y:a.y}}),
      pointBorderWidth: 1,
      pointBorderColor:'rgba(133,133,133)',
  }
  );

  ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'scatter',

    // The data for our dataset
    data: {
      datasets: datasets
    },
    options: {
      maintainAspectRatio:false,
      tooltips: {
          callbacks: {
              label: function(tooltipItem, data) {
                  var label = data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                      label += ': (';
                  }
                  label += tooltipItem.xLabel.toFixed(3);
                  label += ', ' +  tooltipItem.yLabel.toFixed(3) + ')';
                  return label;
              }
          }
      },
      legend:legendOption,
      scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 1
                }
            }]
        }
             
    }
  });
  
}
var legendOption = {
  labels: {
    boxWidth: 15
  }
}
async function displayMeans(meansArr) {
  let datasets = [];
  for (let i = 0; i < means.length; i++) {
    datasets.push(
    {
        label: "Mean " + (i+1),
        backgroundColor: 'rgba(255, 99, 132,0)',
        borderColor: colorsMeans[i % colorsMeans.length],
        data: ([meansArr[i]]),
        pointBorderWidth: 3,
        pointBorderColor:colorsMeans[i % colorsMeans.length],
        pointStyle: 'crossRot',
        pointRadius: 10,
        pointHoverRadius: 12,
    });
    
  }
  chart.data.datasets.push(...datasets);
  chart.update();
}