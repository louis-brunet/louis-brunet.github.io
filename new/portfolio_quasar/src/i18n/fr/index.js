export default {
    greeting: "Bonjour",
    home: { title: "Accueil" },
    resume: { title: "Curriculum Vitae" },
    projects: {
        title: "Réalisations informatiques",
        features: "Fonctionnalités",
        techUsed: "Technologies utilisées",
        srcLinkTitle: "Code source",
        viewLinkTitle: "Voir",
        groups: {
            web: "Web",
            c: "C",
            java: "Java",
            unity: "Unity",
            python: "Python",
        },
        tech: {
            htmlcss: "HTML5/CSS3",
            javaSwing: "Java (bibliothèque graphique Swing)",
            js: "Javascript",
            ajax: "Requêtes AJAX",
            mysql: "MySQL",
            vue: "Vue.js v3",
            quasar: "Quasar (framework qui utilise Vue.js)",
            python: "Python v3",
            php: "PHP",
        },
        projectInfo: {
            covid: {
                title: "Visualisation de données sur le Covid-19",
                features: {
                    api: "Récupération des données avec des appels à un API en ligne. Les résultats des reqêtes sont mémorisés pour une certaine durée, pour éviter de répéter fréquemment les mêmes requêtes.",
                },
            },
            quiz: {
                title: "Création et distribution de quiz",
                features: {
                    //persistance: 'TODO'
                },
            },
            site: {
                title: "Site personnel",
                features: {
                    locale: "Internationalisation avec i18n.",
                    dark: "Choix persistant entre un mode sombre ou un mode clair.",
                    spa: "Single Page Application (SPA).",
                },
            },
            sudoku: {
                title: "Sudoku: création et résolution automatique",
            },
            chess: {
                title: "Échecs",
            },
            zth: {
                title: "Zero to Hero: jeu roguelike",
            },
            invaders: {
                title: "Space Invaders",
                features: {
                    classic: "Une partie classique de Space Invaders.",
                    scores: "Mémorisation des meilleurs scores.",
                },
            },
            pi: {
                title: "Approximation de pi par simulation de Monte-Carlo",
            },
            snake: {
                title: "Snake",
            },
            twinstick: {
                title: "Twinstick shooter",
            },
        },
    },
    contact: { title: "Contact" },
    education: {
        title: "Éducation",
        ensimag: {
            date: "Depuis 2021",
            title: "Etudes d'ingénieur en informatique et mathématiques appliquées",
            desc: "Spécialisation en ingénierie des systèmes d'informations prévue en fin 2022.",
            location:
                "ENSIMAG (École nationale supérieure d'informatique et de mathématiques appliquées de Grenoble)",
        },
        dut: {
            date: "2019 - 2021",
            title: "DUT Informatique",
            desc: "",
            location:
                "IUT de Sénart-Fontainebleau, UPEC (Université Paris-Est Créteil)",
        },
        insa: {
            date: "2018 - 2019",
            title: "Classes préparatoires intégrées",
            desc: "Département Sciences et Techniques pour l'Ingénieur",
            location: "INSA (Institut National des Sciences Appliquées) Rennes",
        },
        mcgill: {
            date: "2017 - 2018",
            title: "Première année de Bachelor of Computer Science",
            desc: "",
            location: "McGill University, Montréal (Canada)",
        },
        bac: {
            date: "2017",
            title: "Baccalauréat S option internationale anglophone",
            desc: "Mention bien",
            location: "Lycée François 1er, Fontainebleau",
        },
    },
    work: {
        title: "Expériences professionnelles",
        biosystemes_cdd: {
            date: "Juillet 2021",
            title: "Développement web (CDD)",
            desc: "Conception et documentation d'une syntaxe généraliste pour la définition rapports (pages HTML) qui affichent un jeu de données. Les données peuvent être récupérées par des requêtes à une base de données. Un rapport défini ainsi est réutilisable pour synthétiser plusieurs jeux de données. Un rapport contient des éléments HTML basiques, ainsi que composants HTML/JS utilisés comme des boites noires. Utilisation de HTML5/CSS3, Javascript et Vue.js.",
            location: "Biosystèmes, éditeur de logiciels",
        },
        biosystemes_stage: {
            date: "Avril - juin 2021",
            title: "Développement web (Stage)",
            desc: "Conception, développement et documentation d'une nouvelle interface, intégrée à une application web existante. Analyse du besoin et dialogue avec l'équipe métier sur les fonctionnalités à implémenter. Apprentissage et utilisation de d3.js (visualisation de données) et axios (gestion de requêtes AJAX). Développement avec soucis de compatibilité avec tous les navigateurs (e.g. Internet Explorer).",
            location: "Biosystèmes, éditeur de logiciels",
        },
        insead: {
            date: "Juin 2019",
            title: "Opérateur de saisie",
            desc: "Mise à jour de bases de données selon les rapports reçus. Utilisation de Qualtrics.com, Excel, Word.",
            location:
                "INSEAD (Institut Européen d'Administration des Affaires), Fontainebleau",
        },
        bakery: {
            date: "Septembre - novembre 2019, juillet 2019, juin 2018",
            title: "Vendeur en boulangerie",
            desc: "En boutique et sur les marchés.",
            location: "Les Petits Pains de Mathilde, Fontainebleau",
        },
        lessons: {
            date: "Février 2018 - décembre 2019, octobre 2015 - juin 2017",
            title: "Cours particuliers",
            desc: "Cours de mathématiques et de physique-chimie, en français et en anglais, pour collégiens anglophones et non anglophones.",
            location: "Fontainebleau",
        },
    },
    tools: { title: "Outils informatiques" },
};
