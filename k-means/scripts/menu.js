var initializeMeansHTML = "<div id='popupMessage'><h2 id='popupTitle'>Initialization</h2><p>Select Means Initialization Method</p><select><option>Random</option><option>K++</option></select><div id=popupForm><label>Number of Means</label><input id='numOfMeans'></div><div class='btn btn-secondary' id='initialize_means' onclick='initializeMeansButton()'>Initialize Means</div>";
var generateRandomHTML = "<div id='popupMessage'><h2 id='popupTitle'>Generate Random Data</h2><div><label>Number of Data Points</label><input id='numOfPoints'><label>Number of Clusters/Unique Data Labels</label><input id='numOfClusters'></div><p>Select Data Generation Method</p><select><option>Normal Distribution Around Center</option><option>Complete Random about Center within range</option></select><br><br><div class='btn btn-secondary' id='generateData' onclick='generateDataButton()'>Generate Data</div></div>";