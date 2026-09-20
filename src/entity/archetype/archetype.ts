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
 * Archetype discovery — the Foundry-free core of the Create-dialog archetype
 * picker.
 *
 * An **archetype** is an existing Actor/Item document marked as a starting
 * template (`system.templatePriority = <priority:number>`) that the Create
 * dialog offers to clone from, so a new being/item is
 * born fully populated instead of blank. This module holds the pure rules — no Foundry
 * access — that turn a flat list of discovered candidates into the picker's
 * option list:
 * filter by the current `(type, subType)` selection, **dedup by shortcode**
 * (the shortcode is an archetype's stable identity; the name is presentation
 * and may diverge or be localized), and pick a **winner** per shortcode by the
 * composite ordering _priority desc, then source tier asc, then a stable UUID_.
 *
 * The Foundry boundary that gathers candidates (world documents + compendium
 * packs) lives in `FoundryHelpers.ts` (`fvttDiscoverArchetypes`); it hands this
 * module plain records so all of the interesting logic is unit-testable in Node.
 *
 * @see https://www.heroiclands.org/sohl/doc-extensionpoints/
 */

import { slugifyShortcode } from "../../utils/helpers";

/**
 * Source tier of an archetype candidate. Lower wins at equal priority, so a
 * GM's **world** copy shadows a shipped **system** archetype, which in turn
 * beats a **module** archetype that leaves its priority at the default `0`.
 */
export enum ARCHETYPE_TIER {
    /** A document in the world directory, or a world-package compendium. */
    WORLD = 0,
    /** A document in one of the SoHL system's own compendium packs. */
    SYSTEM = 1,
    /** A document in a third-party module's compendium pack. */
    MODULE = 2,
}

/**
 * A discovered archetype candidate, flattened to just the fields the pure
 * discovery rules need. Produced at the Foundry boundary from a world document
 * or a compendium index entry.
 */
export interface ArchetypeCandidate {
    /** The candidate document's UUID — the picker option value and clone source. */
    uuid: string;
    /** The display name (presentation only; may diverge across localizations). */
    name: string;
    /** The `system.shortcode` — the archetype's stable identity / dedup key. */
    shortcode: string;
    /** The document type (e.g. `"being"`, `"weapongear"`). */
    type: string;
    /** The `system.subType`, or `""`/`undefined` for types without subtypes. */
    subType?: string;
    /** The `system.templatePriority`; higher wins on a shortcode clash. */
    priority: number;
    /** The candidate's source tier ({@link ARCHETYPE_TIER}). */
    tier: ARCHETYPE_TIER;
}

/** A single Create-dialog archetype `<option>`. */
export interface ArchetypeOption {
    /** Option value — the winner's UUID, or `""` for the **(none)** blank-slate. */
    value: string;
    /** Option label — name and shortcode, since dedup can collapse divergent names. */
    label: string;
    /** The winner's shortcode (`""` for the **(none)** option). */
    shortcode: string;
}

/**
 * Compare two candidates by the composite archetype ordering: **priority
 * descending**, then **tier ascending** (world &lt; system &lt; module), then
 * **UUID ascending** as a stable, deterministic tiebreak. Returns a negative
 * number when `a` should sort before `b`.
 *
 * @param a - The first candidate.
 * @param b - The second candidate.
 * @returns Standard comparator result (`&lt; 0`, `0`, `&gt; 0`).
 */
function compareArchetypes(a: ArchetypeCandidate, b: ArchetypeCandidate): number {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.tier !== b.tier) return a.tier - b.tier;
    return (
        a.uuid < b.uuid ? -1
        : a.uuid > b.uuid ? 1
        : 0
    );
}

/**
 * Resolve the winning archetypes for a `(type, subType)` selection from a flat
 * candidate list: filter to the selection, dedup by shortcode keeping the
 * winner by the composite ordering _priority desc, tier asc, UUID asc_, and
 * return the winners sorted by that same ordering (so the first element is the
 * highest-priority default).
 *
 * Candidates with a blank shortcode are **not** collapsed together (they fall
 * back to their UUID as the dedup key) — an archetype should always carry a
 * meaningful shortcode, and merging distinct unkeyed drafts would hide them.
 *
 * @param candidates - Every discovered candidate for the document type.
 * @param type - The currently-selected document type.
 * @param subType - The currently-selected subtype (`""` when the type has none).
 * @returns The winning candidates, best (default) first.
 */
export function resolveArchetypes(
    candidates: readonly ArchetypeCandidate[],
    type: string,
    subType: string,
): ArchetypeCandidate[] {
    const wantSub = subType ?? "";
    const matched = candidates.filter((c) => c.type === type && (c.subType ?? "") === wantSub);
    const byKey = new Map<string, ArchetypeCandidate>();
    for (const c of matched) {
        const key = c.shortcode || ` ${c.uuid}`;
        const existing = byKey.get(key);
        if (!existing || compareArchetypes(c, existing) < 0) byKey.set(key, c);
    }
    return [...byKey.values()].sort(compareArchetypes);
}

