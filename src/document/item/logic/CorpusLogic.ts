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
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import {
    SohlItemBaseLogic,
    type SohlItemData,
    type SohlItemLogic,
} from "@src/document/item/logic/SohlItemBaseLogic";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlAction } from "@src/entity/action/SohlAction";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    BASE_INJURY_THRESHOLDS,
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    isMovementMedium,
    type MovementMedium,
} from "@src/utils/constants";

/**
 * A being's **corpus** — its physical body. Optional: a being with no corpus is
 * **incorporeal** (e.g. a spirit), with no body structure, weight, reach, or
 * movement. A being has 0 or 1 corpus.
 *
 * A Corpus defines the physical baseline of a body: the
 * {@link sohl.entity.body.BodyStructure | body structure} (body parts, hit locations, and
 * adjacency), body weight, melee reach, and per-medium movement profiles. The
 * Logic exposes these as {@link sohl.entity.modifier.ValueModifier}s — `weight`, `reach`, and the
 * active profile's `feetPerRound` / `leaguesPerWatch` / `encumbrance` /
 * `strengthModifier` — so runtime effects (size changes, haste, encumbrance) can
 * layer on. The active profile is selected by this corpus's own
 * `currentMoveMedium` during {@link initialize}.
 *
 * @typeParam TData - The Corpus data interface.
 */
export class CorpusLogic<
    TData extends CorpusData = CorpusData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The anatomical structure of the being, including body parts,
     * hit locations, and adjacency relationships. Constructed from
     * persisted data during {@link initialize}.
     */
    structure!: BodyStructure;

    /**
     * Per-creature body-scale factor as a {@link sohl.entity.modifier.ValueModifier}
     * (`1.0` = baseline human), seeded from `bodyScaleBase` and floored at `0.01`
     * during {@link initialize}. Active Effects can layer deltas (shrink/enlarge),
     * which re-scale {@link injuryTable} within the same prepare cycle.
     */
    bodyScale!: ValueModifier;

    /**
     * This creature's effective injury-level thresholds — the master
     * {@link BASE_INJURY_THRESHOLDS} scaled by {@link bodyScale} `.effective`,
     * derived during {@link evaluate}. Consumed by `injuryLevelFromImpact` (via
     * {@link sohl.entity.body.BodyStructure.injuryTable}) so an absolute impact
     * reads size-correct on this body.
     */
    injuryTable!: number[];

    /**
     * The being's body weight as a {@link sohl.entity.modifier.ValueModifier}, seeded during
     * {@link initialize} from `weight.base` (when set) or the `weight.calc`
     * `SafeExpression` of strength.
     */
    weight!: ValueModifier;

    /**
     * The creature's base melee reach (feet), exposed as a `ValueModifier`
     * so runtime modifiers (size-changing effects, etc.) can layer on. The
     * base is sourced from `system.reachBase`. Combined with a melee strike
     * mode's effective length to produce that mode's actual reach.
     */
    reach!: ValueModifier;

    /**
     * The creature's tactical move (feet per combat round), exposed as a `ValueModifier`
     * so runtime modifiers (haste, encumbrance, etc.) can layer on.
     */
    feetPerRound!: ValueModifier;

    /**
     * The creature's overland travel speed (leagues per watch), exposed as a `ValueModifier`
     * so runtime modifiers (haste, encumbrance, etc.) can layer on.
     */
    leaguesPerWatch!: ValueModifier;

    /**
     * The creature's encumbrance, exposed as a `ValueModifier` so runtime modifiers
     * (carried weight, strength effects, etc.) can layer on.
     */
    encumbrance!: ValueModifier;

    /**
     * The creature's strength modifier, exposed as a `ValueModifier` so runtime modifiers
     * (effects that alter strength, etc.) can layer on.
     */
    strengthModifier!: ValueModifier;

    /**
     * The creature's movement profile, containing per-medium move data and related modifiers.
     */
    moveProfile!: MovementProfile;

    /**
     * The owning being's total carried-gear weight, read from the being's
     * `carriedWeight` {@link sohl.entity.modifier.ValueModifier} (accumulated ground-up during item
     * preparation — each carried gear adds a delta). 0 when there is no owning
     * being (or the actor exposes no carried weight).
     * @returns The total carried-gear weight in pounds, or 0.
     */
    private get carriedWeight(): number {
        const actorLogic = this.actorLogic as {
            carriedWeight?: { effective?: number };
        } | null;
        const effective = actorLogic?.carriedWeight?.effective;
        return typeof effective === "number" ? effective : 0;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        // Register with the owning being so it can reach its corpus directly
        // (a being has 0 or 1). Duck-typed to avoid coupling to BeingLogic.
        (
            this.actorLogic as {
                registerCorpus?(l: CorpusLogic): void;
            } | null
        )?.registerCorpus?.(this);
        this.structure = new entity.BodyStructure(this.data.structure, {
            parent: this,
        });
        this.bodyScale = new entity.ValueModifier(this)
            .setBase(this.data.bodyScaleBase)
            .floor("Body-scale minimum", "bodyScaleMin", 0.01);
        this.weight = new entity.ValueModifier(this);
        if (this.data.weight.base !== null) {
            this.weight.setBase(this.data.weight.base);
        } else {
            const bodyWeightCalc = new SafeExpression(
                { source: this.data.weight.calc },
                { parent: this },
            );
            this.weight.setBase(
                (bodyWeightCalc.evaluate({
                    str:
                        this.actorLogic?.getItemLogic(
                            "str",
                            ITEM_KIND.ATTRIBUTE,
                        )?.score.effective ?? 0,
                }) as number) ?? 0,
            );
        }
        this.reach = new entity.ValueModifier(this).setBase(
            this.data.reachBase,
        );
        this.feetPerRound = new entity.ValueModifier(this);
        this.leaguesPerWatch = new entity.ValueModifier(this);
        this.encumbrance = new entity.ValueModifier(this);
        this.strengthModifier = new entity.ValueModifier(this);
        this.moveProfile =
            this.data.movementProfiles?.find(
                (profile) => profile.medium === this.data.currentMoveMedium,
            ) ??
            ({
                medium: MOVEMENT_MEDIUM.TERRESTRIAL,
                feetPerRound: 0,
                leaguesPerWatch: 0,
                encumbrance: "0",
                strMod: "0",
                disabled: true,
            } as MovementProfile);

        if (!this.moveProfile.disabled) {
            this.feetPerRound.setBase(this.moveProfile.feetPerRound);
            this.leaguesPerWatch.setBase(this.moveProfile.leaguesPerWatch);
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        const strModExpr = new SafeExpression(
            { source: this.moveProfile.strMod },
            { parent: this },
        );
        const strAttrLogic = this.actorLogic?.getItemLogic(
            "str",
            ITEM_KIND.ATTRIBUTE,
        );
        this.strengthModifier.setBase(
            strModExpr.evaluate({
                str: strAttrLogic?.score.effective ?? 0,
            }) as number,
        );

        // This creature's injury-level thresholds: the master (human) table
        // scaled by bodyScale, so an absolute impact reads size-correct. A delta
        // on bodyScale (shrink/enlarge) re-scales it within this prepare cycle.
        this.injuryTable = BASE_INJURY_THRESHOLDS.map(
            (threshold) => threshold * this.bodyScale.effective,
        );
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        const encExpr = new SafeExpression(
            { source: this.moveProfile.encumbrance },
            { parent: this },
        );
        this.encumbrance.setBase(
            encExpr.evaluate({ wt: this.carriedWeight }) as number,
        );
    }

    /** @inheritDoc */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "makeDefaultMedium",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Corpus.Action.makeDefaultMedium",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-person-swimming",
                executor: "makeDefaultMedium",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
        ];
    }

    /**
     * Set this corpus's {@link CorpusData.currentMoveMedium} — the active
     * movement profile — to the medium carried in the action scope.
     *
     * Intrinsic-action executor for the `makeDefaultMedium` action.
     *
     * @param context - The action context; `context.scope.medium` names the
     *   {@link MovementMedium} to make current.
     * @returns Resolves once the item update completes.
     */
    async makeDefaultMedium(context: SohlActionContext): Promise<void> {
        const medium = (context.scope as PlainObject)?.medium;
        if (!isMovementMedium(medium)) return;
        await this.data.update({ "system.currentMoveMedium": medium });
    }
}

