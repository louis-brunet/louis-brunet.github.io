/** Panels, enabledIf */

export default {
    pages: [
        {
            elements: [
                {
                    name: 'q1',
                    type: 'text',
                    title: 'Show panel ? type yes'
                },
                {
                    name: 'q2',
                    type: 'toggle',
                    title: 'Enable panel ?',
                    visibleIf: {
                        cond: '=',
                        args: [{ ref: 'q1' }, 'yes']
                    }
                },
                {
                    type: 'panel',
                    title: 'This is a panel',
                    indent: 1,
                    visibleIf: {
                        cond: '=',
                        args: [{ ref: 'q1' }, 'yes']
                    },
                    enabledIf: {
                        cond: '=',
                        args: [{ ref: 'q2' }, true]
                    },
                    elements: [
                        {
                            name: 'q3',
                            type: 'check',
                            title: 'Choose something',
                            choices: [
                                {
                                    value: 'val1',
                                    text: 'Value 1'
                                },
                                {
                                    value: 'val2',
                                    text: 'Value 2'
                                },
                                {
                                    value: 'val3',
                                    text: 'Value 3'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
