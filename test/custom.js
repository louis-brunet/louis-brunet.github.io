let url = 'https://louis-brunet.github.io/test/data.json';

/**
 * INITIALISATION DE LA TIMELINE
 */

var groups = new vis.DataSet([
      {id: 0, content: 'Pathologies T', value: 2},
      {id: 1, content: 'Examens', value: 7},
      {id: 2, content: 'Tts locaux', value: 4},
      {id: 3, content: 'Consultations', value: 1},
      {id: 4, content: 'Pathologies NT', value: 3},
      {id: 5, content: 'Complications', value: 6},
      {id: 6, content: 'Tts systémiques', value: 5},
      {id: 7, content: 'Inclusions', value: 8},
      {id: 8, content: 'CRB', value: 9}
    ]);

// create visualization
var container = document.getElementById('visualization');

// calculate end date (now + 1 month)
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
  dataAttributes: ['dataId', 'tooltip'],
  showCustomTime: true
};

// Chargement des données
var death;
var timeline;
var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();

request.onload = createTimeline; 


var tooltipsCreated = false;
setInterval(function() {
  if((!tooltipsCreated) && document.querySelectorAll('.tooltip').length > 1) {
    createAllTooltips();
    tooltipsCreated = true;
  }
},1500);

/**
 * FONCTIONS
 */

function hideEmptySpaceUntilNow (tolerance) {
  // find oldest item's date
  let oldestDate = new Date(timeline.getItemRange().max);
  
  let offset = 1000 * 60 * 60 * 24 * tolerance;
  oldestDate.setTime(oldestDate.getTime() + offset);

  let now = new Date();
  if (oldestDate.getTime() < now.getTime()) {
    options.hiddenDates.push({start: oldestDate, end: now});
  }
}


function hideEmptySpaceAroundItem (item, tolerance) {
  let msTolerance = 1000 * 60 * 60 * 24 * tolerance;
  
  // find lower and upper limit (start -/+ tolerance)
  let limitLow = lowerLimit(item, msTolerance);
  let limitHigh = upperLimit(item, msTolerance);

  // find closest upper limit from items that started before
  let closestUpperLimit = new Date(1970,0,1);
  items.get({
    filter: function (i) {
      let itemStartUpperLimit = upperLimit(i, msTolerance);
      if(itemStartUpperLimit > closestUpperLimit.getTime() && itemStartUpperLimit < limitHigh){
        closestUpperLimit.setTime(itemStartUpperLimit);
      } 
      if(i.hasOwnProperty('end')) {
        let itemEndUpperLimit = endUpperLimit(i, msTolerance);
        if(itemEndUpperLimit > closestUpperLimit.getTime() && itemEndUpperLimit < limitHigh){
          closestUpperLimit.setTime(itemEndUpperLimit);
        } 
      }

      return false;
    }
  });


  
  // find closest lower limit from items that started before
  let closestLowerLimit = new Date();
  items.get({
    filter: function (i) {
      let itemStartLowerLimit = lowerLimit(i, msTolerance);
      if(itemStartLowerLimit < closestLowerLimit.getTime() && itemStartLowerLimit > limitLow){
        closestLowerLimit.setTime(itemStartLowerLimit);
      } 
      if(i.hasOwnProperty('end')) {
        let itemEndLowerLimit = endLowerLimit(i, msTolerance);
        if(itemEndLowerLimit < closestLowerLimit.getTime() && itemEndLowerLimit > limitLow){
          closestLowerLimit.setTime(itemEndLowerLimit);
        } 
      }
      return false;
    }
  });


  // delete range between those limits if necessary
  if(closestUpperLimit < limitLow) {
    options.hiddenDates.push({start: closestUpperLimit, end: limitLow});

    //alert('FOR ITEM : '+ item.content+'\nPUSHING RANGE : '+closestUpperLimit+' TO ' + new Date(limitLow));
  }
  if(closestLowerLimit > limitHigh) {
    options.hiddenDates.push({start: limitHigh, end: closestLowerLimit});

    //alert('FOR ITEM : '+ item.content+'\nPUSHING RANGE : '+new Date(limitHigh)+' TO ' + closestLowerLimit);
  }
}

