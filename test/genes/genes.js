/**
 * INITIALISATION DE LA TIMELINE
 */

var sGroups = [];

// create visualization
var sContainer = document.getElementById('structure');


var sOptions = {
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
      step: 10000
    },
  showMajorLabels: false,
  stack: false
};

// Chargement des données
var sTimeline;

var sItems = [];
let sUrl = 'https://louis-brunet.github.io/test/genes/data-struct.json';
let sRequest = new XMLHttpRequest();
sRequest.open('GET', sUrl);
sRequest.responseType = 'json';
sRequest.send();

sRequest.onload = createStructureTimeline; 

/**
 * FONCTIONS
 */

function createStructureTimeline() {
	const parsedData = sRequest.response;

	loadData(parsedData);

	// AFfichage
	sTimeline = new vis.Timeline(sContainer, sItems, sGroups, sOptions); 
	 
}



function loadData(parsedData) {
	let loadedItems = [];

	document.getElementById('name').innerHTML = parsedData.name;
	document.getElementById('ch').innerHTML = parsedData.ch;
	document.getElementById('start').innerHTML = parsedData.start;
	document.getElementById('end').innerHTML = parsedData.end;
	document.getElementById('strand').innerHTML = parsedData.strand;
	document.getElementById('ref').innerHTML = parsedData.ref;
	document.getElementById('ref').href = parsedData.ref;

	if(Array.isArray(parsedData.components) ) {
		for (let i = 0; i < parsedData.components.length; i++) {
			loadComponent(parsedData.components[i], loadedItems);
		}
	}

	sItems = new vis.DataSet(loadedItems);
	sGroups = new vis.DataSet(sGroups);
}

function loadComponent(component, exonArray) {
	// create component group
	let groupId = sGroups.length + 1;
	sGroups.push(
		{
			id: groupId,
			content: '<div class="comp-type '+component.type+'">&lt;'+component.type+'&gt;</div>' + '<div class="comp-ref">'+component.ref+'</div>',
			value: groupId
		});

	// load exons
	let exons = component.exons.split(';');
	for (let i = 0; i < exons.length; i++) {
		const exon = exons[i];
		let createdItem = createItem(exon, groupId, component.type, exonArray.length);
		exonArray.push(createdItem);
	}  

	// create lines to link adjacent ranges
	// (items w/ CSS height: 0  ?)
	createLines(exonArray, groupId);
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

/**
 * For each item, find next recent item if if exists
 * Link them
 * */	
function createLines(exonArray, groupId) {
	let groupExons = exonArray.filter(e => e.group == groupId).sort(function(a,b) {
		return a.start.getTime() - b.start.getTime();
	});
	
	for (let i = 0; i < groupExons.length - 1; i++) {
		const element = groupExons[i];
		const nextElement = groupExons[i + 1];
		let lineItem = createLineItem(element, nextElement, exonArray.length);
		exonArray.push(lineItem);
	}
}

function createLineItem(exonItem, nextExonItem, nbItems) {
	return {
		id: nbItems,
		group: exonItem.group,
		className: exonItem.className + ' line',
		start: exonItem.end,
		end: nextExonItem.start
	};
}