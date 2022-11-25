<template>
    <component :is="tag" class="typewriter-text">{{ displayText }}</component>
</template>

<script>
export default {
    name: "TypewriterText",

    props: {
        text: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            default: "div",
        },
        compClass: {
            type: String,
            default: "",
        },
        delayMs: {
            type: Number,
            default: 100,
        },
    },

    data() {
        return {
            displayText: "",
            currentIndex: 0,
        };
    },

    mounted() {
        this.typeWriter();
    },

    methods: {
        typeWriter() {
            if (this.currentIndex < this.text.length) {
                this.displayText += this.text.charAt(this.currentIndex);
                this.currentIndex++;
                setTimeout(this.typeWriter, this.delayMs);
            }
        },
    },
};
</script>

<style lang="sass" scoped>

.typewriter-text
    white-space: nowrap

.typewriter-text::after
  content: ''
  width: 0.05em
  height: 1em
  background: currentColor
  opacity: 0
  margin-left: 0.1em
  display: inline-block
  animation: blink 0.5s linear infinite alternate


@keyframes blink
  50%
    opacity: 0

  100%
    opacity: 1
</style>
