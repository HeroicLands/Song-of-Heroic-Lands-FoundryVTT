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

import { STATUS_EFFECT, AFFLICTION_SUBTYPE } from "@src/utils/constants";
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
/*  Trait groups                                 */
/* -------------------------------------------- */

/** A single trait row as consumed by the profile template. */
export interface TraitRow {
    /** The trait item id. */
    id: string;
    /** The trait item uuid. */
    uuid: string;
    /** The trait's display name. */
    name: string;
    /** Localized intensity label (empty when the trait has no intensity). */
    intensity: string;
    /** The displayed value: numeric mastery level or the free-text value. */
    value: string | number;
    /** Free-text notes. */
    notes: string;
}

/** A subtype-labeled group of traits, ready to render. */
export interface TraitGroup {
    /** The subtype key (e.g. `"physique"`), used to seed new items. */
    subType: string;
    /** Localized subtype label shown in the group legend. */
    label: string;
    /** The traits in this group, in the order supplied. */
    traits: TraitRow[];
}

/** The minimal shape a trait must expose to be grouped for display. */
export interface TraitLike {
    id: string;
    uuid: string;
    name: string;
    subType: string | undefined;
    isNumeric: boolean;
    masteryLevelBase: number;
    textValue: string;
    intensity: string | undefined;
    notes: string;
}

/**
 * Build the ordered, subtype-labeled trait groups for the profile Traits
 * section. Every subtype in `order` (the subtype definition order) is emitted —
 * including empty ones, so each defined subtype always offers its "+ Add"
 * control. Subtypes present on traits but absent from `order` are appended after
 * the ordered ones, in first-seen order, so nothing is silently dropped.
 *
 * Labels are resolved through the supplied callbacks so this stays Foundry-free
 * (the sheet passes `game.i18n`-backed resolvers).
 *
 * @param traits - The traits to group, in display order.
 * @param order - The subtype keys in their canonical display order.
 * @param subTypeLabel - Resolves a subtype key to its display label.
 * @param intensityLabel - Resolves an intensity value to its display label.
 * @returns The ordered trait groups.
 */
export function buildTraitGroups(
    traits: readonly TraitLike[],
    order: readonly string[],
    subTypeLabel: (subType: string) => string,
    intensityLabel: (intensity: string) => string,
): TraitGroup[] {
    const buckets = groupBySubType(traits, (trait) => trait.subType);
    const toRow = (trait: TraitLike): TraitRow => ({
        id: trait.id,
        uuid: trait.uuid,
        name: trait.name,
        intensity: trait.intensity ? intensityLabel(trait.intensity) : "",
        value: trait.isNumeric ? trait.masteryLevelBase : trait.textValue,
        notes: trait.notes,
    });

    const seen = new Set<string>();
    const groups: TraitGroup[] = [];
    for (const subType of order) {
        const bucket = buckets[subType];
        seen.add(subType);
        groups.push({
            subType,
            label: subTypeLabel(subType),
            traits: (bucket ?? []).map(toRow),
        });
    }
    for (const [subType, bucket] of Object.entries(buckets)) {
        if (seen.has(subType) || !bucket.length) continue;
        groups.push({
            subType,
            label: subTypeLabel(subType),
            traits: bucket.map(toRow),
        });
    }
    return groups;
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
    /** The location's display name (e.g. "Skull"). */
    name: string;
    /** Comma-joined covering armor materials (`armorType`), empty when bare. */
    layers: string;
    /** Hit-probability weight. */
    prob: number;
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
    /** The part's display label. */
    label: string;
    /** The name of the item held by this part, or empty. */
    held: string;
    /** The part's hit locations, in order. */
    locations: BodyLocationRow[];
}

/** The minimal per-location shape the tree builder consumes. */
export interface BodyLocationLike {
    name: string;
    layers: string;
    prob: number;
    /** Natural per-aspect protection (a location's `protectionBase`, resolved). */
    base: AspectProtection;
    /** Equipped-armor per-aspect protection (a location's `armorProtection`). */
    armor: AspectProtection;
    shock: number;
    impair: number;
}

