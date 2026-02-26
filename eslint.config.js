import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJest from "eslint-plugin-jest";
import jsdoc from "eslint-plugin-jsdoc";

export default [
    pluginJs.configs.recommended,
    eslintConfigPrettier, // ✅ Keep Prettier integration
    {
        languageOptions: {
            parser: require.resolve("@typescript-eslint/parser"),
            parserOptions: {
                projet: "./jsconfig.json",
            },
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                $: "readonly",
                ActiveEffect: "readonly",
                ActiveEffects: "readonly",
                ActiveEffectConfig: "readonly",
                Actor: "readonly",
                Actors: "readonly",
                ActorSheet: "readonly",
                AudioHelper: "readonly",
                BaseItem: "readonly",
                ChatMessage: "readonly",
                Collection: "readonly",
                Combatant: "readonly",
                ContextMenu: "readonly",
                Dialog: "readonly",
                DocumentSheet: "readonly",
                DocumentSheetConfig: "readonly",
                Folder: "readonly",
                FormDataExtended: "readonly",
                Handlebars: "readonly",
                HandlebarsHelpers: "readonly",
                Hooks: "readonly",
                Item: "readonly",
                Items: "readonly",
                ItemSheet: "readonly",
                jQuery: "readonly",
                SimpleCalendar: "readonly",
            },
        },
        plugins: {
            jest: eslintPluginJest,
            jsdoc,
        },
        rules: {
            // Recommended JSDoc rules
            "jsdoc/require-jsdoc": [
                "warn",
                {
                    require: {
                        ClassDeclaration: true,
                        MethodDefinition: true,
                    },
                },
            ],
            "jsdoc/require-description": "warn",
            "jsdoc/require-param": "warn",
            "jsdoc/require-returns": "warn",
            "jsdoc/require-override": "error",
            "jsdoc/no-missing-syntax": [
                "error",
                {
                    contexts: [
                        {
                            context: "MethodDefinition[override=true]",
                            inlineTags: ["inheritdoc"],
                        },
                    ],
                },
            ],
        },
    },
    {
        // ✅ Jest-Specific Rules (Applies Only to Test Files)
        files: ["tests/**/*.test.js"],
        languageOptions: {
            globals: {
                beforeAll: "readonly",
                afterAll: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                describe: "readonly",
                test: "readonly",
                expect: "readonly",
                jest: "readonly",
            },
        },
        plugins: {
            jest: eslintPluginJest,
        },
        extends: ["plugin:jest/recommended"], // ✅ Enables Jest-specific linting rules
        rules: {
            "jest/no-disabled-tests": "warn",
            "jest/no-focused-tests": "error",
            "jest/no-identical-title": "error",
            "jest/prefer-to-have-length": "warn",
            "jest/valid-expect": "error",
        },
    },
];
