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

import { AttackResult } from "@common/result/AttackResult";
import { DefendResult } from "@common/result/DefendResult";
import { OpposedTestResult } from "@common/result/OpposedTestResult";
const kCombatResult = Symbol("CombatResult");
const kData = Symbol("CombatResult.Data");
const kContext = Symbol("CombatResult.Context");

export class CombatResult extends OpposedTestResult {
    attackResult: AttackResult;
    defendResult: DefendResult;
    readonly [kCombatResult] = true;

    static isA(obj: unknown): obj is CombatResult {
        return typeof obj === "object" && obj !== null && kCombatResult in obj;
    }

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
        this.attackResult =
            AttackResult.isA(data.attackResult) ?
                data.attackResult
            :   new AttackResult(data.attackResult, options);
        this.defendResult =
            DefendResult.isA(data.defendResult) ?
                data.defendResult
            :   new DefendResult(data.defendResult, options);
    }

    calcMeleeCombatResult(opposedTestResult: OpposedTestResult) {
        void opposedTestResult;
        // if (!opposedTestResult.targetTestResult) {
        //     throw new Error(
        //         "opposedTestResult.targetTestResult is not defined",
        //     );
        // }
        // const attacker = opposedTestResult.sourceTestResult;
        // const defender = opposedTestResult.targetTestResult;
        // if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
        //     this.mishaps.add(Mishap.FUMBLE_TEST);
        // }
        // if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
        //     this.mishaps.add(Mishap.STUMBLE_TEST);
        // }
        // this.deliversImpact = false;
        // if (this.testType === CombatTestResult.TestType.IGNOREDEFENSE.id) {
        //     this.mishaps.delete(Mishap.STUMBLE_TEST);
        // }
        // switch (this.testType) {
        //     case CombatTestResult.TestType.IGNOREDEFENSE.id:
        //         if (
        //             attacker.successLevel >=
        //             SuccessTestResult.SuccessLevel.MARGINAL_FAILURE
        //         ) {
        //             opposedTestResult.winner(OpposedTestResult.tieBreak.SOURCE);
        //             attacker.deliversImpact = true;
        //         }
        //         break;
        //     case CombatTestResult.TestType.BLOCKDEFENSE.id:
        //         if (opposedTestResult.sourceWins) {
        //             attacker.deliversImpact = true;
        //         } else {
        //             if (opposedTestResult.isTied)
        //                 opposedTestResult.winner(
        //                     OpposedTestResult.TIE_BREAK.TARGET,
        //                 );
        //         }
        //         break;
        //     case CombatTestResult.TestType.CXDEFENSE.id:
        //         if (defender.mlMod.has("CXBoth"))
        //             if (opposedTestResult.isTied) {
        //                 if (defender.mlMod.has("CXBoth")) {
        //                     opposedTestResult.breakTies(true);
        //                     if (opposedTestResult.targetWins)
        //                         defender.deliversImpact = true;
        //                 } else {
        //                     opposedTestResult.winner(
        //                         OpposedTestResult.TIE_BREAK.SOURCE,
        //                     );
        //                 }
        //                 attacker.deliversImpact = true;
        //             } else if (opposedTestResult.sourceWins) {
        //                 attacker.deliversImpact = true;
        //             } else {
        //                 defender.deliversImpact = true;
        //             }
        //         break;
        // }
    }

    calcDodgeCombatResult(opposedTestResult: OpposedTestResult) {
        void opposedTestResult;
        // const attacker = opposedTestResult.sourceTestResult;
        // const defender = opposedTestResult.targetTestResult;
        // attacker.deliversImpact = false;
        // attacker.testFumble =
        //     attacker.isCritical &&
        //     !attacker.isSuccess &&
        //     attacker.lastDigit === 0;
        // attacker.testStumble =
        //     attacker.isCritical &&
        //     !attacker.isSuccess &&
        //     attacker.lastDigit === 5;
        // defender.deliversImpact = false;
        // defender.testFumble = false;
        // defender.testStumble = defender.isCritical && !defender.isSuccess;
        // if (opposedTestResult.sourceWins) {
        //     attacker.deliversImpact = true;
        // }
    }

    opposedTestEvaluate(opposedTestResult: OpposedTestResult) {
        void opposedTestResult;
        // super.opposedTestEvaluate(opposedTestResult);
        // if (opposedTestResult.targetTestResult === this) {
        //     if (
        //         [
        //             CombatTestResult.TEST_TYPE.BLOCKDEFENSE,
        //             CombatTestResult.TEST_TYPE.CXDEFENSE,
        //             CombatTestResult.TEST_TYPE.IGNOREDEFENSE,
        //         ].includes(opposedTestResult.testType.type)
        //     ) {
        //         this.calcMeleeCombatResult(opposedTestResult);
        //     } else if (
        //         this.testType.type === CombatTestResult.TEST_TYPE.DODGEDEFENSE
        //     ) {
        //         this.calcDodgeCombatResult(opposedTestResult);
        //     }
        // }
        // return;
    }

    async testDialog(
        data = {},
        callback: (thisArg: any, formData: any) => void,
    ) {
        void data;
        void callback;
        // foundry.utils.mergeObject(
        //     data,
        //     {
        //         impactMod: this.impactMod,
        //         impactSituationalModifier: this.situationalModifier,
        //         deliversImpact: this.deliversImpact,
        //         testFumble: this.testFumble,
        //         testStumble: this.testStumble,
        //         weaponBreak: this.weaponBreak,
        //     },
        //     { overwrite: false },
        // );
        // return await super.testDialog(data, (thisArg, formData) => {
        //     const formImpactSituationalModifier =
        //         Number.parseInt(formData.impactSituationalModifier, 10) || 0;
        //     if (thisArg.impactMod && formImpactSituationalModifier) {
        //         thisArg.impactMod.add(
        //             sohl.MOD.PLAYER,
        //             formImpactSituationalModifier,
        //         );
        //         thisArg.impactSituationalModifier =
        //             formImpactSituationalModifier;
        //     }
        //     if (callback) callback(this, formData);
        // });
    }

    async toChat(data = {}) {
        void data;
        // return super.toChat(
        //     foundry.utils.mergeObject(
        //         data,
        //         {
        //             impactSituationalModifier: this.situationalModifier,
        //             impactMod: this.impactMod,
        //             deliversImpact: this.deliversImpact,
        //             testFumble: this.testFumble,
        //             testStumble: this.testStumble,
        //             weaponBreak: this.weaponBreak,
        //         },
        //         { overwrite: false },
        //     ),
        // );
    }
}

export namespace CombatResult {
    export interface Data extends OpposedTestResult.Data {
        readonly [kData]: true;
        attackResult: AttackResult | Partial<AttackResult.Data>;
        defendResult: DefendResult | Partial<DefendResult.Data>;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Options extends OpposedTestResult.Options {}

    export class Context extends OpposedTestResult.Context {
        readonly [kContext] = true;

        isA(obj: unknown): obj is Context {
            return typeof obj === "object" && obj !== null && kContext in obj;
        }

        constructor(data: Partial<CombatResult.Context.Data> = {}) {
            super(data);
        }
    }

    export namespace Context {
        export interface Data extends OpposedTestResult.Context.Data {}
    }
}
