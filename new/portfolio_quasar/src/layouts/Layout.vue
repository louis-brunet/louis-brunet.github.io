<template>
    <q-layout view="hHh Lpr lFf">
        <q-header bordered>
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    :icon="leftDrawerOpen ? 'clear' : 'menu'"
                    class="menu_expand"
                    aria-label="Menu"
                    @click="toggleLeftDrawer"
                />
                <q-toolbar-title>
                    Curriculum Vitae | Louis Brunet
                </q-toolbar-title>

                <!--<div>Quasar v{{ $q.version }}</div>-->
                <q-separator vertical />

                <DarkModeToggle persist />

                <q-separator vertical class="q-mr-md" />

                <LocaleSelect />

                <!--<div>
                    Icons made by
                    <a href="https://www.freepik.com" title="Freepik"
                        >Freepik</a
                    >
                    from
                    <a href="https://www.flaticon.com/" title="Flaticon"
                        >www.flaticon.com</a
                    >
                </div>-->
            </q-toolbar>
        </q-header>

        <q-drawer
            :model-value="true"
            behavior="desktop"
            bordered
            :mini-to-overlay="$q.screen.lt.sm"
            :mini="!leftDrawerOpen"
        >
            <q-list separator>
                <EssentialLink
                    v-for="link in navLinks"
                    :key="link.title"
                    class="nav-link"
                    v-bind="link"
                />
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";
import DarkModeToggle from "components/DarkModeToggle.vue";
import LocaleSelect from "components/LocaleSelect.vue";
//import { useI18n } from "vue-i18n";

import { defineComponent, ref } from "vue";
//import { useQuasar } from "quasar";
//import localStorageKeys from "src/localStorageKeys";

// import projects from "src/data/projects.js";
// const projectGroups = Object.freeze(Object.keys(projects));

export default defineComponent({
    name: "Layout",

    components: {
        EssentialLink,
        DarkModeToggle,
        LocaleSelect,
    },

    data() {
        const leftDrawerOpen = ref(true);

        //const $q = useQuasar();
        //const { locale } = useI18n({ useScope: "global" });
        //console.log("MainLayout.data : locale = ", locale);
        //console.log("MainLayout.data : $i18n.locale = ", this.$i18n.locale);
        //this.$i18n.locale = "fr";
        //console.log("MainLayout.data : $i18n.locale = ", this.$i18n.locale);
        //locale = ref(navigator.language);
        //console.log(
        //    "MainLayout.data after navigator.language : locale = ",
        //    locale
        //);
        //$q.dark.set(true);
        return {
            leftDrawerOpen,
            toggleLeftDrawer() {
                leftDrawerOpen.value = !leftDrawerOpen.value;
            },
            //$q,
            //locale,
            //localeOptions: [
            //    {
            //        value: "fr",
            //        label: "Français",
            //        img: "~assets/flags/france.svg",
            //    },
            //    {
            //        value: "en-US",
            //        label: "English",
            //        img: "~assets/flags/united-states.svg",
            //    },
            //],
        };
    },

    computed: {
        navLinks() {
            return [
                {
                    title: this.$t("home.title"),
                    // caption: "Contact me!",
                    icon: "home",
                    link: "/",
                },
                {
                    title: this.$t("education.title"),
                    icon: "school",
                    link: "/education",
                },
                {
                    title: this.$t("work.title"),
                    icon: "work",
                    link: "/work",
                },
                // {
                //     title: this.$t("tools.title"),
                //     caption: "",
                //     icon: "code",
                //     link: "/tools",
                // },
                {
                    title: this.$t("projects.title"),
                    caption: "",
                    icon: "folder",
                    link: "/projects",
                },
                {
                    title: this.$t("contact.title"),
                    caption: "",
                    icon: "email",
                    link: "/contact",
                },
            ];
        },
        //locale: {
        //    get() {
        //        return this.$i18n.locale;
        //    },
        //    set(l) {
        //        this.$q.localStorage.set(localStorageKeys.locale, l);
        //        this.$i18n.locale = l;
        //    },
        //},
    },

    //mounted() {
    //    const savedLang = this.$q.localStorage.getItem(localStorageKeys.locale);
    //    if (savedLang) this.locale = savedLang;
    //    //console.log("this.$route : ", this.$route);
    //    //console.log("this.$router : ", this.$router);
    //},
});
</script>

<style lang="sass">
body.body--dark
    --toolbar-title-clr: white
    --btn-menu-clr: white
    --toolbar-bg: #{$grey-10}
    --nav-icon-clr: #{$grey-2}

body.body--light
    --toolbar-title-clr: #{$grey-8}
    --btn-menu-clr: #{$grey-8}
    --toolbar-bg: #{$grey-1}
    --nav-icon-clr: #{$grey-6}

.q-toolbar
    background-color: var(--toolbar-bg)

.q-toolbar__title
    color: var(--toolbar-title-clr)

.menu_expand
    color: var(--btn-menu-clr)

.nav-link
    .q-icon
        fill: var(--nav-icon-clr)
    &.q-router-link--active .q-icon
        fill: $primary
</style>
