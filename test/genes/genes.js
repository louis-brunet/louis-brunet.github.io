/**
 * Entrée json
 */
var genesUrl = 'https://louis-brunet.github.io/test/genes/data.json';

/**
 * Groupes de gènes
 */
var genesDriver;
var genesDrivers = [{
	nom:      "Jay_q_in.05",
	genes:    "TP53;CTNNB1;AXIN1;ALB;ARID2;ARID1A;ACVR2A;NFE2L2;RPS6KA3;KEAP1;RPL22;CDKN2A;CDKN1A;RB1;TSC2;HNF1A;BAP1;EEF1A1;IL6ST;DYRK1A;GABRA2;BRD7;APOB;COL11A1;KLF15;SETD2;HMBS;DOCK2;ADAMTS19"
},{
	nom:      "HCA",
	genes:    "CTNNB1;HNF1A;IL6ST;JAK1;GNAS;FRK;STAT3;GLI1"
},{
	nom:      "Schulze_p_inf.01",
	genes:    "TP53;CTNNB1;AXIN1;ALB;ARID2;ARID1A;ACVR2A;NFE2L2;RPS6KA3;KEAP1;RPL22;CDKN2A;CDKN1A;RB1;TSC2;ATP10B;FGA;MEF2C;HNF1A;ZNRF3;EPHA4;PTEN;TSC1"
}];
var genesAllGenes = [];

// TODO
var genesCartes = [{
	nom: 	'5-gene-score',
	classes: [{
		nom: 	'P1-P2',
		type: 	'expr',
		genes: 	'JPT1;KRT19;RAMP3;RAN;TAF9'
	}]
},{
	nom: 	'G1-G6-groups',
	classes: [{
		nom: 	'G1-G6',
		type: 	'expr',
		genes: 	'AFP;CDH2;CYP2C9;EPHA1;G0S2;HAMP;JPT1;IGF2;LAMA3;MERTK;NRAS;PAK2;PIR;RAB1A;RAMP3;REG3A;SAE1'
	}]
}];

/**
 * Keep track of anomalies familles for each CHC.
 */
var genesChcList = []; // [{chc: CHCXXXX, mutation: boolean, expr: boolean, copy: boolean, meth: boolean},...]

/**
 * INITIALISATION DE LA TIMELINE
 */

var GROUP_MUT = 10000000;
var GROUP_CNV = 10000001;
//var GROUP_EXPR = 10000002;
var GROUP_METH = 10000003;

var genesGroups = [];
var genesContainer = document.getElementById('visualization');

