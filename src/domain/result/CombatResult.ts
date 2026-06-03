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

import { AttackResult } from "@src/domain/result/AttackResult";
import { DefendResult } from "@src/domain/result/DefendResult";
import { OpposedTestResult } from "@src/domain/result/OpposedTestResult";
import { TEST_TYPE } from "@src/utils/constants";

/** Which combatant a derived result (Tactical Advantages, weapon-break) falls to. */
export type CombatSide = "attacker" | "defender" | "none";

/** Tactical Advantages awarded by an exchange, and to whom. */
export interface TacticalAdvantages {
    side: CombatSide;
    count: number;
}

/**
 * The full result of a **combat exchange** — an {@link OpposedTestResult}
 * composing an {@link AttackResult} and a {@link DefendResult}.
 *
 * CombatResult is the culmination of the combat resolution pipeline:
 *
 * 1. Attacker rolls → {@link AttackResult} (success level, pre-defense
 *    damage, allowed defenses).
 * 2. Defender chooses a defense type and rolls → {@link DefendResult}.
 * 3. CombatResult compares the two via opposed test resolution
 *    (inherited from OpposedTestResult) to determine who prevails.
 *
 * ## What CombatResult determines
 *
 * - Whether the attacker or defender wins the exchange
 *   ({@link sourceWins} / {@link targetWins}, inherited).
 * - The **margin** of victory (difference in success levels).
 * - Mishaps on either side (weapon break, shield break, stumble, fumble).
 *
 * ## What CombatResult does NOT determine
 *
 * The **final damage** is computed separately by the impact resolution
 * stage, which takes the CombatResult's margin, the AttackResult's
 * pre-defense damage, and the target's armor/body location protection
 * to produce an {@link ImpactResult} with the actual injury.
 *
 * ## Resolution model
 *
 * Outcomes are keyed off the **victory score** `VS = attacker.normSuccessLevel
 * − defender.normSuccessLevel` (range −3..+3 on the −1/0/1/2 success scale).
 * This is deliberately the raw level difference, not the inherited
 * {@link OpposedTestResult.sourceWins}/{@link OpposedTestResult.isTied}
 * getters — those carve out a "both failed" case, whereas the SoHL combat
 * tables resolve every exchange by relative margin (a less-bad failure can
 * still beat a worse one).
 *
 * Per-defense outcome (who lands the blow):
 *
 * | Defense       | Attacker delivers            | Defender delivers           |
 * |---------------|------------------------------|-----------------------------|
 * | Block         | `VS >= 0` (tie → also rolls defender weapon-break) | never |
 * | Counterstrike | `VS >= 0`                    | whenever the defender succeeds |
 * | Dodge         | `VS > 0`, or tie with the dodge roll lower than the attack roll | never |
 * | Ignore        | the attack itself succeeds (no defender contest) | never |
 *
 * **Tactical Advantages** (display-only for now): the winner of a `|VS| >= 2`
 * exchange earns `|VS| − 1` TAs (attacker on `VS >= 2`, defender on
 * `VS <= -2`).
 *
 * ## Specialized resolution methods
 *
 * - {@link opposedTestEvaluate} — dispatches by defense type and sets margin/TAs
 * - {@link calcMeleeCombatResult} — Block / Counterstrike / Ignore evaluation
 * - {@link calcDodgeCombatResult} — Dodge evaluation
 */
export class CombatResult extends OpposedTestResult {
    /** The result of the attack test in this combat. */
    attackResult: AttackResult;
    /** The result of the defense test in this combat. */
    defendResult: DefendResult;
    /** Victory score: `attacker.normSuccessLevel − defender.normSuccessLevel`. */
    margin: number;
    /** Tactical Advantages awarded by the exchange (display-only). */
    tacticalAdvantages: TacticalAdvantages;
    /** Whose weapon must roll for breakage as a result of the exchange. */
    weaponBreakCheck: CombatSide;

