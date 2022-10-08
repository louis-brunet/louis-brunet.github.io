<template>
    <!--<div class="row q-gutter-md">-->
    <div class="dates_event_list">
        <DatedEvent
            v-for="(event, index) in events"
            :key="index"
            class="q-mb-md"
            v-bind="event"
        />
        <!--class="col-12 col-md-5 col-lg-3"-->
    </div>
</template>

<script>
import DatedEvent from "components/DatedEvent.vue";

export default {
    name: "DatedEventList",

    components: { DatedEvent },

    props: {
        events: {
            type: Array,
            default: () => [],
        },
    },
    //  setup ()
    //    DatedEvent{
    //    return {}
    //  }
};
</script>

<style lang="sass" scoped>
.dates_event_list
    max-width: $breakpoint-sm
    margin: auto
</style>
