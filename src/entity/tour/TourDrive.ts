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
 * The **drive** step vocabulary for a railroaded tour — the Foundry-free half of
 * the `SohlTour` drive-primitives capability (#624).
 *
 * A coach-and-wait tour only ever automates *scene-setting* navigation and
 * otherwise waits for the human (the PRIME DIRECTIVE). The **Automated Combat**
 * tour is different: it is opinionated and railroaded, so a step may *perform* an
 * action rather than wait for one — import an adventure, activate a scene, start
 * and advance a combat, set a target. This is sanctioned precisely because such a
 * tour demonstrates the automation end-to-end down a fixed path; it is never the
 * general tour behaviour.
 *
 * These descriptors are **pure data**: they name *what* to do, not *how*. The
 * Foundry-coupled `SohlTour` supplies the executor that turns each descriptor into
 * Foundry calls. That split keeps the drive **sequencing** — run each action in
 * order, await it fully before the next so the following step's targets exist —
 * Foundry-free and unit-tested (`tests/domain/tour/TourDrive.test.ts`), while the
 * side-effecting primitives live where Foundry does.
 */

/**
 * The kinds of drive action a step can perform. Each is executed by `SohlTour`'s
 * Foundry-coupled dispatcher and awaited before the step is shown.
 */
export const TOUR_DRIVE_KIND = {
    /** Import an Adventure document (by UUID) into the world. */
    IMPORT_ADVENTURE: "import-adventure",
    /** Activate a Scene (by UUID) and await its canvas render. */
    ACTIVATE_SCENE: "activate-scene",
    /** Start a Combat for the given (or all scene) tokens. */
    START_COMBAT: "start-combat",
    /** Roll initiative for every combatant in the active combat. */
    ROLL_INITIATIVE: "roll-initiative",
    /** Advance the active combat to the next turn. */
    ADVANCE_TURN: "advance-turn",
    /** Set the current user's target to a token (by UUID). */
    SET_TARGET: "set-target",
    /** Clear the current user's targeted tokens. */
    CLEAR_TARGET: "clear-target",
} as const;

/** A drive action kind — one of {@link TOUR_DRIVE_KIND}. */
export type TourDriveKind =
    (typeof TOUR_DRIVE_KIND)[keyof typeof TOUR_DRIVE_KIND];

/** Import an Adventure document into the world, then await its completion. */
export interface ImportAdventureDrive {
    kind: typeof TOUR_DRIVE_KIND.IMPORT_ADVENTURE;
    /** UUID of the Adventure to import (world or compendium). */
    uuid: string;
}

/** Activate a Scene and await its canvas render before the step is shown. */
export interface ActivateSceneDrive {
    kind: typeof TOUR_DRIVE_KIND.ACTIVATE_SCENE;
    /** UUID of the Scene to activate and view. */
    uuid: string;
}

/**
 * Start a Combat encounter, add the chosen tokens as combatants, and begin it.
 * With no `tokenUuids`, every token on the active scene is enrolled.
 */
export interface StartCombatDrive {
    kind: typeof TOUR_DRIVE_KIND.START_COMBAT;
    /** UUIDs of the TokenDocuments to enroll; defaults to all scene tokens. */
    tokenUuids?: string[];
    /** Whether to roll initiative for all as part of starting. Defaults to false. */
    rollInitiative?: boolean;
}

/** Roll initiative for every combatant in the active combat. */
export interface RollInitiativeDrive {
    kind: typeof TOUR_DRIVE_KIND.ROLL_INITIATIVE;
}

/** Advance the active combat to the next turn. */
export interface AdvanceTurnDrive {
    kind: typeof TOUR_DRIVE_KIND.ADVANCE_TURN;
}

/** Set the current user's target to a specific token. */
export interface SetTargetDrive {
    kind: typeof TOUR_DRIVE_KIND.SET_TARGET;
    /** UUID of the TokenDocument to target. */
    tokenUuid: string;
}

/** Clear the current user's targeted tokens. */
export interface ClearTargetDrive {
    kind: typeof TOUR_DRIVE_KIND.CLEAR_TARGET;
}

/**
 * A single drive action declared on a step. The discriminated `kind` selects the
 * shape; `SohlTour` executes each in the order declared, awaiting one before the
 * next.
 */
export type TourDrive =
    | ImportAdventureDrive
    | ActivateSceneDrive
    | StartCombatDrive
    | RollInitiativeDrive
    | AdvanceTurnDrive
    | SetTargetDrive
    | ClearTargetDrive;

/**
 * The Foundry-coupled executor `SohlTour` supplies to {@link runDrive}: it turns
 * one {@link TourDrive} descriptor into its side-effecting Foundry calls and
 * resolves when that action is complete.
 *
 * @param drive - The drive descriptor to execute.
 * @param tour - The running tour, for reaching the resolved documents/canvas.
 * @returns A promise that resolves once the action has fully completed.
 */
export type TourDriveExecutor = (
    drive: TourDrive,
    tour: unknown,
) => void | Promise<void>;

/**
 * Run a step's drive actions **strictly in order**, awaiting each fully before
 * starting the next so the following action (and the step's own selector) sees the
 * world state the prior action produced — an activated scene, a started combat, a
 * set target. An executor that rejects **halts the sequence** and propagates, so
 * the remaining actions never run against a half-built state; the tour's own
 * seeded-RNG teardown still fires because the error unwinds through `SohlTour`'s
 * exit path.
 *
 * This is the unit-tested seam: given a recording executor it proves ordering,
 * sequential awaiting, and error propagation without any Foundry.
 *
 * @param drives - The ordered drive descriptors (may be `undefined`/empty).
 * @param execute - The Foundry-coupled executor for a single descriptor.
 * @param tour - The running tour, passed through to `execute`.
 */
export async function runDrive(
    drives: readonly TourDrive[] | undefined,
    execute: TourDriveExecutor,
    tour: unknown,
): Promise<void> {
    if (!drives?.length) return;
    for (const drive of drives) {
        await execute(drive, tour);
    }
}
