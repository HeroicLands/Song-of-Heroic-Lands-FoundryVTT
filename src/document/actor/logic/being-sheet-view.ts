/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Foundry-free view-model builders for the Being actor sheet.
 *
 * These are the pure data-shaping helpers behind {@link BeingSheet}'s
 * `_prepare*Context` methods: grouping, container-hierarchy assembly, status
 * pill construction, body-part lozenges, the health-bar clamp, and the
 * melee/missile weapon split. They take accessor callbacks and minimal
 * structural inputs (never Foundry document types), so they run — and are
 * unit-tested — without Foundry. The sheet keeps the Foundry-facing work
 * (reading collections, enrichment, hooks) and delegates the shaping here.
 */

import { STATUS_EFFECT } from "@src/utils/constants";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { CombatModifier } from "@src/entity/modifier/CombatModifier";

/* -------------------------------------------- */
/*  Grouping                                    */
/* -------------------------------------------- */

/** The subtype bucket used when an item declares no subtype. */
const DEFAULT_SUBTYPE = "other";

/**
 * Group items into buckets keyed by their subtype, optionally sorting within
 * each bucket. Items whose `getSubType` yields an empty/`undefined` value fall
 * into the `"other"` bucket. Insertion order is preserved within a bucket
 * unless `compare` is supplied.
 *
 * @param items - The items to group.
 * @param getSubType - Derives an item's subtype key.
 * @param compare - Optional within-bucket sort comparator.
 * @returns A map of subtype key → items in that bucket.
 */
export function groupBySubType<T>(
    items: readonly T[],
    getSubType: (item: T) => string | undefined,
    compare?: (a: T, b: T) => number,
): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const item of items) {
        const subType = getSubType(item) || DEFAULT_SUBTYPE;
        (groups[subType] ??= []).push(item);
    }
    if (compare) {
        for (const bucket of Object.values(groups)) {
            bucket.sort(compare);
        }
    }
    return groups;
}

/* -------------------------------------------- */
/*  Gear container hierarchy                     */
/* -------------------------------------------- */

/** A container paired with the gear items it holds. */
export interface ContainerNode<T> {
    /** The container item. */
    container: T;
    /** The gear items nested inside the container. */
    items: T[];
}

/** The result of {@link buildContainerTree}: containers plus loose gear. */
export interface ContainerTree<T> {
    /** Every container with its resolved contents, in input order. */
    containers: ContainerNode<T>[];
    /** Gear not held by any known container — the virtual "On Body" list. */
    onBodyItems: T[];
}

/**
 * Build the gear container hierarchy: route each gear item into the container
 * named by its `containerId`, or into the virtual "On Body" list when its
 * `containerId` is empty or names no known container.
 *
 * `allGear` is expected to include the containers themselves (as in the sheet),
 * so a top-level container appears both as a {@link ContainerNode} and in
 * `onBodyItems` — matching the existing render behavior.
 *
 * @param containers - The container items, in display order.
 * @param allGear - Every gear item (including containers) to place.
 * @param getId - Resolves a container's id.
 * @param getContainerId - Resolves the container id a gear item belongs to.
 * @returns The containers with their contents and the "On Body" list.
 */
export function buildContainerTree<T>(
    containers: readonly T[],
    allGear: readonly T[],
    getId: (item: T) => string | null | undefined,
    getContainerId: (item: T) => string | null | undefined,
): ContainerTree<T> {
    const containerIds = new Set(
        containers.map((c) => getId(c)).filter((id): id is string => !!id),
    );

    const contents = new Map<string, T[]>();
    const onBodyItems: T[] = [];
    for (const item of allGear) {
        const containerId = getContainerId(item);
        if (containerId && containerIds.has(containerId)) {
            const list = contents.get(containerId) ?? [];
            list.push(item);
            contents.set(containerId, list);
        } else {
            onBodyItems.push(item);
        }
    }

    const nodes: ContainerNode<T>[] = containers.map((container) => ({
        container,
        items: contents.get(getId(container) ?? "") ?? [],
    }));

    return { containers: nodes, onBodyItems };
}

/* -------------------------------------------- */
/*  Header: status pills, lozenges, health       */
/* -------------------------------------------- */

/** A header status pill: its status id, labels, and active state. */
export interface StatusPill {
    /** The registered status-effect id (e.g. Foundry's `stun`). */
    id: string;
    /** Short label rendered on the pill. */
    abbr: string;
    /** Tooltip label. */
    label: string;
    /** Whether the status is currently active on the actor. */
    active: boolean;
}

/**
 * The fixed roster of header status pills, in display order. `id` must match a
 * registered status (Foundry's id is `stun`, not `stunned`); `abbr` is the
 * short label rendered, `label` is the tooltip.
 */
const STATUS_PILL_DEFS: readonly Omit<StatusPill, "active">[] = [
    { id: STATUS_EFFECT.SLEEP, abbr: "SLP", label: "Sleep" },
    { id: STATUS_EFFECT.PRONE, abbr: "PRN", label: "Prone" },
    { id: STATUS_EFFECT.STUN, abbr: "STN", label: "Stun" },
    { id: STATUS_EFFECT.AURAL_SHOCK, abbr: "ASHK", label: "Aural Shock" },
    { id: STATUS_EFFECT.INCAPACITATED, abbr: "INC", label: "Incapacitated" },
    { id: STATUS_EFFECT.UNCONSCIOUS, abbr: "UNC", label: "Unconscious" },
    { id: STATUS_EFFECT.DEAD, abbr: "DED", label: "Dead" },
];

