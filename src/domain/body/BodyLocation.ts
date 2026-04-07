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
    readonly shortcode: string;
    readonly isFumble: boolean;
    readonly isStumble: boolean;
    readonly bleedingSevThreshold: ValueModifier;
    readonly amputateModifier: ValueModifier;
    readonly shockValue: ValueModifier;
    readonly probWeight: ValueModifier;
    readonly protectionBase: {
        blunt: ValueModifier;
        edged: ValueModifier;
        piercing: ValueModifier;
        fire: ValueModifier;
    };
    readonly bodyPart: BodyPart;
    /** Zero-based index of this location within {@link BodyPart.locations}. */
    readonly index: number;

    constructor(data: BodyLocation.Data, bodyPart: BodyPart, index: number) {
        const beingLogic = bodyPart.bodyStructure.beingLogic;

        this.shortcode = data.shortcode;
        this.isFumble = data.isFumble;
        this.isStumble = data.isStumble;
        this.bleedingSevThreshold = new ValueModifier(
            {},
            { parent: beingLogic },
        ).setBase(data.bleedingSevThreshold);
        this.amputateModifier = new ValueModifier(
            {},
            { parent: beingLogic },
        ).setBase(data.amputateModifier);
        this.shockValue = new ValueModifier({}, { parent: beingLogic }).setBase(
            data.shockValue,
        );
        this.probWeight = new ValueModifier({}, { parent: beingLogic }).setBase(
            data.probWeight,
        );
        this.protectionBase = {
            blunt: new ValueModifier({}, { parent: beingLogic }).setBase(
                data.protectionBase.blunt,
            ),
            edged: new ValueModifier({}, { parent: beingLogic }).setBase(
                data.protectionBase.edged,
            ),
            piercing: new ValueModifier({}, { parent: beingLogic }).setBase(
                data.protectionBase.piercing,
            ),
            fire: new ValueModifier({}, { parent: beingLogic }).setBase(
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
        shortcode: string;
        isFumble: boolean;
        isStumble: boolean;
        bleedingSevThreshold: number;
        amputateModifier: number;
        shockValue: number;
        probWeight: number;
        protectionBase: {
            blunt: number;
            edged: number;
            piercing: number;
            fire: number;
        };
    }
}
