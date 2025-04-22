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

import { createUniqueId, SohlMap } from "@utils";
import { SohlTemporal } from "./SohlTemporal";
import { AnySohlBase, SohlBase } from "@logic/common/core";
import { DataField, RegisterClass } from "@utils/decorators";
import { gameTimeNow } from "@foundry/core";

export const enum SohlEventTerm {
    DURATION = "duration", // SohlEvent will last for a duration
    INDEFINITE = "indefinite", // SohlEvent will last indefinitely until removed
    PERMANENT = "permanent", // SohlEvent will last permanently
}

export function isSohlEventTerm(value: unknown): value is SohlEventTerm {
    return (
        value === SohlEventTerm.DURATION ||
        value === SohlEventTerm.INDEFINITE ||
        value === SohlEventTerm.PERMANENT
    );
}

export const enum SohlEventActivation {
    IMMEDIATE = "immediate", // SohlEvent will be activated immediately
    DELAYED = "delayed", // SohlEvent will be activated after a delay
    SCHEDULED = "scheduled", // SohlEvent will be activated at a scheduled time
}

export function isSohlEventActivation(
    value: unknown,
): value is SohlEventActivation {
    return (
        value === SohlEventActivation.IMMEDIATE ||
        value === SohlEventActivation.DELAYED ||
        value === SohlEventActivation.SCHEDULED
    );
}

export const enum SohlEventRepeat {
    NONE = "none", // SohlEvent will not repeat
    ONCE = "once", // SohlEvent will repeat once
    REPEATED = "repeated", // SohlEvent will repeat multiple times
}

export function isSohlEventRepeat(value: unknown): value is SohlEventRepeat {
    return (
        value === SohlEventRepeat.NONE ||
        value === SohlEventRepeat.ONCE ||
        value === SohlEventRepeat.REPEATED
    );
}

// Constructor type for SohlEvent and its subclasses
export interface EventConstructor extends Function {
    new (data: PlainObject, options: PlainObject): Event;
}

export type SohlEventMap = SohlMap<string, SohlEvent>;

export type SohlEventTermType =
    (typeof SohlEventTerm)[keyof typeof SohlEventTerm];

@RegisterClass("SohlEvent", "0.6.0")
export abstract class SohlEvent extends SohlBase {
    /** @summary Name of the event */
    @DataField("name", { type: String, initial: "" })
    name!: string;

    /** @summary When the event will be activated */
    @DataField("whenActivate", {
        type: String,
        initial: SohlEventActivation.IMMEDIATE,
        validator: (value: unknown) => isSohlEventActivation(value),
    })
    whenActivate!: SohlEventActivation;

    /**
     * @summary Time when the event was initiated.
     *
     * @description
     * This is the time when the event becomes a candidate for activation, often
     * simply the creation time of the event.
     *
     * @remarks
     * This is used to calculate the activation time of the event. The activation
     * time is calculated based on the `whenActivate` and `delay` properties, using
     * the `initiate` time as a reference. This value will always be less than or
     * equal to the `activate` and `expire` times.
     */
    @DataField("initiate", {
        type: SohlTemporal,
        initial: (thisArg: SohlEvent) => {
            return new SohlTemporal(thisArg.parent, gameTimeNow());
        },
        validator: (initiate: any, thisArg: SohlEvent) => {
            return (
                initiate instanceof SohlTemporal && initiate <= thisArg.activate
            );
        },
    })
    initiate!: SohlTemporal;

    /** @summary Number of seconds after initiation to delay until event is activated */
    @DataField("delay", { type: Number, initial: 0 })
    delay!: number;

    @DataField("activate", {
        type: SohlTemporal,
        initial: (thisArg: SohlEvent) => {
            let activateTime: number = Number.MAX_SAFE_INTEGER;
            if (thisArg.whenActivate === SohlEventActivation.IMMEDIATE) {
                activateTime = gameTimeNow();
            } else {
                activateTime = gameTimeNow() + thisArg.delay;
            }
            return new SohlTemporal(thisArg.parent, activateTime);
        },
        validator: (activate: any, thisArg: SohlEvent) => {
            return (
                activate instanceof SohlTemporal &&
                activate >= thisArg.initiate &&
                thisArg.initiate <= thisArg.expire
            );
        },
    })
    activate!: SohlTemporal; // Time when the event will be activated

    @DataField("term", {
        type: String,
        initial: SohlEventTerm.DURATION,
        validator: (value: any) => isSohlEventTerm(value),
    })
    term!: SohlEventTerm; // How long the event will continue

    @DataField("duration", { type: Number, initial: 0 })
    duration!: number; // Duration of the event if term is DURATION

    /** @summary Time when the event will expire */
    @DataField("expire", {
        type: SohlTemporal,
        initial: (value: any, thisArg: SohlEvent) => {
            return new SohlTemporal(thisArg.parent, Number.MAX_SAFE_INTEGER);
        },
        validator: (expire: any, thisArg: SohlEvent) => {
            return expire instanceof SohlTemporal && expire >= thisArg.activate;
        },
    })
    expire!: SohlTemporal;

    /** @summary How often the event will repeat */
    @DataField("repeat", {
        type: String,
        initial: SohlEventRepeat.NONE,
        validator: (value: any) => isSohlEventRepeat(value),
    })
    repeat!: SohlEventRepeat;
}