/**
 * Build the Create-dialog archetype option list from resolved winners: one
 * UUID-valued option per winner (labelled `Name (shortcode)`), followed by the
 * **(none)** blank-slate option. The default selection is the top winner's
 * UUID, or **(none)** when there are no winners.
 *
 * @param winners - The winners from {@link resolveArchetypes} (default first).
 * @param noneLabel - The localized label for the **(none)** option.
 * @returns The option list and the default option value.
 */
export function buildArchetypeOptions(
    winners: readonly ArchetypeCandidate[],
    noneLabel: string,
): { options: ArchetypeOption[]; defaultValue: string } {
    // The default stays the top winner (best by priority/tier), but the visible
    // list is sorted alphabetically by label so the user can find an archetype by
    // name; the **(none)** blank-slate option is always kept last.
    const defaultValue = winners.length ? winners[0].uuid : "";
    const options: ArchetypeOption[] = winners
        .map((w) => ({
            value: w.uuid,
            label: `${w.name} (${w.shortcode})`,
            shortcode: w.shortcode,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    options.push({ value: "", label: noneLabel, shortcode: "" });
    return { options, defaultValue };
}

/**
 * The name / shortcode identity an archetype contributes as create defaults.
 * Blank fields fall back through {@link resolveCreateIdentity}.
 */
export interface ArchetypeIdentity {
    /** The archetype's display name — the Name default. */
    name: string;
    /** The archetype's `system.shortcode` — the Shortcode default. */
    shortcode: string;
}

/**
 * Resolve the final Name and (pre-uniqueness) Shortcode base for a Create-dialog
 * confirmation, honoring the **archetype-first** defaulting rules:
 *
 * - A user-typed value always wins (`typedName` / `typedShortcode`).
 * - Otherwise, when an **archetype** is chosen, its own `name` / `shortcode`
 *   are the defaults — leaving both fields blank creates a document that matches
 *   the archetype (subject only to later uniqueness bumping).
 * - With **(none)** chosen (blank-slate authoring), the Name falls back to the
 *   class `defaultName` and the Shortcode is **derived from the resolved name**.
 * - A blank shortcode always derives from the resolved name, then the class
 *   default, and finally the `type` token, so the key is never empty.
 *
 * Both the typed and archetype shortcodes are run through
 * {@link slugifyShortcode}, so the returned `shortcodeBase` is always a clean
 * token. The caller applies {@link sohl.utils.uniqueShortcode} against the taken
 * set.
 *
 * @param typedName - The trimmed Name field value (`""` when left at its default).
 * @param typedShortcode - The trimmed Shortcode field value (`""` when defaulted).
 * @param archetype - The chosen archetype's identity, or `undefined` for **(none)**.
 * @param classDefaultName - The document class's `defaultName` for the type.
 * @param typeFallback - The document type token, used as the last-resort base.
 * @returns The resolved `name` and the pre-uniqueness `shortcodeBase`.
 */
export function resolveCreateIdentity(
    typedName: string,
    typedShortcode: string,
    archetype: ArchetypeIdentity | undefined,
    classDefaultName: string,
    typeFallback: string,
): { name: string; shortcodeBase: string } {
    const name = typedName.trim() || archetype?.name || classDefaultName || typeFallback;

    let shortcodeBase = slugifyShortcode(typedShortcode.trim() || archetype?.shortcode || "");
    if (!shortcodeBase) shortcodeBase = slugifyShortcode(name);
    if (!shortcodeBase) {
        shortcodeBase = slugifyShortcode(classDefaultName) || typeFallback;
    }
    return { name, shortcodeBase };
}

/**
 * Whether the archetype-marker control should be offered on a document's sheet.
 * Two conditions, and both are about what an archetype _is_
 * rather than about the UI:
 *
 * - **Only a GM.** An archetype is world-configuration — it changes what every
 *   player's Create dialog offers — so it is not a player-editable property.
 * - **Only a top-level document.** An **embedded** item is by definition an
 *   instance living on an actor, never a library template; the drop-to-embed
 *   path clears the marker for exactly that reason
 *   ({@link clearArchetypeMarker}).
 *
 * @param isGM - Whether the current user holds the GM role.
 * @param isEmbedded - Whether the document is embedded in a parent document.
 * @returns `true` when the sheet should render the archetype control.
 */
export function canMarkArchetype(isGM: boolean, isEmbedded: boolean): boolean {
    return isGM && !isEmbedded;
}

/**
 * Read the template priority out of a document's (or compendium index entry's)
 * `system` block: the numeric `system.templatePriority`, or `undefined` when
 * the document is not an archetype.
 *
 * **The tri-state, and its falsy trap.** A **number** marks an archetype _at
 * that priority_ — SoHL's own archetypes ship at `0` — while `null` (or an
 * absent field) means "not an archetype". Because `0` is falsy, this is a
 * `typeof v === "number"` test and never a truthiness test; a truthiness test
 * would hide every stock archetype from the Create dialog. A non-numeric value
 * (a stray string or boolean) is ignored rather than coerced, so junk never
 * enters discovery.
 *
 * **The legacy spelling is still read.** `system.archetype` is the older name
 * for this field, and a pack built by an older toolchain — a third-party
 * module's, most plausibly — still carries it. A document read through the
 * schema is migrated on construction (`SohlDataModel.migrateData`), but a
 * **compendium index** entry is raw stored data and never passes through the
 * model, so discovery would silently lose those archetypes. The new spelling
 * wins whenever it is present, so a migrated document is never read twice.
 *
 * @param system - A document's or index entry's `system` block.
 * @returns The numeric priority, or `undefined` when this is not an archetype.
 */
export function readTemplatePriority(system: PlainObject | undefined): number | undefined {
    const block = system as PlainObject | undefined;
    if (!block || typeof block !== "object") return undefined;
    if ("templatePriority" in block) {
        // The new key is present, so it is the answer — including when it says
        // `null`. Falling through to the legacy key here would resurrect a
        // marker the migration (or a GM) deliberately cleared.
        const v = block.templatePriority;
        return typeof v === "number" ? v : undefined;
    }
    const legacy = block.archetype;
    return typeof legacy === "number" ? legacy : undefined;
}

/**
 * Rewrite a document's legacy `system.archetype` onto
 * `system.templatePriority`, in place — the rule behind
 * `SohlDataModel.migrateData`, kept here so it is
 * Foundry-free and can be unit-tested without standing a data model up.
 *
 * This needs a migration rather than a pack rebuild, because the archetype
 * contract's *world tier* exists precisely so a GM can duplicate a shipped
 * archetype into their world to shadow it, and that copy carries the marker in
 * world data. Dropped, the override would not error; the archetype would simply
 * stop being offered in the Create dialog, which is the kind of silence a
 * migration exists to prevent.
 *
 * The **tri-state is preserved exactly**: a number stays that number (`0`
 * included — it is the priority SoHL's own archetypes ship at), and anything
 * else becomes `null`, "not an archetype". A non-numeric legacy value is
 * deliberately *not* coerced: {@link readTemplatePriority} has always ignored
 * junk, so migrating it would resurrect a marker that never counted. The legacy
 * key is dropped either way, and a block that already carries the new key is
 * left alone — a re-run cannot undo a GM's later edit.
 *
 * @param system - A document's `system` block (mutated in place); a nullish or
 *   non-object argument is returned untouched.
 * @returns The same `system` object, for chaining.
 */
export function migrateTemplatePriority<T>(system: T): T {
    if (!system || typeof system !== "object") return system;
    const block = system as PlainObject;
    if (!("archetype" in block)) return system;
    const legacy = block.archetype;
    delete block.archetype;
    if (block.templatePriority === undefined) {
        block.templatePriority = typeof legacy === "number" ? legacy : null;
    }
    return system;
}

/**
 * Clear the archetype marker on a document's create-data, in place, by setting
 * `system.templatePriority` to `null` — the schema's "not an archetype" state.
 *
 * Called wherever an archetype is **instantiated** into a live document — the
 * Create dialog's seed and the drop-to-embed path — so the marker (and the
 * priority it carries) never rides along onto an instance and pollutes
 * discovery. Copy-verbatim operations (Import, Duplicate) deliberately do
 * **not** call this: preserving the marker is how a designer makes a world-tier
 * override.
 *
 * Writing `null` rather than deleting the key matters: a `0` priority is a real
 * marker, not a blank, so "clear it" cannot be spelled as "drop a falsy value".
 * The legacy `archetype` key is deleted alongside, since create-data seeded from a
 * document built by an older toolchain can still carry it and
 * {@link readTemplatePriority} falls back to it.
 *
 * @param data - Document create-data (mutated in place); its `system` block is
 *   created when absent.
 * @returns The same `data` object, for chaining.
 */
export function clearArchetypeMarker<T extends PlainObject>(data: T): T {
    const system = (data as PlainObject).system;
    if (system && typeof system === "object") {
        system.templatePriority = null;
        delete system.archetype;
    } else {
        (data as PlainObject).system = { templatePriority: null };
    }
    return data;
}
