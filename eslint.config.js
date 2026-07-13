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
    "src/document/effect/logic/**/*.ts",
    "src/apps/logic/**/*.ts",
    "src/entity/**/*.ts",
    "src/core/logic/SohlLogic.ts",
    "src/core/logic/SohlSpeaker.ts",
];

/**
 * The registered entity classes (`src/entity/entityRegistry.ts`) — the classes a
 * variant module may override via `sohl.entity.register(...)`. A bare `new X(...)`
 * of any of these bypasses the registry and always builds the base class, even
 * after an override is registered, so it is banned (issue #83): inside SoHL
 * construct through `new entity.X(...)` (`import { entity }` from
 * `@src/entity/registry`, or the cycle-free leaf `@src/entity/entityRegistry` for
 * a base class); outside SoHL use `new sohl.entity.X(...)`. Keep this list in sync
 * with the registry membership in `src/entity/entityRegistry.ts`.
 */
const REGISTERED_ENTITY_CLASSES = [
    "ValueModifier",
    "ValueDelta",
    "CombatModifier",
    "ImpactModifier",
    "MasteryLevelModifier",
    "TestResult",
    "SuccessTestResult",
    "OpposedTestResult",
    "ImpactResult",
    "AttackResult",
    "DefendResult",
    "CombatResult",
    "StrikeModeBase",
    "MeleeStrikeMode",
    "MissileStrikeMode",
    "SohlAction",
    "BodyStructure",
    "BodyPart",
    "BodyLocation",
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
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
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
            // Enforce strict equality, but bless the `== null` / `!= null`
            // idiom used deliberately at Foundry boundaries to match both
            // `null` and `undefined` in one check. See the null/undefined
            // convention in docs/contributing/system-development.md.
            eqeqeq: ["error", "always", { null: "ignore" }],
            // A bare `return` is fine in a `void`/`Promise<void>` function,
            // but when the signature admits `undefined` as a real value it
            // must be written `return undefined` so the intent is explicit.
            // The type-aware version knows the difference; the base rule is
            // type-blind and false-positives on void returns.
            "consistent-return": "off",
            "@typescript-eslint/consistent-return": "error",
            // Catch unhandled Promise rejections: every Promise must be
            // awaited, returned, or explicitly void-cast.
            "@typescript-eslint/no-floating-promises": "error",
            // Catch `await` applied to a non-thenable value, which is
            // always a logic bug.
            "@typescript-eslint/await-thenable": "error",
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
            // TSDoc-format enforcement (keeps the doc style consistent so it
            // stays usable as an example of good practice):
            // - every `@param name` is followed by ` - ` before its description.
            // - no old-JSDoc `{Type}` annotations in any tag; the TypeScript
            //   signature is the single source of truth for types, and TSDoc
            //   reserves `{}` for inline tags/links.
            // These are errors (not warnings) because the codebase is clean of
            // them today and we want regressions blocked, not merely noted.
            "jsdoc/require-hyphen-before-param-description": [
                "error",
                "always",
            ],
            "jsdoc/no-types": "error",
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
        // Construction-indirection rule (issue #83): a registered entity class
        // must never be built with a bare `new` — that bypasses the registry and
        // ignores any override. Only `src/` production code is constrained; tests
        // construct the concrete classes directly to exercise them. The selector
        // matches an `Identifier` callee only, so the blessed member-expression
        // forms `new entity.X(...)` and `new sohl.entity.X(...)` pass.
        files: ["src/**/*.ts"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: `NewExpression[callee.type='Identifier'][callee.name=/^(${REGISTERED_ENTITY_CLASSES.join(
                        "|",
                    )})$/]`,
                    message:
                        'Do not bare-`new` a registered entity class: it bypasses the entity registry and ignores overrides. Inside SoHL use `new entity.X(...)` (import { entity } from "@src/entity/registry", or "@src/entity/entityRegistry" for a base class); outside SoHL use `new sohl.entity.X(...)`. See docs/reference/runtime-contracts.md (Entity class registry).',
                },
            ],
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
