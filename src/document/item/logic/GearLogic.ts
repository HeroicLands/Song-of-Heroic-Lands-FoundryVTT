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

import { entity } from "@src/entity/registry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { fvttActorByRef } from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { SohlAction } from "@src/entity/action/SohlAction";
import { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyPartImpairment } from "@src/entity/body/impairment";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";

/**
 * Abstract base logic for all physical gear items — the foundation for
 * {@link ArmorGearLogic}, {@link WeaponGearLogic}, {@link MiscGearLogic},
 * {@link ContainerGearLogic}, {@link ConcoctionGearLogic}, and
 * {@link ProjectileGearLogic}.
 *
 * Gear items represent tangible objects that a character can carry, equip,
 * buy, sell, or trade. All gear shares these tracked properties:
 *
 * - **weight** — Physical weight, modified by enchantments or materials
 * - **value** — Monetary worth in the campaign's currency
 * - **quality** — Craftsmanship level, affecting durability and effectiveness
 * - **durability** — Current structural integrity; damaged gear may break
 *
 * Gear also tracks inventory state: whether it is **carried** (on the character's
 * person). The **worn** state is armor-specific and lives on
 * {@link ArmorGearLogic} as `isWorn`.
 *
 * @typeParam TData - The gear data interface.
 */
export abstract class GearLogic<
    TData extends GearData = GearData,
