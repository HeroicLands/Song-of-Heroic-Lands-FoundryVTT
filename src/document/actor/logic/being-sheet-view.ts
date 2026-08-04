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

import {
    STATUS_EFFECT,
    TRAUMA_SUBTYPE,
    MYSTICALABILITY_SUBTYPE,
    SKILL_SUBTYPE,
} from "@src/utils/constants";
import {
    bodyPartImpairment,
    type BodyPartStatus,
    type LocationInjury,
} from "@src/entity/body/impairment";
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
/*  Attribute descriptor                         */
/* -------------------------------------------- */

/** A value-description band: a label applying up to (and including) `maxValue`. */
export interface ValueDescBand {
    /** Descriptive name for this score band. */
    label: string;
    /** Highest score (inclusive) covered by this band. */
    maxValue: number;
}

/**
 * Resolve the descriptor label for an attribute score against its
 * value-description bands. Bands are considered in ascending `maxValue` order;
 * the descriptor is the label of the first band whose `maxValue` is at least
 * the score. When the score exceeds every band, the highest band's label is
 * used; when there are no bands, the descriptor is the empty string.
 *
 * @param score - The effective attribute score.
 * @param bands - The attribute's `valueDesc` bands (any order).
 * @returns The matching descriptor label, or `""` when no bands are defined.
 */
export function attributeDescriptor(
    score: number,
    bands: readonly ValueDescBand[],
): string {
    if (bands.length === 0) return "";
    const sorted = [...bands].sort((a, b) => a.maxValue - b.maxValue);
    const match = sorted.find((band) => band.maxValue >= score);
    return (match ?? sorted[sorted.length - 1]).label;
}

/* -------------------------------------------- */
/*  Body locations tree                          */
/* -------------------------------------------- */

/** Per-aspect protection values (blunt / edged / piercing / fire). */
export interface AspectProtection {
    blunt: number;
    edged: number;
    piercing: number;
    fire: number;
}

/** A body location as consumed by the combat-tab Body Locations tree. */
export interface BodyLocationRow {
    /** The location's shortcode (its row key within its part), for the Edit action. */
    shortcode: string;
    /** The location's display name (e.g. "Skull"). */
    name: string;
    /** Comma-joined covering armor materials (`armorType`), empty when bare. */
    layers: string;
    /** Total blunt protection — natural base plus equipped armor. */
    blunt: number;
    /** Total edged protection. */
    edged: number;
    /** Total piercing protection. */
    piercing: number;
    /** Total fire protection. */
    fire: number;
    /** Shock value. */
    shock: number;
    /** Impairment value (not yet modeled; 0 for now). */
    impair: number;
}

/** A body part paired with its hit locations, for the Body Locations tree. */
export interface BodyPartNode {
    /** The part's shortcode (its row key within the structure), for the Edit action. */
    shortcode: string;
    /** Zero-based index of the part within the structure's flat `parts` array. */
    index: number;
    /** The part's display label. */
    label: string;
    /**
     * The part's functional roles rendered as a compact display badge (e.g.
     * `"Vital, Core"`), or empty when the part fulfills no roles. Shown by the
     * Profile body-structure tree's `chip--role` badge.
     */
    role?: string;
    /** The part's hit locations, in order. */
    locations: BodyLocationRow[];
}

/** A body zone paired with its parts, the root of the Body Locations tree. */
export interface BodyZoneNode {
    /** The zone's shortcode (its row key within the structure), for the Edit action. */
    shortcode: string;
    /** Zero-based index of the zone within the structure's flat `zones` array. */
    index: number;
    /** The zone's display label. */
    label: string;
    /**
     * The zone's run of zone numbers rendered for display, e.g. `"4–8"`, or the
     * single number when the run is one long. Empty when the zone is unweighted
     * and so unrollable.
     */
    zoneRange: string;
    /** The zone's body parts, in order. */
    parts: BodyPartNode[];
}

/** The minimal per-location shape the tree builder consumes. */
export interface BodyLocationLike {
    shortcode: string;
    name: string;
    layers: string;
    /** Natural per-aspect protection (a location's `protectionBase`, resolved). */
    base: AspectProtection;
    /** Equipped-armor per-aspect protection (a location's `armorProtection`). */
    armor: AspectProtection;
    shock: number;
    impair: number;
}

/** The minimal per-part shape the tree builder consumes. */
export interface BodyPartLike {
    shortcode: string;
    index: number;
    label: string;
    /** Pre-formatted functional-role badge text; omitted when the part has no roles. */
    role?: string;
    locations: readonly BodyLocationLike[];
}

/** The minimal per-zone shape the tree builder consumes. */
export interface BodyZoneLike {
    shortcode: string;
    index: number;
    label: string;
    /** The zone's allocated run of zone numbers, ascending (empty when unweighted). */
    zoneNumbers: readonly number[];
    parts: readonly BodyPartLike[];
}

/**
 * Build the read-only Body Locations tree for the Combat tab: each **zone**
 * with its body parts, each part with its hit locations, and per-location
 * protection totals computed as **natural base + equipped armor** for every
 * aspect (blunt/edged/piercing/fire). The armor contribution comes from the
 * actor's worn armor aggregated onto the body structure (see `aggregateArmor`);
 * natural `protectionBase` is left untouched, so the sum is the effective
 * protection shown per location. Pure — no Foundry dependency.
 *
 * @param zones - The body zones with their parts and locations.
 * @returns The zone tree with per-location totals, in input order.
 */
export function buildBodyLocationTree(
    zones: readonly BodyZoneLike[],
): BodyZoneNode[] {
    return zones.map((zone) => ({
        shortcode: zone.shortcode,
        index: zone.index,
        label: zone.label,
        zoneRange: formatZoneRange(zone.zoneNumbers),
        parts: zone.parts.map(buildBodyPartNode),
    }));
}

/**
 * Render a zone's allocated numbers as a compact display range — `"4–8"` for a
 * run, `"4"` for a single number, `""` when the zone has no weight and can
 * never be rolled.
 *
 * @param zoneNumbers - The zone's ascending run of zone numbers.
 * @returns The display string for the zone's roll range.
 */