// hide all dates that are more than **tolerance** days away from any item
function hideAllEmptySpace (tolerance) {
  // Reset all prior changes to hiddenDates
  options.hiddenDates = [];

  // For each item except for first and last items : hideEmptySpaceAroundItem(item, tolerance)
  let firstDate = timeline.getItemRange().min;
  let lastDate = timeline.getItemRange().max;
  items.get({
    filter: function (i) {
      if (i.start != firstDate && i.start != lastDate && i.end != lastDate) {
        hideEmptySpaceAroundItem(i, tolerance);
      }
      return false;
    }
  });

  // Hide space after last item until present date
  hideEmptySpaceUntilNow(tolerance);

  redrawTimeline();
}

function lowerLimit(item, msTolerance) {
  return item.start.getTime() - msTolerance;
}

function upperLimit(item, msTolerance) {
  return item.start.getTime() + msTolerance;
}

function endLowerLimit(item, msTolerance) {
  if(item.hasOwnProperty('end')) {
    return item.end.getTime() - msTolerance;
  } else {
    return lowerLimit(item, msTolerance);
  }
}

function endUpperLimit(item, msTolerance) {
  if(item.hasOwnProperty('end')) {
    return item.end.getTime() + msTolerance;
  } else {
    return lowerLimit(item, msTolerance);
  }
}
// Destroy and redraw timeline
function redrawTimeline() {
  timeline.destroy();
  timeline = new vis.Timeline(container, items, groups, options);
  timeline.on('select', onSelect);
  if(death != undefined) {
    timeline.addCustomTime(death, 'deces');
  }
  tooltipsCreated = false;
}

// Rename all items containing 'content: $string' to show chronological increment
// (e.g. CHC 1, CHC 2, ...)
function incrementItems(string) {
  let matchedItems = items.get({
    filter: function (i) {
      return (i.content == string);
    }
  });
  // boolean, does matchedItems contain an item with className 'path-fin' ?
  let hasPathFin = false;
  for (var i = 0; i < matchedItems.length; i++) {
    if(matchedItems[i].className == 'path-fin') {
      hasPathFin = true;
      break;
    }
  }

  if (matchedItems.length <= 1 || (hasPathFin && matchedItems.length <= 2)) return;

  // Sort array chronologically
  matchedItems.sort(
    function(a, b){
      return (a.start.getTime() - b.start.getTime());
    }
  );

  // Number each item
  incrementAll(matchedItems, matchedItems[0], 1, 1);

  // Update items DataSet with new contents
  items.update(matchedItems);
}

// Recursively rename currItem and all newer items (sorted chronologically and filtered by content)
// increment oldest to newest
// counts start at 1
function incrementAll(items, currItem, startCount, endCount) {
  if(currItem.className == 'path-fin') {
    currItem.content = currItem.content + ' ' + endCount;
    endCount++;
  } else {
    currItem.content = currItem.content + ' ' + startCount;
    startCount++;
  }

  let nbItemsRead = startCount + endCount - 2;
  if (items.length == nbItemsRead) return;

  let nextItem = items[nbItemsRead];
  
  incrementAll(items, nextItem, startCount, endCount);
}

// Increment all path & consultations if duplicated 
function incrementContents() {
  items.get({
    filter: function (i) {
      incrementItems(i.content);
      
      return false;
    }
  });
}


// Open link on selected item
function onSelect(properties) {
  let selectedItems = items.get(properties.items);
  if(selectedItems[0].hasOwnProperty('link')){
    window.open(selectedItems[0].link);
  }
}


