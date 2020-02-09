/**
 * ENTREE JSON
 */
 var url = 'https://louis-brunet.github.io/test/matrix/data.json'


var drivers = [];
var anomalies = [];

var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = init;


/**
 * FONCTIONS 
 */

 function init() {
    loadData();
 }

 function loadData() {

 }