/**
 * Entrée json
 */
var url = 'https://louis-brunet.github.io/test/genes/data.json';

/**
 * INITIALISATION DE LA TIMELINE
 */

var groups = [];
var GROUP_MUT = 1000;
var GROUP_CNV = 1001;
var GROUP_EXPR = 1002;
var GROUP_METH = 1003;

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

		return date.toDate().getTime()/1000 +' Kb';
	},
	majorLabels: function(date, scale, step) {
		return date.toDate().getTime()/1000 +' Kb';
	}
	},
	showMajorLabels: false,
	stack: false,
	orientation: 'top',
	min: new Date(0),
	dataAttributes: ['dataid']
};

// Chargement des données
var timeline;
var items = [];
var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = createTimeline;


// Création des tooltips
var tooltipsCreated = false;
setInterval(function() {
	if((!tooltipsCreated) && document.querySelectorAll('.anomalie-item').length > 1) {
		createTooltips();
		tooltipsCreated = true;
	}
},1500);


/******************
 * FONCTIONS
 */


function createTimeline() {
	loadData(request.response);

	groups = new vis.DataSet(groups);
	timeline = new vis.Timeline(container, items, groups, options);
}

function loadData(parsedData){
	loadStructureData(parsedData, items);
	groups.push(
		{id: GROUP_MUT, content: 'Mut.', value: GROUP_MUT},
		{id: GROUP_CNV, content: 'CNv', value: GROUP_CNV},
		{id: GROUP_EXPR, content: 'Exp.', value: GROUP_EXPR},
		{id: GROUP_METH, content: 'Mét.', value: GROUP_METH}
	);
	loadAnomaliesData(parsedData.anomalies, items);
	items = new vis.DataSet(items);
}


/****
 * FCTS - ANOMALIES
 */

function loadAnomaliesData(parsedArray, loadedItems) {
	if(Array.isArray(parsedArray) ) {
		for (let i = 0; i < parsedArray.length; i++) {
			loadAnomalie(parsedArray[i], loadedItems);
		}
	}
}

/**
 * Create exploitable item based on parsedItem,
 * put it in itemArray
 */
function loadAnomalie(parsedItem, itemArray) {
	let item = {
		id: itemArray.length,
		dataid: itemArray.length,
		group: null,
		content: '',
		start: new Date(parseInt(parsedItem.start)),
		datatype: parsedItem.type,
		datasoustype: parsedItem.soustype,
		datagnomen: parsedItem.gnomen,
		datapnomen: parsedItem.pnomen,
		datacnomen: parsedItem.cnomen
	};

	switch(parsedItem.famille) {
		case 'mutation':
			item.group = GROUP_MUT;
			break;
		case 'copy':
			item.group = GROUP_CNV;
			break;
		case'expr':
			item.group = GROUP_EXPR;
			break
		case'meth':
			item.group = GROUP_METH;
			break
	}

	switch (parsedItem.type) {
		case 'fa':
		case 'FA':
			item.className = 'type-fa';
			//item.content = 'FA';
			break;
		case 'hd':
		case 'HD':
			item.className = 'type-hd';
			//item.content = 'HD';
			break;
		case 'perte':
		case 'P':
		case 'p':
			item.className = 'type-perte';
			//item.content = 'P';
			break;
		case 'gain':
		case 'g':
		case 'G':
			item.className = 'type-gain';
			//item.content = 'G';
			break;
		case 'up':
			item.className = 'type-up';
			//item.content = 'up';
			break;
		case 'down':
			item.className = 'type-down';
			//item.content = 'down';
			break;
		case 'no-diff':
		case 'nodiff':
			item.className = 'type-no-diff';
			//item.content = 'nodiff';
			break;
		case 'hyper':
			item.className = 'type-hyper';
			//item.content = 'hyper';
			break;
		case 'hypo':
			item.className = 'type-hypo';
			//item.content = 'hypo';
			break;

	}

	if(parsedItem.famille == 'mutation') {
		item.className += ' type-' + parsedItem.soustype;
	}

	//if(parsedItem.end != parsedItem.start) {
		item.end = new Date(parseInt(parsedItem.end));
	//}


	item.className += ' anomalie-item';
	itemArray.push(item);
}

