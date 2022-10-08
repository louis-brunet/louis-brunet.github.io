<template>
    <q-card class="dated_event_card" flat bordered>
        <q-card-section horizontal class="row">
            <q-item class="col-3 text-right">
                <q-item-section>
                    <q-item-label header class="event_date">{{
                        date
                    }}</q-item-label>
                </q-item-section>
            </q-item>

            <q-separator vertical />

            <q-card-section class="col">
                <q-item>
                    <q-item-section>
                        <!--<q-item-label header>{{ title }}</q-item-label>-->
                        <q-item-label class="event_title q-mb-sm">
                            {{ title }}
                        </q-item-label>

                        <q-item-label v-if="desc" class="event_desc q-mb-sm">
                            {{ desc }}
                        </q-item-label>

                        <q-item-label caption>{{ location }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-card-section>
        </q-card-section>
    </q-card>
</template>

<script>
export default {
    name: "DatedEvent",

    props: {
        date: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            default: "",
        },
        desc: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            default: "",
        },
    },

    //data() {
    //    return {
    //    }
    //},

    //setup() {
    //    return {};
    //},
};
</script>

<style lang="sass" scoped>
//.dated_event_card
//    border-color: $primary
//hr.q-separator
//    background-color: $primary
.event_title
    font-weight: bold
//    color: $primary
</style>