/** The minimal per-part shape the tree builder consumes. */
export interface BodyPartLike {
    label: string;
    held: string;
    locations: readonly BodyLocationLike[];
}

/**
 * Build the read-only Body Locations tree for the Combat tab: each body part
 * with its hit locations, and per-location protection totals computed as
 * **natural base + equipped armor** for every aspect (blunt/edged/piercing/fire).
 * The armor contribution comes from the actor's worn armor aggregated onto the
 * body structure (see `aggregateArmor`); natural `protectionBase` is left
 * untouched, so the sum is the effective protection shown per location. Pure —
 * no Foundry dependency.
 *
 * @param parts - The body parts with their locations' base/armor values.
 * @returns The parts with per-location totals, in input order.
 */
export function buildBodyLocationTree(
    parts: readonly BodyPartLike[],
): BodyPartNode[] {
    return parts.map((part) => ({
        label: part.label,
        held: part.held,
        locations: part.locations.map((loc) => ({
            name: loc.name,
            layers: loc.layers,
            prob: loc.prob,
            blunt: loc.base.blunt + loc.armor.blunt,
            edged: loc.base.edged + loc.armor.edged,
            piercing: loc.base.piercing + loc.armor.piercing,
            fire: loc.base.fire + loc.armor.fire,
            shock: loc.shock,
            impair: loc.impair,
        })),
    }));
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
    society: string;
    /** Specific position held within the organization. */
    office: string;
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
    society: string;
    office: string;
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
    /** Mastery Level — the base mastery level. */
    ml: number;
    /** The mastery-level index (a coarse band derived from the ML). */
    index: number;
    /** Effective Mastery Level — the ML after modifiers. */
    eml: number;
    /** Fate Mastery Level — the effective fate ML. */
    fate: number;
    /** Whether the mastery level is disabled (renders an ✕ in place of numbers). */
    disabled: boolean;
    /** Whether the skill is currently eligible for Skill Development. */
    canImprove: boolean;
    /** Whether the skill is flagged for improvement (the SDR star). */
    improveFlag: boolean;
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
    ml: number;
    index: number;
    eml: number;
    fate: number;
    disabled: boolean;
    canImprove: boolean;
    improveFlag: boolean;
}

/**
 * Build the ordered, subtype-labeled skill groups for the Skills tab. Every
 * subtype in `order` (the display subtype order) is emitted — including empty
 * ones, so each defined subtype always offers its "+ Add" control. Subtypes
 * present on skills but absent from `order` are appended after the ordered ones,
 * in first-seen order, so nothing is silently dropped.
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
        ml: skill.ml,
        index: skill.index,
        eml: skill.eml,
        fate: skill.fate,
        disabled: skill.disabled,
        canImprove: skill.canImprove,
        improveFlag: skill.improveFlag,
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
    /** Whether the pill is currently lit (status active, or affliction present). */
    active: boolean;
    /**
     * `true` → clicking the pill toggles the corresponding ActiveEffect status;
     * `false` → a read-only indicator lit from an active affliction subtype
     * (Aural-Shock / Fatigue), which the prototype drove from afflictions rather
     * than toggleable statuses (#306).
     */
    toggleable: boolean;
}

/**
 * The fixed roster of header status pills, in display order. Six are toggleable
 * ActiveEffect statuses (`id` must match a registered status — Foundry's id is
 * `stun`, not `stunned`); Aural-Shock and Fatigue are read-only indicators lit
 * from the matching affliction subtype (the prototype drove them from
 * afflictions, and Fatigue is not a `STATUS_EFFECT`). `abbr` is the short label
 * rendered, `label` is the tooltip.
 */
