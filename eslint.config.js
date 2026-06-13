import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";

/** Foundry VTT (and SoHL) runtime globals available in the browser. */
const foundryGlobals = {
    $: "readonly",
    ActiveEffect: "readonly",
    ActiveEffects: "readonly",
    ActiveEffectConfig: "readonly",
    Actor: "readonly",
    Actors: "readonly",
    ActorSheet: "readonly",
    AudioHelper: "readonly",
    BaseItem: "readonly",
    canvas: "readonly",
    ChatMessage: "readonly",
    Collection: "readonly",
    Combat: "readonly",
    Combatant: "readonly",
    CONFIG: "readonly",
    CONST: "readonly",
    ContextMenu: "readonly",
    Dialog: "readonly",
    DocumentSheet: "readonly",
    DocumentSheetConfig: "readonly",
    Folder: "readonly",
    FormDataExtended: "readonly",
    foundry: "readonly",
    fromUuid: "readonly",
    fromUuidSync: "readonly",
    game: "readonly",
    Handlebars: "readonly",
    HandlebarsHelpers: "readonly",
    Hooks: "readonly",
    Item: "readonly",
    Items: "readonly",
    ItemSheet: "readonly",
    jQuery: "readonly",
    Roll: "readonly",
    Scene: "readonly",
    SimpleCalendar: "readonly",
    sohl: "readonly",
    Token: "readonly",
    TokenDocument: "readonly",
    ui: "readonly",
    User: "readonly",
};

/**
 * The Foundry-free zones: these files must not VALUE-import any
 * Foundry-coupled module. Type-only imports are erased at compile time and
 * are allowed. The runtime backstop for this rule is the purity smoke test
 * (`npm run test:purity`), which imports every module in these zones in an
 * environment with no Foundry globals.
 */
const FOUNDRY_FREE_ZONES = [
    "src/document/item/logic/**/*.ts",
    "src/document/actor/logic/**/*.ts",
    "src/document/combatant/logic/**/*.ts",
    "src/document/combat/logic/**/*.ts",
    "src/document/token/logic/**/*.ts",
    "src/document/scene/logic/**/*.ts",
    "src/domain/**/*.ts",
    "src/core/SohlLogic.ts",
    "src/core/SohlActionContext.ts",
    "src/core/SohlSpeaker.ts",
    "src/core/SohlEventTrigger.ts",
    "src/utils/ContextMenuEntry.ts",
];

export default [
    {
        ignores: ["build/**", "node_modules/**", "docs/**", "nogit/**"],
    },
    {
        // Plain JS (build utilities, this config)
        files: ["**/*.js", "**/*.mjs"],
        ...pluginJs.configs.recommended,
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.node },
        },
    },
    {
        // TypeScript sources and tests
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            // No `parserOptions.project`: none of the configured rules
            // (no-restricted-imports, jsdoc) need type information, so we
            // avoid type-aware linting — it is slower and breaks when the
            // repo is reached through a symlinked path the TSConfig's file
            // list doesn't match.
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...foundryGlobals,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
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
            // A getter's prose description is its return documentation;
            // don't also demand a redundant @returns on it.
            "jsdoc/require-returns": ["warn", { checkGetters: false }],
        },
    },
    {
        // Tests document themselves through their `describe`/`it` names and
        // helper signatures; full JSDoc on test scaffolding is noise.
        files: ["tests/**/*.ts"],
        rules: {
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-description": "off",
            "jsdoc/require-param": "off",
            "jsdoc/require-returns": "off",
        },
    },
    {
        // Boundary rule: the logic/domain layers stay Foundry-free.
        // All Foundry API access goes through the FoundryHelpers shim;
        // references to Foundry-coupled classes are type-only.
        files: FOUNDRY_FREE_ZONES,
        rules: {
            "@typescript-eslint/no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["**/foundry/*"],
                            allowTypeImports: true,
                            message:
                                "Logic/domain code must not value-import Foundry-coupled modules. Use `import type`, or route runtime access through the FoundryHelpers shim.",
                        },
                        {
                            group: [
                                "**/SohlContextMenu",
                                "**/SohlDataModel",
                                "**/SohlSystem",
                                "**/SohlTokenDocument",
                                "**/SohlScene",
                                "**/SohlActiveEffect",
                                "**/SohlCombatant",
                                "**/document/chat/*",
                                "**/sohl",
                            ],
                            allowTypeImports: true,
                            message:
                                "This module is Foundry-coupled. Logic/domain code may reference it with `import type` only; runtime access goes through the FoundryHelpers shim.",
                        },
                    ],
                },
            ],
        },
    },
    eslintConfigPrettier, // Keep Prettier integration (must be last)
];
