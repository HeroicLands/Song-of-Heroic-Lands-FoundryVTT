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
import {
    readBaseMove,
    type MoveBaseDict,
} from "@src/entity/movement/move-helpers";
import { ITEM_KIND, type MovementMedium } from "@src/utils/constants";

/**
 * Anatomical and movement template for a being's lineage (species / heritage).
 *
 * A Lineage defines the physical baseline shared by creatures of a kind: the
 * {@link BodyStructure | body structure} (body parts, hit locations, and
 * adjacency), body weight, melee reach, per-medium movement profiles, and the
 * encumbrance/fatigue expressions. The Logic exposes the scalar baselines as
 * {@link ValueModifier}s — seeded from {@link LineageLogic.baseWeight}, `reachBase`,
 * and `moveBase` — so runtime effects (size changes, haste, encumbrance) can
 * layer on.
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
     * The being's body weight as a {@link ValueModifier}, seeded from
     * {@link LineageLogic.baseWeight}.
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
     * Per-medium effective move, each a {@link ValueModifier} seeded from the
     * corresponding entry of {@link LineageData.moveBase}, so runtime modifiers
     * (haste, encumbrance, etc.) can layer on.
     */
    move!: {
        /** Movement over land. */
        terrestrial: ValueModifier;
        /** Movement through water. */
        aquatic: ValueModifier;
        /** Movement through the air. */
        aerial: ValueModifier;
        /** Movement through earth. */
        burrowing: ValueModifier;
        /** Movement on the astral plane. */
        astral: ValueModifier;
    };

    /**
     * Per-medium base move (feet per combat round) for creatures of this
     * lineage. A value of 0 means the creature cannot move in that medium.
     * Active Effects can target individual entries (e.g.
     * `system.moveBase.terrestrial`) to apply haste, encumbrance, etc.
     */
    get moveBase(): MoveBaseDict {
        return this.data.moveBase;
    }

    /**
     * The medium shown by default in the combat tracker for creatures of
     * this lineage. Seeded onto each new combatant at creation time.
     */
    get defaultMoveMedium(): MovementMedium {
        return this.data.defaultMoveMedium;
    }

    /**
     * The being's base body weight (pounds), not including gear.
     *
     * Returns {@link LineageData.bodyWeight | `bodyWeight.base`} verbatim when it
     * is set (non-null). Otherwise evaluates the `bodyWeight.calc`
     * {@link SafeExpression} against the owning being's strength (`str`) — so a
     * lineage can express weight as a function of Strength (e.g. `(9 * str) + 50`).
     * Falls back to 0 when there is no owning being, no strength attribute, or the
     * expression fails to produce a number.
     */
    get baseWeight(): number {
        const bodyWeight = this.data.bodyWeight;
        if (bodyWeight.base != null) return bodyWeight.base;
        return this.evalExpression(bodyWeight.calc);
    }

    /* --------------------------------------------- */
    /* Per-medium data accessors                     */
    /* --------------------------------------------- */

    /**
     * The persisted per-medium base move (feet per combat round) — the
     * Active-Effect-targetable `moveBase` scalar, mirrored from the matching
     * movement profile's `feetPerRound` at export time.
     *
     * @param medium - The movement medium; defaults to {@link defaultMoveMedium}.
     * @returns The base move, or 0 when the lineage has no value for the medium.
     */
    getMoveBase(medium?: MovementMedium): number {
        return readBaseMove(
            this.data.moveBase,
            medium ?? this.defaultMoveMedium,
        );
    }

    /**
     * The tactical move (feet per combat round) authored on the matching
     * movement profile.
     *
     * @param medium - The movement medium; defaults to {@link defaultMoveMedium}.
     * @returns The profile's `feetPerRound`, or 0 when there is no such profile.
     */
    getFeetPerRound(medium?: MovementMedium): number {
        return this.profileFor(medium)?.feetPerRound ?? 0;
    }

    /**
     * The overland travel speed (leagues per watch) authored on the matching
     * movement profile.
     *
     * @param medium - The movement medium; defaults to {@link defaultMoveMedium}.
     * @returns The profile's `leaguesPerWatch`, or 0 when there is no such profile.
     */
    getLeaguesPerWatch(medium?: MovementMedium): number {
        return this.profileFor(medium)?.leaguesPerWatch ?? 0;
    }

    /**
     * The encumbrance the being incurs in the given medium: the matching
     * profile's `encumbrance` {@link SafeExpression} evaluated against the
     * owning being's context (carried weight `wt` and strength `str`).
     *
     * @param medium - The movement medium; defaults to {@link defaultMoveMedium}.
     * @returns The encumbrance units, or 0 when there is no profile or the
     *   expression cannot produce a number.
     */
    getEncumbrance(medium?: MovementMedium): number {
        return this.evalExpression(this.profileFor(medium)?.encumbrance);
    }

    /**
     * The strength-driven encumbrance shift in the given medium: the matching
     * profile's `strMod` {@link SafeExpression} evaluated against the owning
     * being's context (strength `str`).
     *
     * @param medium - The movement medium; defaults to {@link defaultMoveMedium}.
     * @returns The strength modifier, or 0 when there is no profile or the
     *   expression cannot produce a number.
     */
    getStrMod(medium?: MovementMedium): number {
        return this.evalExpression(this.profileFor(medium)?.strMod);
    }

    /**
     * The movement profile for a medium, or `undefined` when the lineage has no
     * profile for it. Omitting `medium` uses {@link defaultMoveMedium}.
     * @param medium - The movement medium; defaults to {@link defaultMoveMedium}.
     * @returns The matching {@link MovementProfile}, or `undefined`.
     */
    private profileFor(medium?: MovementMedium): MovementProfile | undefined {
        const target = medium ?? this.defaultMoveMedium;
        return this.data.movementProfiles.find((p) => p.medium === target);
    }

    /**
     * Evaluate a lineage {@link SafeExpression} source against the owning being's
     * context. Returns 0 for an empty source, a missing/failed evaluation, or a
     * non-numeric result — the accessors never throw.
     * @param source - The `SafeExpression` source string (may be empty/undefined).
     * @returns The numeric result, or 0.
     */
    private evalExpression(source: string | undefined): number {
        if (!source) return 0;
        try {
            const value = new SafeExpression(
                { source },
                { parent: this },
            ).evaluate(this.exprContext());
            return typeof value === "number" ? value : 0;
        } catch {
            return 0;
        }
    }

    /**
     * The variable bindings lineage expressions may reference, drawn from the
     * owning being: `str` (strength score) and `wt` (total carried-gear weight).
     * Both default to 0 when there is no owning actor (or no strength attribute).
     * @returns The `{ str, wt }` context object.
     */
    private exprContext(): { str: number; wt: number } {
        return { str: this.actorStr, wt: this.carriedWeight };
    }

    /**
     * The owning being's strength score, or 0 when unavailable.
     * @returns The effective `str` score, or 0.
     */
    private get actorStr(): number {
        return (
            this.actorLogic?.logicTypes[ITEM_KIND.ATTRIBUTE].find(
                (a) => a.data?.shortcode === "str",
            )?.score.effective ?? 0
        );
    }

    /**
     * The owning being's total carried-gear weight, read from the being's
     * `carriedWeight` (accumulated ground-up during item preparation). 0 when
     * there is no owning being (or the actor exposes no carried weight).
     * @returns The total carried-gear weight in pounds, or 0.
     */
    private get carriedWeight(): number {
        const actorLogic = this.actorLogic as { carriedWeight?: number } | null;
        return typeof actorLogic?.carriedWeight === "number" ?
                actorLogic.carriedWeight
            :   0;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.bodyStructure = new entity.BodyStructure(this.data.bodyStructure, {
            parent: this,
        });
        this.bodyWeight = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.baseWeight);
        this.reach = new entity.ValueModifier(this).setBase(
            this.data.reachBase,
        );
        this.move = {
            terrestrial: new entity.ValueModifier(this).setBase(
                this.data.moveBase.terrestrial,
            ),
            aquatic: new entity.ValueModifier(this).setBase(
                this.data.moveBase.aquatic,
            ),
            aerial: new entity.ValueModifier(this).setBase(
                this.data.moveBase.aerial,
            ),
            burrowing: new entity.ValueModifier(this).setBase(
                this.data.moveBase.burrowing,
            ),
            astral: new entity.ValueModifier(this).setBase(
                this.data.moveBase.astral,
            ),
        };
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
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
     * `SafeExpression` `calc` of strength (`str`) when `base` is null. See
     * {@link LineageLogic.baseWeight}.
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
