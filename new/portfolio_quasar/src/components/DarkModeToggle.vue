<template>
    <q-toggle
        v-model="isDark"
        checked-icon="dark_mode"
        color="grey-8"
        unchecked-icon="light_mode"
        size="lg"
        dense
        class="q-mx-md"
    />
</template>

<script>
import lsKeys from "src/localStorageKeys";
export default {
    name: "DarkModeToggle",

    props: {
        persist: {
            type: Boolean,
            default: false,
        },
    },

    //data() {
    //    return {
    //        isDark: this.$q.dark.isActive,
    //    };
    //},
    computed: {
        isDark: {
            get() {
                return this.$q.dark.isActive;
            },
            set(v) {
                this.$q.dark.set(v);
                if (this.persist) this.$q.localStorage.set(lsKeys.darkMode, v);
            },
        },
    },
};
</script>
