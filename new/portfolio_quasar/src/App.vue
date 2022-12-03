<template>
    <router-view />
</template>

<script setup>
import { useQuasar } from "quasar";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import lsKeys from "./localStorageKeys";

const $q = useQuasar();

onMounted(() => {
    // Retrieve dark mode setting
    const darkMode = $q.localStorage.getItem(lsKeys.darkMode);
    if (typeof darkMode === "boolean" || darkMode === "auto") {
        $q.dark.set(darkMode);
        console.log("set dark mode to : ", darkMode);
    }

    // Retrieve locale setting
    const $i18n = useI18n();
    const savedLang = $q.localStorage.getItem(lsKeys.locale);
    if (savedLang) $i18n.locale = savedLang;
});

// export default defineComponent({
//     name: "App",

//     mixins: [createMetaMixin(metaData)],

//     mounted() {
//         // console.log("$q.localStorage: ", this.$q.localStorage);
//         // Retrieve dark mode setting
//         const darkMode = this.$q.localStorage.getItem(lsKeys.darkMode);
//         if (typeof darkMode === "boolean" || darkMode === "auto") {
//             this.$q.dark.set(darkMode);
//             console.log("set dark mode to : ", darkMode);
//         }

//         // Retrieve locale setting
//         const savedLang = this.$q.localStorage.getItem(lsKeys.locale);
//         if (savedLang) this.$i18n.locale = savedLang;
//     },
// });
</script>
