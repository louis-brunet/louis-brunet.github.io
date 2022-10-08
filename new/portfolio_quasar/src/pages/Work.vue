<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("work.title") }}</h3>

            <DatedEventList :events="educationEvents" />
        </div>
    </q-page>
</template>

<script>
import DatedEventList from "components/DatedEventList.vue";

const EVENT_KEYS = [
    "biosystemes_cdd",
    "biosystemes_stage",
    "insead",
    "bakery",
    "lessons",
];

export default {
    name: "Work",

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
                    date: this.$t(`work.${key}.date`),
                    title: this.$t(`work.${key}.title`),
                    desc: this.$t(`work.${key}.desc`),
                    location: this.$t(`work.${key}.location`),
                })
            );

            return events;
        },
    },
};
</script>
