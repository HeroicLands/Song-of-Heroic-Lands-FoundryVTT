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

import { SohlEventState, SOHL_EVENT_STATE } from "@utils/constants";
import { SohlBase } from "@common/SohlBase";
import { SohlTemporal } from "@common/event/SohlTemporal";
import type { SohlLogic } from "@common/SohlLogic";
import { SohlEventContext } from "@common/event/SohlEventContext";

/**
 * Represents an event in the SoHL system, with a defined lifecycle and timing rules.
 *
 * A SohlEvent may occur immediately, after a delay, or at a scheduled time. Once
 * activated, it may run for a fixed duration, remain active indefinitely until
 * explicitly expired, or be permanent and never expire. Events may also define
 * recurrence rules to repeat after expiration.
 *
 * ## Lifecycle States
 * - CREATED: Event object exists but has not been initiated.
 * - INITIATED: Event is scheduled and eligible for activation; countdowns/delays run from this point.
 * - ACTIVATED: Event is in effect; termination rules (duration, indefinite, permanent) apply.
 * - EXPIRED: Event has completed or been cancelled and is no longer active.
 *
 * ## Key Temporal Fields
 * - `scheduledAt`: The reference time from which activation is computed (typically creation/initiation).
 * - `activationDelay`: Optional delay (seconds) after `scheduledAt` before activation.
 * - `activatedAt`: The actual timestamp when the event entered ACTIVATED.
 * - `expiresAt`: The scheduled/expected time when the event will expire. Often in the future,
 *   but may be past if the event has already ended. Used for checks like
 *   `now > expiresAt ⇒ expired`.
 *
 * ## Termination Rules
 * - DURATION: Event expires automatically after `lifetimeDuration` seconds.
 * - INDEFINITE: Event remains active until explicitly expired.
 * - PERMANENT: Event never expires.
 *
 * ## Invariants
 * - Temporal order: `scheduledAt ≤ activatedAt ≤ expiresAt` (when values are set).
 * - `expiresAt` is predictive; the event formally becomes EXPIRED once
 *   the current time passes this point (and optionally records `expiredAt`).
 *
 * ## Usage
 * Typical APIs include:
 * - `initiate()` to move CREATED → INITIATED.
 * - `activate()` to enter ACTIVATED and compute expiration.
 * - `expire()` to force end an active or scheduled event.
 * - `tick(now)` to evaluate transitions automatically.
 *
 * This class distinguishes clearly between rules (`activationRule`, `terminationRule`)
 * and timestamps (`scheduledAt`, `activatedAt`, `expiresAt`), making event lifecycles
 * easy to reason about and simulate.
 *
 * SohlEvent lifecycle state model:
 *
 *   ┌─────────┐    initiate()     ┌────────────┐
 *   │ CREATED │ ────────────────► │ INITIATED  │
 *   └─────────┘                   └─────┬──────┘
 *       ▲                               │
 *       │ startNow()                    │ (activation condition met)
 *       │                               ▼
 *       │                         ┌────────────┐
 *       └──────────────────────── │ ACTIVATED  │
 *                                 └─────┬──────┘
 *                                       │
 *          (duration ends / expire())   │
 *                                       ▼
 *                                 ┌────────────┐
 *                                 │  EXPIRED   │
 *                                 └────────────┘
 *
 * - CREATED: Event object exists but not yet scheduled.
 * - INITIATED: Eligible for activation; delays/countdowns apply.
 * - ACTIVATED: Event is in effect; may expire after a duration, indefinitely, or never.
 * - EXPIRED: Event has completed or been cancelled. */
export class SohlEvent extends SohlBase implements SohlEvent.Data {
    private _settleRunning;
    private _settleAgain;
    readonly _parent: SohlLogic;
    id: DocumentId;
    title: string;
    state: SohlEventState;
    initiation: {
        delay: number;
        at: SohlTemporal | null;
    };
    activation: {
        manualTrigger: boolean;
        delay: number;
        at: SohlTemporal | null;
    };
    expiration: {
        duration: number | null;
        at: SohlTemporal | null;
        repeatCount: number | null;
        repeatUntil: SohlTemporal | null;
    };

