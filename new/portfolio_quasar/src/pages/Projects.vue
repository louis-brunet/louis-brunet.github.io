<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("projects.title") }}</h3>

            <div class="project-group-btns">
                <q-btn
                    v-for="(projectGroup, index) in projectGroups"
                    :key="index"
                    :label="projectGroup.title"
                    outline
                    rounded
                    class="q-mr-md q-mb-md"
                    @click="scrollToElement(projectGroup.id)"
                />
            </div>
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

            <q-page-scroller>
                <q-btn fab icon="keyboard_arrow_up" color="accent" />
            </q-page-scroller>
        </div>
    </q-page>
</template>

<script setup>
import { computed } from "@vue/reactivity";
import ProjectList from "components/ProjectList.vue";
import dataProjectGroups from "src/data/projects.js";
import { useMeta } from "quasar";
import { useI18n } from "vue-i18n";

const title = computed(() => {
    const { t } = useI18n();
    return t("projects.title");
});

useMeta(() => {
    return {
        title: `${title.value} | Louis Brunet`,
    };
});

function scrollToElement(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

const projectGroups = computed(() => {
    const groups = [];
    const { t } = useI18n();

    for (const [groupId, projectInfoArr] of Object.entries(dataProjectGroups)) {
        const group = {
            id: groupId,
            title: t(`projects.groups.${groupId}`),
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
                title: t(`${i18nKey}.title`),
                features: featureIds.map((featureId) =>
                    t(`${i18nKey}.features.${featureId}`)
                ),
                tech: techIds.map((techId) => t(`projects.tech.${techId}`)),
                srcLink,
                viewLink,
                imgs: imgs?.map((name) => `img/project_imgs/${name}`) || [],
            });
        }

        groups.push(group);
    }
    return groups;
});
</script>

<style scoped lang="sass">
.project-group-btns
    display: flex
    flex-wrap: wrap
    justify-content: flex-start
</style>