> extends SohlItemBaseLogic<TData> {
    /** Physical weight as a `ValueModifier`, seeded from {@link GearData.weightBase}. */
    weight!: ValueModifier;
    /** Monetary value as a `ValueModifier`, seeded from {@link GearData.valueBase}. */
    value!: ValueModifier;
    /** Craftsmanship quality as a `ValueModifier`, seeded from {@link GearData.qualityBase}. */
    quality!: ValueModifier;
    /** Structural integrity as a `ValueModifier`, seeded from {@link GearData.durabilityBase}. */
    durability!: ValueModifier;
    /** The containing item's logic, resolved from {@link GearData.containerId}, or `null` when not in a container. */
    containedIn?: GearLogic;

    /**
     * The Cohort actors this gear item is shared with, resolved from
     * {@link GearData.sharedWithCohortIds}.
     *
     * Populated during {@link initialize} by resolving each entry as a cohort
     * **reference** — a `system.shortcode`, a document id, or a UUID (see
     * {@link fvttActorByRef}). Sharing is normally
     * keyed by the cohort's shortcode, the stable key an author writes.
     * References that do not resolve are dropped. This is the inverse of
     * {@link sohl.document.actor.logic.CohortLogic.sharedGear}, which the
     * Cohort sheet's Shared Gear tab renders (issue #76).
     */
    sharedWithCohorts!: SohlActor[];

    /**
     * Body Parts that are holding this gear item
     * @returns An array of BodyParts that are currently holding this item
     */
    get heldBy(): BodyPart[] {
        const bodyParts = getActorBody(this.actorLogic)?.structure?.parts;
        return (
            bodyParts?.filter((part): part is BodyPart => {
                const heldItem = part.heldItem;
                return heldItem !== undefined && heldItem.id === this.id;
            }) ?? []
        );
    }

    /**
     * The derived impairment of the body part(s) currently holding this item —
     * the per-part input to a held-weapon strike mode's impairment gating (#628).
     * A weapon strike mode names its required limbs by count (`minParts`), not by
     * role, so this resolves the *specific* holding limbs (via {@link heldBy}) and
     * scores each through the being's body-part impairment. When any holding limb
     * is unusable, a strike-mode test auto-Critically-Fails; an impaired-but-usable
     * limb penalizes the mode's attack/defense mastery level by −5/−10 (applied at
     * {@link sohl.entity.modifier.MasteryLevelModifier.successTest}).
     *
     * Empty when nothing holds the item (an unheld or natural weapon) or the actor
     * has no body from which to derive per-part impairment.
     *
     * @returns The impairment of each holding part, in {@link heldBy} order.
     */
    get heldLimbImpairments(): BodyPartImpairment[] {
        const being = this.actorLogic as
            | {
                  bodyPartImpairments?: (
                      parts: readonly BodyPart[],
                  ) => BodyPartImpairment[];
              }
            | null
            | undefined;
        return being?.bodyPartImpairments?.(this.heldBy) ?? [];
    }

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a cohort reference to the sharing list.
     * @param cohortId - The cohort reference (shortcode, id, or UUID) to add.
     * @returns An update payload adding the reference, or an empty object if already present.
     */
    addSharedCohortUpdate(cohortId: string): PlainObject {
        const canonical = this.data.sharedWithCohortIds;
        if (canonical.includes(cohortId)) return {};
        return {
            "system.sharedWithCohortIds": [...canonical, cohortId],
        };
    }

    /**
     * Build an `update()` payload that removes a cohort reference from the sharing list.
     * @param cohortId - The cohort reference (shortcode, id, or UUID) to remove.
     * @returns An update payload with the reference filtered out of the sharing list.
     */
    removeSharedCohortUpdate(cohortId: string): PlainObject {
        return {
            "system.sharedWithCohortIds": this.data.sharedWithCohortIds.filter(
                (id) => id !== cohortId,
            ),
        };
    }

    /**
     * Whether this item is on the character's person.
     *
     * Gear that is not carried has been set down — left on the ground, in a
     * cart, or wherever the character parted with it. It still appears on the
     * sheet, but it contributes nothing (no encumbrance, no protection) and
     * cannot be acted with: every gear action except `toggleCarried` is gated
     * on this flag (see {@link gateOnCarried}).
     *
     * @returns `true` when the item is carried.
     */
    get isCarried(): boolean {
        return this.data.isCarried;
    }

    /* --------------------------------------------- */
    /* Carried gate                                  */
    /* --------------------------------------------- */

    /**
     * The {@link sohl.entity.expr.SafeExpression} source that gates a gear
     * action on the item being carried (issue #1097). Composed into each gated
     * action's `trigger` by {@link gateOnCarried} — `trigger` rather than
     * `visible` because an uncarried item's actions must be genuinely
     * *unavailable* (refused by {@link sohl.entity.action.SohlAction.execute},
     * however invoked), not merely hidden from the context menu. Visibility
     * composes with the trigger, so gated actions disappear from the menu too.
     */
    static readonly CARRIED_TRIGGER =
        "defined(itemLogic) && itemLogic.isCarried";

    /**
     * Action shortcodes exempt from the carried gate:
     *
     * - `toggleCarried` — the way back. Gating it would strand an item you set
     *   down, with no action left to pick it up again.
     * - `editDocument` / `deleteDocument` / `outputDescription` — the universal
     *   document actions every item carries. They manage or describe the *item*
     *   rather than doing anything with the *gear*, and you must always be able
     *   to edit, delete, or read out an item you are not carrying.
     */
    static readonly CARRIED_GATE_EXEMPT: readonly string[] = [
        "toggleCarried",
        "editDocument",
        "deleteDocument",
        "outputDescription",
    ];

    /**
     * i18n key stamped onto each carried-gated action as its
     * {@link sohl.entity.action.SohlAction.Data.disabledReason}, so a UI
     * offering the action can say *why* it is refused instead of presenting a
     * control that silently does nothing (issue #1135).
     */
    static readonly CARRIED_DISABLED_REASON = "SOHL.Gear.actionRequiresCarried";

    /**
     * Gate a list of action definitions on the item being carried — the seam
     * every gear logic runs its {@link defineIntrinsicActions} result through.
     *
     * Each definition not named in {@link CARRIED_GATE_EXEMPT} has
     * {@link CARRIED_TRIGGER} conjoined onto its `trigger`, so the action is
     * unavailable while `system.isCarried` is `false`. An author's existing
     * trigger is preserved (parenthesized and `&&`-ed), never replaced.
     *
     * Each gated definition also carries {@link CARRIED_DISABLED_REASON} as its
     * `disabledReason` (unless the author declared one), so a surface that
     * offers the action can explain the refusal (issue #1135).
     *
     * The transform is **idempotent** — a subclass gates the list it already
     * received from its parent's `defineIntrinsicActions()`, so definitions pass
     * through it once per level of the hierarchy — and **non-mutating**: gated
     * definitions are returned as copies.
     *
     * @param defs - The action definitions to gate.
     * @returns The definitions, with the carried gate applied to each
     *   non-exempt entry.
     */
    static gateOnCarried(
        defs: Partial<SohlAction.Data>[],
    ): Partial<SohlAction.Data>[] {
        return defs.map((def) => {
            if (
                !def.shortcode ||
                GearLogic.CARRIED_GATE_EXEMPT.includes(def.shortcode)
            ) {
                return def;
            }
            const existing = def.trigger?.trim();
            // Already gated (this list came from a parent's defineIntrinsicActions).
            if (existing?.includes(GearLogic.CARRIED_TRIGGER)) return def;
            return {
                ...def,
                trigger:
                    existing && existing !== "true" ?
                        `(${existing}) && ${GearLogic.CARRIED_TRIGGER}`
                    :   GearLogic.CARRIED_TRIGGER,
                disabledReason:
                    def.disabledReason ?? GearLogic.CARRIED_DISABLED_REASON,
            };
        });
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Additional `update()` payload applied alongside `system.isCarried: false`
     * when this gear is set down (issue #1097). The base gear has no such
     * state; a gear type carrying an "in use" flag of its own overrides this to
     * clear it, so that state can never outlive the carrying that made it
     * possible — see {@link sohl.document.item.logic.ArmorGearLogic}, which
     * clears `isWorn`.
     *
     * @returns The extra update payload; empty by default.
     */
    protected stowUpdates(): PlainObject {
        return {};
    }

    /**
     * Toggles whether this gear is carried on the character's person.
     *
     * Setting the item down also applies `stowUpdates()`, clearing any
     * derived "in use" state (e.g. worn armor) in the same update — otherwise
     * that state would be stuck, since the action that clears it is itself
     * gated on the item being carried.
     *
     * Intrinsic-action executor for the `toggleCarried` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async toggleCarried(_context: SohlActionContext): Promise<void> {
        const isCarried = !this.data.isCarried;
        await this.data.update({
            "system.isCarried": isCarried,
            ...(isCarried ? {} : this.stowUpdates()),
        });
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     *
     * @remarks
     * Gear subclasses append their own definitions to this list and run the
     * result back through {@link gateOnCarried}, so every gear action beyond
     * {@link CARRIED_GATE_EXEMPT} is unavailable while the item is not carried.
     *
     * @returns The base item actions plus the gear carry toggle.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return GearLogic.gateOnCarried([
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "toggleCarried",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.toggleCarried",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "ginf-knapsack",
                executor: "toggleCarried",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
        ]);
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.weight = new entity.ValueModifier(this).setBase(
            this.data.weightBase,
        );
        this.value = new entity.ValueModifier(this).setBase(
            this.data.valueBase,
        );
        this.quality = new entity.ValueModifier(this).setBase(
            this.data.qualityBase,
        );
        this.durability = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.durabilityBase);
        this.sharedWithCohorts = (this.data.sharedWithCohortIds ?? [])
            .map((ref) => fvttActorByRef(ref) as SohlActor | undefined)
            .filter((a): a is SohlActor => a != null);
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.data.containerId) {
            this.containedIn = this.actorLogic?.allLogics.find(
                (logic) => logic.id === this.data.containerId,
            ) as GearLogic | undefined;
        }
        // Ground-up carried-weight accumulation: contribute this item's
        // weight × quantity to the owning being while it evaluates, so the
        // being's total is complete by the time anything reads it.
        if (
            this.countsAsCarriedWeight &&
            this.actorLogic instanceof BeingLogic
        ) {
            this.actorLogic.carriedWeight.add(
                `${this.data.shortcode}Wt`,
                `${this.name} Weight`,
                this.weight.effective * (this.data.quantity ?? 1),
            );
        }
    }

    /**
     * Whether this gear's weight counts against the owning being's carried
     * weight (and therefore encumbrance). By default, any carried gear does.
     *
     * {@link sohl.document.item.logic.ArmorGearLogic} overrides this so that
     * **worn** armor is excluded — a fitted harness rides the body rather than
     * hanging off it as load, while the same armor carried but not worn counts
     * its full weight like any other cargo (#1009).
     *
     * @returns `true` when this item's weight should be tallied as carried load.
     */
    protected get countsAsCarriedWeight(): boolean {
        return this.data.isCarried;
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

/**
 * @remarks The base shape shared by all gear `system` data; the concrete gear types extend it.
 */
export interface GearData<
    TLogic extends GearLogic<GearData> = GearLogic<any>,
> extends SohlItemData<TLogic> {
    /** Number of this item in the stack */
    quantity: number;
    /** Base weight of a single unit */
    weightBase: number;
    /** Base monetary value in silver pennies */
    valueBase: number;
    /** Whether this item is on the character's person */
    isCarried: boolean;
    /** Craftsmanship quality, generally ranging from 8-12 */
    qualityBase: number;
    /** Structural integrity rating */
    durabilityBase: number;
    /** References (shortcode, id, or UUID) of the Cohort actors this gear is shared with */
    sharedWithCohortIds: string[];
    /** The container this item is contained in, if any */
    containerId: string | null;
}
