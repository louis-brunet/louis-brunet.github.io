export default Object.freeze({
    web: [
        {
            id: "site",
            featureIds: ["spa", "locale", "dark"],
            techIds: ["vue", "quasar", "js", "htmlcss"],
            src: "https://github.com/louis-brunet/louis-brunet.github.io",
            view: "/",
        },
        {
            id: "covid",
            featureIds: ["api"],
            techIds: ["ajax", "js", "htmlcss"],
            src: "https://github.com/louis-brunet/iut/tree/main/covid19",
            imgs: ["covid19_home.png", "covid19_country.png"],
        },
        {
            id: "quiz",
            featureIds: ["persistance"],
            techIds: ["php", "mysql", "htmlcss"],
            src: "https://github.com/louis-brunet/iut/tree/main/projet_quiz_CI",
            imgs: ["quiz_login.png"],
        },
    ],
    java: [
        {
            id: "robotsPompiers",
            featureIds: [],
            techIds: ["ensimagGuiLib"],
            src: "",
            imgs: ["pompiers-simulation.gif"],
        },
        {
            id: "sudoku",
            featureIds: ["resolution", "io", "compatibility"],
            techIds: ["javaSwing"],
            src: "https://github.com/louis-brunet/iut/tree/main/PT21_APL2019",
            imgs: [
                "sudoku-resolution.png",
                "sudoku-menu.png",
                "sudoku-construction.png",
            ],
        },
        {
            id: "chess",
            featureIds: ["compatibility"],
            techIds: ["javaSwing"],
            src: "https://github.com/louis-brunet/code/tree/master/JAVA/eclipse/Chess2/src",
            imgs: [
                "chess-start.JPG",
                "chess-promotion.JPG",
                "chess-check.JPG",
                "chess-captured-check.JPG",
                "chess-win.JPG",
            ],
        },
        {
            id: "zth",
            featureIds: ["genre", "generation", "compatibility"],
            techIds: ["libgdx"],
            src: "https://github.com/louis-brunet/iut/tree/main/Projet-Tutore",
            imgs: [
                "zth-pause.png",
                "zth-gameover.png",
                "zth-settings.png",
                "zth-start.png",
            ],
        },
        {
            id: "invaders",
            featureIds: ["classic", "scores", "compatibility"],
            techIds: ["javaSwing"],
            src: "https://github.com/louis-brunet/code/tree/master/JAVA/eclipse/SpaceInvaders/src",
            imgs: ["space-invaders.JPG"],
        },
    ],
    c: [
        {
            id: "guiLib",
            featureIds: [],
            techIds: [],
            src: "",
            imgs: [],
        },
        {
            id: "snake",
            featureIds: [],
            techIds: ["iutGuiLib"],
            src: "https://dwarves.iut-fbleau.fr/git/brunet/PT11_APL2019",
            imgs: [
                "snake-start.png",
                "snake-pause.png",
                "snake-obstacles.png",
                "snake-records.png",
                "snake-perdu.png",
            ],
        },
    ],
    python: [
        {
            id: "pi",
            featureIds: ["ppm2gif"],
            techIds: ["python"],
            imgs: ["pi.gif"],
        },
    ],
    unity: [
        {
            id: "twinstick",
            featureIds: [],
            techIds: [],
            src: "",
            view: "https://louis-brunet.github.io/TwinstickShooter",
            imgs: [
                "twinstick-menu.png",
                "twinstick-playing.png",
                "twinstick-gameover.png",
            ],
        },
    ],
});
