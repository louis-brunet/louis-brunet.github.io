console.log("votes :");console.log(votes);
console.log("logins :");console.log(logins);

let subjects = getSubjects(votes);
let degree = 1000;
addSliders();
document.getElementById('results-btn').onclick = () => refreshResults(votes, logins, subjects, degree);//displayAll(rank(votes, logins, subjects, 100));

refreshResults(votes, logins, subjects, degree);

//displayAll(rank(votes, logins, subjects, 100));

//let ranks = rank(votes, logins, 100);
//displayAll(ranks); 

function getSubjects(votes) {
	let subjects = [];

	for (const login in votes) {
		if (votes.hasOwnProperty(login)) {
			const votesRow = votes[login];
			for (const subject in votesRow) {
				if (votesRow.hasOwnProperty(subject)) {
					subjects.push(subject);
				}
			}

			break;
		}
	}

	return subjects;
}

function addSliders() {
	let slidersContainer = document.getElementById('sliders');
	slidersContainer.innerHTML = '';

	//for (const login in votes) {
	//	if (votes.hasOwnProperty(login)) {
	//		const votesRow = votes[login];
	//		for (const subject in votesRow) {
	//			if (votesRow.hasOwnProperty(subject)) {
	//				addSlider(slidersContainer, subject);
	//			}
	//		}

	//		break;
	//	}
	//}

	subjects.forEach(subject => addSlider(slidersContainer, subject));
}

function addSlider(container, subject) {
	let rowContainer = createElement('div', 'slider-container'); 

	let label = createElement('label', 'slider-label', subject + ": ");
	label.for = subject;
	rowContainer.appendChild(label);

	let input = createElement('input', 'slider');
	input.type = 'range';
	input.id = subject + '-slider';
	input.name = subject;
	input.min = 0;
	input.max = 100;
	input.value = 1;
	input.step = 1;
	input.oninput = () =>  updateRangeText(subject);
	rowContainer.appendChild(input);

	let output = createElement('span', 'slider-output', input.value);
	output.id = subject + '-slider-output';
	rowContainer.appendChild(output);

	container.appendChild(rowContainer);
}

function updateRangeText(subject) {
	let input = document.getElementById(subject + '-slider');
	let output = document.getElementById(subject + '-slider-output');
	output.innerHTML = input.value
}

function createMatrix(votes, logins, nbLogins, subjectWeights) {
	// todo
	let matrix = {};
	//console.log("createMatrix()");

	for (const login in logins) {
		//console.log("createMatrix(): login = "+login);
		//if (logins.hasOwnProperty(login)) {
			addRow(login, matrix, votes, logins, nbLogins, subjectWeights);
		//}
	}
	//Object.keys(logins).forEach(login => addRow(login, matrix, votes, logins));
	//logins.forEach((nameValue, loginValue) => addRow(loginValue, matrix, votes, logins));

	return matrix;
}

function addRow(rowLogin, matrix, votes, logins, nbLogins, subjectWeights) {
	//console.log("addRow()");
	let matrixRow = {};
	let votesRow = votes[rowLogin];

	if (votesRow === null) {
		votesRow = {};
	}

	for (const columnLogin in logins) {
		if (logins.hasOwnProperty(columnLogin)) {
			//const element = logins[login];
			matrixRow[columnLogin] = getProbabilityTo(rowLogin, columnLogin, votesRow, logins, nbLogins, subjectWeights);
			
		}
	}
	//logins.forEach((name, columnLogin) => {
	//	matrixRow[columnLogin] = getProbabilityTo(rowLogin, columnLogin, votesRow, logins);
	//});

	matrix[rowLogin] = matrixRow;
}

function getProbabilityTo(rowLogin, columnLogin, votesRow, logins, nbLogins, subjectWeights) {
	// TODO
	let votesForColumn = 0;
	let totalVotes = 0;

	for (const subject in votesRow) {
		totalVotes += votesRow[subject].length * subjectWeights[subject];
		let votedForColumn = votesRow[subject].includes(columnLogin);
		let votedForThemselves = votesRow[subject].includes(rowLogin);

		if (rowLogin != columnLogin && votedForColumn) {
			votesForColumn += subjectWeights[subject];
		} 
		if (votedForThemselves) {
			totalVotes -= subjectWeights[subject];

			//console.log(rowLogin +" voted for themselves in "+subject);
		}
	}

	if (totalVotes === 0)  {
		//console.log("getProbabilityTo(): no votes found");
		return 1.0 / nbLogins;
	} 
	

	//console.log("getProbabilityTo(): " + votesForColumn * 1.0 / totalVotes );
	return votesForColumn * 1.0 / totalVotes;
}

function multiplyMatrix(probabilities, matrix) {
	// todo
	// [ {login: xxx, name: xxx, probability: xxx}, ... ]
	let newProbabilities = [];

	probabilities.forEach(value => {
		let newProbability = {
			login: value.login,
			name: value.name,
			probability: multiplyRowColumn(probabilities, getColumn(value.login, matrix) )
		};
		newProbabilities.push(newProbability);
	});
	//Object.keys(matrix).forEach(key => {

	//});

	return newProbabilities;
}

