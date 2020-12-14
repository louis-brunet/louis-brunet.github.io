onmessage = function(e) {
	console.log('Worker received msg from main.js : ');
	console.log(e.data);
	console.log('Worker sending msg back to main.js');
	postMessage('Msg from pagerank_worker');
}