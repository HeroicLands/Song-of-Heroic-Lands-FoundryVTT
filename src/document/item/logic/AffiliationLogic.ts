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
    type SohlItemLogic,
} from "@src/document/item/logic/SohlItemBaseLogic";

/**
 * Membership in an organization or faction.
 *
 * Affiliations represent a character's social and political ties: guild
 * membership, noble house allegiance, religious order, military unit, or
 * any other organizational relationship. Each affiliation tracks:
 *
 * - **society** — The name of the organization
 * - **office** — A specific position held (e.g., "Captain," "Acolyte")
 * - **title** — A formal title granted (e.g., "Sir," "Elder")
 * - **level** — Rank or standing within the organization
 *
 * Affiliations are lightweight identity records with no complex calculations.
 * They can be attached to Beings, Cohorts, Structures, or Vehicles.
 *
 * @typeParam TData - The Affiliation data interface.
 */
export class AffiliationLogic<
    TData extends AffiliationData = AffiliationData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The character's rank / standing within this organization, as a
     * {@link sohl.entity.modifier.ValueModifier} seeded from
     * {@link AffiliationData.level} (rank 0 is usually a lay member).
     *
     * Affiliation is the system's **capability credential**: religious rank and
     * arcane grade live here, not on a Skill. Because it is a `ValueModifier` it
     * is a valid **Active Effect target** (`mod:logic.level`), and it is the
     * stable seam a capability derivation reads — a Mystical Ability subtype that
     * draws on its
     * {@link sohl.document.item.logic.MysticalAbilityLogic.affiliation |
     * associated affiliation} may consult this level during its `evaluate()`. It
     * only *informs* a derivation — no action is ever taken on the character
     * automatically.
     */
    level!: ValueModifier;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();

        // Rank as a ValueModifier so an Active Effect can adjust it
        // (`mod:logic.level`). `data.level` is a non-nullable integer (min 0),
        // so the modifier is always enabled — unlike the nullable levels on
        // Skill / Mystery / Mystical Ability.
        this.level = new entity.ValueModifier(this).setBase(this.data.level);
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
 * Persisted data backing {@link AffiliationLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 * @remarks The shape of `system` on a `affiliation` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "affiliation"`. The backing DataModel implements this interface.
 */
export interface AffiliationData<
    TLogic extends SohlItemLogic<AffiliationData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    /** Subdivision of the organization or faction */
    society: string | null;
    /** Specific position held within the organization */
    office: string | null;
    /** Formal title granted by the organization */
    title: string | null;
    /** Rank or standing within the organization */
    level: number;
}
