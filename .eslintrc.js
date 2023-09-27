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
}