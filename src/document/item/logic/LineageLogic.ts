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
 * Anatomical and movement properties
 * that define a creature's physical form and capabilities.
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
     * The creature's body weight, not including carried or worn items
     */
    bodyWeight!: ValueModifier;

    /**
     * The creature's base melee reach (feet), exposed as a `ValueModifier`
     * so runtime modifiers (size-changing effects, etc.) can layer on. The
     * base is sourced from `system.reachBase`. Combined with a melee strike
     * mode's effective length to produce that mode's actual reach.
     */
    reach!: ValueModifier;

    move!: {
        terrestrial: ValueModifier;
        aquatic: ValueModifier;
        aerial: ValueModifier;
        burrowing: ValueModifier;
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

export interface LineageData<
    TLogic extends SohlItemLogic<LineageData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    bodyStructure: BodyStructure.Data;
    moveBase: MoveBaseDict;
    defaultMoveMedium: MovementMedium;
    encumbranceRate: number;
    bodyWeightBase: number;
    reachBase: number;
}
