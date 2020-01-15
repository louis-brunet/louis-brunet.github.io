function toggleMenu() {
	var icon= document.getElementById("menu-icon");
	if(icon.open == true){
		icon.open = false;
		icon.src = "img/menu-closed.png";
		document.getElementById("lien-accueil").style.display = "none";
		document.getElementById("lien-cv").style.display = "none";
		document.getElementById("lien-realisations").style.display = "none";
		document.getElementById("lien-contact").style.display = "none";
	} else {
		icon.open = true;
		icon.src = "img/menu-open.png";
		document.getElementById("topnav").style.flexDirection = "column";
		document.getElementById("lien-accueil").style.display = "block";
		document.getElementById("lien-cv").style.display = "block";
		document.getElementById("lien-realisations").style.display = "block";
		document.getElementById("lien-contact").style.display = "block";
	}
}

function resizeMenu() {
	var expanded = document.getElementById("menu-icon").open;
	var liensVisibles = document.getElementById("lien-accueil").style.display != "none";
	if ((expanded == true) && (window.innerWidth >= 800)) {
		toggleMenu();
		horizontalMenu();
	} else if(window.innerWidth >= 800) {
		horizontalMenu();
	} else if ((expanded != true) && window.innerWidth < 800 && liensVisibles) {
		document.getElementById("lien-accueil").style.display = "none";
		document.getElementById("lien-cv").style.display = "none";
		document.getElementById("lien-realisations").style.display = "none";
		document.getElementById("lien-contact").style.display = "none";
	}
}

function horizontalMenu() {
	document.getElementById("topnav").style.flexDirection = "row";
	document.getElementById("lien-accueil").style.display = "inline";
	document.getElementById("lien-cv").style.display = "inline";
	document.getElementById("lien-realisations").style.display = "inline";
	document.getElementById("lien-contact").style.display = "inline";

	var dropBtns = document.querySelectorAll(".dropdown > a");
	for (i = 0; i < dropBtns.length; i++) {
		dropBtns[i].style.display = "block";
	}
}

function toTop() {
	document.documentElement.scrollTop = 0;
}

function hideMobileMenu() {
	var expanded = document.getElementById("menu-icon").open;
	if(window.innerWidth < 800 && (expanded == true)) {
		toggleMenu();
	}
}

function nextImg (gallery) {
	if(document.querySelector("#" + gallery + "-gallery .gallery-btn.next").dataset.active == "false"){
		return;
	}

	var activeImg = document.getElementById(gallery + "-gallery").dataset.current;
	var nextImg;
	var next;
	
	document.querySelector("#" + gallery +"-gallery > ." + activeImg).style.display = "none";

	if(activeImg == "one") {
		document.querySelector("#" + gallery +"-gallery > .gallery-btn.previous").src = "img/left-arrow.png";
		document.querySelector("#" + gallery +"-gallery > .gallery-btn.previous").dataset.active = "true";
		next = "two";
	} else if (activeImg == "two") {
		next = "three";
	} else if (activeImg == "three") {
		next = "four";
	} else if (activeImg == "four") {
		next = "five";
	}
	nextImg = document.querySelector("#" + gallery +"-gallery > ." + next);
	nextImg.style.display = "block";
	document.getElementById(gallery +"-gallery").dataset.current = next;
	
	if (document.querySelector("#" + gallery +"-gallery .card-entry-img.last") == nextImg) {
		var nextBtn = document.querySelector("#" + gallery +"-gallery > .gallery-btn.next");
		nextBtn.src = "img/right-arrow-inactive.png";
		nextBtn.dataset.active = "false";
	}
}


function prevImg (gallery) {
	if(document.querySelector("#" + gallery +"-gallery .gallery-btn.previous").dataset.active == "false"){
		return;
	}

	var activeImg = document.getElementById(gallery +"-gallery").dataset.current;
	var prevImg;
	var prev;
	
	document.querySelector("#" + gallery +"-gallery > ." + activeImg).style.display = "none";

	if (activeImg == "two") {
		prev = "one";
	}if(activeImg == "three") {
		prev = "two";
	} else if (activeImg == "four") {
		prev = "three";
	} else if (activeImg == "five") {
		document.querySelector("#" + gallery +"-gallery > .gallery-btn.next").src = "img/right-arrow.png";
		document.querySelector("#" + gallery +"-gallery > .gallery-btn.next").dataset.active = "true";
		prev = "four";
	} 

	prevImg = document.querySelector("#" + gallery +"-gallery > ." + prev);
	prevImg.style.display = "block";
	document.getElementById(gallery +"-gallery").dataset.current = prev;
	
	if (document.querySelector("#" + gallery +"-gallery .card-entry-img.one") == prevImg) {
		let prevBtn = document.querySelector("#" + gallery +"-gallery > .gallery-btn.previous");
		prevBtn.src = "img/left-arrow-inactive.png";
		prevBtn.dataset.active = "false";
	}
}
