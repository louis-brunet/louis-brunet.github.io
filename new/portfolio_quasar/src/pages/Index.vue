<template>
    <q-page padding>
        <div class="page-content">
            <q-skeleton type="rect" size="20rem" class="q-ml-auto q-mr-auto" />

            <TypewriterText
                tag="h2"
                text="Louis Brunet"
                class="flex flex-center"
            />

            <div class="row home-text q-mr-auto q-ml-auto">
                <p class="col-12 col-md-6 text-justify q-px-md">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Nisi consequuntur minima enim nostrum quia eum? Repellendus
                    earum hic, distinctio, omnis veritatis voluptatibus,
                    inventore esse voluptas ducimus voluptatum deserunt! Ipsam
                    qui dolor beatae nesciunt debitis! Est vel laborum assumenda
                    rerum magni.
                </p>
                <p class="col-12 col-md-6 text-justify q-px-md">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Quaerat eius magnam a itaque distinctio voluptatibus
                    adipisci, unde tempora quasi ipsa aperiam nobis at ad
                    accusantium soluta consectetur, repudiandae atque
                    consequuntur.
                </p>
            </div>
        </div>
    </q-page>
</template>

<script>
import { defineComponent } from "vue";
import TypewriterText from "components/TypewriterText.vue";

export default defineComponent({
    name: "PageIndex",

    components: {
        TypewriterText,
    },
});
</script>

<style lang="sass" scoped>
.home-text
    max-width: $breakpoint-xs
</style>
