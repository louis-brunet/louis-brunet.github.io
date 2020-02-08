/**
 * Entrée json
 */
var aUrl = 'https://louis-brunet.github.io/test/genes/data-anomalies.json';


/**
 * Création de la timeline
 */
var aGroups = new vis.DataSet([
	{id: 0, content: 'Mut', value: 0},
	{id: 1, content: 'CNv', value: 1},
	{id: 2, content: 'Exp', value: 2},
	{id: 3, content: 'Mét', value: 3}
]);
var aContainer = document.getElementById('anomalies');
var aOptions = {
	groupOrder: function (a, b) {
		return a.value - b.value;
	  },
	editable: false,
	multiselect: false,
	format: {
		minorLabels: function(date, scale, step) {
			return ''+ date.toDate().getTime();
		}
	},
	orientation: 'top',
	timeAxis: {
		scale: 'millisecond',
		step: 5000
	},
	showMajorLabels: false,
	stack: false
};

// var aTimeline;
// var aItems = [];
// var aRequest = new XMLHttpRequest();
// aRequest.open('GET', aUrl);
// aRequest.responseType = 'json';
// aRequest.send();

// aRequest.onload = createAnomaliesTimeline; 

 /**
  * Fonctions
  */


function createAnomaliesTimeline(){
    loadAnomaliesData(aRequest.response);

    aTimeline = new vis.Timeline(aContainer, aItems, aGroups, aOptions);
}

/**
 * Parse json data
 * Fill aItems array with created anomolies
 * @param parsedArray 
 */
function loadAnomaliesData(parsedArray) {
	let loadedItems = [];

	if(Array.isArray(parsedArray) ) {
		for (let i = 0; i < parsedArray.length; i++) {
			loadAnomalie(parsedArray[i], loadedItems);
		}
	}

	aItems = new vis.DataSet(loadedItems);
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
			item.group = 0;
			break;
		case 'copy':
			item.group = 1;
			break;
		case'expr':
			item.group = 2;
			break
		case'meth':
			item.group = 3;
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