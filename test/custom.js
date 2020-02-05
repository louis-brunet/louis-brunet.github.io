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
  end: initEnd
};

// Chargement des données
var timeline;
let loadedItems = [];
let url = 'https://louis-brunet.github.io/test/data.json';
let request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = function () {
  const parsedData = request.response;
  let i = 0;
  if(parsedData[0].hasOwnProperty('nom')) {
    i = 1;
    document.getElementById('fname').innerHTML = parsedData[0].prenom;
    document.getElementById('lname').innerHTML = parsedData[0].nom;
    
    document.getElementById('civilite').innerHTML =
     (parsedData[0].sexe == 'h') || (parsedData[0].sexe == 'H') ? 'Monsieur' : 'Madame';
  }

  for (; i < parsedData.length; i++) {
    let parsedItem = {
      id: i,
      group: null,
      className: parsedData[i].className,
      content: parsedData[i].content,
      start: new Date(parsedData[i].start)
    };

    switch (parsedItem.className) {
      case 'consultation':
        parsedItem.group = 3;
        break;
      case 'path-t':
        parsedItem.group = 0;
        break;
      case 'path-nt':
        parsedItem.group = 4;
        break;
      case 'examen':
        parsedItem.group = 1;
        break;
      case 'comp':
        parsedItem.group = 5;
        break;
      case 'traitement-l':
        parsedItem.group = 2;
        break;
      case 'traitement-s':
        parsedItem.group = 6;
        break;
    }

    if (parsedData[i].hasOwnProperty('end') && parsedData[i].end != parsedData[i].start) {
      if(parsedData[i].end != "" && parsedData[i].end != " ")
        parsedItem.end = new Date(parsedData[i].end);
      else {
        parsedItem.end = new Date();
      }
    }

    if (parsedData[i].hasOwnProperty('text') ){
      parsedItem.title = parsedData[i].text;
    } else {
      parsedItem.title = parsedItem.content;
    }

    if(parsedData[i].hasOwnProperty('link')) {
      parsedItem.link = parsedData[i].link;
      parsedItem.className = parsedItem.className + ' link';
    }


    loadedItems.push(parsedItem);

  }

  items = new vis.DataSet(loadedItems);
  incrementContents();

  // AFfichage
  timeline = new vis.Timeline(container, items, groups, options);
  hideAllEmptySpace(document.getElementById('tolerance').value);

  timeline.on('select', onSelect);
}


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

