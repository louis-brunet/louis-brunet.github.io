module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-strongly-recommended',
        'eslint:recommended',
        '@vue/prettier'
        //'plugin:prettier/recommended',
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'prettier/prettier': [
            'warn',
            {
                trailingComma: 'none',
                tabWidth: 4,
                singleQuote: true,
                semi: false,
                endOfLine: 'auto'
            }
        ],
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
}
