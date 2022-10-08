<template>
    <div>
        <q-carousel
            v-model="slide"
            animated
            :navigation="isMultipleImages"
            infinite
            :autoplay="autoplay"
            :arrows="isMultipleImages"
            control-color="accent"
            transition-prev="slide-right"
            transition-next="slide-left"
            @mouseenter="autoplay = false"
            @mouseleave="autoplay = true"
        >
            <q-carousel-slide
                v-for="(imgSrc, index) in imgs"
                :key="index"
                :name="index"
                class="row justify-center"
            >
                <!--:img-src="imgSrc"-->
                <img :src="imgSrc" class="carousel-img" />
            </q-carousel-slide>
        </q-carousel>
    </div>
</template>

<script>
export default {
    name: "ProjectCarousel",
    props: {
        imgs: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            slide: 0,
            autoplay: this.isMultipleImages,
        };
    },
    computed: {
        isMultipleImages() {
            return this.imgs.length > 1;
        },
    },
    //setup() {
    //    return {};
    //},
};
</script>

<style lang="sass" scoped>
.carousel-img
    max-width: 100%
    max-height: 100%
    margin: auto
</style>
