<template>
    <div>
        <div class="text-h3 q-mb-lg">
            {{ title }}
        </div>
        <div class="row q-gutter-md justify-around">
            <template v-for="(project, index) in projects" :key="index">
                <Project v-bind="project" class="q-mb-md col-12 col-md-5" />
            </template>
        </div>
    </div>
</template>

<script>
import Project from "components/Project.vue";
export default {
    name: "ProjectList",

    components: { Project },

    props: {
        title: {
            type: String,
            default: "",
        },
        projects: {
            type: Array,
            default: () => [],
        },
    },
    //setup() {
    //    return {};
    //},
};
</script>
