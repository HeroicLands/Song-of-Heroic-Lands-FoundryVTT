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
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import {
    SohlItemBaseLogic,
    type SohlItemData,
    type SohlItemLogic,
} from "@src/document/item/logic/SohlItemBaseLogic";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { MoveBaseDict } from "@src/entity/movement/move-helpers";
import {
    ITEM_KIND,
    MOVEMENT_MEDIUM,
    type MovementMedium,
} from "@src/utils/constants";

/**
 * Anatomical and movement template for a being's lineage (species / heritage).
 *
 * A Lineage defines the physical baseline shared by creatures of a kind: the
 * {@link BodyStructure | body structure} (body parts, hit locations, and
 * adjacency), body weight, melee reach, and per-medium movement profiles. The
 * Logic exposes these as {@link ValueModifier}s — `bodyWeight`, `reach`, and the
 * active profile's `feetPerRound` / `leaguesPerWatch` / `encumbrance` /
 * `strengthModifier` — so runtime effects (size changes, haste, encumbrance) can
 * layer on. The active profile is selected by the owning being's
 * `movementMedium` during {@link initialize}.
 *
 * @typeParam TData - The Lineage data interface.
 */
export class LineageLogic<
    TData extends LineageData = LineageData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The anatomical structure of the being, including body parts,
     * hit locations, and adjacency relationships. Constructed from
     * persisted data during {@link initialize}.
     */
    bodyStructure!: BodyStructure;

    /**
     * The being's body weight as a {@link ValueModifier}, seeded during
     * {@link initialize} from `bodyWeight.base` (when set) or the `bodyWeight.calc`
     * `SafeExpression` of strength.
     */
    bodyWeight!: ValueModifier;

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
     * `carriedWeight` {@link ValueModifier} (accumulated ground-up during item
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
        // Register with the owning being so it can reach its lineage directly
        // (a being has 0 or 1). Duck-typed to avoid coupling to BeingLogic.
        (
            this.actorLogic as {
                registerLineage?(l: LineageLogic): void;
            } | null
        )?.registerLineage?.(this);
        this.bodyStructure = new entity.BodyStructure(this.data.bodyStructure, {
            parent: this,
        });
        this.bodyWeight = new entity.ValueModifier(this);
        if (this.data.bodyWeight.base !== null) {
            this.bodyWeight.setBase(this.data.bodyWeight.base);
        } else {
            const bodyWeightCalc = new SafeExpression(
                { source: this.data.bodyWeight.calc },
                { parent: this },
            );
            this.bodyWeight.setBase(
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
                (profile) =>
                    profile.medium === this.actorLogic?.data.movementMedium,
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
}

/**
 * A single per-medium movement profile persisted on a lineage. Bundles the
 * being's speeds in one {@link MovementMedium} with the {@link SafeExpression}s
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
 * @remarks The shape of `system` on a `lineage` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "lineage"`. The backing DataModel implements this interface.
 */
export interface LineageData<
    TLogic extends SohlItemLogic<LineageData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    /** Persisted anatomical structure (body parts, hit locations, adjacency). */
    bodyStructure: BodyStructure.Data;
    /** Per-medium base move (feet per combat round); 0 means the medium is unavailable. */
    moveBase: MoveBaseDict;
    /** The medium shown by default in the combat tracker for this lineage. */
    defaultMoveMedium: MovementMedium;
    /** `SafeExpression` source of encumbrance (`enc`) → personal fatigue. */
    personalFatigue: string;
    /** Per-medium movement profiles (speeds + encumbrance expressions). */
    movementProfiles: MovementProfile[];
    /**
     * Body weight (pounds), not including gear: a fixed `base`, or a
     * `SafeExpression` `calc` of strength (`str`) when `base` is null. Seeds the
     * {@link LineageLogic.bodyWeight} modifier during `initialize`.
     */
    bodyWeight: {
        /** Fixed body weight in pounds; null to compute from `calc`. */
        base: number | null;
        /** `SafeExpression` source of `str` → body weight (used when `base` is null). */
        calc: string;
    };
    /** Base melee reach (feet) for beings of this lineage. */
    reachBase: number;
}