function multiplyRowColumn(row, column) {
	let res = 0.0;

	row.forEach(element => {
		res += element.probability * 1.0 * column[element.login];
	})

	return res;
}

function getColumn(columnLogin, matrix) {
	let column = {};

	for (const rowLogin in matrix) {
		//if (matrix.hasOwnProperty(rowLogin)) {
		//	const element = matrix[rowLogin];	
		//}

		column[rowLogin] = matrix[rowLogin][columnLogin];
	}

	//Object.keys(matrix).forEach(rowLogin => {
	//	column[rowLogin] = matrix[rowLogin][columnLogin];
	//});
	
	return column;
}

 function getProbabilities(matrix, logins, degree, nbLogins) {
	// [ {login: xxx, name: xxx, probability: xxx}, ... ]
	let probabilities =  [];
	if (degree === 0) {
		//let count = 0;
		//for (const login in logins) {
		//	if (logins.hasOwnProperty(login)) {
		//		count++;
		//	}
		//}
		let probabilityValue = 1.0 / nbLogins;
		for (const login in logins) {
			if (logins.hasOwnProperty(login)) {
				probabilities.push({
					login: login,
					name: logins[login],
					probability: probabilityValue
				});
				
			}
		}

		//let probabilityValue = 1.0 / logins.length;
		//logins.forEach( (nameValue, loginValue) => {
		//	probabilities.push({
		//		login: loginValue,
		//		name: nameValue,
		//		probability: probabilityValue
		//	});
		//});
	} else {
		probabilities = multiplyMatrix(getProbabilities(matrix, logins, degree - 1, nbLogins), matrix);
	}

	return probabilities;
}

 function rank(votes, logins, subjects, degree) {
	let nbLogins = 0;
	for (const login in logins) {
		if (logins.hasOwnProperty(login)) {
			nbLogins++;
		}
	}
	console.log("nbLogins : "+nbLogins);

	let subjectWeights = getSubjectWeights(subjects);//{
	//	ACDA: 1,
	//	ANG: 1,
	//	APL: 1,
	//	ART: 1,
	//	ASR: 1,
	//	EC: 1,
	//	EGOD: 1,
	//	MAT: 1,
	//	SGBD: 1,
	//	SPORT: 1
	//};
	console.log('subject weights :');console.log(subjectWeights);

	let matrix = createMatrix(votes, logins, nbLogins, subjectWeights);
	console.log("matrix :"); console.log(matrix);

	let probabilities = getProbabilities(matrix, logins, degree, nbLogins);
	console.log("raw probabilities :"); console.log(probabilities);

	probabilities.sort(higherProbability);
	console.log("sorted probabilities :"); console.log(probabilities);


	let totalProbability = 0.0;
	probabilities.forEach(value => totalProbability += value.probability);
	console.log("total probability : "+totalProbability);

	return probabilities;
}

function getSubjectWeights(subjects) {
	let weights = {};

	subjects.forEach( subject => {
		let value = document.getElementById(subject + '-slider').value;

		weights[subject] = parseInt(value, 10);
	});

	return weights;
}

function refreshResults(votes, logins, subjects, degree) {
	let container = document.getElementById('results');
	if(container == undefined)
		alert('No element with id "results".');
	container.innerHTML = 'Calcul en cours...';

	//let testvariable = await test();
	let ranks = undefined;

	if (window.Worker) {
		let prWorker = new Worker('pagerank_worker.js');
		prWorker.onmessage = function(e) {
			console.log('Main received msg from pr_worker :'); console.log(e.data);
			console.log('e.origin : '); console.log(e.origin);

			console.log('Terminating pr_worker.');
			prWorker.terminate();
		}

		prWorker.postMessage({
			votes: votes,
			logins: logins,
			subjects: subjects,
			degree: degree
		});
	}


	//let ranks =  rank(votes, logins, subjects, degree);
	//showAll(ranks, container);

}

//async function test() { return 1; }

function showAll(ranks, container) {
	container.innerHTML = '';

	for (let i = 0; i < ranks.length; i++) {
		show(ranks[i], container);
	}
}

function show( listItem, container ) {
	let div = createElement('div', 'list-item');
	
	div.appendChild(createElement('span', 'name', listItem.name));
	div.appendChild(createElement('span', 'login', listItem.login));
	div.appendChild(createElement('span', 'probability', listItem.probability));

	container.appendChild(div);
}

function createElement(type, className = '', innerHTML = '') {
	let element = document.createElement(type);
	element.className = className;
	element.innerHTML = innerHTML;
	return element;
}

function higherProbability(a, b) {
	if (a.probability == b.probability) {
		//console.log('higherProbbility : probabilities equal');
		return a.login.localeCompare(b.login, 'fr');
	}

	return b.probability - a.probability;
}