    constructor(data: Partial<SohlEvent.Data> = {}, options: PlainObject = {}) {
        if (!options.parent) {
            throw new Error(
                "SohlEvent must be constructed with a parent logic instance.",
            );
        }
        if (!data.id) {
            throw new Error("Event ID is required");
        }
        super(data, options);
        this._settleRunning = false;
        this._settleAgain = false;
        this.id = data.id;
        this._parent = options.parent;
        this.title = sohl.i18n.localize(data.title || "Unnamed Event");
        this.state = data.state ?? SOHL_EVENT_STATE.CREATED;
        this.initiation = {
            delay: data?.initiation?.delay ?? 0,
            at:
                data?.initiation?.at ??
                SohlTemporal.now().add(data?.initiation?.delay || 0),
        };
        this.activation = {
            delay: data?.activation?.delay ?? 0,
            at: data?.activation?.at ?? null,
            manualTrigger: data?.activation?.manualTrigger ?? false,
        };
        this.expiration = {
            duration: data?.expiration?.duration ?? null,
            at: data?.expiration?.at ?? null,
            repeatCount:
                data?.expiration?.repeatCount ?? Number.POSITIVE_INFINITY,
            repeatUntil: data?.expiration?.repeatUntil ?? null,
        };
    }

    get parent(): SohlLogic {
        return this._parent;
    }

    async setState(
        state: SohlEventState,
        context: PlainObject = {},
    ): Promise<unknown> {
        this.state = state;
        return this.state;
    }

    /**
     * Settles the event's state based on the status, current time, and its defined rules,
     * transitioning between statuses and mutating the event as necessary.
     *
     * @remarks
     * This method is idempotent: multiple invocations with at the same world time with no
     * changes in event state produce no subsequent state changes or effects. It specifically
     * handles the situation where the time has jumped forward significantly, allowing the
     * event to transition through multiple states (e.g., from INITIATED to ACTIVATED to
     * EXPIRED, or even through multiple repeated activations) in a single call.
     *
     * This method can also handle the case where time reverses. The event status is strictly
     * monotonic, meaning that it will not revert to a previous status even if the current
     * time goes backwards.
     *
     * CREATED => INITIATED => ACTIVATED => EXPIRED
     *
     * The only case under which the event status can transition backwards is if the event
     * recurrence is set to a value that allows it to re-enter a prior state after being
     * EXPIRED.
     *
     * The event may transition through multiple states in a single call if the time has
     * advanced sufficiently.
     *
     * This method is re-entrant: if it is called while already running, it will
     * schedule itself to run again after the current invocation completes. This ensures
     * that any state changes made during the current invocation are fully processed
     * before another pass is made.
     *
     * @param ctx - The context in which to settle the event, including any additional data.
     * @returns A promise that resolves once the event has been fully settled.
     */
    async settle(ctx: SohlEventContext): Promise<void> {
        if (this._settleRunning) {
            this._settleAgain = true;
            return;
        }
        this._settleRunning = true;
        try {
            do {
                this._settleAgain = false;
                await this._settleOnce(ctx);
            } while (this._settleAgain);
        } finally {
            this._settleRunning = false;
        }
    }

