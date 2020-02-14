/**
 * Entrée json
 */
var url = 'https://louis-brunet.github.io/test/genes/data.json';

/**
 * Groupes de gènes
 */
var driver;
var drivers = [{
	"nom":      "Jay_q_in.05",
	"genes":    "TP53;CTNNB1;AXIN1;ALB;ARID2;ARID1A;ACVR2A;NFE2L2;RPS6KA3;KEAP1;RPL22;CDKN2A;CDKN1A;RB1;TSC2;HNF1A;BAP1;EEF1A1;IL6ST;DYRK1A;GABRA2;BRD7;APOB;COL11A1;KLF15;SETD2;HMBS;DOCK2;ADAMTS19"
},{
	"nom":      "HCA",
	"genes":    "CTNNB1;HNF1A;IL6ST;JAK1;GNAS;FRK;STAT3;GLI1"
},{
	"nom":      "Schulze_p_inf.01",
	"genes":    "TP53;CTNNB1;AXIN1;ALB;ARID2;ARID1A;ACVR2A;NFE2L2;RPS6KA3;KEAP1;RPL22;CDKN2A;CDKN1A;RB1;TSC2;ATP10B;FGA;MEF2C;HNF1A;ZNRF3;EPHA4;PTEN;TSC1"
}];
var allGenes = [];

/**
 * Affichage des gènes disponibles
 */


/**
 * INITIALISATION DE LA TIMELINE
 */

var GROUP_MUT = 10000000;
var GROUP_CNV = 10000001;
//var GROUP_EXPR = 10000002;
var GROUP_METH = 10000003;

var groups = [];
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
var items; // DataSet
var expressions; // Array

loadDrivers();


let today = new Date();
let day = today.getDate();
if(day<10) {
	day = '0'+day;
} 
document.getElementById('date-du-jour').innerHTML = day + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

// Création des tooltips
var tooltipsCreated = false;
setInterval( () => {
	if((!tooltipsCreated) && document.querySelectorAll('.anomalie-item').length > 1) {
		createTooltips();
		tooltipsCreated = true;
	}
},1500);


/******************
 * FONCTIONS
 */

/**
 * UI FUNCTIONS
 */

function loadDrivers() {
	allGenes = [];

    let driverDiv = document.getElementById('driver-btns');
    driverDiv.innerHTML = '';
    drivers.forEach(d => {
        let button = document.createElement('button');
        button.className = 'driver-btn';
        button.id = 'driver-' + d.nom.toLowerCase();
        button.onclick = () => {
            setDriver(d.nom);
        };
        button.appendChild(document.createTextNode(d.nom));
        driverDiv.appendChild(button);

        let geneArr = d.genes.split(';');
        for (let i = 0; i < geneArr.length; i++) {
            const gStr = geneArr[i];
            if(!allGenes.includes(gStr))
                allGenes.push(gStr);
        }
    });
    allGenes = allGenes.sort();

    // Reset and fill gene filter div
    let geneFilterDiv = document.getElementById('genes-filter-container');
    geneFilterDiv.innerHTML = '';
    allGenes.forEach(gStr => {
        let geneFilterBtn = createGeneFilterBtn(gStr);
        geneFilterDiv.appendChild(geneFilterBtn);
    });
}

function setDriver(dName) {
	if(driver) {
        let btn = document.getElementById('driver-' + driver.nom.toLowerCase());
        btn.className = btn.className.replace(' driver-selected', '');
    }
    let d;
    for (let i = 0; i < drivers.length; i++) {
        if(drivers[i].nom == dName) {
            d = drivers[i];
        }
    }
    driver = {
        nom:    d.nom,
        genes:  d.genes.split(';')
    }
    
    // Update selected gene filters
    let btnsToSelect = [];
    for (let i = 0; i < driver.genes.length; i++) {
        const gStr = driver.genes[i];
        btnsToSelect.push('genes-select-' + gStr.toLowerCase());
    }
    let geneBtns = document.querySelectorAll('.genes-filter-item');
    for (let i = 0; i < geneBtns.length; i++) {
        const btn = geneBtns[i];
        if(btnsToSelect.includes(btn.id)) {
            selectGeneBtn(btn.id);
        } else {
            unselectGeneBtn(btn.id);
        }
    }
}

