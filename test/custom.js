/**
 * INITIALISATION DE LA TIMELINE
 */

var groups = new vis.DataSet([
      {id: 0, content: 'Pathologies', value: 2},
      {id: 1, content: 'Examens', value: 4},
      {id: 2, content: 'Traitements', value: 3},
      {id: 3, content: 'Consultations', value: 1}
    ]);

// create a dataset with items
// note that months are zero-based in the JavaScript Date object, so month 3 is April
var items = new vis.DataSet([
  {id: 0, group: 0, className: 'path-t', content: 'CHC', title: 'CHC', start: new Date(2014, 3, 17)},
  {id: 1, group: 0, className: 'path-nt', content: 'Cir', title: 'Cir',  start: new Date(2014, 5, 17)},
  {id: 2, group: 0, className: 'path-nt', content: 'Nash', title: 'Nash',  start: new Date(2013, 3, 25)},
  {id: 3, group: 1, className: 'examen', content: 'IRM', start: new Date(2014, 4, 17)},
  {id: 4, group: 1, className: 'examen', content: 'TDM', start: new Date(2018, 0, 17)},
  {id: 5, group: 1, className: 'examen', content: 'Bio', start: new Date(2014, 7, 17)},
  {id: 6, group: 1, className: 'examen', content: 'Cath', start: new Date(2016, 4, 10)},
  {id: 7, group: 2, className: 'traitement', content: 'Res', title: 'Res | Traitement T',  start: new Date(2014, 4, 17)},
  {id: 8, group: 2, className: 'traitement', content: 'MO', title: 'MO | Traitement NT',  start: new Date(2014, 6, 17)},
  {id: 9, group: 2, className: 'traitement', content: 'RF', title: 'RF | Traitement NT',  start: new Date(2014, 7, 5)},
  {id: 10, group: 2, className: 'traitement', content: 'RE', title: 'RE | Traitement NT',  start: new Date(2014, 6, 29)},
  {id: 11, group: 2, className: 'traitement', content: 'TC-d', title: 'TC début | Traitement NT',  start: new Date(2014, 8, 23)},
  {id: 12, group: 2, className: 'traitement', content: 'TC-f', title: 'TC fin | Traitement NT',  start: new Date(2014, 9, 23)},
  {id: 13, group: 2, className: 'traitement', content: 'CEL', title: 'CEL | Traitement NT',  start: new Date(2014, 9, 10)},
  {id: 14, group: 0, className: 'path-fin', content: 'CHC', title: 'Fin CHC', start: new Date(2014, 4, 25)},
  {id: 15, group: 0, className: 'path-fin', content: 'Cir', title: 'Fin Cir', start: new Date(2014, 9, 25)},
  {id: 16, group: 0, className: 'path-fin', content: 'Nash', title: 'Fin Nash', start: new Date(2014, 0, 5)},
  {id: 17, group: 0, className: 'path-fin', content: 'Hépat', title: 'Fin Hépat', start: new Date(2015, 7, 13)},
  {id: 18, group: 0, className: 'path-nt', content: 'Hépat', title: 'Hépat',  start: new Date(2014, 11, 25)},
  {id: 19, group: 0, className: 'path-t', content: 'CHC', title: 'CHC', start: new Date(2019, 0, 1)},
  {id: 20, group: 3, className: 'consultation', content: 'RCP', title: 'RCP', start: new Date(2015, 7, 23)},
  {id: 21, group: 3, className: 'consultation', content: 'Cs', title: 'Cs', start: new Date(2019, 0, 14)},
  {id: 22, group: 3, className: 'consultation', content: 'Cs', title: 'Cs', start: new Date(2016, 4, 8)},
  {id: 23, group: 3, className: 'consultation', content: 'Cs', title: 'Cs', start: new Date(2013, 3, 30)}
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

// Affichage
var timeline = new vis.Timeline(container, items, groups, options);
hideAllEmptySpace(document.getElementById('tolerance').value);


/**
 * FONCTIONS
 */

function hideEmptySpaceUntilNow (tolerance) {
  // find oldest item's date
  // convoluted, use forEach() instead ?
  let oldestDate = timeline.getItemRange().max;
  /*let oldestItem = oldItems[oldItems.length];*/
  
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
      let itemUpperLimit = upperLimit(i, msTolerance);
      if(itemUpperLimit > closestUpperLimit.getTime() && itemUpperLimit < limitHigh){
        closestUpperLimit.setTime(itemUpperLimit);
      }
      return false;
    }
  });
  
  // find closest lower limit from items that started before
  let closestLowerLimit = new Date();
  items.get({
    filter: function (i) {
      let itemLowerLimit = lowerLimit(i, msTolerance);
      if(itemLowerLimit < closestLowerLimit.getTime() && itemLowerLimit > limitLow){
        closestLowerLimit.setTime(itemLowerLimit);
      }
      return false;
    }
  });


  // delete range between those limits if necessary
  if(closestUpperLimit < limitLow) {
    options.hiddenDates.push({start: closestUpperLimit, end: limitLow});
  }
  if(closestLowerLimit > limitHigh) {
    options.hiddenDates.push({start: limitHigh, end: closestLowerLimit});
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
  if(currItem.className == 'path-t' || currItem.className == 'consultation') {
    currItem.content = currItem.content + ' ' + startCount;
    startCount++;
  } else if(currItem.className == 'path-fin') {
    currItem.content = currItem.content + ' ' + endCount;
    endCount++;
  }
  else {
    console.log('ERROR @ incrementAll() : className not recognized, aborting');
    return;
  }
  let nbItemsRead = startCount + endCount - 2;
  if (items.length == nbItemsRead) return;

  let nextItem = items[nbItemsRead];
  
  incrementAll(items, nextItem, startCount, endCount);
}


