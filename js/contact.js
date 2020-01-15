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