var genesOptions = {
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
var genesTimeline;
var genesItems; // DataSet
var genesExpressions; // DataSet

genesLoadDrivers();


let today = new Date();
let day = today.getDate();
if(day<10) {
	day = '0'+day;
} 
document.getElementById('date-du-jour').innerHTML = day + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

// Création des tooltips
var genesTooltipsCreated = false;
setInterval( () => {
	if((!genesTooltipsCreated) && document.querySelectorAll('.anomalie-item').length > 1) {
		genesCreateTooltips();
		genesTooltipsCreated = true;
	}
},1500);


/******************
 * FONCTIONS
 */

/**
 * UI FUNCTIONS
 */


function genesLoadDrivers() {
	genesAllGenes = [];

    let driverDiv = document.getElementById('driver-btns');
    driverDiv.innerHTML = '';

    genesDrivers.forEach(d => {
        genesCreateDriverBtn(driverDiv, d);
    });


    let cartesDiv = document.getElementById('carte-btns');
    cartesDiv.innerHTML = '';

    genesCartes.forEach(c => {
    	genesAddDriver(c);
    	genesCreateCarteBtn(cartesDiv, c);
    });

    genesAllGenes = genesAllGenes.sort();

    // Reset and fill gene filter div
    let geneFilterDiv = document.getElementById('genes-filter-container');
    geneFilterDiv.innerHTML = '';
    genesAllGenes.forEach(gStr => {
        let geneFilterBtn = genesCreateGeneFilterBtn(gStr);
        geneFilterDiv.appendChild(geneFilterBtn);
    });
}

function genesCreateDriverBtn(div, driver) {
	let button = document.createElement('button');
	button.className = 'driver-btn';
	let btnId = 'driver-' + driver.nom.toLowerCase();
	button.id = btnId;
	let dNom = driver.nom;

    button.onclick = () => {
		if(genesDriver != undefined && genesDriver.nom == dNom) {
			let thisBtn = document.getElementById(btnId);
			thisBtn.className = thisBtn.className.replace('driver-selected', '');
			// unselect btns
			let btnsToUnselect = [];
			for (let i = 0; i < genesDriver.genes.length; i++) {
				const gStr = genesDriver.genes[i];
				btnsToUnselect.push('genes-select-' + gStr.toLowerCase());
			}
			btnsToUnselect.forEach(btnId => {
				genesUnselectGeneBtn(btnId);
			});
			genesDriver = undefined;
		} else {
			genesSetDriver(d.nom);
		}
    };

    button.appendChild(document.createTextNode(driver.nom));
    div.appendChild(button);

    let geneArr = driver.genes.split(';');
    for (let i = 0; i < geneArr.length; i++) {
        const gStr = geneArr[i];
        if(!genesAllGenes.includes(gStr))
            genesAllGenes.push(gStr);
    }
}

// TODO 
function genesCreateCarteBtn(div, carte) {
	let button = document.createElement('button');
	button.className = 'carte-btn';
	let btnId = 'driver-' + carte.nom.toLowerCase();
	button.id = btnId;
	let cNom = carte.nom; // TODO change

	//TODO change
    button.onclick = () => {
		if(genesDriver != undefined && genesDriver.nom == cNom) {
			let thisBtn = document.getElementById(btnId);
			thisBtn.className = thisBtn.className.replace('driver-selected', '');
			// unselect btns
			let btnsToUnselect = [];
			for (let i = 0; i < genesDriver.genes.length; i++) {
				const gStr = genesDriver.genes[i];
				btnsToUnselect.push('genes-select-' + gStr.toLowerCase());
			}
			btnsToUnselect.forEach(btnId => {
				genesUnselectGeneBtn(btnId);
			});
			genesDriver = undefined;
		} else {
			genesSetDriver(d.nom);
		}
    };

    button.appendChild(document.createTextNode(carte.nom)); 
    div.appendChild(button);


    carte.classes.forEach(classe => {
    	let geneArr = classe.genes.split(';');
	    for (let i = 0; i < geneArr.length; i++) {
	        const gStr = geneArr[i];
	        if(!genesAllGenes.includes(gStr))
	            genesAllGenes.push(gStr);
	    }
    });  
}

/**
 * Create driver from item in genesCartes array
 */
function genesAddDriver(carte) {
	let driver = {
		nom: 	carte.nom,
		genes: 	''
	}

	carte.classes.forEach(classe => {
		let genes = classe.genes.split(';');

		for (let i = 0; i < genes.length; i++) {
			if(!driver.genes.includes(genes[i])){
				driver.genes += ';' + genes[i];
			}
		}
	});

	genesDrivers.push(driver);
}

function genesSetDriver(dName) {
	if(genesDriver) {
        let btn = document.getElementById('driver-' + genesDriver.nom.toLowerCase());
        btn.className = btn.className.replace('driver-selected', '');
	}
	
	document.getElementById('driver-' + dName.toLowerCase()).className += ' driver-selected';

    let d;
    for (let i = 0; i < genesDrivers.length; i++) {
        if(genesDrivers[i].nom == dName) {
            d = genesDrivers[i];
        }
    }
    genesDriver = {
        nom:    d.nom,
        genes:  d.genes.split(';')
    }
    
    // Update selected gene filters
    let btnsToSelect = [];
    for (let i = 0; i < genesDriver.genes.length; i++) {
        const gStr = genesDriver.genes[i];
        btnsToSelect.push('genes-select-' + gStr.toLowerCase());
    }
    let geneBtns = document.querySelectorAll('.genes-filter-item');
    for (let i = 0; i < geneBtns.length; i++) {
        const btn = geneBtns[i];
        if(btnsToSelect.includes(btn.id)) {
            genesSelectGeneBtn(btn.id);
        } else {
            genesUnselectGeneBtn(btn.id);
        }
    }
}

function genesSelectGeneBtn(geneBtnId) {
   let item = document.getElementById(geneBtnId);
   if(!item.className.includes('genes-selected')){
	   item.className += ' genes-selected';
   }
}

function genesUnselectGeneBtn(geneBtnId) {
   let item = document.getElementById(geneBtnId);
   if(item.className.includes('genes-selected')){
	   item.className = item.className.replace('genes-selected', '');
   }
}

function genesCreateGeneFilterBtn(gStr) {
   let res = genesCreateTextDiv(gStr, 'genes-filter-item visible');
   let id = 'genes-select-' + gStr.toLowerCase();
   res.id = id;

   res.onclick = () => {
	   loadTimeline();
   }

   return res;
}

function genesToggleGeneSelected(id) {
   let item = document.getElementById(id);
   if(item.className.includes('genes-selected')) {
	   item.className = item.className.replace('genes-selected', '');
   } else {
	   item.className += ' genes-selected';
   }
}

function genesCreateTextDiv(text, className) {
     let res = document.createElement('div');
     res.className = className;
     res.appendChild(document.createTextNode(text));
     return res;
}

function genesGenesSelect(input) {
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
	genesInit();
	genesLoadData();
}

function genesInit() {
	genesItems = [];
	genesGroups = [];
	genesExpressions = [];
	document.getElementById('materiel-exploite').innerHTML = '';
	document.getElementById('expressions-div').innerHTML = '';
}

function genesLoadData(){
	var request = new XMLHttpRequest();
	request.open('GET', genesUrl);
	request.responseType = 'json';
	request.send();
	request.onload = () => {
		genesContainer.innerHTML = '';
		let parsedData = request.response;
		loadStructureData(parsedData, genesItems);
		genesGroups.push(
			{id: GROUP_MUT, content: 'Mutations', value: GROUP_MUT, className: 'group-mut'},
			{id: GROUP_CNV, content: 'Copy number', value: GROUP_CNV, className: 'group-copy'},
			// {id: GROUP_EXPR, content: 'Expression', value: GROUP_EXPR, className: 'group-expr'},
			{id: GROUP_METH, content: 'Méthylations', value: GROUP_METH, className: 'group-meth'}
		);
		loadAnomaliesData(parsedData.anomalies, genesItems);
		genesItems = new vis.DataSet(genesItems);
		genesGroups = new vis.DataSet(genesGroups);
		genesTimeline = new vis.Timeline(genesContainer, genesItems, genesGroups, genesOptions);
		genesExpressions = new vis.DataSet(genesExpressions);
		buildExpressionsDiv();
	};
}

function buildExpressionsDiv() {
	let exprDiv = document.getElementById('expressions-div');
	// Find all CHC ids in expr dataset
	let chcs = genesExpressions.distinct('datacolonne8');

	chcs.forEach(chc => {
		// Find expressions matching each CHC, sorted by type
		let matched = new vis.DataSet(genesExpressions.get({
			fields: ['id', 'datatype', 'datasoustype', 'datacolonne9'],
			filter: e => {
				return e.datacolonne8 == chc;
			},
			order: (a, b) => {
				return (a.datatype < b.datatype? -1 : 1);
			}
		}));
		let exprItemDiv = genesCreateTextDiv(chc + ' : ', 'expression');

		//GROUP VALUES BY COLONNE9 (e.g. miseq, fluidigm)
		// Find distinct datacolonne9 in matched
		let col9Array = matched.distinct('datacolonne9');
		for (let i = 0; i < col9Array.length; i++) {
			const col9 = col9Array[i];
			
			exprItemDiv.appendChild(genesCreateSpan(col9 + ' = ', 'expr-col9'));

			let subMatched = matched.get({
				filter: m => {
					return m.datacolonne9 == col9;
				}
			});

			let countedTypes = [];
			subMatched.forEach(exp => {
				if(countedTypes.includes(exp.datatype)) return;

				// Find all expressions in matched with same type
				let values = [];
				let thisIndex = subMatched.indexOf(exp);
				for (let i = thisIndex; i < subMatched.length && subMatched[i].datatype == exp.datatype; i++) {
					values.push(subMatched[i].datasoustype);
				}
				if(values.length > 0){
					// Build val str
					let valStr = '' + values[0];
					for (let i = 1; i < values.length; i++) {
						const val = values[i];
						valStr += '; ' + val;
					}
					// Append to CHC line
					exprItemDiv.appendChild(genesCreateSpan(exp.datatype, 'expr-' + exp.datatype));
					let valSpan = genesCreateSpan('(' + valStr + ') ', 'expr-val');
					exprItemDiv.appendChild(valSpan);
					countedTypes.push(exp.datatype);
				}
			});
		}


		
		exprDiv.appendChild(exprItemDiv);
	})	
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

	updateChcListDisplay();
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
		datafamille: parsedItem.famille,
		datatype: parsedItem.type,
		datasoustype: parsedItem.soustype
	};

	
	if(parsedItem.hasOwnProperty('colonne8')) {
		item.datacolonne8 = parsedItem.colonne8;
		// if famille not yet counted for this chc, count it in genesChcList
		countInChcList(item.datacolonne8, item.datafamille);
	}


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
	
	if(parsedItem.hasOwnProperty('colonne9')) {
		item.datacolonne9 = parsedItem.colonne9;
		
	}

	
	// If is expression, push to genesExpressions, else push to items
	if(parsedItem.famille == 'expr') {
		item.id = genesExpressions.length;
		genesExpressions.push(item);
	} else {
		item.className += ' anomalie-item';
		itemArray.push(item);
	}
}

