var chart;
var originalChart;
var ctx;
var lrPopper;
var means = [];
$(document).ready(function () {
  //generateSyntheticData(10).then(displayPredictedData(givenData,[0,1]));
  generateSyntheticData(200).then(displayRawUnlabeledData(originalData));
  displayOriginalLabels(originalData);
  $("#generate_random").on('click', function(){
    
  })
  $("#generate_random_popup").on('click', function(){
    $("#popupMessageWrapper").css('display','block');
    $("#pageCover").css('display','block');
    $("#popupMessageWrapper").html(generateRandomHTML);
  })
  $("#iterate").on('click', function() {
    displayAndIterate(givenData,means);
    //let acc = calculateAccuracy(givenData,originalData);
    //$("#accuracy").text(acc.toFixed(4));
  });
  $("#initialize_means_popup").on('click', function(){
    $("#popupMessageWrapper").css('display','block');
    $("#pageCover").css('display','block');
    $("#popupMessageWrapper").html(initializeMeansHTML);
  });
  $("#initialize_means").on('click', function(){
    
  })
})
function initializeMeansButton() {
  $("#popupMessageWrapper").css('display','none');
  let v = $("#numOfMeans").val();
  means = randomMeansInitialization(givenData, v);
  displayRawUnlabeledData(originalData);
  for (let i = 0; i < originalData.length; i++) {
    givenData[i].label = originalData[i].label;
  }
  unlabeledDataDisplayed = true;
  displayMeans(means);

  $("#pageCover").css('display','none');
}
function generateDataButton() {
  chart.destroy();
  let numPoints = $("#numOfPoints").val();
  let clusters = $("#numOfClusters").val();
  generateSyntheticData(numPoints, clusters).then(displayRawUnlabeledData(givenData));
  displayOriginalLabels(originalData);
  unlabeledDataDisplayed = true;
  $("#popupMessageWrapper").css('display','none');
$("#pageCover").css('display','none');
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

var colors = ['rgb(255, 99, 132)','rgb(55, 159, 255)','rgb(155, 99, 255)', '#a4ddac']
var colorsMeans = ['rgb(205, 89, 122)','#2366a3','#56378c', '#57755b']
async function displayPredictedData(data, means){
  //updateResults();
  
  let datasets = [];
  for (let i = 0; i < means.length; i++) {
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
      for (; i < datasets[k].data.length; i++) {
        if (i < chart.data.datasets[k].data.length){
          chart.data.datasets[k].data[i] = datasets[k].data[i]; 
        }
        else {
          chart.data.datasets[k].data.push(datasets[k].data[i]);
        }
      }
      chart.data.datasets[k].data.splice(i,chart.data.datasets[k].data.length);
      
      chart.data.datasets[k+1].data[0].x = datasets[k+1].data[0].x;
      chart.data.datasets[k+1].data[0].y = datasets[k+1].data[0].y;
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
      legend:legendOption
             
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