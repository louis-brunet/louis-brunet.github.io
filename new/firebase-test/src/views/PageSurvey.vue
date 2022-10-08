<template>
    <div>
        <!-- If you want to hide survey, comment the lines below -->
        <h2>SurveyJS Library - a sample survey below</h2>
        <survey :survey="survey"></survey>
    </div>
</template>

<script>
import * as SurveyVue from 'survey-vue'
//import 'bootstrap/dist/css/bootstrap.css'
var Survey = SurveyVue.Survey
export default {
    components: {
        Survey
    },
    data() {
        var json = {
            pages: [
                {
                    name: 'customerContact',
                    elements: [
                        {
                            type: 'text',
                            name: 'name',
                            title: 'Please enter your name:'
                        },
                        {
                            type: 'text',
                            name: 'email',
                            title: 'Please enter your e-mail:'
                        }
                    ]
                }
            ]
        }
        var model = new SurveyVue.Model(json)
        return {
            survey: model
        }
    }
}
</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}
</style>
