/** SIMPLE PAGE -- no layout or logic, only different question types */
export default {
    pages: [
        {
            elements: [
                {
                    name: 'howAreYou',
                    type: 'text',
                    title: 'How are you ?',
                    placeholder: 'Enter some text here',
                    required: 'true'
                },
                {
                    name: 'shape',
                    type: 'dropdown',
                    title: 'Choose a shape.',
                    options: ['Square', 'Rectangle']
                },
                {
                    name: 'modesOfTransport',
                    type: 'dropdown',
                    title: 'Choose two or more modes of transportation.',
                    count: { min: 2, max: 4 },
                    options: ['Bus', 'Train', 'Car', 'Bicycle'] // array of objects to separate text from value
                },
                {
                    name: 'radio1',
                    type: 'radio',
                    title: 'Make a choice',
                    default: 'Choice A',
                    options: ['Choice A', 'Choice B', 'Choice C'] // array of objects to separate text from value
                },
                {
                    name: 'checkbox1',
                    type: 'check',
                    title: 'Some title',
                    required: true,
                    options: [1, 2, 3, 4] // array of objects to separate text from value
                },
                {
                    name: 'toggle1',
                    type: 'toggle',
                    title: 'Boolean option with string values',
                    options: ['No thanks', 'Yes please'], // array of objects to separate text from value
                    indeterminate: true
                },
                {
                    name: 'slider1',
                    type: 'slider',
                    title: 'Nice slider',
                    slider: { min: 0, max: 100, step: 5 }
                },
                {
                    name: 'date1',
                    type: 'date',
                    title: 'Schedule a meeting'
                },
                {
                    name: 'time1',
                    type: 'time',
                    title: 'Meeting time'
                },
                {
                    name: 'rate1',
                    type: 'rate',
                    title: 'Rate your experience.'
                },
                {
                    name: 'rank1',
                    type: 'rank',
                    title: 'Rank the following features by order of importance:',
                    options: [
                        {
                            value: 'battery',
                            text: 'Battery Life'
                        },
                        {
                            value: 'screen',
                            text: 'Screen size'
                        },
                        {
                            value: 'storage',
                            text: 'Storage space'
                        },
                        {
                            value: 'price',
                            text: 'Price'
                        }
                    ]
                },
                // 2 questions in one line
                {
                    type: 'text',
                    name: 'name',
                    title: 'Name:',
                    required: true
                },
                {
                    type: 'number',
                    name: 'cost',
                    title: 'Item Cost:',
                    required: true,
                    newLine: false
                }
            ]
        }
    ]
}
