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

<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "PageContact",

    data() {
        return {
            email: "123louisb@gmail.com",
            phone: "06 17 03 67 10",
        };
    },

    computed: {
        hrefEmail() {
            return `mailto:${this.email}`;
        },
    },
});
</script>
