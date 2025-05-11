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

import { SohlMap } from "@utils";
import { SohlTemporal } from "./SohlTemporal";
import { SohlBase, SohlPerformer } from "@logic/common/core";
import { DataField, RegisterClass } from "@utils";

export const enum SohlEventState {
    CREATED = "created", // SohlEvent has been created
    INITIATED = "initiated", // SohlEvent has been initiated
    ACTIVATED = "activated", // SohlEvent has been activated
    EXPIRED = "expired", // SohlEvent has expired
}

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

export interface SohlEventData {
    /** @summary Name of the event */
    name: string;

    /** @summary The current state of the event */
    state: SohlEventState;

    /** @summary When the event will be activated */
    whenActivate: SohlEventActivation;

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
    initiate: SohlTemporal;

    /** @summary Number of seconds after initiation to delay until event is activated */
    delay: number;

    activate: SohlTemporal; // Time when the event will be activated

    term: SohlEventTerm; // How long the event will continue

    duration: number; // Duration of the event if term is DURATION

    /** @summary Time when the event will expire */
    expire: SohlTemporal;

    /** @summary How often the event will repeat */
    repeat: SohlEventRepeat;
}

export class SohlEvent extends SohlBase implements SohlEventData {
    name: string;
    state: SohlEventState;
    whenActivate: SohlEventActivation;
    initiate: SohlTemporal;
    delay: number;
    activate: SohlTemporal;
    term: SohlEventTerm;
    duration: number;
    expire: SohlTemporal;
    repeat: SohlEventRepeat;

    constructor(
        parent: SohlPerformer,
        data: Partial<SohlEventData> = {},
        options: PlainObject = {},
    ) {
        if (!data.name) {
            throw new Error("Event name is required");
        }
        super(parent, data, options);
        this.name = data.name;
        this.state = data.state ?? SohlEventState.CREATED;
        this.whenActivate = data.whenActivate ?? SohlEventActivation.IMMEDIATE;
        this.initiate = data.initiate ?? new SohlTemporal(this);
        this.delay = data.delay ?? 0;
        this.activate = data.activate ?? new SohlTemporal(this);
        this.term = data.term ?? SohlEventTerm.DURATION;
        this.duration = data.duration ?? 0;
        this.expire = data.expire ?? new SohlTemporal(this);
        this.repeat = data.repeat ?? SohlEventRepeat.NONE;
    }

    setState(state: SohlEventState, context: PlainObject = {}): void {
        this.state = state;
    }
}
