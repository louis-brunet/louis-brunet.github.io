/** Visibility & dynamic matrix logic */

export default {
    pages: [
        {
            elements: [
                {
                    name: 'q1',
                    type: 'text',
                    title: 'Show q2 ? (type "y")'
                },
                {
                    name: 'q2',
                    type: 'number',
                    title: 'How many siblings do you have ?',
                    visibleIf: {
                        func: '=',
                        args: [{ ref: 'q1' }, 'yes']
                    }
                },
                {
                    name: 'q3',
                    type: 'matrix',
                    visibleIf: {
                        func: '>',
                        args: [{ ref: 'q2' }, 0]
                    },
                    rowCount: { ref: 'q2' },
                    columns: [
                        {
                            //title: '',
                            cellType: 'label',
                            label: [
                                'Sibling ',
                                {
                                    func: 'sum',
                                    args: [{ func: 'rowIndex' }, 1]
                                }
                            ]
                        },
                        {
                            title: 'Name',
                            name: 'sibling-name',
                            cellType: 'text',
                            required: true
                        },
                        {
                            title: 'Gender',
                            name: 'sibling-gender',
                            cellType: 'dropdown',
                            choices: [
                                {
                                    value: 'm',
                                    text: 'Male'
                                },
                                {
                                    value: 'f',
                                    text: 'Female'
                                },
                                {
                                    value: 'o',
                                    text: 'Other'
                                }
                            ]
                        },
                        {
                            title: 'Additional information',
                            name: 'sibling-info',
                            cellType: 'textarea'
                        }
                    ]
                },
                {
                    type: 'matrix',
                    name: 'q4',
                    title: 'Please indicate if you agree or disagree with the following statements',
                    columns: [
                        {
                            name: 'agreement',
                            cellType: 'radio',
                            multipleColumns: true,
                            choices: [
                                {
                                    value: 1,
                                    text: 'Strongly Disagree'
                                },
                                {
                                    value: 2,
                                    text: 'Disagree'
                                },
                                {
                                    value: 3,
                                    text: 'Neutral'
                                },
                                {
                                    value: 4,
                                    text: 'Agree'
                                },
                                {
                                    value: 5,
                                    text: 'Strongly Agree'
                                }
                            ]
                        }
                    ],
                    rows: [
                        {
                            name: 'row1',
                            text: 'Product is affordable'
                        },
                        {
                            name: 'row2',
                            text: 'Product does what it claims'
                        },
                        {
                            name: 'row3',
                            text: 'Product is better than other products on the market'
                        },
                        {
                            name: 'row4',
                            text: 'Product is easy to use'
                        }
                    ]
                }
            ]
        }
    ]
}