export function formatZoneRange(zoneNumbers: readonly number[]): string {
    if (zoneNumbers.length === 0) return "";
    const first = zoneNumbers[0];
    const last = zoneNumbers[zoneNumbers.length - 1];
    return first === last ? `${first}` : `${first}–${last}`;
}

/**
 * Build one part node of the Body Locations tree, summing natural and worn
 * protection per aspect for each of its locations.
 *
 * @param part - The body part with its locations' base/armor values.
 * @returns The part with per-location totals, in input order.
 */
function buildBodyPartNode(part: BodyPartLike): BodyPartNode {
    return {
        shortcode: part.shortcode,
        index: part.index,
        label: part.label,
        role: part.role,
        locations: part.locations.map((loc) => ({
            shortcode: loc.shortcode,
            name: loc.name,
            layers: loc.layers,
            blunt: loc.base.blunt + loc.armor.blunt,
            edged: loc.base.edged + loc.armor.edged,
            piercing: loc.base.piercing + loc.armor.piercing,
            fire: loc.base.fire + loc.armor.fire,
            shock: loc.shock,
            impair: loc.impair,
        })),
    };
}

/* -------------------------------------------- */
/*  Held items                                   */
/* -------------------------------------------- */

/** An option in a body part's "Item Held" dropdown. */
export interface HoldableOption {
    /** The gear item's id (the option value). */
    id: string;
    /** The gear item's display name. */
    name: string;
}

/**
 * Build the list of gear items a body part may hold: only items whose kind is
 * in `holdableKinds` **and** that are not stowed inside a container (you cannot
 * grip a weapon sitting in a bag). Order is preserved.
 *
 * @param gear - Candidate gear items (typically the actor's weapons + misc gear).
 * @param getKind - Resolves an item's kind.
 * @param getContainerId - Resolves the container id an item is stowed in (empty/undefined = loose).
 * @param holdableKinds - The kinds eligible to be held.
 * @returns The holdable options, in input order.
 */
export function buildHoldableGear<T extends HoldableOption>(
    gear: readonly T[],
    getKind: (item: T) => string,
    getContainerId: (item: T) => string | null | undefined,
    holdableKinds: ReadonlySet<string>,
): HoldableOption[] {
    return gear
        .filter(
            (item) => holdableKinds.has(getKind(item)) && !getContainerId(item),
        )
        .map((item) => ({ id: item.id, name: item.name }));
}

/* -------------------------------------------- */
/*  Affiliations                                 */
/* -------------------------------------------- */

/** A single affiliation row as consumed by the profile template. */
export interface AffiliationRow {
    /** The affiliation item id. */
    id: string;
    /** The affiliation item uuid. */
    uuid: string;
    /** The affiliation's display name. */
    name: string;
    /** Standing/rank within the organization. */
    level: number;
    /** Subdivision or branch of the organization. */
    society: string | null;
    /** Specific position held within the organization. */
    office: string | null;
    /** Formal title granted by the organization. */
    title: string;
    /** Notes, reduced to a plain-text snippet for the table cell. */
    notes: string;
}

/** The minimal shape an affiliation must expose to be rendered. */
export interface AffiliationLike {
    id: string;
    uuid: string;
    name: string;
    level: number;
    society: string | null;
    office: string | null;
    title: string;
    notes: string;
}

/**
 * Reduce an HTML string to a trimmed, single-line plain-text snippet: strip
 * tags, unescape the handful of entities Foundry's editor emits, and collapse
 * whitespace. Keeps the rich-text `notes` field legible in a narrow table cell.
 *
 * @param html - The (possibly HTML) notes string.
 * @returns The plain-text snippet.
 */