/**
 * TODO
 */
function updateChcListDisplay() {
	let chcListDiv = document.getElementById('materiel-exploite');

	genesChcList.forEach( chcItem => {
		let lineStr = chcItem.chc + '( ';

		if(chcItem.mutation)
			lineStr += 'Mut. ';
		if(chcItem.copy)
			lineStr += 'CN ';
		if(chcItem.meth)
			lineStr += 'Mét. '
		if(chcItem.expr)
			lineStr += 'Exp. ';
		
		lineStr += ')';

		chcListDiv.appendChild(genesCreateSpan(lineStr, 'chc-item'));
		// TODO
	});
}

function countInChcList(chc, famille) {
	let added = false;
	for (let i = 0; i < genesChcList.length; i++) {
		let listElem = genesChcList[i];
		if(listElem.chc == chc) {
			switch(famille) {
				case 'mutation':
					listElem.mutation = true;
					break;
				case 'expr':
					listElem.expr = true;
					break;
				case 'copy':
					listElem.copy = true;
					break;
				case 'meth':
					listElem.meth = true;
					break;
				
			}
			added = true;
		}
	}
	if(!added) {
		let newItem = {
			chc:		chc,
			mutation:	false,
			expr: 		false,
			meth:		false,
			copy:		false
		};
		switch(famille) {
			case 'mutation':
				newItem.mutation = true;
				break;
			case 'expr':
				newItem.expr = true;
				break;
			case 'copy':
				newItem.copy = true;
				break;
			case 'meth':
				newItem.meth = true;
				break;	
		}

		genesChcList.push(newItem);
	}
}

