/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActionContext } from "@common/SohlActionContext";

import { SohlLogic } from "@common/SohlLogic";
import { COMBATANT_KIND, ITEM_KIND } from "@utils/constants";
import { SohlCombatant } from "@common/combatant/SohlCombatant";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
const { ArrayField, StringField, DocumentIdField } = foundry.data.fields;

export class SohlCombatantData
    extends SohlLogic<SohlCombatantData.Data>
    implements SohlCombatantData.Logic
{
    get combatant(): SohlCombatant {
        return this.parent.parent;
    }

    get actor(): SohlActor | null {
        return this.combatant.actor;
    }

    get token(): SohlTokenDocument | null {
        return this.combatant.token || null;
    }

    get threatened(): SohlCombatant[] {
        if (!this.combatant.token || this.combatant.isDefeated) return [];
        const threatenedList = this.data.threatenedAllyIds;
        return threatenedList
            .map((id: string) => {
                const combatant = game.combat?.combatants.get(id);
                if (combatant) {
                    return combatant;
                }
                return null;
            })
            .filter(Boolean) as SohlCombatant[];
    }

    async addThreatened(...combatants: SohlCombatant[]) {
        const threatenedIds = new Set<string>(this.data.threatenedAllyIds);
        let allyIds = new Set<string>(this.data.allyIds);
        for (const combatant of combatants) {
            if (!combatant || combatant.isDefeated) continue;
            if (!threatenedIds.has(combatant.id || "")) {
                threatenedIds.add(combatant.id || "");
            }
            // Remove the threatened combatant from the ally list if it is present,
            // because a threatened combatant cannot be an ally.
            if (allyIds.has(combatant.id || "")) {
                allyIds.delete(combatant.id || "");
            }
        }
        this.combatant.update({
            name: "foo",
            system: {
                threatenedAllyIds: Array.from(threatenedIds),
                allyIds: Array.from(allyIds),
            },
        });
    }

    async removeThreatened(combatant: SohlCombatant) {
        if (!combatant) return;
        const threatenedIds = new Set<string>(this.data.threatenedAllyIds);
        if (threatenedIds.has(combatant.id || "")) {
            threatenedIds.delete(combatant.id || "");
            this.combatant.update({
                system: {
                    threatenedAllyIds: Array.from(threatenedIds),
                },
            });
        }
    }

    get threatenedBy(): SohlCombatant[] {
        return (game as any).combat?.combatants.reduce(
            (acc: SohlCombatant[], combatant: SohlCombatant) => {
                if (
                    (combatant.system as any).threatenedAllyIds?.includes(
                        this.combatant.id || "",
                    )
                ) {
                    acc.push(combatant);
                }
                return acc;
            },
            [],
        );
    }

    get allies(): SohlCombatant[] {
        if (!this.combatant.token || this.combatant.isDefeated) return [];
        return this.data.allyIds
            .map((id: string) => {
                const combatant = game.combat?.combatants.get(id);
                if (combatant) {
                    return combatant;
                }
                return null;
            })
            .filter(Boolean) as SohlCombatant[];
    }

    async addAlly(...combatants: SohlCombatant[]) {
        const allyIds = new Set<string>(this.data.allyIds);
        for (const combatant of combatants) {
            if (combatant.isDefeated) continue;
            allyIds.add(combatant.id || "");
        }
        this.combatant.update({
            system: {
                allyIds: Array.from(allyIds),
            },
        });
    }

    async removeAlly(combatant: SohlCombatant) {
        if (!combatant) return;
        const allyIds = new Set<string>(this.data.allyIds);
        if (allyIds.has(combatant.id || "")) {
            allyIds.delete(combatant.id || "");
            this.combatant.update({
                system: {
                    allyIds: Array.from(allyIds),
                },
            });
        }
    }

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {}

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {}

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {}
}

export namespace SohlCombatantData {
    export const Kind = COMBATANT_KIND.COMBATANTDATA;

    /**
     * The FontAwesome icon class for the SohlCombatantData combatant.
     */
    export const IconCssClass = "fa-duotone fa-people-group";

    /**
     * The image path for the SohlCombatantData combatant.
     */
    export const Image = "systems/sohl/assets/icons/people-group.svg";

    function defineSohlCombatantDataSchema(): foundry.data.fields.DataSchema {
        return {
            /**
             * An array of combatants which are considered allies of this combatant.
             */
            allyIds: new ArrayField(
                new StringField({
                    blank: false,
                    nullable: false,
                }),
            ),

            /**
             * An array of combatants which are the initial allies of this combatant.
             */
            initAllyIds: new ArrayField(
                new StringField({ blank: false, nullable: false }),
            ),

            /**
             * An array of combatants that are currently threatened by this combatant.
             * The rules determining whether an opponent is threatened are specific to
             * each variation. This is useful for various combat mechanics, such as
             * determining if a combatant is outnumbered or can be attacked in melee.
             */
            threatenedAllyIds: new ArrayField(
                new StringField({ blank: false, nullable: false }),
            ),
        };
    }

    type SohlCombatantDataSchema = ReturnType<
        typeof defineSohlCombatantDataSchema
    >;

    export interface Logic extends SohlLogic<Data> {}

    export interface Data extends SohlLogic.Data<SohlCombatant, any> {
        allyIds: string[];
        initAllyIds: string[];
        threatenedAllyIds: string[];
    }

    export class DataModel
        extends SohlDataModel<SohlCombatantDataSchema, SohlCombatant, Logic>
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["SohlCombatantData"];
        static override readonly kind = Kind;
        allyIds!: string[];
        initAllyIds!: string[];
        threatenedAllyIds!: string[];

        get actor(): SohlActor | null {
            return this.parent.actor;
        }

        get i18nPrefix(): string {
            return `SOHL.Combatant.${this.kind}`;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return defineSohlCombatantDataSchema();
        }
    }
}
