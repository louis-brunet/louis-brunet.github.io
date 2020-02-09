/**
 * JSON ENTRY
 */
 var url = 'https://louis-brunet.github.io/test/matrix/data.json'

var rowContent; // 'gene' or 'patient'
var driver; // {nom: 'txt', genes: ['gene1','gene2',...]}
var drivers = []; // [{nom: 'txt', genes: 'gene1;gene2;...'},...]
var anomalies; // DataSet {id, patient, gene, famille, type}

var items = []; // [{patient: '000', gene: 'nom', mut-nb: 1, cn-nb: 3, ... }, ... ]

var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = init;

/**
 * FUNCTIONS 
 */

 function init() {
    loadData();
    config();
    letorderRows();  
 }

 /**
  * Load drivers and anomalies
  */
 function loadData() {
    let response = request.response;
    // Check if input is array of length 2 and anomalies is array
    if( !Array.isArray(response) || response.length != 2 || !Array.isArray(response[1])){
        alert('wrong format');
        return;
    }
    // Load list of available drivers from input array's first element
    drivers = response[0];

    // Load anomalies
    let createdItems = [];

    for (let i = 0; i < response[1].length; i++) {
       let item = {
           id:      i,
           patient: response[i].patient,
           gene:    response[i].gene,
           famille: response[i].famille,
           type:    response[i].type
       }
       
        createdItems.push(item);
    }
    anomalies = new vis.DataSet(createdItems);
 }


 /** 
  * Set driver to d, parsing d for genes
  */
 function setDriver(d) {
    driver = {
        nom:    d.nom,
        genes:  d.genes.split(';')
    }
 }

 function config() {
    // TODO user choice 
    setDriver(drivers[0]);
    rowContent = 'gene';
 }
