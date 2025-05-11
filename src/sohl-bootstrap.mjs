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

// sohl-bootstrap.mjs
// Must be imported before any modules that use the `sohl` global
import * as helpers from "@utils/helpers.js";
import { SohlLocalize, SohlLogger, SohlClassRegistry } from "@utils";

// Define globalThis.sohl if not already defined
if (!globalThis.sohl) {
    globalThis.sohl = {
        foundry: foundry,
        CONFIG: {
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
                }).map(([k, v]) => [
                    k,
                    { name: `game.sohl?.MOD.${k}`, abbrev: v },
                ]),
            ),
            EVENT: {
                NONE: "none",
                CREATED: "created",
                MODIFIED: "modified",
            },
        },
        CONST: {},
        variants: {},
        game: null, // Placeholder for the active variant
        classRegistry: SohlClassRegistry.getInstance(),
        i18n: SohlLocalize.getInstance(),
        log: SohlLogger.getInstance(),
        utils: helpers,
        simpleCalendar: null, // Placeholder for Simple Calendar API
        ready: false,
    };
}