export function htmlToPlainText(html: string): string {
    return (html ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#(?:39|x27);/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Build the affiliation rows for the profile Affiliations section, in the
 * supplied order. Each row carries the display fields plus a plain-text `notes`
 * snippet (see {@link htmlToPlainText}) so rich-text notes render cleanly in the
 * table. Pure — no Foundry dependency.
 *
 * @param affiliations - The affiliation items, in display order.
 * @returns The affiliation rows.
 */
export function buildAffiliationRows(
    affiliations: readonly AffiliationLike[],
): AffiliationRow[] {
    return affiliations.map((aff) => ({
        id: aff.id,
        uuid: aff.uuid,
        name: aff.name,
        level: aff.level,
        society: aff.society,
        office: aff.office,
        title: aff.title,
        notes: htmlToPlainText(aff.notes),
    }));
}

/* -------------------------------------------- */
/*  Skill groups                                 */
/* -------------------------------------------- */

/** A single skill row as consumed by the skills template. */
export interface SkillRow {
    /** The skill item id. */
    id: string;
    /** The skill item uuid. */
    uuid: string;
    /** The skill's display name. */
    name: string;
    /** The skill's icon image path, shown before the name (#508). */
    img: string;
    /** Skill Base — the derived attribute-driven base score. */
    sb: number;
    /**
     * Whether the Skill-Base formula is valid. `false` → the SB cell renders an
     * ✕ (a malformed / non-numeric expression) instead of {@link sb} (#972).
     */
    sbValid: boolean;
    /** Mastery Level — the base mastery level. */
    ml: number;
    /** The mastery-level index (a coarse band derived from the ML). */
    index: number;
    /** Effective Mastery Level — the ML after modifiers. */
    eml: number;
    /** Fate Mastery Level — the effective fate ML. */
    fate: number;
    /**
     * The EML modifier delta summary — the mastery-level `ValueModifier`'s
     * `deltaLabel` (e.g. `STR +2, ARM ×2`), shown as the EML cell's hover
     * tooltip (#769). Empty when the mastery level has no deltas to explain
     * (its effective value is just the base).
     */
    emlDeltaLabel: string;
    /**
     * The Fate modifier delta summary — the fate `ValueModifier`'s `deltaLabel`,
     * shown as the Fate cell's hover tooltip (#769). Empty when there is nothing
     * to explain.
     */
    fateDeltaLabel: string;
    /** Whether the mastery level is disabled (renders an ✕ in place of numbers). */
    disabled: boolean;
    /** Whether the skill is currently eligible for Skill Development. */
    canImprove: boolean;
    /** Whether the skill is flagged for improvement (the SDR star). */
    improveFlag: boolean;
    /** Plain-text notes snippet shown in the Notes column. */
    notes: string;
}

/** A subtype-labeled group of skills, ready to render. */
export interface SkillGroup {
    /** The subtype key (e.g. `"social"`), used to seed new items. */
    subType: string;
    /** Localized subtype label shown in the group legend. */
    label: string;
    /** The skills in this group, in the order supplied. */
    skills: SkillRow[];
}

/** The minimal shape a skill must expose to be grouped for display. */
export interface SkillLike {
    id: string;
    uuid: string;
    name: string;
    img: string;
    subType: string | undefined;
    sb: number;
    sbValid: boolean;
    ml: number;
    index: number;
    eml: number;
    fate: number;
    emlDeltaLabel: string;
    fateDeltaLabel: string;
    disabled: boolean;
    canImprove: boolean;
    improveFlag: boolean;
    notes: string;
}

/**
 * The canonical display order of skill subtypes on the Being sheet's Skills tab.
 *
 * The order pins each subtype's display position; the template renders only the
 * subtypes that have skills (the redesign's present-only pattern, shared across
 * every Being tab), so each *populated* subtype section carries its own "+ Add"
 * control and empty subtypes are hidden. `combattechnique` (a
 * `combattechnique`-subtype skill) keeps a defined position here so its section
 * sorts stably when a being has combat techniques; a being with none creates its
 * first via the tab's global "Add Skill" footer, which opens the subtype picker
 * (issue #797 retired the always-visible empty Combat Technique section that
 * #714 added). The `mystical` subtype is intentionally absent — those skills
 * surface on the Mysteries tab.
 */
export const SKILL_DISPLAY_SUBTYPE_ORDER: readonly string[] = [
    SKILL_SUBTYPE.SOCIAL,
    SKILL_SUBTYPE.NATURE,
    SKILL_SUBTYPE.CRAFT,
    SKILL_SUBTYPE.LORE,
    SKILL_SUBTYPE.LANGUAGE,
    SKILL_SUBTYPE.SCRIPT,
    SKILL_SUBTYPE.COMBATTECHNIQUE,
];

/**
 * Build the ordered, subtype-labeled skill groups for the Skills tab. Every
 * subtype in `order` (the display subtype order) is emitted — including empty
 * ones — so the template can decide (via `{{#if group.skills.length}}`) which to
 * show; only populated subtypes render, each carrying its own "+ Add" control.
 * Subtypes present on skills but absent from `order` are appended after the
 * ordered ones, in first-seen order, so nothing is silently dropped.
 *
 * Labels are resolved through the supplied callback so this stays Foundry-free
 * (the sheet passes a `game.i18n`-backed resolver).
 *
 * @param skills - The skills to group, in display order.
 * @param order - The subtype keys in their canonical display order.
 * @param subTypeLabel - Resolves a subtype key to its display label.
 * @returns The ordered skill groups.
 */
export function buildSkillGroups(
    skills: readonly SkillLike[],
    order: readonly string[],
    subTypeLabel: (subType: string) => string,
): SkillGroup[] {
    const buckets = groupBySubType(skills, (skill) => skill.subType);
    const toRow = (skill: SkillLike): SkillRow => ({
        id: skill.id,
        uuid: skill.uuid,
        name: skill.name,
        img: skill.img,
        sb: skill.sb,
        sbValid: skill.sbValid,
        ml: skill.ml,
        index: skill.index,
        eml: skill.eml,
        fate: skill.fate,
        emlDeltaLabel: skill.emlDeltaLabel,
        fateDeltaLabel: skill.fateDeltaLabel,
        disabled: skill.disabled,
        canImprove: skill.canImprove,
        improveFlag: skill.improveFlag,
        notes: skill.notes,
    });

    const seen = new Set<string>();
    const groups: SkillGroup[] = [];
    for (const subType of order) {
        const bucket = buckets[subType];
        seen.add(subType);
        groups.push({
            subType,
            label: subTypeLabel(subType),
            skills: (bucket ?? []).map(toRow),
        });
    }
    for (const [subType, bucket] of Object.entries(buckets)) {
        if (seen.has(subType) || !bucket.length) continue;
        groups.push({
            subType,
            label: subTypeLabel(subType),
            skills: bucket.map(toRow),
        });
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

/** A minimal gear reference for planning a container move. */
export interface GearContainerRef {
    /** The gear item's id. */
    id: string;
    /** The id of the container it currently sits in, if any. */
    containerId?: string | null;
}

/** The outcome of {@link resolveGearContainerMove}. */
export interface GearContainerMove {
    /** Whether the move is permitted (`false` → an illegal self/cycle drop). */
    allowed: boolean;
    /** Whether the destination differs from the item's current container. */
    changed: boolean;
    /** The destination container id, or `undefined` for the "On Body" list. */
    containerId: string | undefined;
}

/**
 * Decide whether a gear item may move into a destination container, and whether
 * that changes its current container. Rejects dropping a container into itself
 * or into any of its own descendants, either of which would form a containment
 * cycle. Containment is by reference (`system.containerId`), so "On Body" is the
 * absence of a container — an empty, `null`, or `undefined` destination.
 *
 * @param droppedId - The id of the gear item being moved.
 * @param destContainerId - The destination container id; empty/`null`/`undefined` means "On Body".
 * @param gear - Every gear item on the actor, each with its current `containerId`.
 * @returns Whether the move is allowed, whether it changes the container, and the normalized destination.
 */
export function resolveGearContainerMove(
    droppedId: string,
    destContainerId: string | null | undefined,
    gear: readonly GearContainerRef[],
): GearContainerMove {
    const norm = (id: string | null | undefined): string | undefined =>
        id || undefined;
    const dest = norm(destContainerId);
    const current = norm(gear.find((g) => g.id === droppedId)?.containerId);

    // Dropping an item onto itself is never a valid container.
    if (dest === droppedId) {
        return { allowed: false, changed: false, containerId: current };
    }

    // Dropping a container into one of its own descendants would form a cycle:
    // walk the destination's ancestor chain and reject if it reaches the dropped
    // item. The `seen` set also guards against a pre-existing corrupt cycle.
    if (dest) {
        const parentOf = new Map(
            gear.map((g) => [g.id, norm(g.containerId)] as const),
        );
        const seen = new Set<string>();
        let cursor: string | undefined = dest;
        while (cursor && !seen.has(cursor)) {
            if (cursor === droppedId) {
                return { allowed: false, changed: false, containerId: current };
            }
            seen.add(cursor);
            cursor = parentOf.get(cursor);
        }
    }

    return { allowed: true, changed: current !== dest, containerId: dest };
}

/* -------------------------------------------- */
/*  Header: status pills, lozenges, health       */
/* -------------------------------------------- */

/** A header status pill: its id, labels, active state, and how it is driven. */
export interface StatusPill {
    /**
     * For a toggleable pill, the registered status-effect id (e.g. Foundry's
     * `stun`); for an indicator, the affliction subtype (`auralshock`/`fatigue`).
     */
    id: string;
    /** Short label rendered on the pill. */
    abbr: string;
    /** Tooltip label. */
    label: string;
    /** Whether the pill is currently lit (status active, or trauma present). */
    active: boolean;
    /**
     * `true` → clicking the pill toggles the corresponding ActiveEffect status;
     * `false` → a read-only indicator lit from an active trauma subtype
     * (Aural-Shock / Fatigue), which are modeled as traumas rather than
     * toggleable statuses (#306).
     */
    toggleable: boolean;
}

/**
 * The fixed roster of header status pills, in display order. Six are toggleable
 * ActiveEffect statuses (`id` must match a registered status — Foundry's id is
 * `stun`, not `stunned`); Aural-Shock and Fatigue are read-only indicators lit
 * from the matching trauma subtype (they are modeled as traumas, and Fatigue is
 * not a `STATUS_EFFECT`). `abbr` is the short label rendered, `label` is the
 * tooltip.
 */
const STATUS_PILL_DEFS: readonly Omit<StatusPill, "active">[] = [
    // `abbr` / `label` are localization KEYS (localized in the header template),
    // not literals, so the pill text and its tooltip are translatable.
    {
        id: TRAUMA_SUBTYPE.AURALSHOCK,
        abbr: "SOHL.Being.StatusPill.auralShock.abbr",
        label: "SOHL.Being.StatusPill.auralShock.label",
        toggleable: false,
    },
    {
        id: STATUS_EFFECT.SLEEP,
        abbr: "SOHL.Being.StatusPill.sleep.abbr",
        label: "SOHL.Being.StatusPill.sleep.label",
        toggleable: true,
    },
    {
        id: STATUS_EFFECT.PRONE,
        abbr: "SOHL.Being.StatusPill.prone.abbr",
        label: "SOHL.Being.StatusPill.prone.label",
        toggleable: true,
    },
    // Row layout (4-col grid): top row ends with Fatigue, bottom row starts with
    // Stun, so FTG precedes STN here.
    {
        id: TRAUMA_SUBTYPE.FATIGUE,
        abbr: "SOHL.Being.StatusPill.fatigue.abbr",
        label: "SOHL.Being.StatusPill.fatigue.label",
        toggleable: false,
    },
    {
        id: STATUS_EFFECT.STUN,
        abbr: "SOHL.Being.StatusPill.stun.abbr",
        label: "SOHL.Being.StatusPill.stun.label",
        toggleable: true,
    },
    {
        id: STATUS_EFFECT.INCAPACITATED,
        abbr: "SOHL.Being.StatusPill.incapacitated.abbr",
        label: "SOHL.Being.StatusPill.incapacitated.label",
        toggleable: true,
    },
    {
        id: STATUS_EFFECT.UNCONSCIOUS,
        abbr: "SOHL.Being.StatusPill.unconscious.abbr",
        label: "SOHL.Being.StatusPill.unconscious.label",
        toggleable: true,
    },
    {
        id: STATUS_EFFECT.DEAD,
        abbr: "SOHL.Being.StatusPill.dead.abbr",
        label: "SOHL.Being.StatusPill.dead.label",
        toggleable: true,
    },
];

/**
 * Build the header status pills in display order. A toggleable pill is lit when
 * its status id is in `activeStatusIds`; an indicator (Aural-Shock / Fatigue) is
 * lit when its trauma subtype is in `activeTraumaSubTypes`.
 *
 * @param activeStatusIds - The status ids currently active on the actor.
 * @param activeTraumaSubTypes - The subtypes of the actor's active traumas.
 * @returns The status pills, in display order.
 */
export function buildStatusPills(
    activeStatusIds: ReadonlySet<string>,
    activeTraumaSubTypes: ReadonlySet<string> = new Set(),
): StatusPill[] {
    return STATUS_PILL_DEFS.map((def) => ({
        ...def,
        active:
            def.toggleable ?
                activeStatusIds.has(def.id)
            :   activeTraumaSubTypes.has(def.id),
    }));
}

/** A read-only body-part lozenge, with its derived impairment status (#464). */
export interface BodyPartLozenge {
    /** The body-part shortcode (stable identity). */
    shortcode: string;
    /** Display name of the part (falls back to the shortcode). */
    name: string;
    /** Impairment display status driving the grid color (none/minor/major/unusable). */
    status: BodyPartStatus;
}

/**
 * Build the body-part lozenges from a being's body structure, deriving each
 * part's impairment status from the actor's active injuries (#464). A part takes
 * the most serious injury across its hit locations (see {@link bodyPartImpairment}).
 *
 * @param structure - The being's body structure, or `undefined`.
 * @param injuries - Active injuries by location; empty for an uninjured actor.
 * @returns One lozenge per body part, or an empty array when none.
 */
export function buildBodyPartLozenges(
    structure:
        | {
              parts?: readonly {
                  shortcode: string;
                  name?: string;
                  permanentImpairment?: number;
                  permanentlyUnusable?: boolean;
                  locations?: readonly { shortcode: string }[];
              }[];
          }
        | undefined,
    injuries: readonly LocationInjury[] = [],
): BodyPartLozenge[] {
    return (structure?.parts ?? []).map((p) => ({
        shortcode: p.shortcode,
        name: p.name || p.shortcode,
        status: bodyPartImpairment(
            (p.locations ?? []).map((l) => l.shortcode),
            injuries,
            p.permanentImpairment,
            p.permanentlyUnusable,
        ).status,
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

/**
 * Filter a source's strike modes to those usable given how many limbs currently
 * grip it. A weapon strike mode declares the limb count it needs to wield
 * (`minParts`) — a longbow's missile mode is `minParts: 2` because it takes two
 * hands to draw — so a mode whose `minParts` exceeds the holding-limb count is
 * dropped. Intrinsic sources that no limb "holds" (combat-technique skills,
 * signalled by `heldLimbs === null`) keep every mode.
 *
 * Mirrors the availability rule in
 * {@link sohl.document.actor.logic.BeingLogic.availableStrikeModes} so the combat-tab
 * listing and the roll-time usable-mode set agree (#836).
 *
 * @param modes - The source's strike modes.
 * @param heldLimbs - Number of limbs gripping the source, or `null` for an
 *   intrinsic source (always available).
 * @returns The subset of modes usable at this grip.
 */
export function usableHeldStrikeModes<SM extends object>(
    modes: readonly SM[],
    heldLimbs: number | null,
): SM[] {
    if (heldLimbs === null) return [...modes];
    return modes.filter(
        (sm) => ((sm as { minParts?: number }).minParts ?? 1) <= heldLimbs,
    );
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

/**
 * Pre-extracted values for one trauma (injury) item, sourced by the sheet from
 * the item's logic and system data — the Foundry-free surface {@link buildTraumaRows}
 * formats for the Trauma tab's injuries list.
 */
export interface TraumaLike {
    id: string;
    uuid: string;
    name: string;
    img: string;
    /** Trauma subtype key (e.g. `"injury"`), used to group into injury sections. */
    subType: string | undefined;
    /** Effective severity level (0 or below ⇒ healed). */
    level: number;
    /** Severity (level) modifier derivation summary for the hover tooltip (#769). */
    severityDeltaLabel: string;
    /** Effective healing rate. */
    healingRate: number;
    /** Whether the healing rate is disabled (no natural recovery). */
    healingRateDisabled: boolean;
    /** Healing-rate modifier derivation summary for the hover tooltip (#769). */
    healingRateDeltaLabel: string;
    isTreated: boolean;
    isBleeding: boolean;
    /** Impact-aspect enum value (e.g. `"blunt"`). */
    aspect: string;
    /** Resolved body-location name, or `undefined` for a whole-body trauma. */
    area: string | undefined;
    /**
     * Localized sub-category display (#939): the FATIGUE / PSYCOND / PHYSCOND
     * category label, or — for FEAR / MORALE — the named severity level. The
     * sheet resolves the sub-type-specific choice; blank when not applicable.
     */
    categoryDisplay: string;
    /**
     * Pre-formatted next recovery/heal/course test date (#939), or an em-dash
     * when none is scheduled. Derived from
     * {@link sohl.document.item.logic.TraumaLogic.nextRecoveryTestAt} and
     * formatted by the sheet.
     */
    nextTest: string;
    /** Raw notes HTML. */
    notes: string;
}

/** A formatted trauma row for the injuries list. */
export interface TraumaRow {
    id: string;
    uuid: string;
    name: string;
    img: string;
    /** True when the trauma has healed (level ≤ 0); the list shows an icon. */
    healed: boolean;
    /** Effective severity level, as a number — rendered by the `level` column (#939). */
    level: number;
    /** Severity band label (`M1`, `S2`, `S3`, `G4`, `G5`); empty when healed. */
    severity: string;
    /** Severity (level) modifier derivation summary for the hover tooltip (#769). */
    severityDeltaLabel: string;
    healingRate: number;
    healingRateDisabled: boolean;
    /** Healing-rate modifier derivation summary for the hover tooltip (#769). */
    healingRateDeltaLabel: string;
    isTreated: boolean;
    isBleeding: boolean;
    /** Localized impact-aspect label. */
    aspect: string;
    /** Body-location name, or `"—"` when whole-body. */
    area: string;
    /** Localized sub-category (or named level) display (#939). */
    categoryDisplay: string;
    /** Pre-formatted next-test date, or an em-dash when unscheduled (#939). */
    nextTest: string;
    /** Plain-text notes (HTML stripped). */
    notes: string;
}

/**
 * Format a trauma severity level as its band label: `M1` (minor), `S2`/`S3`
 * (serious), `G4`/`G5` (grievous) — the band letter by level, suffixed with the
 * level number, matching the SoHL injury scale.
 *
 * @param level - The effective severity level.
 * @returns The band label (e.g. `"S2"`).
 */
export function traumaSeverityLabel(level: number): string {
    const band =
        level <= 1 ? "M"
        : level <= 3 ? "S"
        : "G";
    return `${band}${level}`;
}

/**
 * What a Trauma ledger cell renders (#939) — selects the row field and the
 * cell markup: `category` / `area` / `notes` / `nextTest` are text, `level`
 * (FL / PSL / PSY / ASL) is the numeric level modifier, `severity` is the
 * banded injury level (with a healed icon), and `hr` is the healing rate (with
 * an untreated marker).
 */
export type TraumaColumnKind =
    | "category"
    | "level"
    | "severity"
    | "hr"
    | "area"
    | "notes"
    | "nextTest";

/** One column in a Trauma sub-type's Being-sheet ledger (#939). */
export interface TraumaColumn {
    /** Which row field this column renders and how. */
    kind: TraumaColumnKind;
    /** Localization key for the column header label. */
    labelKey: string;
    /** Optional localization key for the header tooltip (spells out an abbreviation). */
    tooltipKey?: string;
    /** CSS grid track width — a single token (no internal spaces). */
    width: string;
    /** Optional header cell class (e.g. `ledger__head-num` for numeric columns). */
    headClass?: string;
}

const col = (
    kind: TraumaColumnKind,
    labelKey: string,
    width: string,
    opts: { tooltipKey?: string; headClass?: string } = {},
): TraumaColumn => ({ kind, labelKey, width, ...opts });

// Shared, sub-type-agnostic columns.
const CATEGORY = col(
    "category",
    "SOHL.Trauma.COLUMN.category",
    "minmax(64px,1fr)",
);
const NOTES = col("notes", "SOHL.Trauma.COLUMN.notes", "minmax(90px,1.4fr)");
const AREA = col("area", "SOHL.Trauma.COLUMN.area", "minmax(64px,1fr)");
const SEV = col("severity", "SOHL.Trauma.COLUMN.sev", "2.8rem", {
    tooltipKey: "SOHL.Trauma.COLTIP.sev",
    headClass: "ledger__head-num",
});
const HR = col("hr", "SOHL.Trauma.COLUMN.hr", "3.4rem", {
    tooltipKey: "SOHL.Trauma.COLTIP.hr",
    headClass: "ledger__head-num",
});
// A "level" column renders the level modifier under a sub-type-specific header
// (FL / PSL / PSY / ASL), so each carries its own label + tooltip.
const levelCol = (labelKey: string, tooltipKey: string): TraumaColumn =>
    col("level", labelKey, "3rem", {
        tooltipKey,
        headClass: "ledger__head-num",
    });
const nextCol = (labelKey: string): TraumaColumn =>
    col("nextTest", labelKey, "minmax(104px,1.2fr)");

/**
 * The ordered column set each Trauma sub-type shows on the Being sheet (#939),
 * keyed by `TRAUMA_SUBTYPE` value. The name/grip/icon lead and the controls
 * trail are fixed (see {@link traumaLedgerCols}); these are the variable middle
 * columns. Every `level` column renders the level
 * {@link sohl.entity.modifier.ValueModifier}.
 */
export const TRAUMA_SUBTYPE_COLUMNS: Record<string, TraumaColumn[]> = {
    [TRAUMA_SUBTYPE.FATIGUE]: [
        CATEGORY,
        levelCol("SOHL.Trauma.COLUMN.fl", "SOHL.Trauma.COLTIP.fl"),
        NOTES,
    ],
    [TRAUMA_SUBTYPE.FEAR]: [CATEGORY, NOTES],
    [TRAUMA_SUBTYPE.MORALE]: [CATEGORY, NOTES],
    [TRAUMA_SUBTYPE.PALL]: [
        levelCol("SOHL.Trauma.COLUMN.psl", "SOHL.Trauma.COLTIP.psl"),
        nextCol("SOHL.Trauma.COLUMN.nextPall"),
    ],
    [TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION]: [
        levelCol("SOHL.Trauma.COLUMN.psy", "SOHL.Trauma.COLTIP.psy"),
        CATEGORY,
        nextCol("SOHL.Trauma.COLUMN.nextPsyche"),
    ],
    [TRAUMA_SUBTYPE.PHYSICAL_CONDITION]: [CATEGORY, NOTES],
    [TRAUMA_SUBTYPE.AURALSHOCK]: [
        levelCol("SOHL.Trauma.COLUMN.asl", "SOHL.Trauma.COLTIP.asl"),
        nextCol("SOHL.Trauma.COLUMN.nextAural"),
    ],
    [TRAUMA_SUBTYPE.INFECTION]: [
        SEV,
        HR,
        AREA,
        nextCol("SOHL.Trauma.COLUMN.nextHeal"),
    ],
    [TRAUMA_SUBTYPE.INJURY]: [
        SEV,
        HR,
        AREA,
        nextCol("SOHL.Trauma.COLUMN.nextHeal"),
    ],
    [TRAUMA_SUBTYPE.SHOCK]: [HR, nextCol("SOHL.Trauma.COLUMN.nextCourse")],
    [TRAUMA_SUBTYPE.COMA]: [HR, nextCol("SOHL.Trauma.COLUMN.nextCourse")],
};

/**
 * Fallback columns for a Trauma sub-type not covered by
 * {@link TRAUMA_SUBTYPE_COLUMNS} — defensive only (the sub-type set is closed),
 * chosen to never brick the sheet render. Mirrors the injury column set.
 */
const DEFAULT_TRAUMA_COLUMNS = TRAUMA_SUBTYPE_COLUMNS[TRAUMA_SUBTYPE.INJURY];

// Fixed grid tracks framing every Trauma ledger: grip, icon, name … controls.
const TRAUMA_LEDGER_LEAD = ["1.2rem", "1.5rem", "minmax(90px,1.4fr)"] as const;
const TRAUMA_LEDGER_TRAIL = "1.6rem";

/**
 * The CSS `--ledger-cols` grid-template value for a Trauma sub-type's ledger
 * (#939): the fixed grip / icon / name lead, then each column's width, then the
 * controls trail. Widths are single tokens, so the returned string has
 * `3 + columns.length + 1` space-separated tracks.
 *
 * @param columns - The sub-type's variable columns.
 * @returns The space-joined grid-template track list.
 */
export function traumaLedgerCols(columns: readonly TraumaColumn[]): string {
    return [
        ...TRAUMA_LEDGER_LEAD,
        ...columns.map((c) => c.width),
        TRAUMA_LEDGER_TRAIL,
    ].join(" ");
}

/** Which row field a Mystical Ability ledger column renders (#990). */
export type MysticalAbilityColumnKind =
    | "skill"
    | "level"
    | "eml"
    | "charges"
    | "notes";

/** One column in a Mystical Ability sub-type's Being-sheet ledger (#990). */
export interface MysticalAbilityColumn {
    /** Which row field this column renders and how. */
    kind: MysticalAbilityColumnKind;
    /** Localization key for the column header label. */
    labelKey: string;
    /** Optional localization key for the header tooltip (spells out an abbreviation). */
    tooltipKey?: string;
    /** CSS grid track width — a single token (no internal spaces). */
    width: string;
    /** Optional header cell class (e.g. `ledger__head-num` for numeric columns). */
    headClass?: string;
}

const maCol = (
    kind: MysticalAbilityColumnKind,
    labelKey: string,
    width: string,
    opts: { tooltipKey?: string; headClass?: string } = {},
): MysticalAbilityColumn => ({ kind, labelKey, width, ...opts });

// The shared Mystical Ability columns. skill/level are the variable middle
// columns; eml/charges/notes appear for every sub-type. EML reuses the Skill
// heading keys, since an ability's EML is rolled exactly like a skill's.
const MA_SKILL = maCol("skill", "SOHL.MysticalAbility.COLUMN.skill", "5.4rem");
// Spirit-power subtypes (shamanicrite / spiritaction) label the same assoc
// column "Spirit Power" — the reference is a SPIRITPOWER ability, not a skill.
const MA_SPIRITPOWER = maCol(
    "skill",
    "SOHL.MysticalAbility.COLUMN.spiritpower",
    "5.4rem",
);
const MA_LEVEL = maCol("level", "SOHL.MysticalAbility.COLUMN.lvl", "2.6rem", {
    tooltipKey: "SOHL.MysticalAbility.COLTIP.lvl",
    headClass: "ledger__head-num",
});
const MA_EML = maCol(
    "eml",
    "SOHL.Skill.Heading.EffectiveMasteryLevel.label",
    "3.4rem",
    {
        tooltipKey: "SOHL.Skill.Heading.EffectiveMasteryLevel.tooltip",
        headClass: "ledger__head-num",
    },
);
const MA_CHARGES = maCol(
    "charges",
    "SOHL.MysticalAbility.COLUMN.charges",
    "4rem",
    {
        tooltipKey: "SOHL.MysticalAbility.COLTIP.charges",
        headClass: "ledger__head-num",
    },
);
const MA_NOTES = maCol(
    "notes",
    "SOHL.MysticalAbility.COLUMN.notes",
    "minmax(90px,1.4fr)",
);

/**
 * The ordered column set each Mystical Ability sub-type shows on the Being
 * sheet (#990), keyed by `MYSTICALABILITY_SUBTYPE` value. `Ability` (name) is
 * the fixed lead and the controls are the fixed trail (see
 * {@link mysticalAbilityLedgerCols}); these are the variable middle columns.
 * `eml` / `charges` / `notes` appear for every sub-type; `skill` is dropped for
 * the intrinsic talents (they have no associated skill) and `level` only shows
 * where the sub-type has a meaningful power level.
 */
export const MYSTICALABILITY_SUBTYPE_COLUMNS: Record<
    string,
    MysticalAbilityColumn[]
> = {
    [MYSTICALABILITY_SUBTYPE.SHAMANICRITE]: [
        MA_SPIRITPOWER,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.SPIRITACTION]: [
        MA_SPIRITPOWER,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.SPIRITPOWER]: [
        MA_SKILL,
        MA_LEVEL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.BENEDICTION]: [
        MA_SKILL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.RITUALACTION]: [
        MA_SKILL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.DIVINEINCANTATION]: [
        MA_SKILL,
        MA_LEVEL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.ARCANEINCANTATION]: [
        MA_SKILL,
        MA_LEVEL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.ARCANETALENT]: [
        MA_LEVEL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.SPIRITTALENT]: [
        MA_LEVEL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
    [MYSTICALABILITY_SUBTYPE.ALCHEMY]: [MA_SKILL, MA_EML, MA_CHARGES, MA_NOTES],
    [MYSTICALABILITY_SUBTYPE.DIVINATION]: [
        MA_SKILL,
        MA_EML,
        MA_CHARGES,
        MA_NOTES,
    ],
};

/**
 * Fallback columns for a Mystical Ability sub-type not covered by
 * {@link MYSTICALABILITY_SUBTYPE_COLUMNS} — defensive only (the sub-type set is
 * closed), chosen to never brick the sheet render (the full column set).
 */
const DEFAULT_MYSTICALABILITY_COLUMNS = [
    MA_SKILL,
    MA_LEVEL,
    MA_EML,
    MA_CHARGES,
    MA_NOTES,
];

/**
 * The ordered column set for a Mystical Ability sub-type, falling back to the
 * full set for an unknown sub-type (defensive).
 *
 * @param subType - A `MYSTICALABILITY_SUBTYPE` value.
 * @returns The columns to render for that sub-type.
 */
export function mysticalAbilityColumns(
    subType: string,
): MysticalAbilityColumn[] {
    return (
        MYSTICALABILITY_SUBTYPE_COLUMNS[subType] ??
        DEFAULT_MYSTICALABILITY_COLUMNS
    );
}

// Fixed grid tracks framing every Mystical Ability ledger: icon, name … controls.
const MA_LEDGER_LEAD = ["1.5rem", "minmax(140px,1.3fr)"] as const;
const MA_LEDGER_TRAIL = "2.8rem";

/**
 * The CSS `--ledger-cols` grid-template value for a Mystical Ability sub-type's
 * ledger (#990): the fixed icon / name lead, then each column's width, then the
 * controls trail. Widths are single tokens, so the returned string has
 * `2 + columns.length + 1` space-separated tracks.
 *
 * @param columns - The sub-type's variable columns.
 * @returns The space-joined grid-template track list.
 */
export function mysticalAbilityLedgerCols(
    columns: readonly MysticalAbilityColumn[],
): string {
    return [
        ...MA_LEDGER_LEAD,
        ...columns.map((c) => c.width),
        MA_LEDGER_TRAIL,
    ].join(" ");
}

/**
 * Build compact display rows for the Trauma tab's injuries list — computing the
 * severity band label, localizing the impact aspect, defaulting the body
 * location, and reducing notes to plain text.
 *
 * @param traumas - The pre-extracted trauma values.
 * @param aspectLabel - Localizer mapping an aspect enum value to its label.
 * @returns The formatted trauma rows, in input order.
 */
export function buildTraumaRows(
    traumas: readonly TraumaLike[],
    aspectLabel: (aspect: string) => string,
): TraumaRow[] {
    return traumas.map((t) => ({
        id: t.id,
        uuid: t.uuid,
        name: t.name,
        img: t.img,
        healed: t.level <= 0,
        level: t.level,
        severity: t.level <= 0 ? "" : traumaSeverityLabel(t.level),
        severityDeltaLabel: t.severityDeltaLabel,
        healingRate: t.healingRate,
        healingRateDisabled: t.healingRateDisabled,
        healingRateDeltaLabel: t.healingRateDeltaLabel,
        isTreated: t.isTreated,
        isBleeding: t.isBleeding,
        aspect: aspectLabel(t.aspect),
        area: t.area ?? "—",
        categoryDisplay: t.categoryDisplay,
        nextTest: t.nextTest,
        notes: htmlToPlainText(t.notes),
    }));
}

/** A subtype-labeled section of injuries (traumas), ready to render. */
export interface InjurySection {
    /** The subtype key (e.g. `"injury"`), used to seed new trauma items. */
    subType: string;
    /** Localized subtype label shown in the section legend. */
    label: string;
    /** The injuries in this section, in the order supplied. */
    injuries: TraumaRow[];
    /** The columns this sub-type renders (#939) — headers + per-row cells. */
    columns: TraumaColumn[];
    /** The `--ledger-cols` grid-template value for this sub-type's ledger (#939). */
    ledgerCols: string;
}

/**
 * Build the subtype-labeled injury sections for the Trauma tab's injuries list.
 * **Every** subtype in `order` is emitted — including empty ones — so the
 * template can decide (via `{{#if section.injuries.length}}`) which to show and
 * so each populated subtype carries a stable per-subtype "+ Add" control.
 * Subtypes present on items but absent from `order` are appended after the
 * ordered ones, in first-seen order, so nothing is silently dropped.
 *
 * Grouping happens upstream of {@link buildTraumaRows} (mirroring
 * {@link buildAfflictionGroups}), so each section's rows are formatted exactly
 * as the flat list once was.
 *
 * @param traumas - The pre-extracted trauma values.
 * @param order - The subtype keys in their canonical display order.
 * @param subTypeLabel - Resolves a subtype key to its display label.
 * @param aspectLabel - Localizer mapping an aspect enum value to its label.
 * @returns The injury sections, ordered subtypes first (including empty ones).
 */
export function buildInjurySections(
    traumas: readonly TraumaLike[],
    order: readonly string[],
    subTypeLabel: (subType: string) => string,
    aspectLabel: (aspect: string) => string,
): InjurySection[] {
    const buckets = groupBySubType(traumas, (t) => t.subType);
    const build = (subType: string, bucket: TraumaLike[]): InjurySection => {
        const columns =
            TRAUMA_SUBTYPE_COLUMNS[subType] ?? DEFAULT_TRAUMA_COLUMNS;
        return {
            subType,
            label: subTypeLabel(subType),
            injuries: buildTraumaRows(bucket, aspectLabel),
            columns,
            ledgerCols: traumaLedgerCols(columns),
        };
    };

    const seen = new Set<string>();
    const sections: InjurySection[] = [];
    for (const subType of order) {
        seen.add(subType);
        sections.push(build(subType, buckets[subType] ?? []));
    }
    for (const [subType, bucket] of Object.entries(buckets)) {
        if (seen.has(subType) || !bucket.length) continue;
        sections.push(build(subType, bucket));
    }
    return sections;
}

/**
 * Pre-extracted values for one affliction item, sourced by the sheet from the
 * item's logic and system data — the Foundry-free surface {@link buildAfflictionGroups}
 * groups and formats for the Trauma tab's afflictions list. `level` and `source`
 * arrive already localized (the logic exposes qualitative `levelLabel` /
 * `categoryLabel`).
 */
export interface AfflictionLike {
    id: string;
    uuid: string;
    name: string;
    img: string;
    subType: string | undefined;
    /** Localized qualitative level label. */
    levelLabel: string;
    /** Level modifier derivation summary for the hover tooltip (#769). */
    levelDeltaLabel: string;
    /** Effective healing rate. */
    healingRate: number;
    /** Whether the healing rate is disabled (no natural recovery). */
    healingRateDisabled: boolean;
    /** Healing-rate modifier derivation summary for the hover tooltip (#769). */
    healingRateDeltaLabel: string;
    /** Localized source/category label. */
    source: string;
    /**
     * World time (seconds) of the next course/recovery check, or `null` when
     * none is projectable — rendered calendar-formatted (#943).
     */
    nextHealTest: number | null;
    /** Raw notes HTML. */
    notes: string;
}

/** A formatted affliction row for the afflictions list. */
export interface AfflictionRow {
    id: string;
    uuid: string;
    name: string;
    img: string;
    /** Localized level label. */
    level: string;
    /** Level modifier derivation summary for the hover tooltip (#769). */
    levelDeltaLabel: string;
    healingRate: number;
    healingRateDisabled: boolean;
    /** Healing-rate modifier derivation summary for the hover tooltip (#769). */
    healingRateDeltaLabel: string;
    source: string;
    /**
     * World time (seconds) of the next course/recovery check, or `null` when
     * none is projectable — rendered calendar-formatted (#943).
     */
    nextHealTest: number | null;
    /** Plain-text notes (HTML stripped). */
    notes: string;
}

/** A subtype-labeled group of afflictions, ready to render. */
export interface AfflictionGroup {
    /** The subtype key (e.g. `"fatigue"`), used to seed new items. */
    subType: string;
    /** Localized subtype label shown in the group legend. */
    label: string;
    /** The afflictions in this group. */
    afflictions: AfflictionRow[];
}

/**
 * Build the subtype-labeled affliction groups for the Trauma tab's afflictions
 * list. Only **non-empty** groups are emitted (afflictions are created from a
 * single section control, so empty subtype groups would be noise): ordered
 * groups first — in `order` — then any remaining populated subtypes in first-seen
 * order, so nothing is silently dropped.
 *
 * @param afflictions - The pre-extracted affliction values.
 * @param order - The subtype keys in their canonical display order.
 * @param subTypeLabel - Resolves a subtype key to its display label.
 * @returns The populated affliction groups.
 */
export function buildAfflictionGroups(
    afflictions: readonly AfflictionLike[],
    order: readonly string[],
    subTypeLabel: (subType: string) => string,
): AfflictionGroup[] {
    const buckets = groupBySubType(afflictions, (a) => a.subType);
    const toRow = (a: AfflictionLike): AfflictionRow => ({
        id: a.id,
        uuid: a.uuid,
        name: a.name,
        img: a.img,
        level: a.levelLabel,
        levelDeltaLabel: a.levelDeltaLabel,
        healingRate: a.healingRate,
        healingRateDisabled: a.healingRateDisabled,
        healingRateDeltaLabel: a.healingRateDeltaLabel,
        source: a.source,
        nextHealTest: a.nextHealTest,
        notes: htmlToPlainText(a.notes),
    });

    const seen = new Set<string>();
    const groups: AfflictionGroup[] = [];
    for (const subType of order) {
        seen.add(subType);
        const bucket = buckets[subType];
        if (!bucket?.length) continue;
        groups.push({
            subType,
            label: subTypeLabel(subType),
            afflictions: bucket.map(toRow),
        });
    }
    for (const [subType, bucket] of Object.entries(buckets)) {
        if (seen.has(subType) || !bucket.length) continue;
        groups.push({
            subType,
            label: subTypeLabel(subType),
            afflictions: bucket.map(toRow),
        });
    }
    return groups;
}