const STATUS_PILL_DEFS: readonly Omit<StatusPill, "active">[] = [
    {
        id: AFFLICTION_SUBTYPE.AURALSHOCK,
        abbr: "ASHK",
        label: "Aural Shock",
        toggleable: false,
    },
    { id: STATUS_EFFECT.SLEEP, abbr: "SLP", label: "Sleep", toggleable: true },
    { id: STATUS_EFFECT.PRONE, abbr: "PRN", label: "Prone", toggleable: true },
    { id: STATUS_EFFECT.STUN, abbr: "STN", label: "Stun", toggleable: true },
    {
        id: AFFLICTION_SUBTYPE.FATIGUE,
        abbr: "FTG",
        label: "Fatigue",
        toggleable: false,
    },
    {
        id: STATUS_EFFECT.INCAPACITATED,
        abbr: "INC",
        label: "Incapacitated",
        toggleable: true,
    },
    {
        id: STATUS_EFFECT.UNCONSCIOUS,
        abbr: "UNC",
        label: "Unconscious",
        toggleable: true,
    },
    { id: STATUS_EFFECT.DEAD, abbr: "DED", label: "Dead", toggleable: true },
];

/**
 * Build the header status pills in display order. A toggleable pill is lit when
 * its status id is in `activeStatusIds`; an indicator (Aural-Shock / Fatigue) is
 * lit when its affliction subtype is in `activeAfflictionSubTypes`.
 *
 * @param activeStatusIds - The status ids currently active on the actor.
 * @param activeAfflictionSubTypes - The subtypes of the actor's active afflictions.
 * @returns The status pills, in display order.
 */
export function buildStatusPills(
    activeStatusIds: ReadonlySet<string>,
    activeAfflictionSubTypes: ReadonlySet<string> = new Set(),
): StatusPill[] {
    return STATUS_PILL_DEFS.map((def) => ({
        ...def,
        active:
            def.toggleable ?
                activeStatusIds.has(def.id)
            :   activeAfflictionSubTypes.has(def.id),
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
 * Build the body-part lozenges from a corpus body structure, deriving each
 * part's impairment status from the actor's active injuries (#464). A part takes
 * the most serious injury across its hit locations (see {@link bodyPartImpairment}).
 *
 * @param structure - The actor's corpus body structure, or `undefined`.
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
    /** Effective severity level (0 or below ⇒ healed). */
    level: number;
    /** Effective healing rate. */
    healingRate: number;
    /** Whether the healing rate is disabled (no natural recovery). */
    healingRateDisabled: boolean;
    isTreated: boolean;
    isBleeding: boolean;
    /** Impact-aspect enum value (e.g. `"blunt"`). */
    aspect: string;
    /** Resolved body-location name, or `undefined` for a whole-body trauma. */
    area: string | undefined;
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
    /** Severity band label (`M1`, `S2`, `S3`, `G4`, `G5`); empty when healed. */
    severity: string;
    healingRate: number;
    healingRateDisabled: boolean;
    isTreated: boolean;
    isBleeding: boolean;
    /** Localized impact-aspect label. */
    aspect: string;
    /** Body-location name, or `"—"` when whole-body. */
    area: string;
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
        severity: t.level <= 0 ? "" : traumaSeverityLabel(t.level),
        healingRate: t.healingRate,
        healingRateDisabled: t.healingRateDisabled,
        isTreated: t.isTreated,
        isBleeding: t.isBleeding,
        aspect: aspectLabel(t.aspect),
        area: t.area ?? "—",
        notes: htmlToPlainText(t.notes),
    }));
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
    /** Effective healing rate. */
    healingRate: number;
    /** Whether the healing rate is disabled (no natural recovery). */
    healingRateDisabled: boolean;
    /** Localized source/category label. */
    source: string;
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
    healingRate: number;
    healingRateDisabled: boolean;
    source: string;
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
        healingRate: a.healingRate,
        healingRateDisabled: a.healingRateDisabled,
        source: a.source,
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