function selectGeneBtn(geneBtnId) {
   let item = document.getElementById(geneBtnId);
   if(!item.className.includes('genes-selected')){
	   item.className += ' genes-selected';
   }
}

function unselectGeneBtn(geneBtnId) {
   let item = document.getElementById(geneBtnId);
   if(item.className.includes('genes-selected')){
	   item.className = item.className.replace('genes-selected', '');
   }
}

function createGeneFilterBtn(gStr) {
   let res = createTextDiv(gStr, 'genes-filter-item visible');
   let id = 'genes-select-' + gStr.toLowerCase();
   res.id = id;

   res.onclick = () => {
	   loadTimeline();
   }

   return res;
}

function toggleGeneSelected(id) {
   let item = document.getElementById(id);
   if(item.className.includes('genes-selected')) {
	   item.className = item.className.replace('genes-selected', '');
   } else {
	   item.className += ' genes-selected';
   }
}

function createTextDiv(text, className) {
     let res = document.createElement('div');
     res.className = className;
     res.appendChild(document.createTextNode(text));
     return res;
}

function genesSelect(input) {
	document.getElementById('genes-input-warning').style.display = 'inline';
}

function loadTimeline() {
	document.getElementById('to-capture').style.display = 'block';
	createTimeline();
}

/**
 * TIMELINE FUNCTIONS
 */

function createTimeline() {
	init();
	loadData();
}

function init() {
	items = [];
	groups = [];
	expressions = [];
}

function loadData(){
	var request = new XMLHttpRequest();
	request.open('GET', url);
	request.responseType = 'json';
	request.send();
	request.onload = () => {
		container.innerHTML = '';
		let parsedData = request.response;
		loadStructureData(parsedData, items);
		groups.push(
			{id: GROUP_MUT, content: 'Mutations', value: GROUP_MUT, className: 'group-mut'},
			{id: GROUP_CNV, content: 'Copy number', value: GROUP_CNV, className: 'group-copy'},
			// {id: GROUP_EXPR, content: 'Expression', value: GROUP_EXPR, className: 'group-expr'},
			{id: GROUP_METH, content: 'Méthylation', value: GROUP_METH, className: 'group-meth'}
		);
		loadAnomaliesData(parsedData.anomalies, items);
		items = new vis.DataSet(items);
		groups = new vis.DataSet(groups);
		timeline = new vis.Timeline(container, items, groups, options);

		buildExpressionsDiv();
	};
}

function buildExpressionsDiv() {
	let exprDiv = document.getElementById('expressions-div');
	for (let i = 0; i < expressions.length; i++) {
		const expr = expressions[i];
		exprDiv.appendChild(createExprDiv(expr.datacolonne8, expr.datatype, expr.datasoustype));
	}
}

