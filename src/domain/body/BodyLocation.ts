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

import type { ImpactAspect } from "@src/utils/constants";
import type { BodyPart } from "@src/domain/body/BodyPart";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";

/**
 * A specific hit location within a {@link BodyPart} — e.g., "Skull",
 * "Upper Left Arm", "Abdomen".
 *
 * Each location tracks its probability weight for random hit selection,
 * natural protection values per {@link ImpactAspect}, and injury-related
 * thresholds (bleeding severity, amputation modifier, shock value).
 *
 * Used by the combat resolution pipeline for hit location determination
 * and damage calculation.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. May be mutated during the lifecycle (e.g., active effects adding
 * modifiers to protection values), but mutations are not persisted — they
 * are recomputed on the next cycle.
 */
export class BodyLocation {
    /** Unique location identifier within its body part. */
    readonly shortcode: string;
    /** Display name of this location (falls back to the shortcode). */
    readonly name: string;
    /** Bleeding tier — see BleedingSusceptibility in constants. */
    readonly bleedingSusceptibility: string;
    /** Amputability tier — see Amputability in constants. */
    readonly amputability: string;
    /**
     * Whether a Serious-or-worse injury here can cause a stumble. A Serious
     * injury requires a stumble roll; a Grievous injury stumbles automatically.
     */
    readonly isStumble: boolean;
    /**
     * Whether a Serious-or-worse injury here can cause a fumble. A Serious
     * injury requires a fumble roll; a Grievous injury fumbles automatically.
     */
    readonly isFumble: boolean;
    /** Base shock contribution this location adds to the Shock Index when wounded. */
    readonly shockValue: ValueModifier;
    /** Selection weight for this location in random hit-location rolls within its part. */
    readonly probWeight: ValueModifier;
    /** Natural (intrinsic) protection per aspect, before worn armor. */
    readonly protectionBase: {
        /** Natural protection against blunt impact. */
        blunt: ValueModifier;
        /** Natural protection against edged impact. */
        edged: ValueModifier;
        /** Natural protection against piercing impact. */
        piercing: ValueModifier;
        /** Natural protection against fire impact. */
        fire: ValueModifier;
    };
    /**
     * Worn-armor protection per aspect, summed across every ArmorGear covering
     * this location during the lifecycle. Reset and recomputed each cycle by
     * the armor-aggregation step; zero before aggregation runs.
     */
    armorProtection: {
        /** Worn-armor protection against blunt impact. */
        blunt: number;
        /** Worn-armor protection against edged impact. */
        edged: number;
        /** Worn-armor protection against piercing impact. */
        piercing: number;
        /** Worn-armor protection against fire impact. */
        fire: number;
    };
    /** True once any *rigid* armor covers this location (drives glancing blows). */
    isRigid: boolean;
    /** Comma-joined list of armor materials covering this location, e.g. "Cloth, Mail". */
    armorType: string;
    /** Back-reference to the owning {@link BodyPart}. */
    readonly bodyPart: BodyPart;
    /** Zero-based index of this location within {@link BodyPart.locations}. */
    readonly index: number;

    /**
     * @param data Persisted location data.
     * @param bodyPart Owning body part (supplies the lineage logic parent).
     * @param index Zero-based position within {@link BodyPart.locations}.
     */
    constructor(data: BodyLocation.Data, bodyPart: BodyPart, index: number) {
        const lineageLogic = bodyPart.bodyStructure.lineageLogic;

        this.shortcode = data.shortcode;
        this.name = data.name || data.shortcode;
        this.bleedingSusceptibility = data.bleedingSusceptibility;
        this.amputability = data.amputability;
        this.isStumble = data.isStumble ?? false;
        this.isFumble = data.isFumble ?? false;
        this.armorProtection = { blunt: 0, edged: 0, piercing: 0, fire: 0 };
        this.isRigid = false;
        this.armorType = "";
        this.shockValue = new ValueModifier(
            {},
            { parent: lineageLogic },
        ).setBase(data.shockValue);
        this.probWeight = new ValueModifier(
            {},
            { parent: lineageLogic },
        ).setBase(data.probWeight);
        this.protectionBase = {
            blunt: new ValueModifier({}, { parent: lineageLogic }).setBase(
                data.protectionBase.blunt,
            ),
            edged: new ValueModifier({}, { parent: lineageLogic }).setBase(
                data.protectionBase.edged,
            ),
            piercing: new ValueModifier({}, { parent: lineageLogic }).setBase(
                data.protectionBase.piercing,
            ),
            fire: new ValueModifier({}, { parent: lineageLogic }).setBase(
                data.protectionBase.fire,
            ),
        };
        this.bodyPart = bodyPart;
        this.index = index;
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting
     * this location's persisted fields, e.g.
     * `"system.bodyStructure.parts.2.locations.1"`.
     */
    get updatePath(): string {
        return `${this.bodyPart.updatePath}.locations.${this.index}`;
    }
}

export namespace BodyLocation {
    /** Persisted data shape for a body location. */
    export interface Data {
        /** Unique location identifier within its part. */
        shortcode: string;
        /** Display name of the location. */
        name?: string;
        /** Bleeding tier (BleedingSusceptibility value). */
        bleedingSusceptibility: string;
        /** Amputability tier (Amputability value). */
        amputability: string;
        /** Whether a serious/grievous injury here can cause a stumble. */
        isStumble?: boolean;
        /** Whether a serious/grievous injury here can cause a fumble. */
        isFumble?: boolean;
        /** Base shock value for injuries to this location (subject to modifiers) */
        shockValue: number;
        /** Weight used in random hit location selection */
        probWeight: number;
        /** Base protection values for different impact aspects */
        protectionBase: {
            /** Base protection against blunt impact. */
            blunt: number;
            /** Base protection against edged impact. */
            edged: number;
            /** Base protection against piercing impact. */
            piercing: number;
            /** Base protection against fire impact. */
            fire: number;
        };
    }
}
