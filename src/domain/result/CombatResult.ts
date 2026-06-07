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
import { ImpactResult } from "@src/domain/result/ImpactResult";
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
 * stage, which takes the CombatResult's margin, the AttackResult's impact
 * dice, and the target's armor/body location protection to produce the
 * actual injury.
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
 * - {@link opposedTestEvaluate} — computes margin, Tactical Advantages, and the
 *   weapon-break check.
 * - {@link attackerLandsBlow} / {@link defenderLandsBlow} — derive who connects
 *   (and thus whose impact may be calculated) from the resolved exchange.
 */
export class CombatResult extends OpposedTestResult {
    /** The result of the attack test in this combat. */
    attackResult: AttackResult;
    /**
     * The defender's response. Its **class** encodes the kind of defense:
     * - a {@link DefendResult} for Block / Dodge (and a non-rolling
     *   `DefendResult(IGNORE)` placeholder for Ignore — the defender takes no
     *   part), or
     * - an {@link AttackResult} for a **Counterstrike** — mechanically a second
     *   attack ("offense is the best defense"), so it carries its own impact.
     */
    defendResult: AttackResult | DefendResult;
    /** Victory score: `attacker.normSuccessLevel − defender.normSuccessLevel`. */
    margin: number;
    /** Tactical Advantages awarded by the exchange (display-only). */
    tacticalAdvantages: TacticalAdvantages;
    /** Whose weapon must roll for breakage as a result of the exchange. */
    weaponBreakCheck: CombatSide;
    /** Impact rolled for the attacker, when it lands a blow (else `undefined`). */
    attackerImpact?: ImpactResult;
    /**
     * Impact rolled for the defender, when it lands a blow — only possible on a
     * Counterstrike (else `undefined`).
     */
    defenderImpact?: ImpactResult;

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
     * Evaluate the defender's side locally, then resolve the opposed combat
     * outcome.
     *
     * Unlike the inherited {@link OpposedTestResult.evaluate}, this does NOT
     * evaluate the attacker's side. The `attackResult` arrives as a read-only
     * snapshot already evaluated on the attacker's client; re-evaluating it
     * here would trip the attacker's `_speaker.isOwner` gate on the defender's
     * machine. Only `defendResult` (owned by the local user) is evaluated; the
     * attacker's outcome is read as-is by {@link opposedTestEvaluate}.
     */
    override async evaluate(): Promise<boolean> {
        const allowed = await this.defendResult.evaluate();
        if (allowed) this.opposedTestEvaluate();
        return allowed;
    }

    /**
     * Resolve the exchange: compute the margin, Tactical Advantages, and the
     * weapon-break check. Who lands a blow is derived on demand by
     * {@link attackerLandsBlow}/{@link defenderLandsBlow}. Idempotent — safe to
     * call again after a re-evaluation.
     */
    opposedTestEvaluate(): void {
        this.weaponBreakCheck = "none";
        this.margin =
            this.attackResult.normSuccessLevel -
            this.defendResult.normSuccessLevel;
        this.tacticalAdvantages = CombatResult.tacticalAdvantagesFor(
            this.margin,
        );

        // Block forces the defender to roll for weapon (shield) breakage on a
        // tie; no other defense has a weapon-break side effect.
        if (
            this.defendResult.testType === TEST_TYPE.BLOCK.id &&
            this.margin === 0
        ) {
            this.weaponBreakCheck = "defender";
        }

        // Roll the impact for each side that lands a blow (this is *when* impact
        // is rolled). Guarded on the side carrying an impact formula — a
        // DefendResult (block/dodge/ignore) has none.
        this.attackerImpact =
            this.attackerLandsBlow && this.attackResult.impact ?
                this.rollImpact(this.attackResult)
            :   undefined;
        this.defenderImpact =
            (
                this.defenderLandsBlow &&
                this.defendResult instanceof AttackResult &&
                this.defendResult.impact
            ) ?
                this.rollImpact(this.defendResult)
            :   undefined;
    }

    /** Build (and roll) an {@link ImpactResult} from a landing attack. */
    private rollImpact(ar: AttackResult): ImpactResult {
        return new ImpactResult(
            {
                speaker: ar.speaker,
                impactModifier: ar.impact,
                aimBodyPartCode: ar.aimBodyPartCode,
                spread: ar.spread,
                source: ar.title,
            },
            { parent: ar.parent },
        );
    }

    /** Award `|VS| − 1` Tactical Advantages to the side that won by 2+. */
    static tacticalAdvantagesFor(vs: number): TacticalAdvantages {
        if (vs >= 2) return { side: "attacker", count: vs - 1 };
        if (vs <= -2) return { side: "defender", count: -(vs + 1) };
        return { side: "none", count: 0 };
    }

    /**
     * Whether the **attacker** lands a blow — i.e. connects, so its impact may
     * then be calculated. Derived from the resolved exchange. Note a landed
     * blow can still be fully absorbed by armor downstream, so this means
     * "connected", not "dealt damage".
     *
     * - **Counterstrike** (defender side is an {@link AttackResult}): the attack
     *   ties or wins (`margin >= 0`).
     * - **Ignore:** the unopposed attack simply has to succeed.
     * - **Dodge:** the attack out-margins the dodge, or ties with a lower dodge
     *   roll than the attack roll (a lower successful roll is the weaker result).
     * - **Block:** the attack ties or wins (`margin >= 0`).
     */
    get attackerLandsBlow(): boolean {
        const vs = this.margin;
        // Counterstrike — the defender's response is itself an attack.
        if (this.defendResult instanceof AttackResult) return vs >= 0;

        const type = this.defendResult.testType;
        if (type === TEST_TYPE.IGNORE.id) return this.attackResult.isSuccess;
        if (type === TEST_TYPE.DODGE.id) {
            if (vs > 0) return true;
            if (vs < 0) return false;
            const dodgeRoll = this.defendResult.roll?.total ?? 0;
            const attackRoll = this.attackResult.roll?.total ?? 0;
            return dodgeRoll < attackRoll;
        }
        // Block.
        return vs >= 0;
    }

    /**
     * Whether the **defender** lands a blow. Only a counterstrike lets the
     * defender strike back (its response is an {@link AttackResult}), and only
     * when its own roll succeeds — so both sides can land in the same exchange.
     */
    get defenderLandsBlow(): boolean {
        return (
            this.defendResult instanceof AttackResult &&
            this.defendResult.isSuccess
        );
    }
}

export namespace CombatResult {
    export interface Data extends OpposedTestResult.Data {
        attackResult: AttackResult;
        defendResult: AttackResult | DefendResult;
    }

    export interface Options extends OpposedTestResult.Options {}

    export interface ContextScope {
        priorTestResult: CombatResult;
        attackResult: AttackResult;
    }
}