function createTooltips() {
	// Find items w/ className contains anomalie-item
	let tooltipItems = items.get({
		filter: function(i) {
			return i.className.includes('anomalie-item');
		}
	});

	// Find corresponding tooltip containers in DOM
	let tooltipContainers = document.querySelectorAll('.vis-range.anomalie-item, .vis-box.anomalie-item');

	// Set select on hover for all containers to keep tooltip above all items
	setSelectOnHover(tooltipContainers);

	// For each (tooltip item, container) where item.id == container.dataset.
	// create tooltip w/ item data
	for (let i = 0; i < tooltipItems.length; i++) {
		for (let j = 0; j < tooltipContainers.length; j++) {  
			if(tooltipItems[i].id == tooltipContainers[j].dataset.dataid ){
				createTooltip(tooltipItems[i], tooltipContainers[j]);

				break;
			}
	   } 
	}
}

function setSelectOnHover(containers) {
	containers.forEach(function(cont){
		cont.addEventListener('mouseover',function(e) {
			timeline.setSelection([]);
			timeline.setSelection(cont.dataset.dataid);
		});
	});
}

/**
 * Create DOM elements in container based on item's properties
 */
function createTooltip(item, container) {
	let tooltipNode = document.createElement('div');
	tooltipNode.className = 'tooltip-text';


	let positionStr = item.start.getTime().toString();
	if(item.hasOwnProperty('end')) {
		positionStr += ' - ' + item.end.getTime().toString();
	}
	tooltipNode.appendChild(createTooltipDiv('Position : ', positionStr, 'tooltip-position'));

	let typeStr = item.datatype;
	tooltipNode.appendChild(createTooltipDiv('Type : ', typeStr, 'tooltip-type'));
	
	let soustypeStr = item.datasoustype;
	tooltipNode.appendChild(createTooltipDiv('Sous-type : ', soustypeStr, 'tooltip-soustype'));

	tooltipNode.appendChild(createTooltipDiv('G nomen : ', item.datagnomen, 'tooltip-gnomen'));
	tooltipNode.appendChild(createTooltipDiv('P nomen : ', item.datapnomen, 'tooltip-pnomen'));
	tooltipNode.appendChild(createTooltipDiv('C nomen : ', item.datacnomen, 'tooltip-cnomen'));

	container.appendChild(tooltipNode);
}

/**
 * Return new div Element containing a label span and a val span
 */
function createTooltipDiv(label, text, className) {
	let res = document.createElement('div');
	res.className = className;
	res.appendChild(createSpan(label, 'tooltip-label'));
	res.appendChild(createSpan(text, 'tooltip-val'));
	return res;
}

function createSpan(text, className) {
	let res = document.createElement('span');
	res.className = className;
	res.appendChild(document.createTextNode(text));
	return res;
}


/****
 * FCTS - STRUCTURE
 */

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
	let groupId = groups.length + 1;
	groups.push(
		{
			id: groupId,
			content: '<div class="comp-type ' + component.type + (component.hasOwnProperty('ref') ? '':' noref' )+'">&lt;'+component.type+'&gt;</div>' + (component.hasOwnProperty('ref') ? '<div class="comp-ref">'+component.ref+'</div>' : ''),
			value: groupId
		});

	// load exons
	let exons = component.exons.split(';');
	for (let i = 0; i < exons.length; i++) {
		const exon = exons[i];
		let createdItem = createItem(exon, groupId, component.type, exonArray.length);
		if(createdItem.className.includes('protein_coding') && ! component.hasOwnProperty('ref')) {
			createdItem.className += ' noref';
		}
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


/**
 * Afficher une capture d'ecran du graphe
 */
function capture() {
	html2canvas(document.getElementById('to-capture')).then(function(canvas) {
		document.getElementById('output-card').style.display = 'block';
		// Export the canvas to its data URI representation
		var base64image = canvas.toDataURL("image/jpeg");
		// Display image in #output element
		document.getElementById('output').src = base64image;
	});
}