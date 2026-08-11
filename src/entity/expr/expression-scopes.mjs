/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The catalog of **expression scopes** — for every place SoHL evaluates a
 * {@link SafeExpression}, the exact set of identifiers an author may write
 * there, each with the description shown in the editor's autocomplete.
 *
 * This is the single source of truth behind three surfaces that previously each
 * carried their own copy of the same fact (issue #1142):
 *
 * 1. **Validation** — `SafeExpression` rejects an identifier outside the
 *    declared scope at *construction*, so a typo fails loudly where it is
 *    authored instead of silently at every evaluation.
 * 2. **The editor** — autocomplete offers exactly these identifiers, with these
 *    descriptions, and live validation flags an out-of-scope one while typing.
 * 3. **The documentation** — the bound-variables table in
 *    `kb/dev-docs/concepts/expressions.md` is generated from this catalog by
 *    `utils/build-expression-scopes-doc.mjs` and guarded by `npm run lint`.
 *
 * This module is deliberately **plain ESM** — no TypeScript, no `@src` aliases,
 * no Foundry — precisely so the plain-`node` documentation scripts *and* the
 * bundled TS runtime can both import it (the same arrangement as
 * `src/utils/default-item-art.mjs`). A `.ts` module could not be required by
 * the doc scripts, which run under bare `node`.
 *
 * ## Adding a scope
 *
 * Add an entry here, then pass the scope at the `new SafeExpression(...)` call
 * site (`{ parent, scope: expressionScopes.get("<id>") }`). Regenerate the docs
 * with `npm run docs:expr-scopes`. There is no separate registration step —
 * this object *is* the registry.
 *
 * ### Entry shape
 *
 * - `label` — a short human name, used as the docs-table row title.
 * - `site` — where the expression is authored, for the docs table.
 * - `field` — the data field(s) the scope applies to, for the docs table.
 * - `result` — what the expression is expected to evaluate to.
 * - `summary` — one sentence of prose about when this scope applies.
 * - `open` — when `true`, identifiers beyond those declared are **permitted**.
 *   Reserve this for genuinely dynamic contexts (see `event.predicate`); the
 *   declared bindings are then documentation and autocomplete only, not a gate.
 * - `bindings` — identifier name → description. May be empty, which means the
 *   expression may use **only** literals and helper calls.
 *
 * @module expression-scopes
 */

/**
 * Every expression scope, keyed by its stable id. Ids are dotted
 * `<subject>.<use>` strings; they are persisted only in `SafeExpressionField`
 * declarations (schema source, not world data), so they may be renamed with a
 * code change alone.
 *
 * @type {Readonly<Record<string, {
 *   label: string,
 *   site: string,
 *   field: string,
 *   result: string,
 *   summary: string,
 *   open?: boolean,
 *   bindings: Readonly<Record<string, string>>,
 * }>>}
 */
export const EXPRESSION_SCOPES = Object.freeze({
    "action.visible": {
        label: "Action — UI visibility",
        site: "`SohlAction` (`compileVisibility`)",
        field: "`visible`",
        result: "boolean",
        summary:
            "Gates whether an action is offered on a context menu. Composed with the " +
            "script-permission check and the action's own `trigger`.",
        bindings: {
            element:
                "The DOM element the context menu was opened on (the row or sheet control).",
            itemLogic:
                "Logic layer of the row's item, or `undefined` when the menu is not on an item row.",
            actorLogic:
                "Logic layer of the surrounding actor, or `undefined` when there is none.",
            isGM: "Whether the current user is a GM.",
        },
    },

    "action.trigger": {
        label: "Action — executability",
        site: "`SohlAction` (`compileTrigger`)",
        field: "`trigger`",
        result: "boolean",
        summary:
            "Gates whether an action may run at all. Evaluated programmatically, not from a DOM event.",
        bindings: {
            itemLogic:
                "Logic layer of the owning item, or `undefined` for an actor-owned action.",
            actorLogic:
                "Logic layer of the owning actor, or `undefined` when there is none.",
        },
    },

    "effect.itemTest": {
        label: "Active Effect — item targeting",
        site: "`SohlActiveEffect` (item-kind scope)",
        field: "`test`",
        result: "boolean",
        summary:
            "Selects which of the actor's items of the effect's scope kind the effect applies to. " +
            "A blank test matches every item of the kind.",
        bindings: {
            itemLogic: "Logic layer of the candidate item being tested.",
        },
    },

    "effect.strikeModeTest": {
        label: "Active Effect — strike-mode targeting",
        site: "`SohlActiveEffect` (`meleestrikemode` / `missilestrikemode` scope)",
        field: "`test`",
        result: "boolean",
        summary:
            "Selects which of an item's strike modes the effect applies to. The same `test` field as " +
            "item targeting, bound differently because the effect's scope is a strike-mode scope.",
        bindings: {
            itemLogic: "Logic layer of the item owning the strike mode.",
            sm: "The candidate strike mode being tested.",
        },
    },

    "menu.condition": {
        label: "Context-menu entry",
        site: "`ContextMenuEntry` (`compileCondition`)",
        field: "`condition`",
        result: "boolean",
        summary:
            "Gates whether a context-menu entry is shown for the element the menu was opened on.",
        bindings: {
            target: "The DOM element the menu was triggered on.",
            itemLogic:
                "Logic layer of the nearest ancestor row's item, or `undefined`.",
            actorLogic:
                "Logic layer of the nearest ancestor row's actor, or `undefined`.",
        },
    },

    "skill.base": {
        label: "Skill Base formula",
        site: "`SkillLogic` (`computeSkillBase`)",
        field: "`skillBaseFormula`",
        result: "number",
        summary:
            "Computes a skill's Skill Base from the owning actor's attributes, e.g. `sb(attr.str, attr.dex)`.",
        bindings: {
            attr:
                "Attribute scores by shortcode — `attr.str`, `attr['dex']`. " +
                "An attribute the actor does not have reads as `0`.",
        },
    },

    "being.strengthModifier": {
        label: "Being — strength modifier",
        site: "`BeingLogic` (`evaluate`)",
        field: "`strMod`",
        result: "number",
        summary:
            "Derives the being's strength modifier from its Strength attribute.",
        bindings: {
            str: "The being's effective Strength score.",
        },
    },

    "being.encumbrance": {
        label: "Being — encumbrance",
        site: "`BeingLogic` (`evaluate`)",
        field: "`encumbrance`",
        result: "number",
        summary:
            "Derives the being's encumbrance level from the weight it is carrying.",
        bindings: {
            wt: "The being's effective carried weight.",
        },
    },

    "body.weight": {
        label: "Body — derived weight",
        site: "`BodyLogic` (`evaluate`)",
        field: "`weight.calc`",
        result: "number",
        summary:
            "Derives a body's weight from its Strength when no explicit base weight is set.",
        bindings: {
            str: "The being's effective Strength score.",
        },
    },

    "test.resultRow": {
        label: "Result-description table row",
        site: "`SuccessTestResult` (result-description tables)",
        field: "`label`, `description`, `result`",
        result: "string (label/description) or number (result)",
        summary:
            "Computes a result-table row's text or Value Diamond count from the settled test result. " +
            "Evaluated only for the one row a test matches.",
        bindings: {
            successLevel: "The test's computed success level.",
            targetValue: "The test's effective target value.",
            lastDigit: "The last digit of the rolled d100.",
        },
    },

    "event.predicate": {
        label: "Event-queue subscription predicate",
        site: "`SohlEventQueue` (`fire`)",
        field: "`predicate`",
        result: "boolean",
        summary:
            "Gates whether a due subscription is dispatched when its trigger fires. **Open scope** — " +
            "the bindings are the trigger context, which varies by trigger (and a world may register " +
            "custom triggers carrying custom keys), so undeclared identifiers are permitted here. " +
            "Guard anything trigger-specific with `defined(...)`.",
        open: true,
        bindings: {
            name: "The trigger name that fired (e.g. `'turnEnd'`).",
            subscriberUuid:
                "UUID of the document this subscription belongs to — compare against the trigger to scope it to yourself.",
            payload: "The subscription's own attached data, when it has any.",
            worldTime: "`updateWorldTime`: the new world time, in seconds.",
            dt: "`updateWorldTime`: signed delta from the previous world time.",
            combat: "Combat triggers: the combat document.",
            combatant:
                "`turnStart` / `turnEnd`: the combatant whose turn it is.",
            round: "Round and turn triggers: the round number.",
            turn: "`turnStart` / `turnEnd`: the turn index.",
            skipped: "Round and turn triggers: whether the change was skipped.",
            sceneUuid: "Region and darkness triggers: UUID of the scene.",
            darkness: "`sceneDarknessChange`: the new darkness level (0–1).",
            priorDarkness:
                "`sceneDarknessChange`: the previous darkness level, when known.",
            regionUuid: "Region triggers: UUID of the region.",
            regionId: "Region triggers: the region's id.",
            regionName: "Region triggers: the region's display name.",
            tokenUuid: "Region triggers: UUID of the token that acted.",
            actorUuid:
                "Region triggers: UUID of that token's actor, when it has one.",
        },
    },

    "affliction.outcomeTrauma": {
        label: "Affliction — outcome trauma",
        site: "`AfflictionLogic` (`contractOutcomeTraumas`)",
        field: "`outcomeTrauma`",
        result: "string or string[] (trauma shortcodes)",
        summary:
            "Chooses which trauma(s) an affliction inflicts on contraction. Bound to nothing: the " +
            "expression may use only literals and helper calls (e.g. a shortcode literal, or a " +
            "`roll('1d3').total` selection), never a bare identifier.",
        bindings: {},
    },
});
