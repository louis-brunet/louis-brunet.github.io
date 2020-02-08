/**
 * Création de la timeline
 */
var aGroups = [];
var aContainer = document.getElementById('structure');
var aOptions = {};

var aTimeline;
var aItems = [];
var aUrl = 'https://louis-brunet.github.io/test/genes/data-anomalies.json';
var aRequest = new XMLHttpRequest();
sRequest.open('GET', aUrl);
sRequest.responseType = 'json';
sRequest.send();

sRequest.onload = createAnomaliesTimeline; 

 /**
  * Fonctions
  */

function createAnomaliesTimeline(){
    loadAnomaliesData(aRequest.response);

    aTimeline = new vis.Timeline(aContainer, aItems, aGroups, aOptions);
}

function loadAnomaliesData(jsonData) {

}