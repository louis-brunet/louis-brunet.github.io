<template>
    <q-item clickable :to="link" :title="title" exact>
        <q-item-section v-if="icon" avatar>
            <q-icon :name="icon" />
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ title }}</q-item-label>
            <q-item-label caption>
                {{ caption }}
            </q-item-label>
        </q-item-section>
    </q-item>

    <!-- <q-expansion-item clickable :to="link" exact :icon="icon" :label>
        <template #header>

        <q-item-section v-if="icon" avatar>
            <q-icon :name="icon" />
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ title }}</q-item-label>
            <q-item-label caption>
                {{ caption }}
            </q-item-label>
        </q-item-section>
    </q-expansion-item> -->
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "EssentialLink",
    props: {
        title: {
            type: String,
            required: true,
        },

        caption: {
            type: String,
            default: "",
        },

        link: {
            type: String,
            default: "#",
        },

        icon: {
            type: String,
            default: "",
        },

        iconColor: {
            type: String,
            default: undefined,
        },

        active: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
