/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { entity } from "@src/entity/registry";
import { registerEntity } from "@src/entity/entityRegistry";
import { fvttLogicFromUuidSync } from "@src/core/FoundryHelpers";
import { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { AttackResult } from "@src/entity/result/AttackResult";
import { DefendResult } from "@src/entity/result/DefendResult";
import type { ImpactResult } from "@src/entity/result/ImpactResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { weightedRandom } from "@src/entity/body/weighted-random";
import type { BodyPart } from "@src/entity/body/BodyPart";
import { TEST_TYPE } from "@src/utils/constants";
import { registerKind } from "@src/utils/kindRegistry";

/**
 * Points of impact a limb block takes off a blow that lands on the blocking
 * limb. A limb wards a fraction of what a shield does, and this is the whole of
 * it — against anything with an edge it is close to nothing.
 */
const LIMB_BLOCK_WARD = 2;

/** Which combatant a derived result (Tactical Advantages, weapon-break) falls to. */
export type CombatSide = "attacker" | "defender" | "none";

/** Tactical Advantages awarded by an exchange, and to whom. */
export interface TacticalAdvantages {
    /** Which combatant the Tactical Advantages are awarded to. */
    side: CombatSide;
    /** How many Tactical Advantages were earned (`|VS| − 1` for the winner). */
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
 * still beat a worse one). Winning the exchange is not the same as landing a
 * blow: a failed attack takes the margin, and any Tactical Advantages that come
 * with it, without ever connecting.
 *
 * Per-defense outcome (who lands the blow). The attacker's side of every row is
 * conditional on the attack test having succeeded — a failed attack never
 * lands, however badly the defence blundered:
 *
 * | Defense       | Attacker delivers            | Defender delivers           |
 * |---------------|------------------------------|-----------------------------|
 * | Block         | `VS > 0` (a tie wards the blow, and rolls the defender's weapon-break) | never |
 * | Limb Block    | `VS >= 0` (a tie lands on the blocking limb) | never |
 * | Counterstrike | `VS >= 0`                    | whenever the defender succeeds |
 * | Dodge         | `VS > 0`, or tie with the dodge roll lower than the attack roll | never |
 * | Ignore        | always — no defender contest | never |
 *
 * ## Limb Block
 *
 * A **limb block** — a block made with a forearm, a shin or a shoulder, marked
 * by the `limbBlock` trait on the blocking strike mode — wards safely only on a
 * **clear victory**: a higher success level than the attacker, with no tiebreak
 * to help. On **tied successes the blow lands on the blocking limb itself**
 * ({@link limbBlockStrikesLimb}): {@link blockingLimbLocationCode} names the
 * struck location within that limb, the impact carries a flat `LmbBlk` ward
 * delta, and the limb's own armour then applies as normal on top of it. A limb
 * is not a weapon, so no limb block ever sets the defender's weapon-break check.
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
    /** Victory score: `attacker.normSuccessLevel − defender.normSuccessLevel`. */
    margin: number;
    /** Tactical Advantages awarded by the exchange (display-only). */
    tacticalAdvantages: TacticalAdvantages;
    /** Whose weapon must roll for breakage as a result of the exchange. */
    weaponBreakCheck: CombatSide;
    /**
     * Shortcode of the hit location the blow lands on when a limb block takes
     * it ({@link limbBlockStrikesLimb}); `""` in every other exchange, and when
     * the defender has no body part the technique could have blocked with.
     */
    blockingLimbLocationCode: string;
    /** Impact rolled for the attacker, when it lands a blow (else `undefined`). */
    attackerImpact?: ImpactResult;
    /**
     * Impact rolled for the counterstriker, when they land a blow — only possible on a
     * Counterstrike (else `undefined`).
     */
    cxImpact?: ImpactResult;

    /**
     * Constructs a combat result from an attack/defense pair, seeding the
     * margin, Tactical Advantages, and weapon-break check to their initial
     * (unresolved) values.
     * @param data - Must include both
     *   {@link CombatResult.Data.attackResult | attackResult} and
     *   {@link CombatResult.Data.defendResult | defendResult}; the remaining
     *   {@link OpposedTestResult.Data} fields are optional.
     * @param options - Result options; `options.parent` (the initiating Logic)
     *   is required by the base {@link TestResult} constructor.
     * @throws If `attackResult` or `defendResult` is missing, or if no `parent`
     *   is provided.
     */
    constructor(data: Partial<CombatResult.Data>, options: Partial<CombatResult.Options> = {}) {
        // Accept either the domain names (attackResult/defendResult) or the
        // inherited names (sourceTestResult/targetTestResult) so the constructor
        // works both at build-time and when defaultFromJSON revives from JSON
        // that only carries the serialized sourceTestResult/targetTestResult keys.
        const attackResult =
            data.attackResult ?? (data.sourceTestResult as AttackResult | undefined);
        const defendResult =
            data.defendResult ??
            (data.targetTestResult as (AttackResult | DefendResult) | undefined);
        if (!attackResult) {
            throw new Error("CombatResult requires attackResult");
        }
        if (!defendResult) {
            throw new Error("CombatResult requires defendResult");
        }
        super(
            {
                ...data,
                sourceTestResult: attackResult,
                targetTestResult: defendResult,
            },
            options,
        );
        this.margin = 0;
        this.tacticalAdvantages = { side: "none", count: 0 };
        this.weaponBreakCheck = "none";
        this.blockingLimbLocationCode = "";
    }

    /** The result of the attack test — aliases {@link sourceTestResult}. */
    get attackResult(): AttackResult {
        return this.sourceTestResult as AttackResult;
    }

    /**
     * The defender's response — aliases {@link targetTestResult}. Its **class**
     * encodes the kind of defense chosen (block/dodge → {@link DefendResult};
     * counterstrike → {@link AttackResult}).
     */
    get defendResult(): AttackResult | DefendResult {
        return this.targetTestResult as AttackResult | DefendResult;
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
     * @returns `true` if the defender's evaluation was allowed (and the exchange resolved), `false` otherwise.
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
        this.blockingLimbLocationCode = "";
        this.margin = this.attackResult.normSuccessLevel - this.defendResult.normSuccessLevel;
        this.tacticalAdvantages = CombatResult.tacticalAdvantagesFor(this.margin);

        // Block forces the defender to roll for weapon (shield) breakage on a
        // tie — the blocking weapon absorbed a blow it did not out-fight, and
        // may not survive doing so. It follows that there must have *been* a
        // blow: a tie between two failures had nothing to absorb. No other
        // defense has a weapon-break side effect, and a limb block has no
        // weapon in it to break.
        if (
            this.defendResult.testType === TEST_TYPE.BLOCK.id &&
            !this.isLimbBlock &&
            this.margin === 0 &&
            this.attackResult.isSuccess
        ) {
            this.weaponBreakCheck = "defender";
        }

        // A limb block that ties lands the blow on the limb that was raised, so
        // the location is settled here rather than drawn across the whole body
        // downstream.
        if (this.limbBlockStrikesLimb) {
            this.blockingLimbLocationCode = this.drawBlockingLimbLocation();
        }

        // Roll the impact for each side that lands a blow (this is *when* impact
        // is rolled). Guarded on the side carrying an impact formula — a
        // DefendResult (block/dodge/ignore) has none.
        if (this.attackerLandsBlow && this.attackResult.impact) {
            // The partial ward comes off the impact as a named delta, so the
            // damage card says where the two points went. Same abbrev on a
            // re-evaluation replaces rather than stacks.
            if (this.limbBlockStrikesLimb) {
                this.attackResult.impact.add(
                    "SOHL.CombatResult.limbBlockWard",
                    "LmbBlk",
                    -LIMB_BLOCK_WARD,
                );
            }
            this.attackerImpact = this.rollImpact(this.attackResult);
        } else {
            this.attackerImpact = undefined;
        }
        this.cxImpact =
            this.defenderLandsBlow && this.defendResult instanceof AttackResult ?
                this.rollImpact(this.defendResult)
            :   undefined;
    }

    /**
     * Whether the defence was a **limb block** — a block whose strike mode
     * carries the `limbBlock` trait. The trait is what marks the technique, so a
     * creature whose own anatomy gives it an equivalent declares it the same way.
     */
    get isLimbBlock(): boolean {
        if (this.defendResult.testType !== TEST_TYPE.BLOCK.id) return false;
        const mode = (this.defendResult as DefendResult).mode;
        return !!mode?.traits?.limbBlock;
    }

    /**
     * Whether the blow lands on the blocking limb: a limb block whose successes
     * tied, where an ordinary block would have warded it.
     */
    get limbBlockStrikesLimb(): boolean {
        return this.isLimbBlock && this.margin === 0 && this.attackResult.isSuccess;
    }

    /**
     * Draw the struck location within the blocking limb.
     *
     * The limbs a technique can be performed with are the body-part roles its
     * governing skill names in `impairedByRoles` — a Limb Block is a
     * manipulator's, so an arm is raised. One of those parts is drawn by its own
     * selection weight, then a location within it, which is how this system
     * resolves "where within a limb".
     *
     * @returns The struck location's shortcode, or `""` when the defender has no
     *   part the technique could have blocked with.
     */
    private drawBlockingLimbLocation(): string {
        const structure = getActorBody(
            (this.defendResult as DefendResult).combatant?.actorLogic,
        )?.structure;
        if (!structure) return "";
        const mode = (this.defendResult as DefendResult).mode;
        const roles =
            (mode?.parent as { data?: { impairedByRoles?: string[] } } | undefined)?.data
                ?.impairedByRoles ?? [];
        const candidates: BodyPart[] = [];
        for (const role of roles) {
            for (const part of structure.getPartsByRole(role)) {
                if (part.locations.length > 0 && !candidates.includes(part)) candidates.push(part);
            }
        }
        if (candidates.length === 0) return "";
        return weightedRandom(candidates).getRandomLocation().shortcode;
    }

    /**
     * Build (and roll) an {@link ImpactResult} from a landing attack.
     * @param ar - The attack result that landed the blow.
     * @returns The rolled impact result for that attack.
     */
    private rollImpact(ar: AttackResult): ImpactResult {
        return new entity.ImpactResult(
            {
                speaker: ar.speaker,
                impactModifier: ar.impact,
                label: ar.title,
            },
            { parent: ar.parent },
        );
    }

    /**
     * Award `|VS| − 1` Tactical Advantages to the side that won by 2+.
     * @param vs - The victory spread (attacker margin minus defender margin).
     * @returns The Tactical Advantages owed, attributed to the winning side.
     */
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
     * Two conditions govern a landed blow, and **both** must hold:
     *
     * 1. **The attack test succeeded.** However badly the defender blundered, a
     *    swing that never found its line does not arrive.
     * 2. **The attack beat the defence** by the margin that defence demands:
     *
     * - **Counterstrike** (defender side is an {@link AttackResult}): the
     *   counterstrike does not out-level it (`margin >= 0`) — a counterstrike
     *   wards nothing, so it only has to be the better attack to strike first.
     * - **Ignore:** nothing is rolled, so there is no contest to win.
     * - **Dodge:** the attack out-levels the dodge, or ties with a lower dodge
     *   roll than the attack roll (the higher roll takes a broken tie).
     * - **Block:** the attack out-levels the block (`margin > 0`) — a block need
     *   only tie to ward the blow, at the cost of a weapon-break check.
     * - **Limb Block:** the attack ties or out-levels it (`margin >= 0`) — a
     *   limb wards safely only on a clear victory, and the tie is settled by the
     *   level difference alone rather than sent to the tiebreak.
     */
    get attackerLandsBlow(): boolean {
        // A failed attack never lands, whatever the defence did.
        if (!this.attackResult.isSuccess) return false;

        const vs = this.margin;
        // Counterstrike — the defender's response is itself an attack.
        if (this.defendResult instanceof AttackResult) return vs >= 0;

        const type = this.defendResult.testType;
        if (type === TEST_TYPE.IGNORE.id) return true;
        if (type === TEST_TYPE.DODGE.id) {
            if (vs > 0) return true;
            if (vs < 0) return false;
            const dodgeRoll = this.defendResult.roll?.total ?? 0;
            const attackRoll = this.attackResult.roll?.total ?? 0;
            return dodgeRoll < attackRoll;
        }
        // Limb block — a tie lands on the raised limb.
        if (this.isLimbBlock) return vs >= 0;
        // Block.
        return vs > 0;
    }

    /**
     * Whether the **defender** lands a blow. Only a counterstrike lets the
     * defender strike back (its response is an {@link AttackResult}), and only
     * when its own roll succeeds — so both sides can land in the same exchange.
     */
    get defenderLandsBlow(): boolean {
        return this.defendResult instanceof AttackResult && this.defendResult.isSuccess;
    }
}

export namespace CombatResult {
    /** Registry key identifying this modifier kind for serialization. */
    export const Kind: string = "CombatResult";

    /** Construction data for a {@link CombatResult}. */
    export interface Data extends OpposedTestResult.Data {
        /**
         * The attacker's evaluated {@link AttackResult}. Optional alias for
         * `sourceTestResult` — supply one or the other (or both).
         */
        attackResult?: AttackResult;
        /**
         * The defender's evaluated {@link DefendResult} or {@link AttackResult}
         * (for counterstrikes). Optional alias for `targetTestResult`.
         */
        defendResult?: AttackResult | DefendResult;
    }

    /** Options for a {@link CombatResult}; see {@link OpposedTestResult.Options}. */
    export interface Options extends OpposedTestResult.Options {}

    /** Scope passed to actions that resume from a prior combat exchange. */
    export interface ContextScope {
        /** The {@link CombatResult} being resumed. */
        priorTestResult: CombatResult;
        /** The originating attack of that exchange. */
        attackResult: AttackResult;
    }
}

registerKind(CombatResult.Kind, CombatResult);
registerEntity("CombatResult", CombatResult);
