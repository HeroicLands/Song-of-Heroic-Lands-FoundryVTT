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
 * The Foundry-free heart of the world-migration runner: the migration step
 * shape, the ordered registry, and the pure functions that plan which steps to
 * run and fold a single document's source through them.
 *
 * The Foundry-boundary orchestrator that walks the world's documents and applies
 * the resulting updates lives in `src/core/foundry/migration.ts`; everything here
 * is pure and unit-tested so the *decision* logic never depends on a running
 * Foundry. See the migration reference at
 * https://kb.heroiclands.org/dev/reference/runtime-contracts/ for the update
 * contract.
 *
 * @module
 */

import {
    AFFILIATION_SUBTYPE,
    ITEM_KIND,
    isAffiliationSubType,
} from "@src/utils/constants";
import { compareVersions, isNewerVersion } from "./version";

/**
 * The document classes a migration can target. These are Foundry document-class
 * names (not SoHL subtypes) used as the dispatch key for a step's per-type
 * migrators. The SoHL in-scope types map onto them as: Actors
 * (`being`/`cohort`/`structure`/`vehicle`) → `Actor`; the 13 item subtypes →
 * `Item`; the `sohleffectdata` effect → `ActiveEffect`; the `trigger` region
 * behavior → `RegionBehavior`. `Scene` is included so a future migration can
 * touch scene-level flags even though Scenes carry no SoHL system data.
 */
export type MigrationDocKind =
    | "Actor"
    | "Item"
    | "ActiveEffect"
    | "RegionBehavior"
    | "Scene";

/**
 * A plain, serialized document source handed to a migrator. This is the shape of
 * `document.toObject()` — never a live document — so migrators stay pure and the
 * folder can run in Node without Foundry.
 */
