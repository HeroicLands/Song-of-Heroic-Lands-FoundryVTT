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

import { describe, it, expect, vi } from "vitest";
import {
    TOUR_DRIVE_KIND,
    runDrive,
    type TourDrive,
    type TourDriveExecutor,
} from "@src/entity/tour/TourDrive";

/** A short delay used to prove sequential (not concurrent) awaiting. */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const ACTIVATE: TourDrive = {
    kind: TOUR_DRIVE_KIND.ACTIVATE_SCENE,
    uuid: "Scene.abc",
};
const START: TourDrive = { kind: TOUR_DRIVE_KIND.START_COMBAT };
const ADVANCE: TourDrive = { kind: TOUR_DRIVE_KIND.ADVANCE_TURN };

describe("runDrive — drive-step sequencing and awaiting", () => {
    it("executes each drive action in the order declared", async () => {
        const seen: string[] = [];
        const execute: TourDriveExecutor = (d) => {
            seen.push(d.kind);
        };
        await runDrive([ACTIVATE, START, ADVANCE], execute, {});
        expect(seen).toEqual([
            TOUR_DRIVE_KIND.ACTIVATE_SCENE,
            TOUR_DRIVE_KIND.START_COMBAT,
            TOUR_DRIVE_KIND.ADVANCE_TURN,
        ]);
    });

    it("awaits each action fully before starting the next (no overlap)", async () => {
        const events: string[] = [];
        const execute: TourDriveExecutor = async (d) => {
            events.push(`start:${d.kind}`);
            await delay(5);
            events.push(`end:${d.kind}`);
        };
        await runDrive([ACTIVATE, START], execute, {});
        // A concurrent runner would interleave the starts; a sequential one
        // fully closes each action before opening the next.
        expect(events).toEqual([
            `start:${TOUR_DRIVE_KIND.ACTIVATE_SCENE}`,
            `end:${TOUR_DRIVE_KIND.ACTIVATE_SCENE}`,
            `start:${TOUR_DRIVE_KIND.START_COMBAT}`,
            `end:${TOUR_DRIVE_KIND.START_COMBAT}`,
        ]);
    });

    it("passes the running tour through to the executor", async () => {
        const tour = { id: "combat-tour" };
        const execute = vi.fn<TourDriveExecutor>();
        await runDrive([ACTIVATE], execute, tour);
        expect(execute).toHaveBeenCalledWith(ACTIVATE, tour);
    });

    it("halts the sequence and propagates when an action rejects", async () => {
        const seen: string[] = [];
        const execute: TourDriveExecutor = async (d) => {
            seen.push(d.kind);
            if (d.kind === TOUR_DRIVE_KIND.START_COMBAT) {
                throw new Error("combat failed");
            }
        };
        await expect(
            runDrive([ACTIVATE, START, ADVANCE], execute, {}),
        ).rejects.toThrow("combat failed");
        // ADVANCE must never run after START threw.
        expect(seen).toEqual([
            TOUR_DRIVE_KIND.ACTIVATE_SCENE,
            TOUR_DRIVE_KIND.START_COMBAT,
        ]);
    });

    it("is a no-op for an empty or undefined drive list", async () => {
        const execute = vi.fn<TourDriveExecutor>();
        await runDrive(undefined, execute, {});
        await runDrive([], execute, {});
        expect(execute).not.toHaveBeenCalled();
    });
});
