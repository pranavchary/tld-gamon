module.exports = {
    env: {
        node: true,
        es2023: true,
    },
    extends: ['eslint:recommended'],
    parser: '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2023
    },
    rules: {
        semi: ['error', 'always'],
        'semi-style': ['error', 'last'],
        'eol-last': ['error', 'always']
    }
};
