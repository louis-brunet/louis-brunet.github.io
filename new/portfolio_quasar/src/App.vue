<template>
    <router-view />
</template>
<script>
import { defineComponent } from "vue";
import lsKeys from "./localStorageKeys";

export default defineComponent({
    name: "App",
    mounted() {
        console.log("$q.localStorage: ", this.$q.localStorage);
        // Retrieve dark mode setting
        const darkMode = this.$q.localStorage.getItem(lsKeys.darkMode);
        if (typeof darkMode === "boolean" || darkMode === "auto") {
            this.$q.dark.set(darkMode);
            console.log("set dark mode to : ", darkMode);
        }

        // Retrieve locale setting
        const savedLang = this.$q.localStorage.getItem(lsKeys.locale);
        if (savedLang) this.$i18n.locale = savedLang;
    },
});
</script>
