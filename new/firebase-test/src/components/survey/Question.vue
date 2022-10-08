<template>
    <component :is="componentName" v-bind="attrs" />
</template>

<script>
// TODO: create quasar+firebase project

const types = {
    panel: 'Panel',
    text: 'QuestText',
    number: 'QuestNumber',
    dropdown: 'QuestDropdown',
    radio: 'QuestRadioGroup',
    check: 'QuestCheckGroup',
    toggle: 'QuestToggle',
    slider: 'QuestSlider',
    date: 'QuestDate',
    time: 'QuestTime',
    rate: 'QuestRate',
    matrix: 'QuestMatrix',
    rank: 'QuestRank'
}

export default {
    name: 'Question',

    props: {
        type: {
            type: String,
            default: 'text',
            validator: (prop) => Object.keys(types).includes(prop)
        }
    },

    setup(props, ctx) {
        const componentName = import(
            `components/survey/${types[props.type] || 'QuestNotFound'}.vue`
        )

        return { componentName, attrs: ctx.attrs }
    }
}
</script>
