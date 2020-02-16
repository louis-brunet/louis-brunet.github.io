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
var container = document.getElementById('matrix');
var MAX_ITEMS = 15;
var ROW_TYPE = 'gene'; // 'gene' or 'patient'
var driver; // {nom: 'txt', genes: ['gene1','gene2',...]}
var drivers; // [{nom: 'txt', genes: 'gene1;gene2;...'},...]
var anomalies; // DataSet {id, patient, gene, famille, type}

var patientFilter = [];
document.getElementById('patient-select').value = '';
var genesFilter = [];
var allGenes = [];
var sortByMutations = false;
var pagesInfo = {
    rows:   {
        order:      [],
        page:       0,
        nbPages:    0
    },
    columns:{
        order:    [],
        page:       0,
        nbPages:    0
    }
};

var items; // DataSet [{patient: '000', gene: 'nom', nbTotal: 4, nbMutSomatic: 1, nbMutGermline: 1, nbCopy: 3, ... }, ... ]
var avgGenes = new vis.DataSet(); // DataSet [{gene, avg}, ... ]
var avgPatients  = new vis.DataSet(); // DataSet [{patient, avg}, ... ]

var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = () => {
    loadDrivers(request.response);
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
         // TODO init items array with all drivers' items

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
    let col8 = removeQuotes(lineItems[7]);
    if(col8 != '') {
        item.chc = col8;
    }
    if(item.type == ''){
        item.type = 'no-diff';
    }

    // Skip item if is irrelevant ('nsp' or 'mutation'&'non' or already counted mutation)
    let col4 = removeQuotes(lineItems[3]);
    let irrelevant = col4 == 'nsp' || ((item.famille == 'mutation' || item.famille == 'copy number') && col4 == 'non') || (item.famille == 'mutation' && checkIfMutationInAnomalies(item.patient, item.gene, item.type, item.gnomen, item.chc));
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

 function genesSelect(input) {
    document.getElementById('genes-input-warning').style.display = 'inline';
 }

 /**
  * Check if anomaly is already counted for a patient, gene, famille, type, region
  * Only using mutation & gnomen for now
  * If found anomaly, add new chc to its chc 
  */
 function checkIfMutationInAnomalies(pat, gene, type, gnomen, chc) {
    let quit = false;
    let matched = anomalies.get({
        filter: a => {
            if(!quit && a.famille == 'mutation' && a.gnomen == gnomen && a.patient == pat && a.gene == gene && a.type == type){
                quit = true;

                if(! a.chc.split(';').includes(chc)) {
                    let newChc = a.chc + ';' + chc;
                    setAnomalyChc(a.id, newChc);
                }

                return true;
            }
            return false;
        }
    });
    
    return matched.length > 0;
 }

 function setAnomalyChc(anomId, newChc) {
    anomalies.update({id: anomId, chc: newChc});
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

    pagesInfo.rows.page = 0;
    pagesInfo.columns.page = 0;

    setTimeout( () => {
        setRowType();
        setSorting();


        calculateAvgGenes();
        optimisedCalculateAvgPatients();
        calculateRowOrder();
        calculateColumnOrder();

        createGraphic();
    }, 400);
 }

 function setRowType() {
    let rowTypeBtns = document.getElementsByName('row-type-btn');
    for (let i = 0; i < rowTypeBtns.length; i++) {
        const btn = rowTypeBtns[i];
        if(btn.checked == true) {
            ROW_TYPE = btn.value;
            break;
        }
    }
 }

 function setSorting() {
    let sortingBtns = document.getElementsByName('sorting-btn');
    for (let i = 0; i < sortingBtns.length; i++) {
        const btn = sortingBtns[i];
        if(btn.checked == true) {
            if(btn.value == 'mutations') {
                sortByMutations = true;
            } else if (btn.value == 'default') {
                sortByMutations = false;
            }
            break;
        }
    }
 }

 function setItems(itemArr) {
     items = new vis.DataSet(itemArr);
 }

 /**
  * Add elements to items DataSet
  * merge elements that refer to the same intersection
  */
 function addItems(itemArr) {
    if(Array.isArray(itemArr)) {
        itemArr.forEach( i => {
            let oldItem;
            if(ROW_TYPE == 'gene') {
                oldItem = getIntersection(i.gene, i.patient);
            } else {
                oldItem = getIntersection(i.patient, i.gene);
            }
            if(oldItem == undefined) {
                i.id = items.length;
                items.add(i);
            } else {
                let newItem = {
                    id:             oldItem.id,
                    gene:           i.gene,
                    patient:        i.patient,
                    nbTotal:        i.nbTotal + oldItem.nbTotal,
                    nbMutSomatic:   i.nbMutSomatic + oldItem.nbMutSomatic,
                    nbMutGermline:  i.nbMutGermline + oldItem.nbMutGermline,
                    nbCopy:         i.nbCopy + oldItem.nbCopy,
                    nbExprUp:       i.nbExprUp +oldItem.nbExprUp,
                    nbExprDown:     i.nbExprDown + oldItem.nbExprDown,
                    nbExprNodiff:   i.nbExprNodiff + oldItem.nbExprNodiff,
                    nbMethHypo:     i.nbMethHypo + oldItem.nbMethHypo,
                    nbMethHyper:    i.nbMethHyper + oldItem.nbMethHyper,
                    nbMethNodiff:   i.nbMethNodiff + oldItem.nbMethNodiff,
                    anomalies:      mergeAnomalies(i.anomalies, oldItem.anomalies)
                }
                items.update(newItem);
            }
        });
    }
}

/**
 * TODO MERGE MUTATIONS IF SAME GNOMEN,etc.
 */
function mergeAnomalies(item1Anomalies, item2Anomalies) {
    let res = {
        mut:    [],
        copy:   item1Anomalies.copy.concat(item2Anomalies.copy),
        expr:   item1Anomalies.expr.concat(item2Anomalies.expr),
        meth:   item1Anomalies.meth.concat(item2Anomalies.meth)
    };

    // TODO MERGE MUTATIONS

    return res;
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
    // Update graph title 
    document.getElementById('driver-name').innerHTML = driver.nom;
    document.getElementById('driver-genes').innerHTML = driver.genes.sort().join(', ');
    document.getElementById('driver-' + d.nom.toLowerCase()).className += ' driver-selected';

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

    // Replace items dataset with driver's computed items
    let itemsRequest = new XMLHttpRequest();
    itemsRequest.open('GET', d.items);
    itemsRequest.responseType = 'json';
    itemsRequest.send();
    itemsRequest.onload = () => {
        setItems(itemsRequest.response);
        document.getElementById('create-graph-btn').style.display = 'inline-block';
    }

    avgGenes = new vis.DataSet();
    avgPatients = new vis.DataSet();
 }

 /**
  * Reset drivers array and driver buttons with new drivers
  * btns onclick : UPDATE ITEMS DATASET WITH RELEVANT COMPUTED ITEMS 
  * init genes filter select
  */
 function loadDrivers(driverArray) {
    drivers = driverArray;
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

 function createGeneFilterBtn(gStr) {
    let res = createTextDiv(gStr, 'genes-filter-item visible');
    let id = 'genes-select-' + gStr.toLowerCase();
    res.id = id;

    res.onclick = () => {
        toggleGeneSelected(id);
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

 function makeVisible(geneBtnId) {
    let item = document.getElementById(geneBtnId);
    if(! item.className.includes('visible')) {
        item.className += ' visible';
    }
    if(item.className.includes('hidden')) {
        item.className = item.className.replace('hidden', '');
    }
 }

 function hide(geneBtnId) {
    let item = document.getElementById(geneBtnId);
    if(! item.className.includes('hidden')) {
        item.className += ' hidden';
    }
    if(item.className.includes('visible')) {
        item.className = item.className.replace('visible', '');
    }
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
    let bool = false;
    let exists = items.get({
        filter: i => {
            if(!bool & i.gene == geneStr && i.patient == patientStr){
                bool = true;
                return true;
            }
            return false;
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
  * Fill resultArr with names of patients ordered by totalSomatic
  */
 function getPatientsOrder(resultArr) {
    let sorted = avgPatients.get({
        fields:     ['patient'],
        filter:     i => {
            if(patientFilter.length > 0) {
                return patientFilter.includes(i.patient); /*&& checkIntersectionsWithDriverGenes(i.patient);*/
            }
            return true;/*checkIntersectionsWithDriverGenes(i.patient)*/
        },
        order:      (a, b) => {
            if(a.totalSomatic == b.totalSomatic){
                return (a.gene < b.gene ? -1 : 1);
            }
            return b.totalSomatic - a.totalSomatic;
        }   
    });

    for (let i = 0; i < sorted.length; i++) {
        resultArr.push(sorted[i].patient);
    }
 }

 /**
  * Fill resultArr with names of genes ordered by totalSomatic
  */
 function getGenesOrder(resultArr) {
    let sorted = avgGenes.get({
        fields:     ['gene'],
        filter:     i => {
            return driver.genes.includes(i.gene);
        },
        order:      (a, b) => {
            if(a.totalSomatic == b.totalSomatic){
                return (a.gene < b.gene ? -1 : 1);
            }
            return b.totalSomatic - a.totalSomatic;
        }   
    });

    for (let i = 0; i < sorted.length; i++) {
        resultArr.push(sorted[i].gene);
    }
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
                    id:             avgGenes.length,
                    gene:           gStr,
                    avg:            moy,
                    totalSomatic:   total
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
        let countedPatients = avgPatients.distinct('patient');
        if((patientFilter.length > 0 && !patientFilter.includes(pStr)) || countedPatients.includes(pStr)) 
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
                id:             avgPatients.length,
                patient:        pStr,
                avg:            moy,
                totalSomatic:   total
            });

        }
    });

    document.getElementById('nb-patients-span').style.display = 'inline';
    document.getElementById('nb-patients-val').innerHTML = avgPatients.length;
}

function optimisedCalculateAvgPatients() {
    let allPatients = items.distinct('patient');

    let createdAvgs = [];
    // For each sum all nbMutSomatic in items DataSet
    allPatients.forEach(pStr => {
        if(patientFilter.length > 0 && !patientFilter.includes(pStr)) 
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
            // Add item to avgPatients DataSet
            avgPatients.add({
                id:             pStr,
                patient:        pStr,
                totalSomatic:   total
            });

        }
    });

    document.getElementById('nb-patients-span').style.display = 'inline';
    document.getElementById('nb-patients-val').innerHTML = avgPatients.length;
}

function calculateRowOrder() {
    let res = []; 
    if(sortByMutations) { 
        if(ROW_TYPE == 'gene'){
            getGenesOrder(res);
        } else {
            getPatientsOrder(res);
        }
    }
    // Otherwise return rows sorted alphabetically if genes, or by patient id value 
    else {
        if(ROW_TYPE == 'gene') {
            res = driver.genes.sort();
        } else {
            if(patientFilter.length > 0) {
                let sorted = patientFilter.sort( (a, b) => {
                    return parseInt(a) - parseInt(b);
                });

                for (let i = 0; i < sorted.length; i++) {
                    if(checkIntersectionsWithDriverGenes(sorted[i])) {
                        res.push(sorted[i]);
                    }
                }
            } else {
                let sorted = avgPatients.get({
                    fields:     ['patient'],
                    filter:     i => {
                        return checkIntersectionsWithDriverGenes(i.patient);
                    },
                    order:      (a, b) => {
                        return parseInt(a.patient) - parseInt(b.patient);
                    }   
                });

                for (let i = 0; i < sorted.length; i++) {
                    res.push(sorted[i].patient);
                }
    
            }
        }
    }
    pagesInfo.rows.order = res;
    pagesInfo.rows.nbPages = Math.ceil(res.length / MAX_ITEMS); 
}

function calculateColumnOrder() {
    let res = [];

    if(ROW_TYPE == 'gene') {
       getPatientsOrder(res);
    } else {
       getGenesOrder(res);
    }

    pagesInfo.columns.order = res;
    pagesInfo.columns.nbPages = Math.ceil(res.length / MAX_ITEMS);
}

// Takes pagesInfo.rows or .columns as arg
function getCurrentPageOrder(axis) {
    let res = [];

    let start = axis.page * MAX_ITEMS
    let count = 0;
    for (let i = start; i < axis.order.length && count < MAX_ITEMS; i++, count++) {
        const str = axis.order[i];
        res.push(str);
    }

    return res;
}

/**
  * Create graphic based on items DataSet and in the given order
  */
function createGraphic() {
     //TODO take rowOrder and columnOrder from pagesInfo.rows & .columns
    let rowOrder = getCurrentPageOrder(pagesInfo.rows);  
    let columnOrder = getCurrentPageOrder(pagesInfo.columns);


    // Empty container
    container.innerHTML = '';
    document.getElementById('loader').style.display = 'none';

    // Column page numbers
    let columnPageNumbersDiv = createColumnPageNumbersDiv();
    container.appendChild(columnPageNumbersDiv);

    // Graph pane
    let graphPane = createDiv('graph-pane');
    
    // Create row page numbers
    let rowPageNumbersDiv = createRowPageNumbersDiv();
    graphPane.appendChild(rowPageNumbersDiv);

    // Create row labels
    let rowLabelDiv = createRowLabelDiv(rowOrder);
    graphPane.appendChild(rowLabelDiv);
    
    // rightDiv includes column labels and content div
    let rightDiv = createDiv('graph-right');
    
    let colLabelDiv = createColLabelDiv(columnOrder);
    rightDiv.appendChild(colLabelDiv);

    let contentDiv = createDiv('graph-content');
    fillContent(contentDiv, rowOrder, columnOrder);
    rightDiv.appendChild(contentDiv);
    graphPane.appendChild(rightDiv);

    container.appendChild(graphPane);
}

function createDiv(className) {
    let res = document.createElement('div');
    res.className = className;
    return res;
}

function createLink(url, className) {
    let res = document.createElement('a');
    res.className = className;
    res.href = url;
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
        let item;
        if(ROW_TYPE == 'gene') {
            item = avgGenes.get({
                fields: ['totalSomatic'],
                filter: item => {
                    return item.gene == rowOrder[i];
                }
            })[0];
        } else {
            item = avgPatients.get({
                fields: ['totalSomatic'],
                filter: item => {
                    return item.patient == rowOrder[i];
                }
            })[0];
        }
        
        if(item != undefined && item.hasOwnProperty('totalSomatic')) {
            avgStr += item.totalSomatic;
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

        let item;
        if(ROW_TYPE == 'gene') {
            item = avgPatients.get({
                fields: ['totalSomatic'],
                filter: item => {
                    return item.patient == columnOrder[i];
                }
            })[0];
        } else {
            item = avgGenes.get({
                fields: ['totalSomatic'],
                filter: item => {
                    return item.gene == columnOrder[i];
                }
            })[0];
        }
        
        if(item != undefined && item.hasOwnProperty('totalSomatic')) {
            avgStr += item.totalSomatic;
        }

        let titleDiv = createTextDiv(titleStr, 'graph-label');
        titleDiv.appendChild(createTextDiv(avgStr, 'graph-label-avg'));
        res.appendChild(titleDiv);
    }

    return res;
}

function createRowPageNumbersDiv() {
    let res = createDiv('row-page-numbers');
    if(pagesInfo.rows.nbPages > 10) {
        createOverflownPageNumbers(res, pagesInfo.rows, 'page-number-row');
    } else if(pagesInfo.rows.nbPages > 1) {
        for (let i = 0; i < pagesInfo.rows.nbPages; i++) {
            let numberDiv = createTextDiv('' + (i + 1), 'page-number page-number-row');
            if(i == pagesInfo.rows.page) {
                numberDiv.className += ' current';
            } else {
                numberDiv.onclick = () => {
                    pagesInfo.rows.page = i;
                    document.getElementById('loader').style.display = 'block';
                    container.innerHTML = '';
                    
                    setTimeout(createGraphic, 50);
                }
            }
            
            res.appendChild(numberDiv);
        }
    }

    return res;
}

function createColumnPageNumbersDiv() {
    let res = createDiv('column-page-numbers');

    if(pagesInfo.columns.nbPages > 10) {
        createOverflownPageNumbers(res, pagesInfo.columns, 'page-number-column');
    } else if(pagesInfo.columns.nbPages > 1) {
        for (let i = 0; i < pagesInfo.columns.nbPages; i++) {
            let numberDiv = createTextDiv('' + (i + 1), 'page-number page-number-column');
            if(i == pagesInfo.columns.page) {
                numberDiv.className += ' current';
            } else {
                numberDiv.onclick = () => {
                    showColumnPage(i);
                }
            }
            res.appendChild(numberDiv);
            
        }
    }

    return res;
 }

 function showRowPage(i) {
     pagesInfo.rows.page = i;
     document.getElementById('loader').style.display = 'block';
     container.innerHTML = '';
     
     setTimeout(createGraphic, 50);
 }

 function showColumnPage(i) {
     pagesInfo.columns.page = i;
     document.getElementById('loader').style.display = 'block';
     document.getElementById('visualization').innerHTML = '';
     
     setTimeout(createGraphic, 50);
 }

function createOverflownPageNumbers(div, axisObj, itemClass) {
    let res = div;

    // start, start + 1
    let oneDiv = createTextDiv('1', 'page-number ' + itemClass);
    if( axisObj.page == 0 ) {
        oneDiv.className += ' current';
    } else {
        if(itemClass.includes('row')) {
            oneDiv.onclick = () => {
                showRowPage(0);
            }
        } else {
            oneDiv.onclick = () => {
                showColumnPage(0);
            }
        }
    }
    res.appendChild(oneDiv);

    let twoDiv = createTextDiv('2', 'page-number ' + itemClass);
    if( axisObj.page == 1 ) {
        twoDiv.className += ' current';
    } else {
        if(itemClass.includes('row')) {
            twoDiv.onclick = () => {
                showRowPage(1);
            }
        } else {
            twoDiv.onclick = () => {
                showColumnPage(1);
            }
        }
    }
    res.appendChild(twoDiv);

    // empty
    if( axisObj.page > 3 ) {
        let emptyDiv = createTextDiv(' ', 'page-number empty ' + itemClass);
        res.appendChild(emptyDiv);
    }

    // current - 1
    if( axisObj.page > 2 && axisObj.page < axisObj.nbPages - 1 ) {
        let prevPageDiv = createTextDiv('' + axisObj.page, 'page-number ' + itemClass);
        if(itemClass.includes('row')) {
            prevPageDiv.onclick = () => {
                showRowPage(axisObj.page - 1);
            }
        } else {
            prevPageDiv.onclick = () => {
                showColumnPage(axisObj.page - 1);
            }
        }
        res.appendChild(prevPageDiv);
    }

    // current
    if ( axisObj.page > 1 && axisObj.page < axisObj.nbPages - 2 ) {
        let currentPageDiv = createTextDiv('' + (axisObj.page + 1), 'page-number current ' + itemClass);
        res.appendChild(currentPageDiv);
    }
    
    // current + 1
    if( axisObj.page > 0 && axisObj.page < axisObj.nbPages - 3 ) {
        let nextPageDiv = createTextDiv('' + (axisObj.page + 2), 'page-number ' + itemClass);
        if(itemClass.includes('row')) {
            nextPageDiv.onclick = () => {
                showRowPage(axisObj.page + 1);
            }
        } else {
            nextPageDiv.onclick = () => {
                showColumnPage(axisObj.page + 1);
            }
        }
        res.appendChild(nextPageDiv);
    }

    
    // empty
    if( axisObj.page < axisObj.nbPages - 4 ) {
        let emptyDiv = createTextDiv(' ', 'page-number empty ' + itemClass);
        res.appendChild(emptyDiv);
    }

    // end -1
    let penultimateDiv = createTextDiv('' + (axisObj.nbPages - 1), 'page-number ' + itemClass);
    if( axisObj.page == axisObj.nbPages - 2) {
        penultimateDiv.className += ' current';
    } else {
        if(itemClass.includes('row')) {
            penultimateDiv.onclick = () => {
                showRowPage(axisObj.nbPages - 2);
            }
        } else {
            penultimateDiv.onclick = () => {
                showColumnPage(axisObj.nbPages - 2);
            }
        }
    }
    res.appendChild(penultimateDiv);

    // last page
    let lastPageDiv = createTextDiv('' + axisObj.nbPages, 'page-number ' + itemClass);
    if( axisObj.page == axisObj.nbPages - 1) {
        lastPageDiv.className += ' current';
    } else {
        if(itemClass.includes('row')) {
            lastPageDiv.onclick = () => {
                showRowPage(axisObj.nbPages - 1);
            }
        } else {
            lastPageDiv.onclick = () => {
                showColumnPage(axisObj.nbPages - 1);
            }
        }
    }
    res.appendChild(lastPageDiv);
}

/**
  * Fill contentDiv with graph-row divs containing graph-item divs containing relevant info
  */
function fillContent(contentDiv, rowOrder, columnOrder) {
    for (let i = 0; i < rowOrder.length; i++) {
        const rowTitle = rowOrder[i];

        let newRow = createDiv('graph-row');

        for (let j = 0; j < columnOrder.length; j++) {
            const colTitle = columnOrder[j];
            //let newItem = createLink('https://louis-brunet.github.io/test/genes/genes.html', 'graph-item');
            let newItem = createDiv('graph-item');
            let intersectItem = getIntersection(rowTitle, colTitle);
            if(intersectItem) {
                newItem.style.cursor = 'pointer';
                newItem.onclick = matrixCreateTimeline;
                createIntersectDiv(intersectItem, newItem);
            }

            newRow.appendChild(newItem);

        }

        contentDiv.appendChild(newRow);
    }
}

function matrixCreateTimeline() {
    document.getElementById('gene-window-container').style.display = 'block';
    createTimeline();
}

function createIntersectDiv(intersectItem, itemDiv) {
    let mutDiv = createDiv('graph-mut');
    let somaticDiv = createTextDiv(''+intersectItem.nbMutSomatic, 'somatic');
    let germlineDiv = createTextDiv(''+intersectItem.nbMutGermline, 'germline');
    
    let copyDiv = createTextDiv(''+intersectItem.nbCopy, 'graph-copy');
    
    let exprDiv = createDiv('graph-expr');
    exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprUp, 'up'));
    exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprDown, 'down'));
    exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprNodiff, 'nodiff'));
   

    let methDiv = createDiv('graph-meth');
    methDiv.appendChild(createTextDiv(''+intersectItem.nbMethHyper, 'hyper'));
    methDiv.appendChild(createTextDiv(''+intersectItem.nbMethHypo, 'hypo'));
    methDiv.appendChild(createTextDiv(''+intersectItem.nbMethNodiff, 'nodiff'));

    let anomSomatic = [];
    let anomGermline = [];
    for (let i = 0; i < intersectItem.anomalies.mut.length; i++) {
        const mut = intersectItem.anomalies.mut[i];
        if(mut.type == 'somatic') {
            anomSomatic.push(mut)
        } else if(mut.type == 'germline'){
            anomGermline.push(mut);
        }
    }


    createTooltip(somaticDiv, anomSomatic);
    mutDiv.appendChild(somaticDiv);
    createTooltip(germlineDiv, anomGermline);
    mutDiv.appendChild(germlineDiv);
    createTooltip(copyDiv, intersectItem.anomalies.copy);
    createTooltip(exprDiv, intersectItem.anomalies.expr);
    createTooltip(methDiv, intersectItem.anomalies.meth);

    itemDiv.appendChild(mutDiv);
    itemDiv.appendChild(copyDiv);
    itemDiv.appendChild(exprDiv);
    itemDiv.appendChild(methDiv);
}

/**
  * Create tooltip in div containing anomArray's items if anomArray.length > 0
  */
function createTooltip(div, anomArray) {
    if(anomArray.length > 0) {
        div.className += ' tooltip';
        let tooltipText = createDiv('tooltip-text');
        for (let i = 0; i < anomArray.length; i++) {
            const anom = anomArray[i];
            let lineStr = anom.type
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

function captureGenes() {
	// hide tooltips
	let tooltips = document.querySelectorAll('.genes-tooltip-text');
	tooltips.forEach(t => {
		t.style.display = 'none';
	});

	// Display screencap of #to-capture elem
	html2canvas(document.getElementById('genes-to-capture')).then(function(canvas) {
		document.getElementById('genes-output-card').style.display = 'block';
		// Export the canvas to its data URI representation
		var base64image = canvas.toDataURL("image/jpeg");
		// Display image in #output element
		document.getElementById('genes-output').src = base64image;
	});

	// show tooltips
	tooltips.forEach(t => {
		t.style.display = 'block';
	});
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
    document.getElementById('patient-select').value = ''
}