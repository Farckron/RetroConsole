module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'airbnb-base'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script'
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        'arrow-spacing': 'error',
        'comma-dangle': ['error', 'never'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'indent': ['error', 4],
        'max-len': ['error', { code: 120 }],
        'no-trailing-spaces': 'error',
        'eol-last': 'error',
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
        'space-before-function-paren': ['error', 'never'],
        'keyword-spacing': 'error',
        'space-infix-ops': 'error',
        'comma-spacing': 'error',
        'brace-style': 'error',
        'curly': 'error',
        'no-else-return': 'error',
        'no-lonely-if': 'error',
        'no-unneeded-ternary': 'error',
        'one-var': ['error', 'never'],
        'vars-on-top': 'error',
        'wrap-iife': 'error',
        'yoda': 'error',
        'strict': ['error', 'global']
    },
    globals: {
        Task: 'readonly',
        TaskStorage: 'readonly',
        TaskManager: 'readonly',
        TerminalUI: 'readonly',
        TerminalApp: 'readonly'
    }
};