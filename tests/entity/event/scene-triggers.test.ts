/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import {
    buildDarknessTriggerContext,
    SCENE_DARKNESS_TRIGGER,
    SOHL_ENVIRONMENT_TRIGGERS,
} from "@src/entity/event/scene-triggers";

describe("scene-triggers", () => {
    it("names the darkness trigger", () => {
        expect(SCENE_DARKNESS_TRIGGER).toBe("sceneDarknessChange");
    });

    describe("buildDarknessTriggerContext", () => {
        it("builds a context when the scene update changes darknessLevel", () => {
            expect(
                buildDarknessTriggerContext("Scene.s", {
                    environment: { darknessLevel: 0.75 },
                }),
            ).toEqual({
                name: "sceneDarknessChange",
                sceneUuid: "Scene.s",
                darkness: 0.75,
            });
        });

        it("handles a darkness of 0 (a real value, not absence)", () => {
            expect(
                buildDarknessTriggerContext("Scene.s", {
                    environment: { darknessLevel: 0 },
                }),
            ).toEqual({
                name: "sceneDarknessChange",
                sceneUuid: "Scene.s",
                darkness: 0,
            });
        });

        it("returns undefined when the update does not touch darknessLevel", () => {
            expect(
                buildDarknessTriggerContext("Scene.s", { name: "New name" }),
            ).toBeUndefined();
            expect(
                buildDarknessTriggerContext("Scene.s", {
                    environment: { globalLight: { enabled: true } },
                }),
            ).toBeUndefined();
            expect(buildDarknessTriggerContext("Scene.s", {})).toBeUndefined();
        });
    });

    describe("SOHL_ENVIRONMENT_TRIGGERS", () => {
        it("lists the darkness trigger with an i18n label", () => {
            expect(SOHL_ENVIRONMENT_TRIGGERS).toEqual([
                {
                    name: "sceneDarknessChange",
                    label: "SOHL.Trigger.sceneDarknessChange",
                },
            ]);
        });
    });
});
