<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ title }}</h3>

            <DatedEventList :events="educationEvents" />
        </div>
    </q-page>
</template>

<script setup>
import { computed } from "@vue/reactivity";
import DatedEventList from "components/DatedEventList.vue";
import { useMeta } from "quasar";
import { useI18n } from "vue-i18n";

const EVENT_KEYS = ["ensimag", "dut", "insa", "mcgill", "bac"];
const educationEvents = computed(() => {
    const events = [];
    const { t } = useI18n();

    EVENT_KEYS.forEach((key) =>
        events.push({
            date: t(`education.${key}.date`),
            title: t(`education.${key}.title`),
            desc: t(`education.${key}.desc`),
            location: t(`education.${key}.location`),
        })
    );

    return events;
});

const title = computed(() => {
    const { t } = useI18n();
    return t("education.title");
});

useMeta(() => {
    return {
        title: `${title.value} | Louis Brunet`,
    };
});
</script>
