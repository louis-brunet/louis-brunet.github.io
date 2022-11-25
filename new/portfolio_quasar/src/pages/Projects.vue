<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("projects.title") }}</h3>

            <template
                v-for="(projectGroup, index) in projectGroups"
                :key="index"
            >
                <button @click="scrollToElement(projectGroup.id)">
                    {{ projectGroup.title }}
                </button>
            </template>

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
import projectGroups from "src/data/projects.js";

export default {
    name: "PageProjects",

    components: { ProjectList },

    computed: {
        projectGroups() {
            const groups = [];

            for (const [groupId, projectInfoArr] of Object.entries(
                projectGroups
            )) {
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
            // TODO préciser projets scolaires ou persos, pas professionnels (??)
        },
    },

    methods: {
        scrollToElement(id) {
            document.getElementById(id).scrollIntoView({ behavior: "smooth" });
        },
    },
};
</script>
