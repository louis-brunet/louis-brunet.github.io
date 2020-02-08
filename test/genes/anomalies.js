/**
 * Création de la timeline
 */
var aGroups = [];
var aContainer = document.getElementById('structure');
var aOptions = {};

var aTimeline;
var aItems = [];
var aUrl = 'https://louis-brunet.github.io/test/genes/data-anomalies.json';
let aRequest = new XMLHttpRequest();
aRequest.open('GET', aUrl);
aRequest.responseType = 'json';
aRequest.send();

// sRequest.onload = createAnomaliesTimeline; 

 /**
  * Fonctions
  */


function createAnomaliesTimeline(){
    loadAnomaliesData(aRequest.response);

    aTimeline = new vis.Timeline(aContainer, aItems, aGroups, aOptions);
}

function loadAnomaliesData(jsonData) {

}