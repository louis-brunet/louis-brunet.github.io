/**
 * INPUT FILE
 */
 if (!window.File || !window.FileReader) {
    alert('The File APIs are not fully supported in this browser.');
 }


/**
 * DEFAULT JSON ENTRY
 */
 var url = 'https://louis-brunet.github.io/test/matrix/data.json'


/**
 * CONSTANTS & GLOBAL VARIABLES
 */
var container = document.getElementById('visualization');
var MAX_ITEMS = 15;
var ROW_TYPE; // 'gene' or 'patient'
var driver; // {nom: 'txt', genes: ['gene1','gene2',...]}
var drivers; // [{nom: 'txt', genes: 'gene1;gene2;...'},...]
var anomalies; // DataSet {id, patient, gene, famille, type}

var items; // DataSet [{patient: '000', gene: 'nom', nbTotal: 4, nbMut: 1, nbCopy: 3, ... }, ... ]
var avgGenes; // DataSet [{gene, avg}, ... ]
var avgPatients; // DataSet [{patient, avg}, ... ]


var request = new XMLHttpRequest();
request.open('GET', url);
request.responseType = 'json';
request.send();
request.onload = () => init(request.response);

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
            let lineItems = line.split(';');
            let fam = removeQuotes(lineItems[2]).toLowerCase();
            // Continue if item is irrelevant ('nsp' or 'mutation'&'non')
            let col4 = removeQuotes(lineItems[3]);
            let irrelevant = col4 == 'nsp' || (fam == 'mutation' && col4 == 'non');
            if(irrelevant){
                continue;
            }
            //TODO
            let item = {};
            item.id = i;
            item.patient = removeQuotes(lineItems[0]);
            item.gene = removeQuotes(lineItems[1]).toUpperCase();
            item.famille = fam;
            item.type = removeQuotes(lineItems[4]).toLowerCase();
            if(item.type == ''){
                item.type = 'no-diff';
            }
            if(item.famille == 'expression') {
                item.famille = 'expr';
            }
            if(item.famille == 'methylation') {
                item.famille = 'meth';
            }

            anomalies.add(item);
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
        recomputeGrapic();
    }, 500);
 }

 /**
  * Load drivers, create anomalies
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
    let createdItems = [];

    for (let i = 0; i < response[1].length; i++) {
       let input = response[1][i];
       let anomaly = {
           id:      i,
           patient: response[1][i].patient,
           gene:    response[1][i].gene,
           famille: response[1][i].famille,
           type:    response[1][i].type,
           soustype:response[1][i].soustype,
           gnomen:  response[1][i].gnomen,
           pnomen:  response[1][i].pnomen,
           cnomen:  response[1][i].cnomen,
           chc:     response[1][i].chc,
           start:   response[1][i].start,
           end:     response[1][i].end
       }
       
        createdItems.push(anomaly);
    }
    anomalies = new vis.DataSet(createdItems);
 }


 function config() {
    // TODO user choice 
    setDriver(drivers[0].nom);
    ROW_TYPE = 'gene';
 }

 function recomputeGrapic() {
    document.getElementById('loader').style.display = 'block';
    container.innerHTML = '';

    setTimeout( () => {
        countRelevantAnomalies();
        calculateAvgGenes();
        calculateAvgPatients();
        createGraphic();
    }, 400);
 }

 /** 
  * Set driver to d, parsing d for genes
  */
 function setDriver(dName) {
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
    document.getElementById('driver-genes').innerHTML = driver.genes;
 }

 function loadDrivers(driverArray) {
    drivers = driverArray;

    let driverDiv = document.getElementById('driver-btns');
    drivers.forEach(d => {
        let button = document.createElement('button');
        button.className = 'driver-btn';
        button.onclick = () => {
            setDriver(d.nom);
            recomputeGrapic();
        };
        button.appendChild(document.createTextNode(d.nom));
        driverDiv.appendChild(button);
    });
 }

 /**
  * Initialise items DataSet
  * TODO? Give each patient and each gene a 'moyenne g/p'?
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

    let total = foundAnomalies.mut.length + foundAnomalies.copy.length + nbExprUp + nbExprDown + nbExprNodiff + nbMethHypo + nbMethHyper + nbMethNodiff;
    
    items.add({
        id:             items.length,
        gene:           geneStr,
        patient:        patientStr,
        nbTotal:        total,
        nbMut:          foundAnomalies.mut.length,
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

 function calculateAvgGenes() {
    driver.genes.forEach(gStr => {
        let exists = avgGenes.distinct('gene').includes(gStr);
        if(!exists){
            let total = 0;
            let count = 0;
            items.get({
                filter: i => {
                    return i.gene == gStr;
                },
                fields: ['nbTotal']
            }).forEach(i => {
                total += i.nbTotal;
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

 function calculateAvgPatients() {
     //TODO
    // Find patients with anomalies in relevant genes
    let allPatients = items.distinct('patient');
    // =  items.get({
    //     fields: ['patient'],
    //     filter: i => {
    //         return driver.genes.includes(i.gene);
    //     }
    // });

    // For each, if it isn't already created, avg all nbTotal in items DataSet
    allPatients.forEach(pStr => {
        if(avgPatients.distinct('patient').includes(pStr)) return;
        
        let total = 0;
        let count = 0;
        items.get({
            filter: i => {
                return i.patient == pStr;
            },
            fields: ['nbTotal']
        }).forEach(i => {
            total += i.nbTotal;
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
            return i.gene == geneStr;
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
                newItem.appendChild(createTextDiv(''+intersectItem.nbMut, 'graph-mut'));
                newItem.appendChild(createTextDiv(''+intersectItem.nbCopy, 'graph-copy'));
                let exprDiv = createDiv('graph-expr');
                exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprUp, 'up'));
                exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprDown, 'down'));
                exprDiv.appendChild(createTextDiv(''+intersectItem.nbExprNodiff, 'nodiff'));
                newItem.appendChild(exprDiv);

                let methDiv = createDiv('graph-meth');
                methDiv.appendChild(createTextDiv(''+intersectItem.nbMethHyper, 'hyper'));
                methDiv.appendChild(createTextDiv(''+intersectItem.nbMethHypo, 'hypo'));
                methDiv.appendChild(createTextDiv(''+intersectItem.nbMethNodiff, 'nodiff'));
                newItem.appendChild(methDiv);


                //TODO CREATE TOOLTIPS
            }

            newRow.appendChild(newItem);

        }

        contentDiv.appendChild(newRow);
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