function genesCreateTooltips() {
	// Find items w/ className contains anomalie-item
	let tooltipItems = genesItems.get({
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
				genesCreateTooltip(tooltipItems[i], tooltipContainers[j]);

				break;
			}
	   } 
	}
}

function setSelectOnHover(containers) {
	containers.forEach(function(cont){
		cont.addEventListener('mouseover',function(e) {
			genesTimeline.setSelection([]);
			genesTimeline.setSelection(cont.dataset.dataid);
		});
	});
}

/**
 * Create DOM elements in container based on item's properties
 */
function genesCreateTooltip(item, container) {
	let tooltipNode = document.createElement('div');
	tooltipNode.className = 'genes-tooltip-text';

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
	tooltipNode.appendChild(genesCreateTextDiv(lineStr, 'genes-tooltip-line'));

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
		tooltipNode.appendChild(genesCreateTextDiv(line2Str, 'genes-tooltip-line'));
	}

	if((item.className.includes('type-somatic') || item.className.includes('type-germline') || item.className.includes('type-hd') || item.className.includes('type-fa') || item.className.includes('type-gain') || item.className.includes('type-perte')) && item.hasOwnProperty('dataso')) {
		let lastLineStr = '';
		if(item.hasOwnProperty('datacolonne9')){
			lastLineStr = item.datacolonne9 + ', ' + lastLineStr;
		}
		if(item.hasOwnProperty('datacolonne8')){
			lastLineStr = item.datacolonne8 + ', ' + lastLineStr;
		}
		//tooltipNode.appendChild(createTooltipDiv('', lastLineStr, 'tooltip-last-line'));
		let lastLineDiv = genesCreateTextDiv(lastLineStr, 'genes-tooltip-line genes-tooltip-last-line');

		let soUrl = ' http://www.sequenceontology.org/browser/current_release/term/SO:' + item.dataso.split(':')[1];
		let linkNode = document.createElement('a');
		linkNode.className = 'genes-tooltip-link';
		linkNode.href = soUrl;
		linkNode.appendChild(document.createTextNode(item.dataso));
		lastLineDiv.appendChild(linkNode);
		tooltipNode.appendChild(lastLineDiv);
	}

	container.appendChild(tooltipNode);
}