function createItem(parsedItem, id) {
  let res = {
    id: id,
    dataId: id,
    group: null,
    className: parsedItem.className,
    content: parsedItem.content
  };

  if(parsedItem.hasOwnProperty('start')) {
    res.start = new Date(parsedItem.start);
  }

  // Assign group
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
    case 'inclusion':
      res.group = 7;
      break;
    case 'crb':
      res.group = 8;
      break;
  }

  // Add arrows to inclusion starts & end dates
  let isInclusionEnd = parsedItem.className == 'inclusion' && !parsedItem.hasOwnProperty('start') && parsedItem.hasOwnProperty('end');
  let isInclusionStart = parsedItem.className == 'inclusion' && !parsedItem.hasOwnProperty('end') && parsedItem.hasOwnProperty('start');
  if(isInclusionStart) {
    res.content += ' &#8679;' // add up arrow
  }else if(isInclusionEnd) {
    res.start = new Date(parsedItem.end);
    res.content += ' &#8681;' // add down arrow
  } 
  // Handle presence of attribute 'end'
  else if (parsedItem.hasOwnProperty('end') && (parsedItem['end'] != parsedItem['start'])) {
    if(parsedItem.end != "" && parsedItem.end != " ")
      res.end = new Date(parsedItem.end);
    else {
      if(death == undefined) {
        res.end = new Date();
      } else {
        res.end = death;
      }
    }
  }


  let hasSynthesePathT = parsedItem.hasOwnProperty('synthese_path_t');
  let hasSynthesePathNT = parsedItem.hasOwnProperty('synthese_path_nt');
  let hasSyntheseComp = parsedItem.hasOwnProperty('synthese_comp');
  let hasSyntheseTraitementI = parsedItem.hasOwnProperty('synthese_traitement_i');
  let hasSyntheseTraitementS = parsedItem.hasOwnProperty('synthese_traitement_s'); 
  let hasSynthesePbh = parsedItem.hasOwnProperty('synthese_pbh');
  let hasLiensExamen = parsedItem.hasOwnProperty('liens_examen');

  // Load relevant tooltip data
  if (parsedItem.hasOwnProperty('evaluation_examen') || 
      (parsedItem.className == 'crb' && parsedItem.hasOwnProperty('reference')) ||
      hasSynthesePathT || hasSynthesePathNT || hasSyntheseComp || hasSyntheseTraitementI || 
      hasSyntheseTraitementS || hasSynthesePbh || hasLiensExamen){
    res.className = res.className + ' tooltip';
    
    if(parsedItem.hasOwnProperty('evaluation_examen')) {
      res.tooltip = parsedItem.evaluation_examen;
    } else {
      res.tooltip = {};
    }
    // If is CRB, add réf. to last line of val-norm
    if(parsedItem.className == 'crb' && parsedItem.hasOwnProperty('reference')) {
      if(res.tooltip.normal == undefined) {
        res.tooltip.normal = '';
      } else {
        res.tooltip.normal += ' | ';
      }
      
      res.tooltip.normal += 'réf. ' + parsedItem.reference;
    }

    if(hasSynthesePathT) {
      res.tooltip.synthese_path_t = parsedItem.synthese_path_t;
    }

    if(hasSynthesePathNT) {
      res.tooltip.synthese_path_nt = parsedItem.synthese_path_nt;
    }

    if(hasSyntheseComp) {
      res.tooltip.synthese_comp = parsedItem.synthese_comp;
    }

    if(hasSyntheseTraitementI) {
      res.tooltip.synthese_traitement_i = parsedItem.synthese_traitement_i;
    }

    if(hasSyntheseTraitementS) {
      res.tooltip.synthese_traitement_s = parsedItem.synthese_traitement_s;
    }

    if(hasSynthesePbh) {
      res.tooltip.synthese_pbh = parsedItem.synthese_pbh;
    }

    if(hasLiensExamen) {
      res.tooltip.liens_examen = parsedItem.liens_examen;
    }
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
  if(death != undefined) {
    timeline.addCustomTime(death, 'deces');
  }
  hideAllEmptySpace(document.getElementById('tolerance').value);
}

function createAllTooltips() {
  // Array of objects {id, className, tooltip}
  let tooltips = items.get({
    fields: ['id','className','tooltip', 'start', 'end'],
    filter: function (i) {
      return i.hasOwnProperty('tooltip');
    }
  });

  let containers = document.querySelectorAll(".vis-box.tooltip, .vis-range.tooltip");
  

  setSelectOnHover(containers);

  for (let i = 0; i < tooltips.length; i++) {
    for (let j = 0; j < containers.length; j++) {
      if(tooltips[i].id == containers[j].dataset.dataid ){
        // Créer sous-élément .tooltip-text contenant le texte à afficher
        createTooltip(tooltips[i], containers[j]);
        break;
      }
   } 
  }
}