    constructor(
        data: Partial<CombatResult.Data>,
        options: Partial<CombatResult.Options> = {},
    ) {
        if (!data.attackResult || !data.defendResult) {
            throw new Error(
                "CombatResult requires both attackResult and defendResult",
            );
        }
        super(data, options);
        this.attackResult = data.attackResult;
        this.defendResult = data.defendResult;
        this.margin = 0;
        this.tacticalAdvantages = { side: "none", count: 0 };
        this.weaponBreakCheck = "none";
    }

    /**
     * Evaluate both sides, then resolve the opposed combat outcome.
     */
    override async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (allowed) this.opposedTestEvaluate();
        return allowed;
    }

    /**
     * Resolve the exchange: compute the margin and Tactical Advantages, then
     * dispatch to the defense-specific calculator to set `deliversImpact` on
     * each side. Idempotent — safe to call again after a re-evaluation.
     */
    opposedTestEvaluate(): void {
        this.attackResult.deliversImpact = false;
        this.defendResult.deliversImpact = false;
        this.weaponBreakCheck = "none";
        this.margin =
            this.attackResult.normSuccessLevel -
            this.defendResult.normSuccessLevel;
        this.tacticalAdvantages = CombatResult.tacticalAdvantagesFor(
            this.margin,
        );

        if (this.defendResult.testType === TEST_TYPE.DODGE.id) {
            this.calcDodgeCombatResult();
        } else {
            this.calcMeleeCombatResult();
        }
    }

    /** Award `|VS| − 1` Tactical Advantages to the side that won by 2+. */
    static tacticalAdvantagesFor(vs: number): TacticalAdvantages {
        if (vs >= 2) return { side: "attacker", count: vs - 1 };
        if (vs <= -2) return { side: "defender", count: -(vs + 1) };
        return { side: "none", count: 0 };
    }

    /**
     * Resolve a Block, Counterstrike, or Ignore exchange, setting
     * `deliversImpact` on the attacker (and, for Counterstrike, the defender).
     * Per-side fumble/stumble mishaps are already set by each result's own
     * `evaluate()`; this only decides who lands a blow.
     */
    calcMeleeCombatResult(): void {
        const vs = this.margin;
        const type = this.defendResult.testType;

        if (type === TEST_TYPE.IGNORE.id) {
            // No defense contest — the blow lands if the attack itself hits.
            this.attackResult.deliversImpact = this.attackResult.isSuccess;
            return;
        }

        if (type === TEST_TYPE.COUNTERSTRIKE.id) {
            // The attacker connects on a tie or better; the defender's
            // counterstrike connects whenever its own roll succeeds, so both
            // blows can land in the same exchange.
            this.attackResult.deliversImpact = vs >= 0;
            this.defendResult.deliversImpact = this.defendResult.isSuccess;
            return;
        }

        // Block: the attack lands on a tie or better; a tie additionally forces
        // the defender to roll for weapon (shield) breakage.
        this.attackResult.deliversImpact = vs >= 0;
        if (vs === 0) this.weaponBreakCheck = "defender";
    }

    /**
     * Resolve a Dodge exchange. A dodge never deals damage; the attack lands
     * when it out-margins the dodge, and on a tie when the dodge roll is lower
     * than the attack roll (a lower successful roll is the weaker result).
     */
    calcDodgeCombatResult(): void {
        const vs = this.margin;
        if (vs > 0) {
            this.attackResult.deliversImpact = true;
        } else if (vs === 0) {
            const dodgeRoll = this.defendResult.roll?.total ?? 0;
            const attackRoll = this.attackResult.roll?.total ?? 0;
            this.attackResult.deliversImpact = dodgeRoll < attackRoll;
        }
    }

}

export namespace CombatResult {
    export interface Data extends OpposedTestResult.Data {
        attackResult: AttackResult;
        defendResult: DefendResult;
    }

    export interface Options extends OpposedTestResult.Options {}

    export interface ContextScope {
        priorTestResult: CombatResult | null;
    }
}