export interface MigrationSource {
    /** The document subtype (e.g. `"skill"`, `"being"`). */
    type?: string;
    /** The document id, when present. */
    _id?: string;
    /** The document name, for diagnostics. */
    name?: string;
    /** The system (schema) data. */
    system?: Record<string, unknown>;
    /** The document flags. */
    flags?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * A per-document-kind migrator. Receives the document's serialized source and
 * returns an update payload to write, or `undefined` / an empty object for a
 * no-op. A migrator must not mutate `source`.
 *
 * **The payload replaces, it does not merge.** The runner updates with
 * `recursive: false`, and a non-recursive Foundry update treats every root-level
 * key as a forced replacement of that whole object — dot paths are expanded
 * first, so `{ "system.foo": 1 }` replaces the document's entire `system` with
 * `{ foo: 1 }`. Build the payload by spreading the source object and editing the
 * copy: `{ system: { ...source.system, foo: 1 } }`. The same rule makes a whole
 * array the only safe way to change an array field (see the array-field contract
 * in the runtime-contracts reference).
 *
 * A key that has already left the schema **cannot be deleted** by a `-=` payload:
 * Foundry prunes undeclared keys out of the change set. Omit it from a
 * replacement payload instead — see the migration reference at
 * https://kb.heroiclands.org/dev/reference/migration/.
 */
export type DocMigrator = (
    source: MigrationSource,
) => Record<string, unknown> | undefined;

/**
 * A single, version-stamped migration. `version` is the system version at which
 * the migration is introduced; the runner applies every step whose version is
 * newer than the world's stored migration version and no newer than the running
 * system version. `migrators` holds one function per in-scope document kind the
 * step needs to touch — omit a kind the step does not change.
 */
export interface MigrationStep {
    /** The system version this migration was introduced at (e.g. `"0.8.0"`). */
    version: string;
    /** A short human-readable description of what the step changes. */
    description: string;
    /** Per-document-kind migrators. Omit a kind the step does not touch. */
    migrators?: Partial<Record<MigrationDocKind, DocMigrator>>;
}

/**
 * Rewrite a document's `system` object with the retired `docUrl` key removed
 * (#1394).
 *
 * `docUrl` persisted an absolute documentation URL into every compiled item and,
 * on import, into every world; nothing ever read it. Removing it from the schema
 * is enough for the running client — Foundry prunes any key its schema does not
 * declare out of a document's source the moment the document is constructed —
 * but that same pruning is why the stale value cannot be deleted by key: a
 * `{"system.-=docUrl": null}` change set is pruned before it can delete anything.
 * The value survives only in the stored record, which is rewritten from the
 * (already pruned) source the next time the document is written at all.
 *
 * So the migrator hands back the document's own `system` object, minus `docUrl`.
 * The runner updates with `recursive: false`, which makes a root-level key a
 * forced replacement of the whole object, and the write persists the pruned
 * source. Nothing else changes — the payload is the document's current data.
 *
 * The payload is unconditional because a migrator cannot tell whether a given
 * document still carries the key: by the time it sees the source, Foundry has
 * already pruned it. Each actor and item is therefore rewritten once.
 *
 * @param source - The document's serialized source.
 * @returns The replacement payload, or `undefined` for a document with no
 *   system data.
 */
const stripDocUrl: DocMigrator = (source) => {
    if (!source.system) return undefined;
    const system = { ...source.system };
    delete system.docUrl;
    return { system };
};

/**
 * Stamp the default subtype on an affiliation that predates the field (#1405).
 *
 * `subType` is `required` with no `initial`, so an affiliation authored before it
 * existed carries no value at all — and an unrecognized value (hand-edited, or
 * left by a third-party module) fails the field's `choices` validation and is
 * dropped, which lands in the same place. Both are stamped `social`, the secular
 * default, which is what an unclassified body most often is.
 *
 * The payload spreads the document's own `system` because the runner updates
 * non-recursively: a bare `{"system.subType": …}` would replace the whole system
 * object with just that one key. See {@link DocMigrator}.
 *
 * @param source - The document's serialized source.
 * @returns The replacement payload, or `undefined` for anything already valid.
 */
const stampAffiliationSubType: DocMigrator = (source) => {
    if (source.type !== ITEM_KIND.AFFILIATION) return undefined;
    if (isAffiliationSubType(source.system?.subType)) return undefined;
    return {
        system: { ...source.system, subType: AFFILIATION_SUBTYPE.SOCIAL },
    };
};

/**
 * The `(type, shortcode)` keys retired by the alphanumeric rule (#1397), each
 * mapped to its replacement.
 *
 * Keyed by **type** because the shortcode alone is not the identity: another
 * type may legitimately carry the same string, and renaming it there would
 * repoint an unrelated document.
 */
const RENAMED_SHORTCODES: Readonly<
    Record<string, Readonly<Record<string, string>>>
> = Object.freeze({
    trauma: Object.freeze({ "self-pro": "selfpro", "self-suf": "selfsuf" }),
    weapongear: Object.freeze({ "B&CFl": "BCFl" }),
});

/**
 * Rewrite the three shortcodes that were not alphanumeric (#1397).
 *
 * A shortcode is identity, referenced from saved world data — a compendium item
 * and the world copy imported from it are "the same thing" precisely because
 * they share `(type, shortcode)`. So renaming the key in the content tree is a
 * **data change**: without this step a world that imported the old
 * `weapongear:B&CFl` would stop matching the pack entry it came from, and
 * archetype shadowing and compendium reconciliation would both quietly treat the
 * two as different entities.
 *
 * Both lookups use {@link Object.hasOwn}: `type` and `shortcode` come from
 * stored data, so a bare property read on an object literal would resolve
 * inherited names like `constructor` and rename on a match that is not there.
 *
 * The payload spreads the document's own `system` because the runner updates
 * non-recursively. See {@link DocMigrator}.
 *
 * @param source - The document's serialized source.
 * @returns The replacement payload, or `undefined` when nothing is renamed.
 */
const renameShortcodes: DocMigrator = (source) => {
    const type = source.type;
    if (typeof type !== "string" || !Object.hasOwn(RENAMED_SHORTCODES, type)) {
        return undefined;
    }
    const current = source.system?.shortcode;
    const renames = RENAMED_SHORTCODES[type];
    if (typeof current !== "string" || !Object.hasOwn(renames, current)) {
        return undefined;
    }
    return { system: { ...source.system, shortcode: renames[current] } };
};

/**
 * The ordered list of world migrations.
 *
 * Append in version order — the planner sorts defensively regardless — and stamp
 * each step with the system version that introduces it, so a world upgrading past
 * that version runs it exactly once.
 */
export const SOHL_MIGRATIONS: readonly MigrationStep[] = Object.freeze([
    {
        version: "0.9.0",
        description:
            "Strip the retired system.docUrl field, which baked an external " +
            "documentation URL into world data (#1394).",
        migrators: { Actor: stripDocUrl, Item: stripDocUrl },
    },
    {
        version: "0.9.0",
        description:
            "Stamp the new required subType on existing affiliation items (#1405)",
        migrators: { Item: stampAffiliationSubType },
    },
    {
        version: "0.9.0",
        description:
            "Rename the three shortcodes that were not alphanumeric, which " +
            "the type-shortcode address cannot parse unambiguously (#1397).",
        migrators: { Item: renameShortcodes },
    },
]);

/**
 * Select the migration steps to run for a world, in ascending version order.
 *
 * A step runs when `from < step.version <= to` — the lower bound is exclusive
 * (the world already has `from`) and the upper bound inclusive (migrate up to and
 * including the running system version). An empty `from` behaves as `0.0.0`
 * (runs everything up to `to`); an empty `to` yields no steps (the target version
 * is unknown).
 *
 * @param from - The world's stored migration version.
 * @param to - The target (running system) version.
 * @param steps - The registry to draw from (defaults to {@link SOHL_MIGRATIONS}).
 * @returns The applicable steps, sorted oldest-first.
 */
export function planMigrations(
    from: string,
    to: string,
    steps: readonly MigrationStep[] = SOHL_MIGRATIONS,
): MigrationStep[] {
    if (!to) return [];
    return steps
        .filter(
            (s) =>
                isNewerVersion(s.version, from) &&
                !isNewerVersion(s.version, to),
        )
        .sort((a, b) => compareVersions(a.version, b.version));
}

/**
 * Fold a single document's source through a plan, producing one merged update.
 *
 * Each step's migrator for `kind` is applied in plan order; every non-empty
 * result is merged into the accumulating update, so later steps win on colliding
 * keys. Returns an empty object when nothing changed — the caller skips the
 * `document.update()` entirely in that case.
 *
 * @param source - The document's serialized source (`document.toObject()`).
 * @param kind - The document's class name (dispatch key).
 * @param plan - The steps to apply (already selected by {@link planMigrations}).
 * @returns A flattened update payload; `{}` when the plan changes nothing.
 */
export function migrateDocumentSource(
    source: MigrationSource,
    kind: MigrationDocKind,
    plan: readonly MigrationStep[],
): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    // Each step sees the previous steps' output, not the untouched source.
    // Payloads are whole-object replacements (see {@link DocMigrator}), and they
    // are merged at the *root*, so two steps that both rewrite `system` would
    // otherwise not compose: the later one spreads the original `system` and
    // silently reinstates whatever the earlier one removed. Threading the
    // accumulated source is what makes a plan of several steps mean the sum of
    // them rather than the last one.
    let current = source;
    for (const step of plan) {
        const migrator = step.migrators?.[kind];
        if (!migrator) continue;
        const result = migrator(current);
        if (result && Object.keys(result).length > 0) {
            Object.assign(update, result);
            current = { ...current, ...result };
        }
    }
    return update;
}

/**
 * Resolve the effective "from" version for a world, distinguishing a brand-new
 * world from a pre-tracking legacy one.
 *
 * The `systemMigrationVersion` setting defaults to `""` for both a freshly
 * created world (nothing to migrate) and a world created before migration
 * tracking existed (everything to migrate). They are told apart by whether the
 * world holds any content:
 *
 * - stored version present → use it verbatim.
 * - empty + world unpopulated → **fresh**: return `current`, so the plan is empty
 *   and the runner simply stamps the version forward.
 * - empty + world populated → **legacy**: return `"0.0.0"`, so every registered
 *   migration runs.
 *
 * @param stored - The stored `systemMigrationVersion` (may be empty).
 * @param current - The running system version.
 * @param worldHasContent - Whether the world holds any migratable documents.
 * @returns The version to plan migrations from.
 */
export function resolveFromVersion(
    stored: string,
    current: string,
    worldHasContent: boolean,
): string {
    if (stored) return stored;
    return worldHasContent ? "0.0.0" : current;
}