function createTooltip(tooltipObj, container) {
  var valNorm;
  var valAnorm;
  if(tooltipObj.tooltip.hasOwnProperty('normal')){
    // Valeurs normales
    valNorm = tooltipObj.tooltip.normal.split(';');
  } else if(typeof tooltipObj.tooltip === 'string') {
    valNorm = [tooltipObj.tooltip];
  }


  if(tooltipObj.tooltip.hasOwnProperty('anormal')){
    // Valeurs anormales
    valAnorm = tooltipObj.tooltip.anormal.split(';');
  }

  // create tooltip text
  let node = document.createElement('div');
  node.className = 'tooltip-text';

  // Date
  let dateDiv = document.createElement('div');
  dateDiv.className = 'tooltip-date tooltip-line';
  let dateStr = tooltipObj.start.getFullYear() + '-' + (tooltipObj.start.getMonth() + 1) + '-' + tooltipObj.start.getDate();
  if(tooltipObj.end != undefined) {
    dateStr += ' – ' + tooltipObj.end.getFullYear() + '-' + (tooltipObj.end.getMonth() + 1 ) + '-' + tooltipObj.end.getDate();
  }
  dateDiv.appendChild(document.createTextNode(dateStr));
  node.appendChild(dateDiv);

  // Val anormales
  if(valAnorm != undefined && tooltipObj.tooltip.hasOwnProperty('anormal') ) {
    let anormNode = document.createElement('div');
    anormNode.className = 'tooltip-anorm tooltip-line';

    for (let k = 0; k < valAnorm.length; k++) {
      let anormValue = document.createElement('div');
      anormValue.className = 'tooltip-val';

      let text = document.createTextNode(valAnorm[k]);
      anormValue.appendChild(text);
      anormNode.appendChild(anormValue);
    }
    node.appendChild(anormNode);
  }
  // Val normales
  if(tooltipObj.tooltip.hasOwnProperty('normal')) {
    let normNode = document.createElement('div');
    normNode.className = 'tooltip-norm tooltip-line';

    for (let k = 0; k < valNorm.length; k++) {
      let normValue = document.createElement('div');
      normValue.className = 'tooltip-val';

      let text = document.createTextNode(valNorm[k]);
      normValue.appendChild(text);
      normNode.appendChild(normValue);
    }
    node.appendChild(normNode);
  }
  


  // Synthèses
  if(tooltipObj.tooltip.hasOwnProperty('synthese_path_t')) {
    // TODO
    let syntheseNode = createSynthesePathTNode(tooltipObj.tooltip.synthese_path_t);
    node.appendChild(syntheseNode);
  }
  if(tooltipObj.tooltip.hasOwnProperty('synthese_path_nt')) {
    let syntheseNode = createSyntheseCompPathNtNode(tooltipObj.tooltip.synthese_path_nt);
    node.appendChild(syntheseNode);
  }
  if(tooltipObj.tooltip.hasOwnProperty('synthese_comp')) {
    let syntheseNode = createSyntheseCompPathNtNode(tooltipObj.tooltip.synthese_comp);
    node.appendChild(syntheseNode);
  }
  if(tooltipObj.tooltip.hasOwnProperty('synthese_traitement_i')) {
    // TODO
    let syntheseNode = createSyntheseTraitementINode(tooltipObj.tooltip.synthese_traitement_i);
    node.appendChild(syntheseNode);
  }
  if(tooltipObj.tooltip.hasOwnProperty('synthese_traitement_s')) {
    // TODO
    let syntheseNode = createSyntheseTraitementSNode(tooltipObj.tooltip.synthese_traitement_s);
    node.appendChild(syntheseNode);
  } 
  if(tooltipObj.tooltip.hasOwnProperty('synthese_pbh')) {
    // TODO
    let syntheseNode = createSynthesePbhNode(tooltipObj.tooltip.synthese_pbh);
    node.appendChild(syntheseNode);
  } 

  // Liens Examen
  if(tooltipObj.tooltip.hasOwnProperty('liens_examen')) {
    // TODO 
    node.appendChild(createLiensExamensNode(tooltipObj.tooltip.liens_examen)); 
  }

  if(tooltipObj.className.includes('consultation') ||
   tooltipObj.className.includes('path-t') ) {
    node.className += ' down';
  } else node.className += ' up';

  container.appendChild(node);

}

