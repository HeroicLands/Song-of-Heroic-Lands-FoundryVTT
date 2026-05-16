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
import { MovementProfile } from "@src/domain/movement/MovementProfile";

/**
 * Logic for the **Lineage** item type — membership in an organization
 * or faction.
 *
 * Lineages represent a character's social and political ties: guild
 * membership, noble house allegiance, religious order, military unit, or
 * any other organizational relationship. Each affiliation tracks:
 *
 * - **society** — The name of the organization
 * - **office** — A specific position held (e.g., "Captain," "Acolyte")
 * - **title** — A formal title granted (e.g., "Sir," "Elder")
 * - **level** — Rank or standing within the organization
 *
 * Lineages are lightweight identity records with no complex calculations.
 * They can be attached to Beings, Cohorts, Structures, or Vehicles.
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
     * Movement profiles for each medium this being can move through.
     * Constructed from persisted data during {@link initialize}.
     */
    movementProfiles!: MovementProfile[];

    bodyWeight!: ValueModifier;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.bodyStructure = new BodyStructure(this.data.bodyStructure, this);
        this.movementProfiles = (this.data.movementProfiles ?? []).map(
            (d, i) => new MovementProfile(d, this, i),
        );
        this.bodyWeight = new ValueModifier({}, { parent: this }).setBase(
            this.data.bodyWeightBase,
        );
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
    movementProfiles: MovementProfile.Data[];
    encumbranceRate: number;
    bodyWeightBase: number;
}
