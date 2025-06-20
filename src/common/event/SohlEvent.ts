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

import { SohlTemporal } from "@common/event";
import { SohlBase, SohlLogic } from "@common";
import { defineType } from "@utils";

export class SohlEvent<P extends SohlLogic = SohlLogic>
    extends SohlBase
    implements SohlEvent.Data
{
    readonly parent: P;
    name: string;
    state: SohlEvent.State;
    whenActivate: SohlEvent.Activation;
    initiate: SohlTemporal;
    delay: number;
    activate: SohlTemporal;
    term: SohlEvent.Term;
    duration: number;
    expire: SohlTemporal;
    repeat: SohlEvent.Repeat;

    constructor(
        parent: P,
        data: Partial<SohlEvent.Data> = {},
        options: PlainObject = {},
    ) {
        if (!data.name) {
            throw new Error("Event name is required");
        }
        super(data, options);
        this.parent = parent;
        this.name = data.name;
        this.state = data.state ?? SohlEvent.STATE.CREATED;
        this.whenActivate = data.whenActivate ?? SohlEvent.ACTIVATION.IMMEDIATE;
        this.initiate = data.initiate ?? SohlTemporal.now();
        this.delay = data.delay ?? 0;
        this.activate = data.activate ?? SohlTemporal.now();
        this.term = data.term ?? SohlEvent.TERM.DURATION;
        this.duration = data.duration ?? 0;
        this.expire = data.expire ?? SohlTemporal.now();
        this.repeat = data.repeat ?? SohlEvent.REPEAT.NONE;
    }

    setState(state: SohlEvent.State, context: PlainObject = {}): void {
        this.state = state;
    }
}

export namespace SohlEvent {
    export const {
        kind: STATE,
        values: States,
        isValue: isState,
        labels: SStateLabels,
    } = defineType("Affliction.STATE", {
        CREATED: "created", // SohlEvent has been created
        INITIATED: "initiated", // SohlEvent has been initiated
        ACTIVATED: "activated", // SohlEvent has been activated
        EXPIRED: "expired", // SohlEvent has expired
    });
    export type State = (typeof STATE)[keyof typeof STATE];

    export const {
        kind: TERM,
        values: Terms,
        isValue: isTerm,
        labels: STermLabels,
    } = defineType("Affliction.TERM", {
        DURATION: "duration", // SohlEvent will last for a duration
        INDEFINITE: "indefinite", // SohlEvent will last indefinitely until removed
        PERMANENT: "permanent", // SohlEvent will last permanently
    });
    export type Term = (typeof TERM)[keyof typeof TERM];

    export const {
        kind: ACTIVATION,
        values: Activations,
        isValue: isActivation,
        labels: ActivationLabels,
    } = defineType("Affliction.ACTIVATION", {
        IMMEDIATE: "immediate", // SohlEvent will be activated immediately
        DELAYED: "delayed", // SohlEvent will be activated after a delay
        SCHEDULED: "scheduled", // SohlEvent will be activated at a scheduled time
    });
    export type Activation = (typeof ACTIVATION)[keyof typeof ACTIVATION];

    export const {
        kind: REPEAT,
        values: Repeats,
        isValue: isRepeat,
        labels: RepeatLabels,
    } = defineType("Affliction.REPEAT", {
        NONE: "none", // SohlEvent will not repeat
        ONCE: "once", // SohlEvent will repeat once
        REPEATED: "repeated", // SohlEvent will repeat multiple times
    });
    export type Repeat = (typeof REPEAT)[keyof typeof REPEAT];

    // Constructor type for SohlEvent and its subclasses
    export interface EventConstructor extends Function {
        new (data: PlainObject, options: PlainObject): Event;
    }

    export interface Data {
        /** @summary Name of the event */
        name: string;

        /** @summary The current state of the event */
        state: State;

        /** @summary When the event will be activated */
        whenActivate: Activation;

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

        term: Term; // How long the event will continue

        duration: number; // Duration of the event if term is DURATION

        /** @summary Time when the event will expire */
        expire: SohlTemporal;

        /** @summary How often the event will repeat */
        repeat: Repeat;
    }
}
