/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import {
    buildRegionTriggerContext,
    CURATED_REGION_EVENTS,
    EXCLUDED_REGION_EVENTS,
    REGION_EVENT_TO_TRIGGER,
    SOHL_REGION_TRIGGERS,
    regionTriggerForEvent,
} from "@src/entity/event/region-triggers";

describe("region-triggers", () => {
    describe("REGION_EVENT_TO_TRIGGER", () => {
        it("maps each curated Foundry region event to its SoHL trigger name", () => {
            expect(REGION_EVENT_TO_TRIGGER).toEqual({
                tokenEnter: "regionTokenEnter",
                tokenExit: "regionTokenExit",
                tokenTurnStart: "regionTokenTurnStart",
                tokenTurnEnd: "regionTokenTurnEnd",
                tokenRoundStart: "regionTokenRoundStart",
                tokenRoundEnd: "regionTokenRoundEnd",
            });
        });

        it("covers exactly the curated event set", () => {
            expect(Object.keys(REGION_EVENT_TO_TRIGGER).sort()).toEqual(
                [...CURATED_REGION_EVENTS].sort(),
            );
        });
    });

    describe("regionTriggerForEvent", () => {
        it("returns the SoHL trigger name for a curated event", () => {
            expect(regionTriggerForEvent("tokenEnter")).toBe(
                "regionTokenEnter",
            );
            expect(regionTriggerForEvent("tokenRoundEnd")).toBe(
                "regionTokenRoundEnd",
            );
        });

        it("returns undefined for an excluded high-frequency event", () => {
            for (const excluded of EXCLUDED_REGION_EVENTS) {
                expect(regionTriggerForEvent(excluded)).toBeUndefined();
            }
        });

        it("returns undefined for an unknown event name", () => {
            expect(regionTriggerForEvent("notAnEvent")).toBeUndefined();
        });
    });

    describe("exclusions", () => {
        it("excludes the continuous/high-frequency streams and internal events", () => {
            expect([...EXCLUDED_REGION_EVENTS].sort()).toEqual(
                [
                    "tokenMoveIn",
                    "tokenMoveOut",
                    "tokenMoveWithin",
                    "tokenAnimateIn",
                    "tokenAnimateOut",
                    "regionBoundary",
                    "behaviorActivated",
                    "behaviorDeactivated",
                    "behaviorViewed",
                    "behaviorUnviewed",
                ].sort(),
            );
        });

        it("never maps an excluded event", () => {
            for (const excluded of EXCLUDED_REGION_EVENTS) {
                expect(
                    (REGION_EVENT_TO_TRIGGER as Record<string, string>)[
                        excluded
                    ],
                ).toBeUndefined();
            }
        });
    });

    describe("buildRegionTriggerContext", () => {
        it("builds the full context for a curated event", () => {
            expect(
                buildRegionTriggerContext({
                    eventName: "tokenEnter",
                    regionUuid: "Scene.s.Region.r",
                    regionId: "r",
                    regionName: "Crypt",
                    tokenUuid: "Scene.s.Token.t",
                    actorUuid: "Actor.a",
                    sceneUuid: "Scene.s",
                }),
            ).toEqual({
                name: "regionTokenEnter",
                regionUuid: "Scene.s.Region.r",
                regionId: "r",
                regionName: "Crypt",
                tokenUuid: "Scene.s.Token.t",
                actorUuid: "Actor.a",
                sceneUuid: "Scene.s",
            });
        });

        it("returns undefined for an excluded/unknown event (caller does nothing)", () => {
            expect(
                buildRegionTriggerContext({ eventName: "tokenMoveWithin" }),
            ).toBeUndefined();
            expect(
                buildRegionTriggerContext({ eventName: "nope" }),
            ).toBeUndefined();
        });

        it("normalizes missing identifiers to blank and a missing actor to undefined", () => {
            const ctx = buildRegionTriggerContext({ eventName: "tokenExit" });
            expect(ctx).toEqual({
                name: "regionTokenExit",
                regionUuid: "",
                regionId: "",
                regionName: "",
                tokenUuid: "",
                actorUuid: undefined,
                sceneUuid: "",
            });
        });
    });

    describe("SOHL_REGION_TRIGGERS", () => {
        it("lists every region trigger name with an i18n label", () => {
            const names = SOHL_REGION_TRIGGERS.map((t) => t.name).sort();
            expect(names).toEqual(
                Object.values(REGION_EVENT_TO_TRIGGER).sort(),
            );
            for (const t of SOHL_REGION_TRIGGERS) {
                expect(t.label).toMatch(/^SOHL\./);
            }
        });
    });
});