function createExprDiv(chc, type, val) {
	let res = createTextDiv(chc + ' = ', 'expression');
	res.appendChild(createSpan(type, 'expr-' + type));
	res.appendChild(document.createTextNode('('+val+')'));
	return res;
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
 * If item is expression, store it in expressions Array
 */
function loadAnomalie(parsedItem, itemArray) {
	let item = {
		id: itemArray.length,
		dataid: itemArray.length,
		group: null,
		content: '',
		start: new Date(parseInt(parsedItem.start)),
		end: new Date(parseInt(parsedItem.end)),
		datatype: parsedItem.type,
		datasoustype: parsedItem.soustype
	};

	switch(parsedItem.famille) {
		case 'mutation':
			item.group = GROUP_MUT;
			break;
		case 'copy':
			item.group = GROUP_CNV;
			break;
		// case'expr':
		// 	item.group = GROUP_EXPR;
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

	if(parsedItem.hasOwnProperty('presence') && parsedItem.presence == 'non') {
		item.className += ' non-present';
	}

	if(parsedItem.hasOwnProperty('gnomen')) {
		item.datagnomen = parsedItem.gnomen;
	}

	if(parsedItem.hasOwnProperty('pnomen')) {
		item.datapnomen = parsedItem.pnomen;
	}

	if(parsedItem.hasOwnProperty('cnomen')) {
		item.datacnomen = parsedItem.cnomen;
	}

	if(parsedItem.hasOwnProperty('so')) {
		item.dataso = parsedItem.so;
	}

	if(parsedItem.hasOwnProperty('colonne8')) {
		item.datacolonne8 = parsedItem.colonne8;
	}

	if(parsedItem.hasOwnProperty('colonne9')) {
		item.datacolonne9 = parsedItem.colonne9;
	}
	
	if(parsedItem.famille == 'expr') {
		expressions.push(item);
	} else {
		item.className += ' anomalie-item';
		itemArray.push(item);
	}
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

	let lineStr = '';

	let positionStr = item.start.getTime().toString();
	if(item.hasOwnProperty('end')) {
		positionStr += ' - ' + item.end.getTime().toString();
	}
	//tooltipNode.appendChild(createTooltipDiv('Position : ', positionStr, 'tooltip-position'));
	lineStr += positionStr;

	let typeStr = item.datatype;
	//tooltipNode.appendChild(createTooltipDiv('Type : ', typeStr, 'tooltip-type'));
	lineStr += ', ' + typeStr;

	let soustypeStr = item.datasoustype;
	//tooltipNode.appendChild(createTooltipDiv('Sous-type : ', soustypeStr, 'tooltip-soustype'));
	lineStr += ', ' + soustypeStr;
	tooltipNode.appendChild(createTextDiv(lineStr, 'tooltip-line'));

	let line2Str = '';
	if(item.hasOwnProperty('datagnomen')) {
		//tooltipNode.appendChild(createTooltipDiv('G nomen : ', item.datagnomen, 'tooltip-gnomen'));
		line2Str += item.datagnomen;
	}
	if(item.hasOwnProperty('datapnomen')) {
		//tooltipNode.appendChild(createTooltipDiv('P nomen : ', item.datapnomen, 'tooltip-pnomen'));
		line2Str += (line2Str == '' ? '' : ', ') + item.datapnomen;
	}
	if(item.hasOwnProperty('datacnomen')) {
		//tooltipNode.appendChild(createTooltipDiv('C nomen : ', item.datacnomen, 'tooltip-cnomen'));
		line2Str += (line2Str == '' ? '' : ', ') + item.datacnomen;
	}
	if(line2Str != '') {
		tooltipNode.appendChild(createTextDiv(line2Str, 'tooltip-line'));
	}

	if((item.className.includes('type-somatic') || item.className.includes('type-germline') || item.className.includes('type-hd') || item.className.includes('type-fa') || item.className.includes('type-gain') || item.className.includes('type-perte')) && item.hasOwnProperty('dataso')) {
		let lastLineStr = item.dataso;
		if(item.hasOwnProperty('datacolonne9')){
			lastLineStr = item.datacolonne9 + ', ' + lastLineStr;
		}
		if(item.hasOwnProperty('datacolonne8')){
			lastLineStr = item.datacolonne8 + ', ' + lastLineStr;
		}
		//tooltipNode.appendChild(createTooltipDiv('', lastLineStr, 'tooltip-last-line'));
		tooltipNode.appendChild(createTextDiv(lastLineStr, 'tooltip-line tooltip-last-line'));

		let soUrl = ' http://www.sequenceontology.org/browser/current_release/term/SO:' + item.dataso.split(':')[1];
		let linkNode = document.createElement('a');
		linkNode.className = 'tooltip-link tooltip-line';
		linkNode.href = soUrl;
		linkNode.appendChild(document.createTextNode('Sequence ontology'));
		tooltipNode.appendChild(linkNode);
	}

	container.appendChild(tooltipNode);
}

/**
 * Return new div Element containing a label span and a val span
 */
function createTooltipDiv(label, text, className) {
	let res = document.createElement('div');
	res.className = className;
	if(label != '') {
		res.appendChild(createSpan(label, 'tooltip-label'));
	}
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

	document.getElementById('patient').innerHTML = parsedData.patient;
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
	// hide tooltips
	let tooltips = document.querySelectorAll('.tooltip-text');
	tooltips.forEach(function (t) {
		t.style.display = 'none';
	});

	// Display screencap of #to-capture elem
	html2canvas(document.getElementById('to-capture')).then(function(canvas) {
		document.getElementById('output-card').style.display = 'block';
		// Export the canvas to its data URI representation
		var base64image = canvas.toDataURL("image/jpeg");
		// Display image in #output element
		document.getElementById('output').src = base64image;
	});

	// show tooltips
	tooltips.forEach(function (t) {
		t.style.display = 'block';
	});
}