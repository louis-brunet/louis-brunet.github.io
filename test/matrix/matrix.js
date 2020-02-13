/**
 * DEFAULT JSON ENTRY
 */
 var url = 'https://louis-brunet.github.io/test/matrix/datanew.json';



if (!window.File || !window.FileReader) {
    alert('The File APIs are not fully supported in this browser.');
 }

/**
 * CONSTANTS & GLOBAL VARIABLES
 */
var container = document.getElementById('visualization');
var MAX_ITEMS = 15;
var ROW_TYPE = 'gene'; // 'gene' or 'patient'
var driver; // {nom: 'txt', genes: ['gene1','gene2',...]}
var drivers; // [{nom: 'txt', genes: 'gene1;gene2;...'},...]
var anomalies; // DataSet {id, patient, gene, famille, type}

var patientFilter = [];

var items; // DataSet [{patient: '000', gene: 'nom', nbTotal: 4, nbMutSomatic: 1, nbMutGermline: 1, nbCopy: 3, ... }, ... ]
var avgGenes = new vis.DataSet(); // DataSet [{gene, avg}, ... ]
var avgPatients  = new vis.DataSet(); // DataSet [{patient, avg}, ... ]


var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = () => {
    loadDrivers(request.response[0]);
}

/**
 * FUNCTIONS 
 */

 function fileSelect(input) {
     let file = input.files[0];

     let reader = new FileReader();

     reader.readAsText(file);

     reader.onload = function() {
         init(JSON.parse(reader.result));
     }
 }

 //TODO
 function csvSelect(input) {
     items = [];

     let file = input.files[0];

     let reader = new FileReader();

     reader.readAsText(file);

     reader.onload = () => {
        emptyAnomalies();

        let inputLines = reader.result.split('\n');
        for (let i = 0; i < inputLines.length; i++) {
            const line = inputLines[i];
            loadAnomalyCsvFormat(line);
        }
        console.log(JSON.stringify(anomalies.get()));
        let pausehere;

        config();
        alert('counting anomalies about to start');
        countRelevantAnomalies(); // WAYYYY TOO COMPLEX FOR LOTS OF DATA
        alert('count done');
        createGraphic();
     };
 }

 function loadAnomalyCsvFormat(line) {
    let lineItems = line.split(';');
    if(lineItems[1] == undefined){
        return;
    }
    //TODO
    let item = {};
    item.id = anomalies.length;
    item.patient = removeQuotes(lineItems[0]);
    item.gene = removeQuotes(lineItems[1]).toUpperCase();
    item.famille = removeQuotes(lineItems[2]).toLowerCase();
    item.type = removeQuotes(lineItems[4]).toLowerCase();
    let col6 = removeQuotes(lineItems[5]);
    if(item.famille == 'mutation' && col6 != '') {
        item.gnomen = col6;
    }
    if(item.type == ''){
        item.type = 'no-diff';
    }

    // Skip item if is irrelevant ('nsp' or 'mutation'&'non' or already counted mutation)
    let col4 = removeQuotes(lineItems[3]);
    let irrelevant = col4 == 'nsp' || ((item.famille == 'mutation' || item.famille == 'copy number') && col4 == 'non') || (item.famille == 'mutation' && checkIfMutationInAnomalies(item.patient, item.gene, item.type, item.gnomen));
    if(irrelevant){
        return;
    }
    if(item.famille == 'expression') {
        item.famille = 'expr';
    }
    if(item.famille == 'methylation') {
        item.famille = 'meth';
    }
    if(item.famille == 'copy number') {
        item.famille = 'copy';
    }

    let col8 = removeQuotes(lineItems[7]);
    if(col8 != '') {
        item.chc = col8;
    }

    anomalies.add(item);
 }

 function computedSelect(input) {
     let file = input.files[0];

     let reader = new FileReader();
     reader.readAsText(file);

     // Config for HCA items
     document.getElementById('loader').style.display = 'block';
     container.innerHTML = '';
     ROW_TYPE = 'gene';

     // Recreate graphic without computing averages again
     reader.onload = () => {
         emptyAnomalies();
         
         items.add(JSON.parse(reader.result));

         setDriver('HCA');

         setTimeout(() => {
            calculateAvgGenes();
            calculateAvgPatients();
            createGraphic();
         }, 400);
     }
     
 }

 function patientSelect(input) {
    if(input.value == '') return;

    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
        patientFilter = reader.result.split(';');
        if(patientFilter[0] == '') {
            patientFilter = [];
            return;
        }
        document.getElementById('filter-wipe-btn').style.display = 'inline';
        document.getElementById('nb-patients-span').style.display = 'inline';
        document.getElementById('nb-patients-val').innerHTML = patientFilter.length;
    }
 }

 /**
  * Check if anomaly is already counted for a patient, gene, famille, type, region
  * Only using mutation & gnomen for now
  */
 function checkIfMutationInAnomalies(pat, gene, type, gnomen) {
    let quit = false;
    let matched = anomalies.get({
        filter: a => {
            if(!quit && a.famille == 'mutation' && a.gnomen == gnomen && a.patient == pat && a.gene == gene && a.type == type){
                quit = true;
                return true;
            }
            return false;
        }
    });
    
    return matched.length > 0;
 }

 /**
  * Return a copy of str without any quotes (") 
  */
 function removeQuotes(str) {
    while(str.includes('"')) {
        str = str.replace('"','');
    }
    return str;
 }

 function emptyAnomalies() {
    anomalies = new vis.DataSet();
    items = new vis.DataSet();
    avgGenes = new vis.DataSet();
    avgPatients = new vis.DataSet();
    container.innerHTML = '';
    document.getElementById('loader').style.display = 'block';
    document.getElementById('row-type-btn').innerHTML = '<strong>GENES</strong> <> Patients';
 }

 function init(dataObj) {
    drivers = [];
    emptyAnomalies();
    // timeout to refresh UI elements
    setTimeout( () => {
        if(loadData(dataObj) == -1) return;
        config();
        countRelevantAnomalies(); // init items dataset
        recomputeGraphic(); // calculate avgs & redraw graphic
    }, 500);
 }

 /**
  * Load drivers, create anomalies from json created from csv
  */
 function loadData(dataObj) {
    let response = dataObj;
    // Check if input is array of length 2 and anomalies is array
    if( !Array.isArray(response) || response.length != 2 || !Array.isArray(response[1])){
        alert('wrong format');
        container.innerHTML = '';
        document.getElementById('driver-name').innerHTML = '';
        document.getElementById('driver-genes').innerHTML = '';
        return -1;
    }
    // Load list of available drivers from input array's first element
    loadDrivers(response[0]);

    // Load anomalies
    // let createdItems = [];

    // for (let i = 0; i < response[1].length; i++) {
    //    let input = response[1][i];
    //    let anomaly = {
    //        id:      i,
    //        patient: response[1][i].patient,
    //        gene:    response[1][i].gene,
    //        famille: response[1][i].famille,
    //        type:    response[1][i].type,
    //        soustype:response[1][i].soustype,
    //        gnomen:  response[1][i].gnomen,
    //        pnomen:  response[1][i].pnomen,
    //        cnomen:  response[1][i].cnomen,
    //        chc:     response[1][i].chc,
    //        start:   response[1][i].start,
    //        end:     response[1][i].end
    //    }
       
    //     createdItems.push(anomaly);
    // }
    anomalies = new vis.DataSet(response[1]);
 }

 /**
  * Set ROW_TYPE to 'gene' & select first driver from drivers
  */
 function config() {
    // TODO user choice 
    setDriver(drivers[0].nom);
    ROW_TYPE = 'gene';
 }

 /**
  * Reset and compute averages for genes and patients
  * Recreate graphic
  */
 function recomputeGraphic() {
    document.getElementById('loader').style.display = 'block';
    container.innerHTML = '';
    avgGenes = new vis.DataSet();
    avgPatients = new vis.DataSet();

    setTimeout( () => {
        calculateAvgGenes();
        calculateAvgPatients();
        createGraphic();
    }, 400);
 }

 /** 
  * Set driver to d, parsing d for genes
  */
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
    document.getElementById('driver-name').innerHTML = driver.nom;
    document.getElementById('driver-genes').innerHTML = driver.genes.join(', ');
    document.getElementById('driver-' + d.nom.toLowerCase()).className += ' driver-selected';


    // Replace items dataset with driver's computed items
    let itemsRequest = new XMLHttpRequest();
    itemsRequest.open('GET', d.items);
    itemsRequest.responseType = 'json';
    itemsRequest.send();
    itemsRequest.onload = () => {
        items = new vis.DataSet(itemsRequest.response);
    }

    avgGenes = new vis.DataSet();
    avgPatients = new vis.DataSet();
 }

 /**
  * Reset drivers array and driver buttons with new drivers
  * TODO ONCLICK UPDATE ITEMS DATASET WITH RELEVANT COMPUTED ITEMS 
  */
 function loadDrivers(driverArray) {
    drivers = driverArray;

    let driverDiv = document.getElementById('driver-btns');
    driverDiv.innerHTML = '';
    drivers.forEach(d => {
        let button = document.createElement('button');
        button.className = 'driver-btn';
        button.id = 'driver-' + d.nom.toLowerCase();
        button.onclick = () => {
            // TODO UPDATE ITEMS DATASET WITH RELEVANT COMPUTED ITEMS 
            setDriver(d.nom);
        };
        button.appendChild(document.createTextNode(d.nom));
        driverDiv.appendChild(button);
    });
 }

 

 /**
  * Initialise the items DataSet from anomalies
  */
 function countRelevantAnomalies() {
    driver.genes.forEach(geneStr => {
        let patients = anomalies.get({
            fields: ['patient'],
            filter: a => {
                return a.gene == geneStr;
            }
        });

        patients.forEach(p => {
            countAnomalies(geneStr, p.patient);
        });


    });
 }

 /**
  * Create object in items array associated with  
  * the pair : geneStr, patientStr
  * If it doesn't already exist
  */
 function countAnomalies(geneStr, patientStr) {
    let exists = items.get({
        filter: i => {
            return i.gene == geneStr && i.patient == patientStr;
        }
    }).length > 0;
    if(exists) return;


    let matched = anomalies.get({
        filter: function(a) {
            return a.gene == geneStr && a.patient == patientStr;
        }
    });

    let nbMutSomatic = 0;
    let nbMutGermline = 0;
    let nbExprUp = 0;
    let nbExprDown = 0;
    let nbExprNodiff = 0;
    let nbMethHypo = 0;
    let nbMethHyper = 0;
    let nbMethNodiff = 0;
    
    let foundAnomalies = {
        mut:    [],
        expr:   [],
        copy:   [],
        meth:   []
    };

    // For each matched anomaly, add 1 to corresponding type count 
    matched.forEach(anom => {
        switch(anom.famille) {
            case 'mutation':
                foundAnomalies.mut.push(anom);
                switch(anom.type) {
                    case 'somatic': 
                        nbMutSomatic++;
                        break;
                    case 'germline':
                        nbMutGermline++;
                        break;
                }
                break;
            case 'copy':
                foundAnomalies.copy.push(anom);
                break;
            case 'expr':
                foundAnomalies.expr.push(anom);
                switch(anom.type) {
                    case 'up':
                        nbExprUp++;
                        break;
                    case 'down':
                        nbExprDown++;
                        break;
                    case 'no-diff':
                    case 'nodiff':
                        nbExprNodiff++;
                        break;
                }
                break;
            case 'meth':
                foundAnomalies.meth.push(anom);
                switch(anom.type) {
                    case 'hypo':
                        nbMethHypo++;
                        break;
                    case 'hyper':
                        nbMethHyper++;
                        break;
                    case 'no-diff':
                    case 'nodiff':
                        nbMethNodiff++;
                        break;
                }
                break;
        }
    });

    let total = nbMutSomatic + nbMutGermline + foundAnomalies.copy.length + nbExprUp + nbExprDown + nbExprNodiff + nbMethHypo + nbMethHyper + nbMethNodiff;
    
    items.add({
        id:             items.length,
        gene:           geneStr,
        patient:        patientStr,
        nbTotal:        total,
        nbMutSomatic:   nbMutSomatic,
        nbMutGermline:  nbMutGermline,
        nbCopy:         foundAnomalies.copy.length,
        nbExprUp:       nbExprUp,
        nbExprDown:     nbExprDown,
        nbExprNodiff:   nbExprNodiff,
        nbMethHypo:     nbMethHypo,
        nbMethHyper:    nbMethHyper,
        nbMethNodiff:   nbMethNodiff,
        anomalies:      foundAnomalies
    });
 }

 
 /**
  * Analyze items DataSet
  * Return array of 15 names of genes or patients (depending on rowType),
  * ordered by avg
  */
 function getRowOrder() {
    let res = []; 
    if(ROW_TYPE == 'gene'){
        let sorted = avgGenes.get({
            fields:     ['gene'],
            filter:     i => {
                return driver.genes.includes(i.gene);
            },
            order:      (a, b) => {
                return b.avg - a.avg;
            }   
        });

        for (let i = 0; i < sorted.length && i < 15; i++) {
            res.push(sorted[i].gene);
        }
    } else {
        let sorted = avgPatients.get({
            fields:     ['patient'],
            filter:     i => {
                if(patientFilter.length > 0) {
                    return patientFilter.includes(i.patient) && checkIntersectionsWithDriverGenes(i.patient);
                }
                return checkIntersectionsWithDriverGenes(i.patient);
            },
            order:      (a, b) => {
                return b.avg - a.avg;
            }   
        });

        for (let i = 0; i < sorted.length && i < 15; i++) {
            res.push(sorted[i].patient);
        }
    }
    return res;
 }

 function checkIntersectionsWithDriverGenes(pStr) {
    let bool = false;
    for (let i = 0; i < driver.genes.length && !bool; i++) {
        const gStr = driver.genes[i];
        if(ROW_TYPE == 'gene') 
            bool = (bool || getIntersection(gStr, pStr) != undefined);
        else 
            bool = (bool || getIntersection(pStr, gStr) != undefined);
    }

    return bool;
 }

 /**
  * Calculte avg of somatic mutations for each gene
  */
 function calculateAvgGenes() {
    driver.genes.forEach(gStr => {
        let exists = avgGenes.distinct('gene').includes(gStr);
        if(!exists){
            let total = 0;
            let count = 0;
            items.get({
                filter: i => {
                    if(patientFilter.length > 0) {
                        return patientFilter.includes(i.patient) && i.gene == gStr;
                    }
                    return i.gene == gStr;
                },
                fields: ['nbMutSomatic']
            }).forEach(i => {
                total += i.nbMutSomatic;
                count++;

            });
            if(count > 0) {
                let moy = total / count;

                // Add item to avgGenes DataSet
                avgGenes.add({
                    id:     avgGenes.length,
                    gene:   gStr,
                    avg:    moy
                });
            }
        }
    });
 }

 /**
  * Calculte avg of somatic mutations for each patient
  */
 function calculateAvgPatients() {
    let allPatients = items.distinct('patient');

    // For each, if it isn't already created, avg all nbTotal in items DataSet
    allPatients.forEach(pStr => {
        if((patientFilter.length > 0 && !patientFilter.includes(pStr)) || avgPatients.distinct('patient').includes(pStr)) 
            return;
        
        let total = 0;
        let count = 0;
        items.get({
            filter: i => {
                return i.patient == pStr;
            },
            fields: ['nbMutSomatic']
        }).forEach(i => {
            total += i.nbMutSomatic;
            count++;
        });

        if(count > 0) {
            let moy = total / count;

            // Add item to avgPatients DataSet
            avgPatients.add({
                id:         avgPatients.length,
                patient:    pStr,
                avg:        moy
            });

        }
    });

    document.getElementById('nb-patients-span').style.display = 'inline';
    document.getElementById('nb-patients-val').innerHTML = avgPatients.length;
 }

 /**
  * Analyze items DataSet
  * Return array of 15 names of patients or genes (depending on rowType),
  * ordered by nbTotal and matching firstRowStr
  */
 function getColumnOrder(rowOrder) {
    //TODO
    let res = [];

    if(ROW_TYPE == 'gene'){
        // get patients ordered by nbTotal for rowOrder[0]
        // if less than MAX_ITEMS, add patients for next gene 
        // until either (15 max patients) or (all genes checked)
        for (let i = 0; i < rowOrder.length && res.length < MAX_ITEMS; i++) {
            const geneRow = rowOrder[i];
            let patientsForGene = getOrderedPatients(geneRow);
            for (let j = 0; j < patientsForGene.length && res.length < MAX_ITEMS; j++) {
                const patientCol = patientsForGene[j];
                if(! res.includes(patientCol)) {
                    res.push(patientCol);
                }
            }
        }  
    } else {
        // get genes ordered by nbTotal for rowOrder[0]
        // if less than MAX_ITEMS, add genes for next patient 
        // until either (15 max genes) or (all patients checked)
        for (let i = 0; i < rowOrder.length && res.length < MAX_ITEMS; i++) {
            const patientRow = rowOrder[i];
            let genesForPatient = getOrderedGenes(patientRow);
            for (let j = 0; j < genesForPatient.length && res.length < MAX_ITEMS; j++) {
                const geneCol = genesForPatient[j];
                if(! res.includes(geneCol)) {
                    res.push(geneCol);
                }
            }
        }  
    }

    return res;
 }

 /**
  * Return array of patients for geneStr
  * Ordered by nbTotal descending
  */
 function getOrderedPatients(geneStr) {
    let matched = items.get({
        fields: ['patient'],
        filter: i => {
            if(patientFilter.length > 0) {
                return patientFilter.includes(i.patient) && i.gene == geneStr;
            }
            else return i.gene == geneStr;
        },
        order: (a, b) => {
            return b.nbTotal - a.nbTotal;
        }
    });

    let res = [];
    for (let i = 0; i < matched.length; i++) {
        const item = matched[i];
        res.push(item.patient);
    }

    return res;
 }

 /**
  * Return array of genes for patientStr
  * Ordered by nbTotal descending
  */
 function getOrderedGenes(patientStr) {
    let matched = items.get({
        fields: ['gene'],
        filter: i => {
            if(patientFilter.length > 0) {        
                return patientFilter.includes(i.patient) && i.patient == patientStr && driver.genes.includes(i.gene);
            }
            return i.patient == patientStr && driver.genes.includes(i.gene);
        },
        order: (a, b) => {
            return b.nbTotal - a.nbTotal;
        }
    });

    let res = [];
    for (let i = 0; i < matched.length; i++) {
        const item = matched[i];
        res.push(item.gene);
    }

    return res;
 }


 /**
  * Create graphic based on items DataSet and in the given order
  */
 function createGraphic() {
    let rowOrder = getRowOrder();  
    let columnOrder = getColumnOrder(rowOrder);
    // Empty container
    container.innerHTML = '';
    document.getElementById('loader').style.display = 'none';
    // Create row labels
    let rowLabelDiv = createRowLabelDiv(rowOrder);
    container.appendChild(rowLabelDiv);
    
    // Create right div including column labels and content div
    let rightDiv = createDiv('graph-right');
    let colLabelDiv = createColLabelDiv(columnOrder);
    rightDiv.appendChild(colLabelDiv);

    let contentDiv = createDiv('graph-content');
    fillContent(contentDiv, rowOrder, columnOrder);
    rightDiv.appendChild(contentDiv);
    container.appendChild(rightDiv);
 }

 function createDiv(className) {
     let res = document.createElement('div');
     res.className = className;
     return res;
 }

 function createTextDiv(text, className) {
     let res = document.createElement('div');
     res.className = className;
     res.appendChild(document.createTextNode(text));
     return res;
 }

 function createRowLabelDiv(rowOrder) {
    let res = createDiv('graph-row-labels');
    res.appendChild(createTextDiv(' ', 'graph-label graph-top-left'));
    for (let i = 0; i < rowOrder.length; i++) {
        const rowTitle = rowOrder[i];
        let titleStr = '' + rowTitle;
        let avgStr = '';
        if(ROW_TYPE == 'gene') {
            avgStr = Math.trunc(avgGenes.get({
                fields: ['avg'],
                filter: item => {
                    return item.gene == rowOrder[i];
                }
            })[0].avg * 100) / 100;
        } else {
            avgStr = Math.trunc(avgPatients.get({
                fields: ['avg'],
                filter: item => {
                    return item.patient == rowOrder[i];
                }
            })[0].avg * 100) / 100;
        }
        let titleDiv = createTextDiv(titleStr, 'graph-label');
        titleDiv.appendChild(createTextDiv(avgStr, 'graph-label-avg'));
        res.appendChild(titleDiv);
    }
    return res;
 }

 function createColLabelDiv(columnOrder) {
    let res = createDiv('graph-col-labels graph-row');

    for (let i = 0; i < columnOrder.length; i++) {
        const columnTitle = columnOrder[i];
        let titleStr = '' + columnTitle;
        let avgStr = '';
        if(ROW_TYPE == 'gene') {
            avgStr = Math.trunc(avgPatients.get({
                fields: ['avg'],
                filter: item => {
                    return item.patient == columnOrder[i];
                }
            })[0].avg * 100) / 100;
        } else {
            avgStr = Math.trunc(avgGenes.get({
                fields: ['avg'],
                filter: item => {
                    return item.gene == columnOrder[i];
                }
            })[0].avg * 100) / 100;
        }
        let titleDiv = createTextDiv(titleStr, 'graph-label');
        titleDiv.appendChild(createTextDiv(avgStr, 'graph-label-avg'));
        res.appendChild(titleDiv);
    }

    return res;
 }

 /**
  * Fill contentDiv with graph-row divs containing graph-item divs containing relevant info
  * TODO CREATE TOOLTIPS
  */
 function fillContent(contentDiv, rowOrder, columnOrder) {
    for (let i = 0; i < rowOrder.length; i++) {
        const rowTitle = rowOrder[i];

        let newRow = createDiv('graph-row');

        for (let j = 0; j < columnOrder.length; j++) {
            const colTitle = columnOrder[j];
            let newItem = createDiv('graph-item');

            let intersectItem = getIntersection(rowTitle, colTitle);
            if(intersectItem) {
                createIntersectDiv(intersectItem, newItem);
            }

            newRow.appendChild(newItem);

        }

        contentDiv.appendChild(newRow);
    }
 }

 function createIntersectDiv(intersectItem, itemDiv) {
    let mutDiv = createDiv('graph-mut');
    mutDiv.appendChild(createTextDiv(''+intersectItem.nbMutSomatic, 'somatic'));
    mutDiv.appendChild(createTextDiv(''+intersectItem.nbMutGermline, 'germline'));
    
    let copyDiv = createTextDiv(''+intersectItem.nbCopy, 'graph-copy');
    
    let exprDiv = createDiv('graph-expr');
    exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprUp, 'up'));
    exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprDown, 'down'));
    exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprNodiff, 'nodiff'));
   

    let methDiv = createDiv('graph-meth');
    methDiv.appendChild(createTextDiv(''+intersectItem.nbMethHyper, 'hyper'));
    methDiv.appendChild(createTextDiv(''+intersectItem.nbMethHypo, 'hypo'));
    methDiv.appendChild(createTextDiv(''+intersectItem.nbMethNodiff, 'nodiff'));

    createTooltip(mutDiv, intersectItem.anomalies.mut);
    createTooltip(copyDiv, intersectItem.anomalies.copy);
    createTooltip(exprDiv, intersectItem.anomalies.expr);
    createTooltip(methDiv, intersectItem.anomalies.meth);

    itemDiv.appendChild(mutDiv);
    itemDiv.appendChild(copyDiv);
    itemDiv.appendChild(exprDiv);
    itemDiv.appendChild(methDiv);
 }

 function createTooltip(div, anomArray) {
    if(anomArray.length > 0) {
        div.className += ' tooltip';
        let tooltipText = createDiv('tooltip-text');
        for (let i = 0; i < anomArray.length; i++) {
            const anom = anomArray[i];
            let lineStr = anom.famille + ', ' + anom.type
            if(anom.hasOwnProperty('gnomen')) {
                lineStr += ', ' + anom.gnomen;
            }
            if(anom.hasOwnProperty('chc')) {
                lineStr += ', ' + anom.chc;
            }
            tooltipText.appendChild(createTextDiv(lineStr, 'tooltip-item'));
        }


        div.appendChild(tooltipText);
    }
 }
 
 /**
  * Return item matching pair gene, patient or patien, gene (depending on ROW_TYPE)
  * IF GENE IS IN DRIVER'S LIST, else return undefined
  */
 function getIntersection(rowTitle, colTitle) {
    let matched = items.get({
        filter: i => {
            if(driver.genes.includes(i.gene)){
                if(ROW_TYPE == 'gene')
                    return i.gene == rowTitle && i.patient == colTitle;
                else 
                    return i.gene == colTitle && i.patient == rowTitle;
            }

            return false;
        }
    });

    return matched[0];
 }


