<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("education.title") }}</h3>

            <DatedEventList :events="educationEvents" />
        </div>
    </q-page>
</template>

<script>
import DatedEventList from "components/DatedEventList.vue";

const EVENT_KEYS = ["ensimag", "dut", "insa", "mcgill", "bac"];

export default {
    name: "Education",

    components: { DatedEventList },

    //data() {
    //    return {
    //        educationEvents
    //    }
    //}

    computed: {
        educationEvents() {
            let events = [];

            EVENT_KEYS.forEach((key) =>
                events.push({
                    date: this.$t(`education.${key}.date`),
                    title: this.$t(`education.${key}.title`),
                    desc: this.$t(`education.${key}.desc`),
                    location: this.$t(`education.${key}.location`),
                })
            );

            return events;
        },
    },
};
</script>
