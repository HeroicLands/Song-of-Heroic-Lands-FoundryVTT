/* SPDX-License-Identifier: GPL-3.0-or-later */
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";

/**
 * Derive a weapon's optional Hold attack without changing its damaging mode.
 * The caller supplies a collision-free runtime shortcode and localized name.
 * @param mode - Persisted weapon mode.
 * @param shortcode - Stable runtime alternative identity within the weapon.
 * @param name - Localized option name.
 * @returns A zero-impact Hold mode, or undefined without a melee entangle trait.
 */
export function entangleAlternative(
    mode: StrikeModeBase.Data,
    shortcode: string,
    name: string,
): MeleeStrikeMode.Data | undefined {
    if (mode.type !== "melee" || !mode.traits?.entangle) return undefined;
    const melee = mode as MeleeStrikeMode.Data;
    return {
        ...melee,
        shortcode,
        name,
        attack: { ...melee.attack },
        impactBase: { numDice: 0, die: null, modifier: 0, aspect: "blunt" },
        traits: {
            ...melee.traits,
            hold: true,
            take: false,
            strRoll: true,
            noStrMod: true,
            swung: false,
            entangle: false,
            envelop: false,
        },
        defense: {
            block: { ...melee.defense?.block },
            counterstrike: { ...melee.defense?.counterstrike },
        },
    };
}
