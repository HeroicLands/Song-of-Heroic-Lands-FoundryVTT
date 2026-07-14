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

import { entity } from "@src/entity/registry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { fvttGetActor } from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { SohlAction } from "@src/entity/action/SohlAction";
import { BodyPart } from "@src/entity/body/BodyPart";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";

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
 * person) and whether it is **equipped** (actively worn or wielded, as opposed
 * to stowed in a pack).
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
     * Populated during {@link initialize} by looking up each cohort ID
     * in the world actor collection.
     */
    sharedWithCohorts!: SohlActor[];

    /**
     * Body Parts that are holding this gear item
     * @returns An array of BodyParts that are currently holding this item
     */
    get heldBy(): BodyPart[] {
        const bodyParts = (this.actorLogic as BeingLogic)?.logicTypes[
            ITEM_KIND.CORPUS
        ][0]?.structure?.parts;
        return (
            bodyParts?.filter((part): part is BodyPart => {
                const heldItem = part.heldItem;
                return heldItem !== undefined && heldItem.id === this.id;
            }) ?? []
        );
    }

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a cohort ID to the sharing list.
     * @param cohortId - The cohort actor ID to add to the sharing list.
     * @returns An update payload adding the ID, or an empty object if already present.
     */
    addSharedCohortUpdate(cohortId: string): PlainObject {
        const canonical = this.data.sharedWithCohortIds;
        if (canonical.includes(cohortId)) return {};
        return {
            "system.sharedWithCohortIds": [...canonical, cohortId],
        };
    }

    /**
     * Build an `update()` payload that removes a cohort ID from the sharing list.
     * @param cohortId - The cohort actor ID to remove from the sharing list.
     * @returns An update payload with the ID filtered out of the sharing list.
     */
    removeSharedCohortUpdate(cohortId: string): PlainObject {
        return {
            "system.sharedWithCohortIds": this.data.sharedWithCohortIds.filter(
                (id) => id !== cohortId,
            ),
        };
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Marks this gear as carried on the character's person.
     *
     * Intrinsic-action executor for the `setCarried` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setCarried(_context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.isCarried": true };
        await this.data.update(updateData);
    }

    /**
     * Marks this gear as not carried (stowed somewhere off-person).
     *
     * Intrinsic-action executor for the `setNotCarried` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setNotCarried(_context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.isCarried": false };
        await this.data.update(updateData);
    }

    /**
     * Marks this gear as equipped (worn/wielded, not just carried).
     *
     * Intrinsic-action executor for the `setEquipped` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setEquipped(_context: SohlActionContext): Promise<void> {
        await this.data.update({ "system.isEquipped": true });
    }

    /**
     * Marks this gear as not equipped (stowed, not actively worn/wielded).
     *
     * Intrinsic-action executor for the `setNotEquipped` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setNotEquipped(_context: SohlActionContext): Promise<void> {
        await this.data.update({ "system.isEquipped": false });
    }

    /**
     * The minimum number of free hold-capable limbs required to grip this
     * item. Defaults to 1; subclasses (e.g. WeaponGearLogic) may override
     * to reflect the item's actual grip requirement.
     */
    protected get minPartsToHold(): number {
        return 1;
    }

    /**
     * Assigns the first free hold-capable body part(s) on the owning actor
     * to grip this item. Does nothing if the actor has no corpus or there
     * are fewer free limbs than `minPartsToHold`.
     *
     * Intrinsic-action executor for the `holdItem` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the corpus update completes (or immediately if
     *   no update is needed).
     */
    async holdItem(_context: SohlActionContext): Promise<void> {
        const corpus = (this.actorLogic as BeingLogic)?.logicTypes?.[
            ITEM_KIND.CORPUS
        ]?.[0];
        if (!corpus) return;
        const freeParts = corpus.structure.parts.filter(
            (p: any) => p.canHoldItem && !p.heldItem,
        );
        const needed = this.minPartsToHold;
        if (freeParts.length < needed) return;
        // Full-array write — a partial `parts.${i}.heldItemId` update corrupts
        // the whole parts array (#247). See BodyStructure.setPartFieldsUpdate.
        const payload = corpus.structure.setPartFieldsUpdate(
            freeParts.slice(0, needed).map((p: any) => ({
                index: p.index,
                changes: { heldItemId: this.id },
            })),
        );
        if (Object.keys(payload).length) await corpus.data.update(payload);
    }

    /**
     * Clears `heldItemId` on every body part currently gripping this item,
     * releasing it from the actor's grip. Does nothing if the actor has no
     * corpus or no part holds this item.
     *
     * Intrinsic-action executor for the `releaseItem` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the corpus update completes (or immediately if
     *   no update is needed).
     */
    async releaseItem(_context: SohlActionContext): Promise<void> {
        const corpus = (this.actorLogic as BeingLogic)?.logicTypes?.[
            ITEM_KIND.CORPUS
        ]?.[0];
        if (!corpus) return;
        const holdingParts = corpus.structure.parts.filter(
            (p: any) => p.canHoldItem && p.heldItem?.id === this.id,
        );
        if (!holdingParts.length) return;
        // Full-array write — a partial `parts.${i}.heldItemId` update corrupts
        // the whole parts array (#247). See BodyStructure.setPartFieldsUpdate.
        const payload = corpus.structure.setPartFieldsUpdate(
            holdingParts.map((part: any) => ({
                index: part.index,
                changes: { heldItemId: null },
            })),
        );
        if (Object.keys(payload).length) await corpus.data.update(payload);
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns The base item actions plus gear equip/carry/hold actions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "setCarried",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.setCarried",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-round-star-filled",
                executor: "setCarried",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "setNotCarried",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.setNotCarried",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-round-star-unfilled",
                executor: "setNotCarried",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "setEquipped",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.setEquipped",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-chest-armor",
                executor: "setEquipped",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "setNotEquipped",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.setNotEquipped",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-chest-armor",
                executor: "setNotEquipped",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "holdItem",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.holdItem",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-hand-grab",
                executor: "holdItem",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "releaseItem",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Gear.Action.releaseItem",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-hand-open",
                executor: "releaseItem",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
        ];
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
            .map((id) => fvttGetActor(id) as SohlActor | undefined)
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
        if (this.data.isCarried && this.actorLogic instanceof BeingLogic) {
            this.actorLogic.carriedWeight.add(
                `${this.data.shortcode}Wt`,
                `${this.name} Weight`,
                this.weight.effective * (this.data.quantity ?? 1),
            );
        }
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
    /** Whether this item is actively worn or wielded */
    isEquipped: boolean;
    /** Craftsmanship quality, generally ranging from 8-12 */
    qualityBase: number;
    /** Structural integrity rating */
    durabilityBase: number;
    /** IDs of Cohort actors this gear is shared with */
    sharedWithCohortIds: string[];
    /** The container this item is contained in, if any */
    containerId: string | null;
}