/**
 * A single per-medium movement profile persisted on a corpus. Bundles the
 * being's speeds in one {@link MovementMedium} with the {@link sohl.entity.expr.SafeExpression}s
 * (stored as source strings) that turn carried weight into encumbrance and shift
 * it by strength.
 */
export interface MovementProfile {
    /** The movement medium this profile describes. */
    medium: MovementMedium;
    /** Tactical move (feet per combat round) in this medium. */
    feetPerRound: number;
    /** Overland travel speed (leagues per watch) in this medium. */
    leaguesPerWatch: number;
    /** `SafeExpression` source of carried weight (`wt`) → encumbrance units. */
    encumbrance: string;
    /** `SafeExpression` source of strength (`str`) → encumbrance shift. */
    strMod: string;
    /** Whether this movement profile is disabled. */
    disabled: boolean;
}

/**
 * @remarks The shape of `system` on a `corpus` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "corpus"`. The backing DataModel implements this interface.
 */
export interface CorpusData<
    TLogic extends SohlItemLogic<CorpusData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    /** Persisted anatomical structure (body parts, hit locations, adjacency). */
    structure: BodyStructure.Data;
    /** The current movement medium; selects the active {@link movementProfiles} entry. */
    currentMoveMedium: MovementMedium;
    /** `SafeExpression` source of encumbrance (`enc`) → personal fatigue. */
    personalFatigue: string;
    /** Per-medium movement profiles (speeds + encumbrance expressions). */
    movementProfiles: MovementProfile[];
    /**
     * Body weight (pounds), not including gear: a fixed `base`, or a
     * `SafeExpression` `calc` of strength (`str`) when `base` is null. Seeds the
     * {@link CorpusLogic.weight} modifier during `initialize`.
     */
    weight: {
        /** Fixed body weight in pounds; null to compute from `calc`. */
        base: number | null;
        /** `SafeExpression` source of `str` → body weight (used when `base` is null). */
        calc: string;
    };
    /** Base melee reach (feet) for beings of this corpus. */
    reachBase: number;
    /**
     * Per-creature body-scale factor (`1.0` = baseline human). Scales the
     * injury-level thresholds; seeds the {@link CorpusLogic.bodyScale} modifier.
     */
    bodyScaleBase: number;
}
