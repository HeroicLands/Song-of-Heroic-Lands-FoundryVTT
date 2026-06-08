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

import {
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemLogic,
} from "@src/document/item/foundry/SohlItem";
import { BodyStructure } from "@src/domain/body/BodyStructure";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import type { MoveBaseDict } from "@src/domain/movement/move-helpers";
import type { MovementMedium } from "@src/utils/constants";

/**
 * Anatomical and movement template for a being's lineage (species / heritage).
 *
 * A Lineage defines the physical baseline shared by creatures of a kind: the
 * {@link BodyStructure | body structure} (body parts, hit locations, and
 * adjacency), base body weight, melee reach, and per-medium movement rates.
 * The Logic exposes these as {@link ValueModifier}s — seeded from the data's
 * `*Base` fields — so runtime effects (size changes, haste, encumbrance) can
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
     * {@link LineageData.bodyWeightBase}.
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

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.bodyStructure = new BodyStructure(this.data.bodyStructure, this);
        this.bodyWeight = new ValueModifier({}, { parent: this }).setBase(
            this.data.bodyWeightBase,
        );
        this.reach = new ValueModifier({}, { parent: this }).setBase(
            this.data.reachBase,
        );
        this.move = {
            terrestrial: new ValueModifier({}, { parent: this }).setBase(
                this.data.moveBase.terrestrial,
            ),
            aquatic: new ValueModifier({}, { parent: this }).setBase(
                this.data.moveBase.aquatic,
            ),
            aerial: new ValueModifier({}, { parent: this }).setBase(
                this.data.moveBase.aerial,
            ),
            burrowing: new ValueModifier({}, { parent: this }).setBase(
                this.data.moveBase.burrowing,
            ),
            astral: new ValueModifier({}, { parent: this }).setBase(
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
    /** Rate at which carried weight contributes to encumbrance. */
    encumbranceRate: number;
    /** Base body weight for beings of this lineage. */
    bodyWeightBase: number;
    /** Base melee reach (feet) for beings of this lineage. */
    reachBase: number;
}
