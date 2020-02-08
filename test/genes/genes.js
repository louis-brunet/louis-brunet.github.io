/**
 * Entrée json
 */
var sUrl = 'https://louis-brunet.github.io/test/genes/data-struct.json';
var url = 'https://louis-brunet.github.io/test/genes/data.json';

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
  orientation: 'top',
  timeAxis: {
      scale: 'millisecond',
      step: 5000
    },
  showMajorLabels: false,
  stack: false
};

// Chargement des données
// var sTimeline;

// var sItems = [];
// let sRequest = new XMLHttpRequest();
// sRequest.open('GET', sUrl);
// sRequest.responseType = 'json';
// sRequest.send();

// sRequest.onload = createStructureTimeline; 



var timeline;
var items = [];
var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = createTimeline;

/**
 * FONCTIONS
 */

function createTimeline() {
	loadData(request.response);

	sGroups = new vis.DataSet(sGroups);
	timeline = new vis.Timeline(sContainer, items, sGroups, sOptions);
}

function loadData(parsedData){
	loadStructureData(parsedData, items);
	sGroups.push(
		{id: 1000, content: 'Mut', value: 1000},
		{id: 1001, content: 'CNv', value: 1001},
		{id: 1002, content: 'Exp', value: 1002},
		{id: 1003, content: 'Mét', value: 1003}
	);
	loadAnomaliesData(parsedData.anomalies, items);
	items = new vis.DataSet(items);
}

function loadAnomaliesData(parsedArray, loadedItems) {
	if(Array.isArray(parsedArray) ) {
		for (let i = 0; i < parsedArray.length; i++) {
			loadAnomalie(parsedArray[i], loadedItems);
		}
	}
}

/**
 * Create item from parsedItem,
 * put it in itemArray
 * @param  parsedItem 
 * @param  itemArray 
 */
function loadAnomalie(parsedItem, itemArray) {
	let item = {
		id: itemArray.length,
		group: null,
		content: null,
		start: new Date(parseInt(parsedItem.start))
	};

	switch(parsedItem.famille) {
		case 'mutation':
			item.group = 1000;
			break;
		case 'copy':
			item.group = 1001;
			break;
		case'expr':
			item.group = 1002;
			break
		case'meth':
			item.group = 1003;
			break
	}

	switch (parsedItem.type) {
		case 'fa':
		case 'FA':
			item.className = 'fa';
			item.content = 'FA';
			break;
		case 'hd':
		case 'HD':
			item.className = 'hd';
			item.content = 'HD';
			break;
		case 'perte':
		case 'P':
		case 'p':
			item.className = 'perte';
			item.content = 'P';
			break;
		case 'gain':
		case 'g':
		case 'G':
			item.className = 'gain';
			item.content = 'G';
			break;
		case 'up':
			item.className = 'up';
			item.content = 'up';
			break;
		case 'down':
			item.className = 'down';
			item.content = 'down';
			break;
		case 'no-diff':
		case 'nodiff':
			item.className = 'no-diff';
			item.content = 'nodiff';
			break;
		case 'hyper':
			item.className = 'hyper';
			item.content = 'hyper';
			break;
		case 'hypo':
			item.className = 'hypo';
			item.content = 'hypo';
			break;

	}

	if(parsedItem.famille == 'mutation') {
		item.className += ' ' + parsedItem.soustype;
		switch(parsedItem.type) {
			case 'snp':
				item.content = 'S';
				break;
			case 'ins':
				item.content = 'I';
				break;
			case 'del':
				item.content = 'D';
				break;
		}
	}

	if(parsedItem.end != parsedItem.start) {
		item.end = new Date(parseInt(parsedItem.end));
	}


	item.className += ' anomalie-item';
	itemArray.push(item);
}
function createStructureTimeline() {
	const parsedData = sRequest.response;

	loadStructureData(parsedData);

	// AFfichage
	sTimeline = new vis.Timeline(sContainer, sItems, sGroups, sOptions); 
	 
}

function loadStructureData(parsedData, loadedItems) {

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

	item.className += ' struct-item';

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