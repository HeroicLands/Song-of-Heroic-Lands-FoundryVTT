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

import { LOGLEVEL } from "@utils/constants";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { SohlAction } from "@common/event/SohlAction";
import type { SohlLogic } from "@common/SohlLogic";

/** Function signature for Accessor functions */
export type AccessorFunction = (thisArg: ValueModifier) => any;

/** Function signature for synchronous Action functions */
export type SyncActionFunction = (
    this: SohlLogic,
    context: SohlAction.Context,
) => any;

/** Function signature for asynchronous Action functions */
export type AsyncActionFunction = (
    this: SohlLogic,
    context: SohlAction.Context,
) => Promise<any>;

/** Union of possible Action function types */
export type ActionFunction = SyncActionFunction | AsyncActionFunction;

/**
 * Safely generates a JavaScript or async function from a string.
 * @param fnStr - Function body or full function string.
 * @param isAsync - Whether to create an async function.
 * @returns A new Function or AsyncFunction instance.
 * @throws Error if the string is invalid or unsafe.
 */
export function safeFunctionFactory(fnStr: string, isAsync = false): Function {
    const structureCheck = /^\s*(?:\([\w\s,]*\)|\w+)\s*=>|^\s*function\b/;
    const forbidden =
        /\b(eval|Function|globalThis|window|document|process|require|import|__proto__|constructor|prototype)\b/;

    if (!structureCheck.test(fnStr)) {
        throw new Error("Provided string does not appear to be a function.");
    }

    if (forbidden.test(fnStr.replace(/\s+/g, ""))) {
        throw new Error("Unsafe code detected in function string.");
    }

    const wrapped = '"use strict"; return (' + fnStr + ")";

    try {
        const ctor =
            isAsync ?
                Object.getPrototypeOf(async function () {}).constructor
            :   Function;
        return new ctor(wrapped)();
    } catch (e) {
        throw new Error("Function creation failed", { cause: e });
    }
}

/**
 * Constructs a safe accessor function from a string.
 * @param fnStr - The function string to evaluate.
 * @returns A validated AccessorFunction.
 */
export function createAccessorFunction(fnStr: string): AccessorFunction {
    const fn = safeFunctionFactory(fnStr, false) as AccessorFunction;

    return (thisArg: ValueModifier): any => {
        try {
            return fn(thisArg);
        } catch (err) {
            console.warn(
                `Accessor error for ValueModifier '${thisArg.abbrev}':`,
                err,
            );
            return undefined;
        }
    };
}

/**
 * Constructs a safe action function (sync or async) from a string.
 * @param fnStr - The function string to evaluate.
 * @param isAsync - Whether the action is asynchronous.
 * @returns A validated ActionFunction.
 */
export function createActionFunction(
    fnStr: string,
    isAsync: boolean,
): ActionFunction {
    const fn = safeFunctionFactory(fnStr, isAsync) as ActionFunction;

    return function (
        this: SohlLogic,
        context: SohlAction.Context,
    ): any | Promise<any> {
        try {
            return isAsync ?
                    (fn as AsyncActionFunction).call(this, context)
                :   (fn as SyncActionFunction).call(this, context);
        } catch (err) {
            sohl.log.log("An error occurred while executing an Action", {
                logLevel: LOGLEVEL.ERROR,
                notifyLevel: LOGLEVEL.ERROR,
                error: err as Error,
            });
        }
    };
}