/**
 * Return new div Element containing a label span and a val span
 */
function genesCreateTooltipDiv(label, text, className) {
	let res = document.createElement('div');
	res.className = className;
	if(label != '') {
		res.appendChild(genesCreateSpan(label, 'tooltip-label'));
	}
	res.appendChild(genesCreateSpan(text, 'tooltip-val'));
	return res;
}

function genesCreateSpan(text, className) {
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
	let groupId = genesGroups.length + 1;
	genesGroups.push(
		{
			id: groupId,
			content: '<div class="comp-type ' + component.type + (component.hasOwnProperty('ref') ? '':' noref' )+'">&lt;'+component.type+'&gt;</div>' + (component.hasOwnProperty('ref') ? '<div class="comp-ref">'+component.ref+'</div>' : ''),
			value: groupId
		});

	// load exons
	let exons = component.exons.split(';');
	for (let i = 0; i < exons.length; i++) {
		const exon = exons[i];
		let createdItem = genesCreateItem(exon, groupId, component.type, exonArray.length);
		if(createdItem.className.includes('protein_coding') && ! component.hasOwnProperty('ref')) {
			createdItem.className += ' noref';
		}
		exonArray.push(createdItem);
	}  

	// create lines to link adjacent ranges
	// (items w/ CSS height: 0  ?)
	createLines(exonArray, groupId);
}

function genesCreateItem(exon, groupId, compType, nbItems) {
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
function captureVis() {
	// hide tooltips
	let tooltips = document.querySelectorAll('.genes-tooltip-text');
	tooltips.forEach(function (t) {
		t.style.display = 'none';
	});

	// Display screencap of #to-capture elem
	html2canvas(document.getElementById('to-capture')).then( canvas => {
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