    private async _settleOnce(ctx: SohlEventContext): Promise<void> {
        const now = SohlTemporal.now(); // however your clock is accessed

        // Loop forward through activations/expirations if time has jumped
        while (true) {
            // If not initiated yet and condition met → initiate
            if (this.state === SOHL_EVENT_STATE.CREATED) {
                if (!this.initiation.at) {
                    this.initiation.at = (this.initiation.at ?? now).add(
                        this.initiation.delay,
                    );
                }
                if (this.initiation.at.pastOrPresent()) {
                    if ((await this._preInitiate(ctx)) !== false) {
                        this.state = SOHL_EVENT_STATE.ACTIVATED;
                        await this._onInitiate(ctx);
                    }
                    continue;
                }
            }

            // If not activated yet and condition met → activate
            if (this.state === SOHL_EVENT_STATE.INITIATED) {
                if (!this.activation.at) {
                    this.activation.at =
                        this.activation.manualTrigger ?
                            SohlTemporal.from(Number.POSITIVE_INFINITY)
                        :   (this.initiation.at ?? now).add(
                                this.activation.delay,
                            );
                }
                if (this.activation.at?.pastOrPresent()) {
                    if ((await this._preActivate(ctx)) !== false) {
                        this.state = SOHL_EVENT_STATE.ACTIVATED;
                        await this._onActivate(ctx);
                    }
                    continue;
                }
            }

            // If not expired yet and condition met → expire
            if (this.state === SOHL_EVENT_STATE.ACTIVATED) {
                if (!this.expiration.at) {
                    this.expiration.at = (this.activation.at ?? now).add(
                        this.expiration.duration ?? Number.POSITIVE_INFINITY,
                    );
                }

                if (this.expiration.at?.pastOrPresent()) {
                    if ((await this._preExpire(ctx)) !== false) {
                        this.state = SOHL_EVENT_STATE.EXPIRED;
                        await this._onExpire(ctx);
                    }
                    continue;
                }
            }

            // If expired and recurring, then schedule next occurrence
            if (this.state === SOHL_EVENT_STATE.EXPIRED) {
                // Check if expiration date has passed; if so then stop
                if (this.expiration.repeatUntil?.pastOrPresent()) {
                    break;
                }

                this.expiration.repeatCount ??= Number.POSITIVE_INFINITY;

                // Check if we have remaining repetitions; if not then stop
                if (--this.expiration.repeatCount > 0) {
                    // We have more repetitions; schedule the next one
                    this.initiation.at = (this.expiration.at ?? now).add(
                        this.initiation.delay,
                    );
                    this.activation.at = null;
                    this.expiration.at = null;
                    this.state = SOHL_EVENT_STATE.CREATED;
                    continue;
                }
            }

            // Nothing more to do at this time
            break;
        }
    }

    /**
     * Manually activates the event if it is in the INITIATED state.
     * @param ctx - The context in which to settle the event, including any additional data.
     */
    async activate(ctx: SohlEventContext): Promise<void> {
        if (this.state !== SOHL_EVENT_STATE.INITIATED) {
            throw new Error(
                "Event must be in INITIATED state to be activated.",
            );
        }
        this.activation.at = SohlTemporal.now();
        await this.settle(ctx);
    }

    /**
     * Hook called immediately before the event initiates.
     * @returns `false` to prevent initiation, or any other value (or no value) to allow
     *                  initiation to proceed.
     */
    protected async _preInitiate(ctx: SohlEventContext): Promise<false | void> {
        if (this.state !== SOHL_EVENT_STATE.CREATED) {
            return false;
        }
    }

    /**
     * Hook called immediately after the event initiates.
     */
    protected async _onInitiate(ctx: SohlEventContext): Promise<void> {}

    /**
     * Hook called immediately before the event activates.
     * @returns `false` to prevent activation, or any other value (or no value) to
     *                  allow activation to proceed.
     */
    protected async _preActivate(
        ctx: SohlEventContext,
    ): Promise<false | void> {}

    /**
     * Hook called immediately after the event activates.
     */
    protected async _onActivate(ctx: SohlEventContext): Promise<void> {}

    /**
     * Hook called immediately before the event expires.
     * @returns `false` to prevent expiration, or any other value (or no value) to
     *                  allow expiration to proceed.
     */
    protected async _preExpire(ctx: SohlEventContext): Promise<false | void> {}

    /**
     * Hook called immediately after the event expires.
     */
    protected async _onExpire(ctx: SohlEventContext): Promise<void> {
        this.setState(SOHL_EVENT_STATE.EXPIRED);
    }
}

export namespace SohlEvent {
    // Constructor type for SohlEvent and its subclasses
    export interface EventConstructor extends Function {
        new (data: PlainObject, options: PlainObject): Event;
    }

    export interface Data {
        /** Unique identifier for the event */
        id: DocumentId;

        /** Human-readable title (localizable) */
        title: string;

        /** The current status of the event */
        state: SohlEventState;

        initiation: {
            delay: number;
            at?: SohlTemporal | null;
        };

        activation: {
            manualTrigger: boolean;
            delay: number;
            at?: SohlTemporal | null;
        };

        expiration: {
            duration?: number | null;
            at?: SohlTemporal | null;
            repeatCount?: number | null;
            repeatUntil?: SohlTemporal | null;
        };
    }
}
