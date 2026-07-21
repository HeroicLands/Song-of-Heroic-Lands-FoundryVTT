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

/**
 * **Generic scheduled actions** (issue #588) — the data-driven half of the
 * {@link sohl.entity.event.SohlEventQueue | deferred action runner}.
 *
 * A recurring schedule is stored as data on **any** SoHL document, in the
 * `system.scheduledActions` field on the base data model (beside `actionDefs`).
 * Each entry defers an action — run `actionName` on that document's logic — to
 * `anchor + interval`. Two halves keep it working:
 *
 * - **persist** — {@link scheduleAction} / {@link unscheduleAction} write the
 *   whole `system.scheduledActions` array, the durable record that survives a
 *   reload;
 * - **arm** — the same calls, plus {@link armScheduledActions} on load, push the
 *   entries into the event queue so they fire (offer a `[Perform]` reminder) when
 *   due.
 *
 * Both derive the fire time from the same `(anchor, interval)`, so they cannot
 * drift. Foundry-free: it operates on a minimal {@link Schedulable} surface and
 * the queue, so it is unit-testable without a running Foundry.
 */

import type { SohlEventQueue } from "@src/entity/event/SohlEventQueue";

/**
 * One persisted recurring-schedule entry — the shape of an element of a
 * document's `system.scheduledActions`.
 */
export interface ScheduledAction {
    /** The action shortcode to run on the owning document's logic. */
    actionName: string;
    /** World time (seconds) the schedule was last set from. */
    anchor: number;
    /** Seconds from {@link anchor} to the next fire. */
    interval: number;
    /**
     * The uuid of the scene this schedule is bound to (issue #590). When set,
     * the schedule is offered only while that scene is the **active** scene — a
     * location-bound event (bandits at a hideout) does not fire while the party
     * is elsewhere, and a check that came due while away surfaces when they
     * return. Absent (or blank) means **world-wide**: it fires regardless of the
     * active scene.
     */
    sceneUuid?: string;
    /** Opaque data handed to the action as its scope when performed. */
    payload?: Record<string, unknown>;
}

/**
 * The next world time an entry fires at.
 * @param entry - The schedule entry.
 * @returns `anchor + interval`.
 */
export function scheduledFireAt(entry: ScheduledAction): number {
    return entry.anchor + entry.interval;
}

/**
 * Insert or replace (by `actionName`) an entry, returning a **new** array — the
 * whole array is written back to the document (never by index). Pure.
 * @param list - The current entries.
 * @param entry - The entry to upsert.
 * @returns The updated entries.
 */
export function upsertScheduledAction(
    list: ScheduledAction[] | undefined,
    entry: ScheduledAction,
): ScheduledAction[] {
    const rest = (list ?? []).filter((e) => e.actionName !== entry.actionName);
    return [...rest, entry];
}

/**
 * Remove the entry with `actionName`, returning a **new** array. Pure.
 * @param list - The current entries.
 * @param actionName - The entry to remove.
 * @returns The updated entries.
 */
export function removeScheduledAction(
    list: ScheduledAction[] | undefined,
    actionName: string,
): ScheduledAction[] {
    return (list ?? []).filter((e) => e.actionName !== actionName);
}

/**
 * Arm every persisted schedule entry into the queue — the **load-side** re-arm,
 * called on world `ready` for every world actor and its embedded items.
 * @param uuid - The owning document's uuid.
 * @param list - The document's `system.scheduledActions`.
 * @param queue - The event queue to arm.
 */
export function armScheduledActions(
    uuid: string,
    list: ScheduledAction[] | undefined,
    queue: SohlEventQueue,
): void {
    for (const entry of list ?? []) {
        queue.scheduleAt(
            uuid,
            entry.actionName,
            scheduledFireAt(entry),
            entry.payload,
            entry.sceneUuid || undefined,
        );
    }
}

/** The minimal document surface the schedule mutators need. */
export interface Schedulable {
    /** The document's uuid. */
    uuid: string;
    /** The document's system data (carries `scheduledActions`). */
    system: { scheduledActions?: ScheduledAction[] };
    /** Persist a partial update to the document. */
    update(data: Record<string, unknown>): Promise<unknown>;
}

/**
 * **Persist and arm** a recurring schedule for `actionName` on `doc` — both
 * halves of {@link sohl.core.logic.SohlSystem.schedule}. Writes the whole
 * `system.scheduledActions` array (the durable record) and arms the queue (the
 * live entry), both anchored at `now`.
 *
 * @param doc - The document to schedule on.
 * @param queue - The event queue to arm.
 * @param actionName - The action to run on the document's logic when due.
 * @param interval - Seconds until the next fire.
 * @param payload - Opaque scope handed to the action on `[Perform]`.
 * @param now - The current world time (the schedule anchor).
 * @param sceneUuid - The scene the schedule is bound to (issue #590); offered
 *   only while that scene is active. Omit for a world-wide schedule.
 */
export async function scheduleAction(
    doc: Schedulable,
    queue: SohlEventQueue,
    actionName: string,
    interval: number,
    payload: Record<string, unknown> | undefined,
    now: number,
    sceneUuid?: string,
): Promise<void> {
    const entry: ScheduledAction = {
        actionName,
        anchor: now,
        interval,
        sceneUuid: sceneUuid || "",
        payload,
    };
    const list = upsertScheduledAction(doc.system.scheduledActions, entry);
    await doc.update({ "system.scheduledActions": list });
    queue.scheduleAt(
        doc.uuid,
        actionName,
        scheduledFireAt(entry),
        payload,
        sceneUuid || undefined,
    );
}

/**
 * Remove a recurring schedule for `actionName` on `doc` — clears the persisted
 * entry and unsubscribes it from the queue.
 * @param doc - The document to unschedule on.
 * @param queue - The event queue to unsubscribe from.
 * @param actionName - The schedule to remove.
 */
export async function unscheduleAction(
    doc: Schedulable,
    queue: SohlEventQueue,
    actionName: string,
): Promise<void> {
    const list = removeScheduledAction(doc.system.scheduledActions, actionName);
    await doc.update({ "system.scheduledActions": list });
    queue.unsubscribe(doc.uuid, actionName);
}