function createLiensExamensNode(liens_examens) {
  let res = document.createElement('div');
  res.className = 'liens-examen';

  let crLink = createLink('CR', 'lien-cr', liens_examens.cr);
  let imgLink = createLink('Images','lien-images', liens_examens.images);
  let radiomicsLink = createLink('Radiomics','lien-radiomics', liens_examens.radiomics);
  let viewerLink = createLink('Viewer','lien-viewer', liens_examens.viewer);

  res.appendChild(crLink);
  res.appendChild(imgLink);
  res.appendChild(radiomicsLink);
  res.appendChild(viewerLink);

  return res;
}

function createLink(text, className, href) {
  let res = document.createElement('a');
  res.className = className;
  res.href = href;
  res.innerHTML = text;
  return res;
}


function loadData(parsedData) {
  let loadedItems = [];
  let i = 0;
  if(parsedData[0].hasOwnProperty('nom')) {
    i = 1;
    document.getElementById('fname').innerHTML = '<strong>'+parsedData[0].prenom+'</strong>';
    document.getElementById('lname').innerHTML = '<strong>'+parsedData[0].nom+'</strong>';
    
    document.getElementById('sexe').innerHTML =
     (parsedData[0].sexe == 'h') || (parsedData[0].sexe == 'H') ? 'Masculin' : 'Fémin0i.decesn;';
    document.getElementById('ipp').innerHTML = '<strong>'+parsedData[0].ipp+'</strong>';
    document.getElementById('ddn').innerHTML = parsedData[0].ddn;

    let ageTitle = document.getElementById('age');

    if(parsedData[0].hasOwnProperty('deces') && parsedData[0].deces != ''){
      death = new Date(parsedData[0].deces);
      let deadTitle = document.getElementById('dead');
      if(deadTitle != undefined) {
        deadTitle.style.display = 'inline';
      }
      ageTitle.style.display = 'none';
      document.getElementById('date-death').innerHTML = parsedData[0].deces;
      let age = getAge(new Date(parsedData[0].ddn), death);
      document.getElementById('age-death').innerHTML = age;
    } else {
      let age = getAge(new Date(parsedData[0].ddn), new Date());// new Date(new Date().getTime() - new Date(parsedData[0].ddn).getTime()).getFullYear() - 1970;
      ageTitle.innerHTML = '('+ age +' ans)';
    }
  }

  document.getElementById('date-today').innerHTML = '' +now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

  for (; i < parsedData.length; i++) {
    let parsedItem = createItem(parsedData[i], i);
    loadedItems.push(parsedItem);
  }

  items = new vis.DataSet(loadedItems);
}

function getAge(birthDate, endDate) {
  return new Date(endDate.getTime() - birthDate.getTime()).getFullYear() - 1970;
}

function setSelectOnHover(containers) {
  containers.forEach(function(cont){
    cont.addEventListener("mouseover",function(e) {
      timeline.setSelection([]);
      timeline.setSelection(cont.dataset.dataid);
    });
  });
}

function createSynthesePathTNode(synthese) {
  let res = document.createElement('div');
  res.className = 'synthese';

  if(synthese.hasOwnProperty('nbTumeurs')) {
    let nbDiv = document.createElement('div');
    nbDiv.className = 'synthese-line';
    let text = document.createTextNode('Nombre de tumeurs : ' + synthese.nbTumeurs);
    nbDiv.appendChild(text);
    res.appendChild(nbDiv);
  }

  if(synthese.hasOwnProperty('tumeurs')) {
    let listDiv = document.createElement('div');
    listDiv.className = 'synthese-line';
    let text = document.createTextNode('Tumeurs : ' + synthese.tumeurs);
    listDiv.appendChild(text);
    res.appendChild(listDiv);
  }

  if(synthese.hasOwnProperty('scores')) {
    let scoreDiv = document.createElement('div');
    scoreDiv.className = 'synthese-line';
    let text = document.createTextNode('Scores : ' + synthese.scores);
    scoreDiv.appendChild(text);
    res.appendChild(scoreDiv);
  }

  return res;
}

