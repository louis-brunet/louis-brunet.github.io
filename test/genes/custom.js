/**
 * INITIALISATION DE LA TIMELINE
 */

var groups = new vis.DataSet([
      {id: 0, content: 'Pathologies tumorales', value: 2},
      {id: 1, content: 'Examens', value: 7},
      {id: 2, content: 'Traitements locaux', value: 4},
      {id: 3, content: 'Consultations', value: 1},
      {id: 4, content: 'Pathologies non tumorales', value: 3},
      {id: 5, content: 'Complications', value: 6},
      {id: 6, content: 'Traitements systémiques', value: 5}
    ]);

// create visualization
var container = document.getElementById('visualization');

// calculate end date (now + 6 months)
let now = new Date();
let offsetEndMonths = 1;
let initEnd = now.getTime() + offsetEndMonths * 1000*60*60*24*30.42; 


var options = {
  // option groupOrder can be a property name or a sort function
  // the sort function must compare two groups and return a value
  //     > 0 when a > b
  //     < 0 when a < b
  //       0 when a == b
  groupOrder: function (a, b) {
    return a.value - b.value;
  },
  editable: false,
  multiselect: false,
  hiddenDates: [],
  end: initEnd,
  dataAttributes: ['dataId', 'tooltip']
};

// Chargement des données
var timeline;
let url = 'https://louis-brunet.github.io/test/data.json';
var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();

request.onload = createTimeline; 


/**
 * FONCTIONS
 */

f

function createItem(parsedItem, id) {
  let res = {
    id: id,
    dataId: id,
    group: null,
    className: parsedItem.className,
    content: parsedItem.content,
    start: new Date(parsedItem.start)
  };

  switch (res.className) {
    case 'consultation':
      res.group = 3;
      break;
    case 'path-t':
      res.group = 0;
      break;
    case 'path-nt':
      res.group = 4;
      break;
    case 'examen':
      res.group = 1;
      break;
    case 'comp':
      res.group = 5;
      break;
    case 'traitement-l':
      res.group = 2;
      break;
    case 'traitement-s':
      res.group = 6;
      break;
  }

  if (parsedItem.hasOwnProperty('end') && (parsedItem['end'] != parsedItem['start'])) {
    if(parsedItem.end != "" && parsedItem.end != " ")
      res.end = new Date(parsedItem.end);
    else {
      res.end = new Date();
    }
  }

  if (parsedItem.hasOwnProperty('text') ){
    // res.title = parsedItem.text;

    res.className = res.className + ' tooltip';
    res['tooltip'] = parsedItem.text;
  } else {
    res.title = res.content; // TODO remove ?
  }

  if(parsedItem.hasOwnProperty('link')) {
    res.link = parsedItem.link;
    res.className = res.className + ' link';
  }

  return res;
}

function createTimeline() {
  const parsedData = request.response;

  loadData(parsedData);

  incrementContents();

  // AFfichage
  timeline = new vis.Timeline(container, items, groups, options);
  timeline.on('select', onSelect);
  
  hideAllEmptySpace(document.getElementById('tolerance').value);
}



function loadData(parsedData) {
  let loadedItems = [];
  let i = 0;
  if(parsedData[0].hasOwnProperty('name')) {
    i = 1;
    document.getElementById('name').innerHTML = parsedData[0].name;
    document.getElementById('type').innerHTML = parsedData[0].type;
    
    document.getElementById('civilite').innerHTML =
     (parsedData[0].sexe == 'h') || (parsedData[0].sexe == 'H') ? 'Monsieur' : 'Madame';
    document.getElementById('ipp').innerHTML = parsedData[0].ipp;
  }

  for (; i < parsedData.length; i++) {
    let parsedItem = createItem(parsedData[i], i);

    loadedItems.push(parsedItem);

  }

  items = new vis.DataSet(loadedItems);
}
