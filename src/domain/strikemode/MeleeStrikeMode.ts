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

import type { SohlLogic } from "@src/core/SohlLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { CombatModifier } from "@src/domain/modifier/CombatModifier";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { STRIKE_MODE_TYPE } from "@src/utils/constants";

const { NumberField, StringField, SchemaField, BooleanField } =
    foundry.data.fields;

/**
 * A melee strike mode — close-combat attack with accuracy, reach, and
 * defense capabilities (block and counterstrike).
 */
export class MeleeStrikeMode extends StrikeModeBase {
    /** Length of the weapon in this mode (feet). */
    readonly length: ValueModifier;
    /** Effective melee engagement range (feet). */
    readonly reach: ValueModifier;
    /** Defense modifiers for block and counterstrike. */
    readonly defense: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };

    constructor(
        data: MeleeStrikeMode.Data,
        parentLogic: SohlLogic,
        id: string,
    ) {
        super(data, parentLogic, id);
        this.length = new ValueModifier({}, { parent: parentLogic }).setBase(
            data.lengthBase,
        );
        // Reach is computed during evaluate() from the wielder's lineage
        // reach plus this mode's effective length; it starts at base 0.
        this.reach = new ValueModifier({}, { parent: parentLogic });
        this.defense = {
            block: new CombatModifier({}, { parent: parentLogic }),
            counterstrike: new CombatModifier({}, { parent: parentLogic }),
        };
        if (data.defense.block.modifier) {
            this.defense.block.add(
                "Block Modifier",
                "BlkMod",
                data.defense.block.modifier,
            );
        }
        if (data.defense.counterstrike.modifier) {
            this.defense.counterstrike.add(
                "Counterstrike Modifier",
                "CtrMod",
                data.defense.counterstrike.modifier,
            );
        }
        if (data.defense.block.disabled || data.traits?.noBlock) {
            this.defense.block.disabledReason =
                "This strike mode cannot be used for blocking.";
        }
        if (
            data.defense.counterstrike.disabled ||
            data.traits?.noCounterstrike
        ) {
            this.defense.counterstrike.disabledReason =
                "This strike mode cannot be used for counterstriking.";
        }
    }

    /**
     * Recompute this mode's reach during the evaluate phase: the wielder's
     * lineage effective reach becomes the base, and the (already-evaluated)
     * effective weapon length is layered on as a delta. Any `sm:reach`
     * effect deltas applied earlier in the lifecycle are preserved.
     *
     * Idempotent — re-evaluating replaces the length delta rather than
     * accumulating it.
     *
     * @param lineageReach - The wielder's lineage effective reach (feet);
     *   see {@link actorLineageReach}.
     */
    evaluate(lineageReach: number): void {
        this.reach.setBase(lineageReach);
        this.reach.add("SOHL.INFO.Length", "Len", this.length.effective);
    }

    /**
     * SchemaField definition for melee strike modes — used as one branch
     * of the TypedSchemaField on `CombatTechniqueDataModel.strikeMode`.
     */
    static schemaFields(): foundry.data.fields.DataSchema {
        return {
            ...StrikeModeBase.baseSchemaFields(),
            type: new StringField({
                required: true,
                blank: false,
                choices: [STRIKE_MODE_TYPE.MELEE],
                initial: STRIKE_MODE_TYPE.MELEE,
            }),
            lengthBase: new NumberField({
                integer: false,
                min: 0,
                initial: 0,
            }),
            defense: new SchemaField({
                block: new SchemaField({
                    disabled: new BooleanField({ initial: false }),
                    modifier: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                    successLevelMod: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                }),
                counterstrike: new SchemaField({
                    disabled: new BooleanField({ initial: false }),
                    modifier: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                    successLevelMod: new NumberField({
                        integer: true,
                        initial: 0,
                    }),
                }),
            }),
        };
    }
}

export namespace MeleeStrikeMode {
    export interface Data extends StrikeModeBase.Data {
        type: "melee";
        lengthBase: number;
        defense: {
            block: {
                disabled?: boolean;
                modifier?: number;
                successLevelMod?: number;
            };
            counterstrike: {
                disabled?: boolean;
                modifier?: number;
                successLevelMod?: number;
            };
        };
    }
}
