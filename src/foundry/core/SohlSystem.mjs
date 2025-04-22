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

import { MersenneTwister } from "../../utils/MersenneTwister.js";
import { SimpleRoll } from "../../utils/SimpleRoll.js";
import { SohlActor } from "../actor/SohlActor.mjs";
import { SohlItem } from "../item/SohlItem.mjs";
import { ActionContext } from "./ActionContext.mjs";
import { SohlSpeaker } from "./SohlSpeaker.mjs";
import { SuccessTestResult } from "../../logic/common/core/result/SuccessTestResult.js";
import { TestResult } from "../../logic/common/core/result/TestResult.js";

const { Roll } = foundry.dice;
const { Die, RollTerm } = foundry.dice.terms;

export class SohlSystem {
    /**
     * A short string ID for this system variant.
     */
    id;

    /**
     * The human-readable title of the system variant.
     */
    title;

    /**
     * The core system configuration object.
     */
    CONFIG = {
        statusEffects: [
            {
                id: "incapacitated",
                name: "incapacitated",
                img: "systems/sohl/assets/icons/knockout.svg",
            },
            {
                id: "vanquished",
                name: "vanquished",
                img: "systems/sohl/assets/icons/surrender.svg",
            },
        ],

        specialStatusEffects: {
            DEFEATED: "vanquished",
        },

        controlIcons: {
            defeated: "systems/sohl/assets/icons/surrender.svg",
        },
        MOD: Object.fromEntries(
            Object.entries({
                Player: "SitMod",
                MinimumValue: "MinVal",
                MaximumValue: "MaxVal",
                Outnumbered: "Outn",
                OffHand: "OffHnd",
                MagicModifier: "MagMod",
                MasteryLevelDisabled: "MLDsbl",
                FateBonus: "FateBns",
                NoFateAvailable: "NoFate",
                MasteryLevelAttrBoost: "MlAtrBst",
                TraitNoML: "NotAttrNoML",
                SunsignModifier: "SSMod",
                Durability: "Dur",
                ItemWeight: "ItmWt",
                NoMissileDefense: "NoMslDef",
                NoModifierNoDie: "NMND",
                NoBlocking: "NoBlk",
                NoCounterstrike: "NoCX",
                NoFateNPC: "NPC",
                NoFateSettings: "NoFateSetg",
                NoFateAura: "NoFateAura",
                NoCharges: "NoChrg",
                NoUseCharges: "NoUseChrg",
                NoHealRate: "NoHeal",
                NotNumNoScore: "NoScore",
                NotNumNoFate: "NotNumNoFate",
                NotNumNoML: "NoML",
                NotDisabled: "",
                ArmorProtection: "ArmProt",
            }).map(([k, v]) => [k, { name: `game.sohl?.MOD.${k}`, abbrev: v }]),
        ),
        EVENT: {
            NONE: "none",
            CREATED: "created",
            MODIFIED: "modified",
        },
    };

    twist = MersenneTwister.getInstance();

    /**
     * Generate a Foundry VTT Roll instance that reflects the current state.
     */
    static async createRoll(simpleRoll) {
        function isDieTerm(term) {
            const DieTerm = CONFIG.Dice.termTypes.Die;
            return term instanceof DieTerm;
        }

        const formulaParts = [];
        if (simpleRoll.numDice > 0 && simpleRoll.dieFaces > 0) {
            formulaParts.push(`${simpleRoll.numDice}d${simpleRoll.dieFaces}`);
        }
        if (simpleRoll.modifier !== 0) {
            formulaParts.push(
                (simpleRoll.modifier > 0 ? "+" : "") + simpleRoll.modifier,
            );
        }

        const formula = formulaParts.join(" ");
        const roll = new Roll(formula);
        for (const term of roll.terms) {
            if (isDieTerm(term)) {
                if (simpleRoll.rolls.length !== term.number) {
                    throw new Error(
                        "Mismatch between term and provided rolls.",
                    );
                }
                term.results = simpleRoll.rolls.map((r) => ({
                    result: r,
                    active: true,
                }));
                await term.evaluate({ async: false });
            }
        }
        return roll;
    }

    /**
     * The system initialization message, displayed during loading.
     */
    INIT_MESSAGE;

    static actionContextFactory(doc, speaker, user) {
        user = user || game.user;
        if (doc instanceof SohlToken) {
            return new ActionContext({
                token: doc.actor,
                user,
                speaker,
            });
        } else if (doc instanceof SohlActor) {
            return new ActionContext({ actor: doc, user, speaker });
        } else if (doc instanceof SohlItem) {
            return new ActionContext({
                item: doc,
                user,
                speaker,
            });
        }
        throw new Error("Invalid document type");
    }

    static chatSpeakerFactory(parent, speaker, rollMode) {
        return new SohlSpeaker(parent, { speaker });
    }

    static successTestResultFactory(parent, { chat, type, title, mlMod } = {}) {
        return new SuccessTestResult(parent, { chat, type, title, mlMod });
    }
}
