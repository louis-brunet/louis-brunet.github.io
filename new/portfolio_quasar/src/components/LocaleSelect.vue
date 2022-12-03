<template>
    <q-select
        v-model="locale"
        :options="localeOptions"
        dense
        borderless
        emit-value
        map-options
        options-dense
        style="min-width: 10rem"
    >
        <template #option="scope">
            <q-item v-bind="scope.itemProps">
                <q-item-section avatar class="col-4">
                    <q-img
                        :src="optionImg(scope.opt.img)"
                        width="1.4rem"
                        height="1.4rem"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script setup>
import { computed } from "@vue/reactivity";
import { useQuasar } from "quasar";
import localStorageKeys from "src/localStorageKeys";
import { useI18n } from "vue-i18n";

const localeOptions = [
    {
        value: "fr",
        label: "Français",
        img: "france.svg",
    },
    {
        value: "en-US",
        label: "English",
        img: "united-states.svg",
    },
];

function optionImg(img) {
    return "img/flags/" + img;
}

const { localStorage } = useQuasar();
const locale = computed({
    get() {
        const $i18n = useI18n();
        return $i18n.locale;
    },
    set(l) {
        localStorage.set(localStorageKeys.locale, l);
        $i18n.locale = l;
    },
});

// import localStorageKeys from "src/localStorageKeys";

// export default {
//     name: "LocaleSelect",

//     data() {
//         return {
// localeOptions: [
//     {
//         value: "fr",
//         label: "Français",
//         img: "france.svg",
//     },
//     {
//         value: "en-US",
//         label: "English",
//         img: "united-states.svg",
//     },
// ],
//             optionImg(img) {
//                 return "img/flags/" + img;
//             },
//         };
//     },

//     computed: {
//         locale: {
//             get() {
//                 return this.$i18n.locale;
//             },
//             set(l) {
//                 this.$q.localStorage.set(localStorageKeys.locale, l);
//                 this.$i18n.locale = l;
//             },
//         },
//     },
// };
</script>
