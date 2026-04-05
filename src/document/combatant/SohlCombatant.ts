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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SkillLogic } from "@src/document/item/logic/SkillLogic";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlCombat } from "@src/document/combat/SohlCombat";
import { getCanvas } from "@src/core/FoundryProxy";
import { expandAllyGroups } from "./combatant-logic";

export class SohlCombatant<
    SubType extends Combatant.SubType = Combatant.SubType,
> extends Combatant<SubType> {
    get actor(): SohlActor | null {
        return super.actor as SohlActor | null;
    }

    /**
     * An array of combatants which are considered allies of this combatant.
     */
    get allies(): SohlCombatant[] {
        if (!this.combat) return [];
        const combatData = this.combat.system as SohlCombatantDataModel;

        const myGroups = new Set(combatData.groups);
        if (!myGroups.size) return [];
        const combat = this.combat as SohlCombat;

        const expandedGroups = expandAllyGroups(myGroups, (group) =>
            combat.allyGroups(group),
        );

        // A combatant is an ally if they share any group with me (including through allied groups)
        return combat.combatants.contents.filter((combatant: SohlCombatant) => {
            if (combatant === this) return false;

            const otherGroups = combatData.groups;
            return otherGroups.some((group: string) =>
                expandedGroups.has(group),
            );
        }) as SohlCombatant[];
    }

    /**
     * An array of combatants which are currently threatening this combatant.
     * The rules determining whether an opponent is threatening are specific to
     * each variation. This is useful for various combat mechanics, such as
     * determining if a combatant is outnumbered or can be attacked in melee.
     */
    get threatenedBy(): SohlCombatant[] {
        // TODO: Implement calculation of threatenedBy based on reactions
        return [];
    }

    /**
     * .
     *
     * @returns True if the combatant has performed an action, false otherwise.
     */
    get didAction(): boolean {
        return (this.system as SohlCombatantDataModel).didAction;
    }

    /**
     * The number of spaces this combatant has moved since
     * the start of its turn.
     *
     * @returns The number of spaces moved this turn.
     */
    get spacesMovedThisTurn(): number {
        const start = (this.system as SohlCombatantDataModel).startLocation;
        const current = (this.token as any)?.object?.center ??
            (this.token as any)?.center ?? {
                x: start.x,
                y: start.y,
            };

        const result = getCanvas().grid?.measurePath(
            [
                {
                    x: start.x,
                    y: start.y,
                    elevation: start.elevation,
                },
                {
                    x: current.x,
                    y: current.y,
                    elevation: (this.token as any)?.elevation,
                },
            ],
            {},
        );

        return result?.spaces ?? 0;
    }

    /**
     * The default dice formula which should be used for initiative for this combatant.
     * @remark
     * The SOHL system uses a different approach to initiative than the default Foundry VTT system.
     * Initiative is determined by the character's initiative skill, not a random die roll.
     * So, the roll object returned by this method will always evaluate to the actor's initiative skill,
     * a single number, rather than a dice formula.
     *
     * @returns The initiative formula to use for this combatant.
     */
    override _getInitiativeFormula(): string {
        if (this.actor) {
            const init = this.actor.itemTypes.skill.find(
                (s) => (s.system as any).shortcode === "init",
            ) as unknown as SohlItem;
            if (init) {
                return String(
                    (init.logic as SkillLogic).masteryLevel.effective,
                );
            }
        }
        return "0";
    }
}

function defineSohlCombatantDataSchema(): foundry.data.fields.DataSchema {
    return {
        groups: new foundry.data.fields.ArrayField(
            new foundry.data.fields.StringField({ blank: false }),
            {
                initial: [],
            },
        ),
        startLocation: new foundry.data.fields.ObjectField({
            initial: {
                x: 0,
                y: 0,
                elevation: 0,
            },
            fields: {
                x: new foundry.data.fields.NumberField({ required: true }),
                y: new foundry.data.fields.NumberField({ required: true }),
                elevation: new foundry.data.fields.NumberField({ initial: 0 }),
            },
        }),
        didAction: new foundry.data.fields.BooleanField({
            required: false,
            initial: false,
        }),
    };
}

type SohlCombatantDataSchema = ReturnType<typeof defineSohlCombatantDataSchema>;

export class SohlCombatantDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlCombatantDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlCombatant> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Combatant"];
    static readonly kind = "sohlcombatantdata";
    groups!: string[];
    startLocation!: {
        x: number;
        y: number;
        elevation: number;
    };
    didAction!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlCombatantDataSchema();
    }
}