/**
 * Build the header status pills, stamping each with whether its status id is
 * present in the active set.
 *
 * @param activeStatusIds - The status ids currently active on the actor.
 * @returns The status pills, in display order.
 */
export function buildStatusPills(
    activeStatusIds: ReadonlySet<string>,
): StatusPill[] {
    return STATUS_PILL_DEFS.map((def) => ({
        ...def,
        active: activeStatusIds.has(def.id),
    }));
}

/** A read-only body-location lozenge. */
export interface BodyPartLozenge {
    /** The body-part shortcode. */
    shortcode: string;
}

/**
 * Build the read-only body-location lozenges from a lineage body structure.
 *
 * @param bodyStructure - The actor's lineage body structure, or `undefined`.
 * @returns One lozenge per body part, or an empty array when none.
 */
export function buildBodyPartLozenges(
    bodyStructure: { parts?: readonly { shortcode: string }[] } | undefined,
): BodyPartLozenge[] {
    return (bodyStructure?.parts ?? []).map((p) => ({
        shortcode: p.shortcode,
    }));
}

/**
 * Clamp a raw health value to an integer percentage in `[0, 100]` for the
 * health bar. A missing value clamps to `0`.
 *
 * @param value - The raw health percentage.
 * @returns An integer in `[0, 100]`.
 */
export function clampHealthPct(value: number | null | undefined): number {
    return Math.max(0, Math.min(100, Math.round(value ?? 0)));
}

/* -------------------------------------------- */
/*  Combat: melee/missile weapon split           */
/* -------------------------------------------- */

/** A weapon paired with a subset of its strike modes. */
export interface WeaponStrikeGroup<W, SM> {
    /** The weapon item. */
    weapon: W;
    /** The weapon's strike modes for this range band. */
    strikeModes: SM[];
}

/** The result of {@link splitWeaponsByRange}. */
export interface WeaponRangeSplit<W, SM> {
    /** Weapons that have at least one melee strike mode. */
    meleeWeapons: WeaponStrikeGroup<W, SM>[];
    /** Weapons that have at least one missile strike mode. */
    missileWeapons: WeaponStrikeGroup<W, SM>[];
}

/** The range-classification fields that {@link splitWeaponsByRange} inspects on each strike mode. */
export interface StrikeModeRangeInfo {
    /** Whether this is a melee-range strike mode. */
    isMelee: boolean;
    /** Whether this is a missile-range strike mode. */
    isMissile: boolean;
}

/**
 * Partition weapons into melee and missile lists by their strike modes. A
 * weapon appears in a list only when it has at least one mode for that range
 * band, and a weapon with both kinds appears in both lists (each with only the
 * matching modes).
 *
 * @param weapons - The weapon items.
 * @param getStrikeModes - Resolves a weapon's strike modes.
 * @returns The melee and missile weapon groups, in input order.
 */
export function splitWeaponsByRange<W, SM extends Partial<StrikeModeRangeInfo>>(
    weapons: readonly W[],
    getStrikeModes: (weapon: W) => readonly SM[],
): WeaponRangeSplit<W, SM> {
    const meleeWeapons: WeaponStrikeGroup<W, SM>[] = [];
    const missileWeapons: WeaponStrikeGroup<W, SM>[] = [];
    for (const weapon of weapons) {
        const modes = getStrikeModes(weapon);
        const melee = modes.filter((sm) => sm.isMelee);
        const missile = modes.filter((sm) => sm.isMissile);
        if (melee.length > 0) meleeWeapons.push({ weapon, strikeModes: melee });
        if (missile.length > 0)
            missileWeapons.push({ weapon, strikeModes: missile });
    }
    return { meleeWeapons, missileWeapons };
}

/* -------------------------------------------- */
/*  Combat: held-weapon filter                  */
/* -------------------------------------------- */

/**
 * Filter weapons to only those currently held (gripped) by the actor.
 *
 * @param weapons - All weapon items.
 * @param getHeldBy - Resolves the body parts holding the weapon.
 * @returns The subset of weapons with at least one holding part.
 */
export function filterHeldWeapons<W>(
    weapons: readonly W[],
    getHeldBy: (weapon: W) => readonly unknown[],
): W[] {
    return weapons.filter((w) => getHeldBy(w).length > 0);
}

/* -------------------------------------------- */
/*  Strike-mode modifier selection              */
/* -------------------------------------------- */

/**
 * Return the {@link CombatModifier} that corresponds to a `data-test-kind`
 * attribute on a Being-sheet strike-mode cell.
 *
 * - `"attack"` → `sm.attack` (all strike modes)
 * - `"block"` → `sm.defense.block` (melee only)
 * - `"counterstrike"` → `sm.defense.counterstrike` (melee only)
 *
 * Returns `undefined` for an unrecognised kind or when a defense kind is
 * requested but the mode is not a {@link MeleeStrikeMode}.
 *
 * @param sm - The strike mode to read the modifier from.
 * @param testKind - The `data-test-kind` string: `"attack"`, `"block"`, or
 *   `"counterstrike"`.
 * @returns The matching {@link CombatModifier}, or `undefined`.
 */
export function selectStrikeModeModifier(
    sm: StrikeModeBase,
    testKind: string,
): CombatModifier | undefined {
    if (testKind === "block") return (sm as MeleeStrikeMode).defense?.block;
    if (testKind === "counterstrike")
        return (sm as MeleeStrikeMode).defense?.counterstrike;
    if (testKind === "attack") return sm.attack;
    return undefined;
}
