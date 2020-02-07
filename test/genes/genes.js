/**
 * INITIALISATION DE LA TIMELINE
 */

var groups = [];

// create visualization
var container = document.getElementById('visualization');


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
  format: {
    minorLabels: function(date, scale, step) {
      //alert('date : '+date+'\nscale : '+scale+'\nstep : '+step);

      return date.toDate().getTime();
    }/*,
    
    minorLabels: {millisecond:'SSSSSS'}*/
  },
  orientation: {
    axis: 'top'
  },
  timeAxis: {
      scale: 'millisecond',
      step: 5000
    },
  showMajorLabels: false,
  stack: false
};

// Chargement des données
var timeline;

var items = [{id:1,group:1,start:new Date(287440), end:new Date(352673)}];
let url = 'https://louis-brunet.github.io/test/genes/data-struct.json';
var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();

request.onload = createTimeline; 

/**
 * FONCTIONS
 */

function createTimeline() {
  const parsedData = request.response;

  loadData(parsedData);

  // AFfichage
  timeline = new vis.Timeline(container, items, groups, options); 
  timeline.on('rangechange', function() {
    exonsAligned = false;
  }); 
}



function loadData(parsedData) {
  let loadedExons = [];

  document.getElementById('name').innerHTML = parsedData.name;
  document.getElementById('ch').innerHTML = parsedData.ch;
  document.getElementById('start').innerHTML = parsedData.start;
  document.getElementById('end').innerHTML = parsedData.end;
  document.getElementById('strand').innerHTML = parsedData.strand;
  document.getElementById('ref').innerHTML = parsedData.ref;
  document.getElementById('ref').href = parsedData.ref;
  
  if(Array.isArray(parsedData.components) ) {
    for (let i = 0; i < parsedData.components.length; i++) {
      loadComponent(parsedData.components[i], loadedExons);
    }
  }

  items = new vis.DataSet(loadedExons);
  groups = new vis.DataSet(groups);
}

function loadComponent(component, exonArray) {
  // create component group
  let groupId = groups.length + 1;
  groups.push(
    {
      id: groupId,
   //   content: component.type + ' ' + component.ref,
      content: '<div class="comp-type">&lt;'+component.type+'></div>' + '<div class="comp-ref">'+component.ref+'</div>',
      value: groupId
    });

  // load exons
  let exons = component.exons.split(';');
  for (let i = 0; i < exons.length; i++) {
    const exon = exons[i];
    let createdItem = createItem(exon, groupId, component.type, exonArray.length);
    exonArray.push(createdItem);
  }  

  // create lines to link ranges (items w/ CSS height: 0)
}

function createItem(exon, groupId, compType, nbItems) {
  let period = exon.split('-');

  let item = {
    id: nbItems,
    group: groupId,
    className: compType,
    start: new Date(parseInt(period[0])),
    end: new Date(parseInt(period[1]))
  };
  
  return item;
}

// function alignExons() {
// 	let rangeItems = document.querySelectorAll('.vis-range');

// 	// Align
// 	for (let i = 0; i < rangeItems.length; i++) {
// 		const element = rangeItems[i];
		
// 		element.style.top = '5px';
// 	}

//   return rangeItems.length > 0;
// }