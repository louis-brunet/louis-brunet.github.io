<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("work.title") }}</h3>

            <DatedEventList :events="workEvents" />
        </div>
    </q-page>
</template>

<script setup>
import DatedEventList from "components/DatedEventList.vue";
import { computed } from "@vue/reactivity";
import { useMeta } from "quasar";
import { useI18n } from "vue-i18n";

const title = computed(() => {
    const { t } = useI18n();
    return t("work.title");
});

useMeta(() => {
    return {
        title: `${title.value} | Louis Brunet`,
    };
});

const EVENT_KEYS = [
    "biosystemes_cdd",
    "biosystemes_stage",
    "insead",
    "bakery",
    "lessons",
];

const workEvents = computed(() => {
    const { t } = useI18n();
    let events = [];

    EVENT_KEYS.forEach((key) =>
        events.push({
            date: t(`work.${key}.date`),
            title: t(`work.${key}.title`),
            desc: t(`work.${key}.desc`),
            location: t(`work.${key}.location`),
        })
    );

    return events;
});
</script>
