<template>
    <q-page padding>
        <div class="page-content">
            <h3 class="text-center">{{ $t("contact.title") }}</h3>

            <div class="flex column flex-center contact-info">
                <a :href="hrefEmail">
                    <!-- TODO icon -->
                    {{ email }}
                </a>
                <div>
                    <!-- TODO icon -->
                    {{ phone }}
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { computed } from "@vue/reactivity";
import { useMeta } from "quasar";
import { useI18n } from "vue-i18n";

const title = computed(() => {
    const { t } = useI18n();
    return t("contact.title");
});

useMeta(() => {
    return {
        title: `${title.value} | Louis Brunet`,
    };
});

const [email, phone] = ["123louisb@gmail.com", "06 17 03 67 10"];
const hrefEmail = `mailto:${email}`;
</script>
