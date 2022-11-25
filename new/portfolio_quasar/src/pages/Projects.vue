<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("projects.title") }}</h3>

            <q-card flat>
                <template
                    v-for="(projectGroup, index) in projectGroups"
                    :key="index"
                >
                    <q-card-section :id="projectGroup.id" class="q-mb-lg">
                        <ProjectList v-bind="projectGroup" />
                    </q-card-section>
                </template>
            </q-card>
        </div>
    </q-page>
</template>

<script>
import ProjectList from "components/ProjectList.vue";
import projectGroups from "src/data/projects.js"

// const GROUPS = Object.freeze({
//     web: [
//         {
//             id: "site",
//             featureIds: ["spa", "locale", "dark"],
//             techIds: ["htmlcss", "js", "vue", "quasar"],
//             src: "https://github.com/louis-brunet/louis-brunet.github.io",
//             view: "/",
//         },
//         {
//             id: "covid",
//             featureIds: ["api"],
//             techIds: ["htmlcss", "ajax", "js"],
//             src: "",
//             imgs: ["covid19_home.png", "covid19_country.png"],
//         },
//         {
//             id: "quiz",
//             featureIds: ["persistance"],
//             techIds: ["php", "mysql", "htmlcss"],
//             src: "",
//             imgs: ["quiz_login.png"],
//         },
//     ],
//     java: [
//         {
//             id: "sudoku",
//             featureIds: ["resolution", "io", "compatibility"],
//             techIds: [],
//             src: "",
//             imgs: [
//                 "sudoku-menu.png",
//                 "sudoku-construction.png",
//                 "sudoku-resolution.png",
//             ],
//         },
//         {
//             id: "chess",
//             featureIds: ["compatibility"],
//             techIds: [],
//             src: "https://github.com/louis-brunet/code/tree/master/JAVA/eclipse/Chess2/src",
//             imgs: [
//                 "chess-start.JPG",
//                 "chess-promotion.JPG",
//                 "chess-check.JPG",
//                 "chess-captured-check.JPG",
//                 "chess-win.JPG",
//             ],
//         },
//         {
//             id: "zth",
//             featureIds: ["genre", "generation", "compatibility"],
//             techIds: ["libgdx"],
//             src: "",
//             imgs: [
//                 "zth-pause.png",
//                 "zth-gameover.png",
//                 "zth-settings.png",
//                 "zth-start.png",
//             ],
//         },
//         {
//             id: "invaders",
//             featureIds: ["classic", "scores", "compatibility"],
//             techIds: ["javaSwing"],
//             src: "https://github.com/louis-brunet/code/tree/master/JAVA/eclipse/SpaceInvaders/src",
//             imgs: ["space-invaders.JPG"],
//         },
//     ],
//     python: [
//         {
//             id: "pi",
//             featureIds: ["ppm2gif"],
//             techIds: ["python"],
//             imgs: ["pi.gif"],
//         },
//     ],
//     c: [
//         {
//             id: "snake",
//             featureIds: [],
//             techIds: [],
//             src: "https://dwarves.iut-fbleau.fr/git/brunet/PT11_APL2019",
//             imgs: [
//                 "snake-start.png",
//                 "snake-pause.png",
//                 "snake-obstacles.png",
//                 "snake-records.png",
//                 "snake-perdu.png",
//             ],
//         },
//     ],
//     unity: [
//         {
//             id: "twinstick",
//             featureIds: [],
//             techIds: [],
//             src: "",
//             view: "https://louis-brunet.github.io/TwinstickShooter",
//             imgs: ["twinstick-menu.png", "twinstick-playing.png", "twinstick-gameover.png"],
//         },
//     ],
// });

export default {
    name: "PageProjects",

    components: { ProjectList },

    computed: {
        projectGroups() {
            const groups = [];

            for (const [groupId, projectInfoArr] of Object.entries(projectGroups)) {
                const group = {
                    id: groupId,
                    title: this.$t(`projects.groups.${groupId}`),
                    projects: [],
                };

                for (const {
                    id: projectId,
                    featureIds,
                    techIds,
                    src: srcLink,
                    view: viewLink,
                    imgs,
                } of projectInfoArr) {
                    const i18nKey = `projects.projectInfo.${projectId}`;

                    group.projects.push({
                        title: this.$t(`${i18nKey}.title`),
                        features: featureIds.map((featureId) =>
                            this.$t(`${i18nKey}.features.${featureId}`)
                        ),
                        tech: techIds.map((techId) =>
                            this.$t(`projects.tech.${techId}`)
                        ),
                        srcLink,
                        viewLink,
                        imgs:
                            imgs?.map((name) => `img/project_imgs/${name}`) ||
                            [],
                    });
                }

                groups.push(group);
            }
            return groups;
            //  préciser projets scolaires ou persos, pas professionnels (??)
        },
    },

    methods: {
        scrollToElement(id) {
            document.getElementById(id).scrollIntoView({ behavior: "smooth" })
        }
    }
};
</script>
