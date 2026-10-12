/* SPDX-License-Identifier: GPL-3.0-or-later */
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ITEM_KIND, SKILL_CODE } from "@src/utils/constants";

/** Shortcode of the persistent owner-controlled Enveloped physcond Trauma. */
export const ENVELOPED_CODE = "enveloped";

/** The weapon/skill surface needed to update combat modifiers. */
interface EnvelopedCarrier {
    strikeModes: StrikeModeBase[];
    masteryLevel?: ValueModifier;
    data?: { shortcode: string };
    actorLogic?: unknown;
}

/**
 * Apply or remove the named Enveloped penalty from all attack and defence rolls.
 * It depends on the ongoing trauma, never on the incoming weapon's trait.
 * @param logic - Owned weapon or skill whose rolls are being finalized.
 */
export function applyEnvelopedCombat(logic: EnvelopedCarrier): void {
    const actor = logic.actorLogic as
        | {
              getItemLogic?: (
                  code: string,
                  kind: string,
              ) => { data?: { subType?: string } } | undefined;
          }
        | undefined;
    const active =
        actor?.getItemLogic?.(ENVELOPED_CODE, ITEM_KIND.TRAUMA)?.data?.subType === "physcond";
    const modifiers: ValueModifier[] = logic.strikeModes.flatMap((mode) => [
        mode.attack,
        ...(mode.isMelee ?
            [
                (mode as MeleeStrikeMode).defense.block,
                (mode as MeleeStrikeMode).defense.counterstrike,
            ]
        :   []),
    ]);
    if (logic.data?.shortcode === SKILL_CODE.DODGE && logic.masteryLevel)
        modifiers.push(logic.masteryLevel);
    for (const modifier of modifiers) {
        modifier.delete("Env");
        if (active) modifier.add("SOHL.Enveloped.condition", "Env", -20);
    }
}
