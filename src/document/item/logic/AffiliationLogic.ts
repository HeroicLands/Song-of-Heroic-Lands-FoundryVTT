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
    AFFILIATION_STANDING,
    type AffiliationStanding,
    type AffiliationClass,
    type AffiliationSubType,
    affiliationClassOf,
} from "@src/utils/constants";
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
 * - **subType** — The kind of body it is, from the content format's eleven
 *   (see {@link AffiliationSubType}); {@link AffiliationLogic.subTypeClass}
 *   derives the arcane / divine / spirit / social partition from it
 * - **society** — The name of the organization
 * - **office** — A specific position held (e.g., "Captain," "Acolyte")
 * - **title** — A formal title granted (e.g., "Sir," "Elder")
 * - **level** — Rank or standing within the organization
 * - **relation** — How the organization stands toward *other* affiliations
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

    /**
     * Which of the four classes this body belongs to (#1788).
     *
     * Derived from {@link AffiliationData.subType}, never authored beside it:
     * the three traditions class by what they face and every other kind of body
     * is `social`. This is the partition a mystical-ability picker filters on,
     * and deriving it means the filter cannot disagree with the record.
     *
     * @returns The affiliation's class.
     */
    get subTypeClass(): AffiliationClass {
        return affiliationClassOf(this.data.subType);
    }

    /**
     * This organization's standing toward another affiliation (#1404).
     *
     * Reads the persisted {@link AffiliationData.relation} table directly — it is
     * authored data, not derived state, so no lifecycle work builds it. Only
     * relations that differ from neutral are recorded: a shortcode absent from
     * the table (and an empty table, which is the default) answers
     * `unaligned`.
     *
     * This *records and reports* a relationship; it never acts on one. Any
     * downstream use — a reaction prompt, a credential check — stays behind a
     * human trigger.
     *
     * @param shortcode - The other affiliation's shortcode.
     * @returns The recorded standing, or `unaligned` when none is recorded.
     */
    standingWith(shortcode: string): AffiliationStanding {
        const relation = this.data.relation;
        // Own-property check: a bare `relation[shortcode]` would answer with an
        // inherited Object.prototype member for a shortcode like `toString`.
        if (!relation || !Object.prototype.hasOwnProperty.call(relation, shortcode)) {
            return AFFILIATION_STANDING.UNALIGNED;
        }
        return relation[shortcode] ?? AFFILIATION_STANDING.UNALIGNED;
    }

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
    /** The kind of body this is — one of the content format's eleven (#1788) */
    subType: AffiliationSubType;
    /** Subdivision of the organization or faction */
    society: string | null;
    /** Specific position held within the organization */
    office: string | null;
    /** Formal title granted by the organization */
    title: string | null;
    /** Rank or standing within the organization */
    level: number;
    /**
     * Standing toward other affiliations, keyed by their shortcode. Only
     * non-neutral relations are authored; an empty map means neutral toward
     * everyone. Read it through {@link AffiliationLogic.standingWith}.
     */
    relation: Record<string, AffiliationStanding>;
}
