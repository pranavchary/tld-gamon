module.exports = {
	env: {
		node: true,
		es2023: true,
	},
	extends: ["airbnb-base"],
	parser: "@babel/eslint-parser",
	parserOptions: {
		requireConfigFile: false,
		ecmaVersion: 2023,
	},
	rules: {
		quotes: ["error", "double", { avoidEscape: true }],
		"comma-dangle": ["error", "always-multiline"],
		// Objects/arrays with 4+ properties/elements must be multiline;
		"object-curly-newline": [
			"error",
			{
				ObjectExpression: { multiline: true, minProperties: 4 },
				ObjectPattern: { multiline: true, minProperties: 4 },
				ImportDeclaration: { multiline: true, minProperties: 4 },
				ExportDeclaration: { multiline: true, minProperties: 4 },
			},
		],
		"array-bracket-newline": ["error", { multiline: true, minItems: 4 }],
		"array-element-newline": ["error", { multiline: true, minItems: 4 }],
		indent: ["error", "tab"],
		"no-tabs": "off",
		"max-len": ["warn", { code: 140 }],
		semi: ["error", "always"],
		"semi-style": ["error", "last"],
		"eol-last": ["error", "always"],
		"global-require": ["off"],
		"no-plusplus": ["off"],
	},
};
