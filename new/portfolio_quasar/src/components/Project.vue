<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h5 text-center">{{ title }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="tech?.length > 0">
            <div class="category-title">{{ $t("projects.techUsed") }} :</div>
            <div class="row justify-around">
                <q-chip
                    v-for="(techItem, index) in tech"
                    :key="index"
                    class="tech-used-item"
                    outline
                    square
                >
                    {{ techItem }}
                    <!--<template v-if="index < tech.length - 1">, </template>-->
                </q-chip>
            </div>
        </q-card-section>

        <q-card-section v-if="showImgCarousel">
            <project-carousel :imgs="imgs" />
        </q-card-section>

        <q-card-section v-if="features?.length > 0">
            <div class="category-title">{{ $t("projects.features") }} :</div>
            <div v-for="(feature, index) in features" :key="index">
                {{ feature }}
            </div>
        </q-card-section>

        <q-separator v-if="showBtnSection" />

        <q-card-actions v-if="showBtnSection" class="justify-around">
            <q-btn
                v-if="srcLink"
                flat
                class="src-btn"
                label=""
                icon="source"
                type="a"
                :href="srcLink"
                target="_blank"
            >
                <q-tooltip class="bg-accent">
                    {{ $t("projects.srcLinkTitle") }}
                </q-tooltip>
            </q-btn>

            <q-btn
                v-if="viewLink"
                flat
                class="view-btn"
                label=""
                icon="visibility"
                type="a"
                :href="viewLink"
                target="_blank"
            >
                <q-tooltip class="bg-accent">
                    {{ $t("projects.viewLinkTitle") }}
                </q-tooltip>
            </q-btn>
        </q-card-actions>
    </q-card>
</template>

<script>
import ProjectCarousel from "./ProjectCarousel.vue";
export default {
    name: "Project",
    components: { ProjectCarousel },

    props: {
        title: {
            type: String,
            required: true,
        },
        srcLink: {
            type: String,
            default: "",
        },
        viewLink: {
            type: String,
            default: "",
        },
        imgs: {
            type: Array,
            default: () => [],
        },
        features: {
            type: Array,
            default: () => [],
        },
        tech: {
            type: Array,
            default: () => [],
        },
    },

    computed: {
        showImgCarousel() {
            return this.imgs.length > 0;
        },

        showBtnSection() {
            return this.srcLink || this.viewLink;
        },
    },
    //setup() {
    //    return {};
    //},
};
</script>

<style lang="sass">
//body.body--dark
//    --tech-bg-clr: #{$grey-9}
//body.body--light
//    --tech-bg-clr: #{$grey-1}
//
</style>

<style lang="sass" scoped>
//.tech-used-item
    //font-weight: bold
    //background-color: var(--tech-bg-clr)

.src-btn,
.view-btn
    color: $accent

.category-title
    font-size: map-get($h6, 'size')
    font-weight: map-get($h6, 'weight')
</style>