function createSyntheseCompPathNtNode(synthese) {
  let res = document.createElement('div');
  res.className = 'synthese';

  if(synthese.hasOwnProperty('details')) {
    let nbDiv = document.createElement('div');
    nbDiv.className = 'synthese-line';
    let text = document.createTextNode(synthese.details);
    nbDiv.appendChild(text);
    res.appendChild(nbDiv);
  }

  if(synthese.hasOwnProperty('traitePar')) {
    let listDiv = document.createElement('div');
    listDiv.className = 'synthese-line';
    let text = document.createTextNode('Traité par : ' + synthese.traitePar);
    listDiv.appendChild(text);
    res.appendChild(listDiv);
  }
  return res;
}

function createSyntheseTraitementINode(synthese) {
  let res = document.createElement('div');
  res.className = 'synthese';

  if(synthese.hasOwnProperty('segments')) {
    let segmentsDiv = document.createElement('div');
    segmentsDiv.className = 'synthese-line';
    let text = document.createTextNode('Segments : ' + synthese.segments);
    segmentsDiv.appendChild(text);
    res.appendChild(segmentsDiv);
  }

  if(synthese.hasOwnProperty('tumeurs')) {
    let listDiv = document.createElement('div');
    listDiv.className = 'synthese-line';
    let text = document.createTextNode('Tumeurs : ' + synthese.tumeurs);
    listDiv.appendChild(text);
    res.appendChild(listDiv);
  }

  return res;
}

function createSyntheseTraitementSNode(synthese) {
  let res = document.createElement('div');
  res.className = 'synthese';

  if(synthese.hasOwnProperty('drug')) {
    let nbDiv = document.createElement('div');
    nbDiv.className = 'synthese-line';
    let text = document.createTextNode(synthese.drug);
    nbDiv.appendChild(text);
    res.appendChild(nbDiv);
  }

  if(synthese.hasOwnProperty('nbCycles')) {
    let listDiv = document.createElement('div');
    listDiv.className = 'synthese-line';
    let text = document.createTextNode('Nombre de cycles : ' + synthese.nbCycles);
    listDiv.appendChild(text);
    res.appendChild(listDiv);
  }

  if(synthese.hasOwnProperty('dose')) {
    let scoreDiv = document.createElement('div');
    scoreDiv.className = 'synthese-line';
    let text = document.createTextNode('Dose par jour : ' + synthese.dose);
    scoreDiv.appendChild(text);
    res.appendChild(scoreDiv);
  }

  return res;
}

function createSynthesePbhNode(synthese) {
  let res = document.createElement('div');
  res.className = 'synthese';

  if(synthese.hasOwnProperty('ft')) {
    let nbDiv = document.createElement('div');
    nbDiv.className = 'synthese-line';
    let text = document.createTextNode('FT : ' + synthese.ft);
    nbDiv.appendChild(text);
    res.appendChild(nbDiv);
  }

  if(synthese.hasOwnProperty('fnt')) {
    let listDiv = document.createElement('div');
    listDiv.className = 'synthese-line';
    let text = document.createTextNode('FNT : ' + synthese.fnt);
    listDiv.appendChild(text);
    res.appendChild(listDiv);
  }
  return res;
}

/**
 * Afficher une capture d'ecran du graphe
 */
function capture() {
  let tolerance = document.querySelector('.tolerance');
  let initDisplay = '' + tolerance.style.display;
  tolerance.style.display = 'none';

  // hide tooltips
	let tooltips = document.querySelectorAll('.tooltip-text');
	tooltips.forEach(function (t) {
		t.style.display = 'none';
	});

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
  
  tolerance.style.display = initDisplay;
}