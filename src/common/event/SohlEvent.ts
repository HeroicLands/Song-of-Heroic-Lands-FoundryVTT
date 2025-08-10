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

import {
    SohlEventState,
    SohlEventActivation,
    SohlEventTerm,
    SohlEventRepeat,
    SOHL_EVENT_STATE,
    SOHL_EVENT_ACTIVATION,
    SOHL_EVENT_TERM,
    SOHL_EVENT_REPEAT,
} from "@utils/constants";
import { SohlBase } from "@common/SohlBase";
import { SohlTemporal } from "@common/event/SohlTemporal";
import type { SohlLogic } from "@common/SohlLogic";
import { DocumentId, toDocumentId } from "@utils/helpers";

export class SohlEvent<P extends SohlLogic = SohlLogic>
    extends SohlBase
    implements SohlEvent.Data
{
    readonly parent: P;
    id: DocumentId;
    label: string;
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
        parent: P,
        data: Partial<SohlEvent.Data> = {},
        options: PlainObject = {},
    ) {
        if (!data.id) {
            throw new Error("Event ID is required");
        }
        super(data, options);
        this.id = data.id;
        this.parent = parent;
        this.label = sohl.i18n.localize(data.label || "Unnamed Event");
        this.state = data.state ?? SOHL_EVENT_STATE.CREATED;
        this.whenActivate =
            data.whenActivate ?? SOHL_EVENT_ACTIVATION.IMMEDIATE;
        this.initiate = data.initiate ?? SohlTemporal.now();
        this.delay = data.delay ?? 0;
        this.activate = data.activate ?? SohlTemporal.now();
        this.term = data.term ?? SOHL_EVENT_TERM.DURATION;
        this.duration = data.duration ?? 0;
        this.expire = data.expire ?? SohlTemporal.now();
        this.repeat = data.repeat ?? SOHL_EVENT_REPEAT.NONE;
    }

    setState(state: SohlEventState, context: PlainObject = {}): void {
        this.state = state;
    }
}

export namespace SohlEvent {
    // Constructor type for SohlEvent and its subclasses
    export interface EventConstructor extends Function {
        new (data: PlainObject, options: PlainObject): Event;
    }

    export interface Data {
        /** @summary Unique identifier for the event */
        id: DocumentId;

        /** @summary Visible label of the event (localizable) */
        label: string;

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
}