/**
 * Afficher une capture d'ecran du graphe
 */
function capture() {
	// hide tooltips
	// let tooltips = document.querySelectorAll('.tooltip-text');
	// tooltips.forEach(function (t) {
	// 	t.style.display = 'none';
	// });

	// Display screencap of #to-capture elem
	html2canvas(document.getElementById('to-capture')).then(function(canvas) {
		document.getElementById('output-card').style.display = 'block';
		// Export the canvas to its data URI representation
		var base64image = canvas.toDataURL("image/jpeg");
		// Display image in #output element
		document.getElementById('output').src = base64image;
	});

	// show tooltips
	// tooltips.forEach(function (t) {
	// 	t.style.display = 'block';
	// });
}

 /**
  * Toggle between genes and patients for rows
  */
function toggleRowType() {
    changeRowTypeUI();
    setTimeout(createGraphic, 20);
}

function changeRowTypeUI() {
    if(ROW_TYPE == 'gene'){
        ROW_TYPE = 'patient';
        document.getElementById('row-type-btn').innerHTML = 'Gènes <> <strong>PATIENTS</strong>';
    } else {
        ROW_TYPE = 'gene';
        document.getElementById('row-type-btn').innerHTML = '<strong>GENES</strong> <> Patients';
    }
    container.innerHTML = '';
    document.getElementById('loader').style.display = 'block';
}

function resetFilters(input) {
    patientFilter = [];
    document.getElementById('nb-patients-span').style.display = 'none';
    input.value = '';
}