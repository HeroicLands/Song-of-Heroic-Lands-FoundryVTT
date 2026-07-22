/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import {
    buildScriptActionDef,
    upsertActionDef,
    attachScriptAction,
} from "@src/entity/action/script-action-attach";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import type { SohlAction } from "@src/entity/action/SohlAction";

const MACRO = "Macro.p8f2c1a0d9e7b6a5";

/** A stub attachable document with a recording `update`. */
function mockDoc(actionDefs: SohlAction.Data[] = []) {
    return {
        system: { actionDefs },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

describe("script-action-attach — buildScriptActionDef", () => {
    it("maps `name` to both shortcode and default title (the scheduling identity)", () => {
        const def = buildScriptActionDef({
            name: "checkForBandits",
            executor: MACRO,
        });
        // shortcode is the key `logic.actions` is built under and what
        // `sohl.schedule(doc, "checkForBandits", …)` addresses.
        expect(def.shortcode).toBe("checkForBandits");
        expect(def.title).toBe("checkForBandits");
    });

    it("builds a SCRIPT action bound to the Macro UUID with sane defaults", () => {
        const def = buildScriptActionDef({
            name: "checkForBandits",
            executor: MACRO,
        });
        expect(def).toMatchObject({
            subType: ACTION_SUBTYPE.SCRIPT,
            executor: MACRO,
            scope: SOHL_ACTION_SCOPE.SELF,
            trigger: "true",
            visible: "true",
            iconFAClass: "fa-solid fa-bolt",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            minActorOwnership: 3,
        });
    });

    it("honors explicit overrides", () => {
        const def = buildScriptActionDef({
            name: "checkForBandits",
            executor: MACRO,
            title: "Check For Bandits",
            scope: SOHL_ACTION_SCOPE.ACTOR,
            iconFAClass: "fa-solid fa-skull",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT,
            minActorOwnership: 0,
            trigger: "false",
            visible: "false",
        });
        expect(def).toMatchObject({
            title: "Check For Bandits",
            scope: SOHL_ACTION_SCOPE.ACTOR,
            iconFAClass: "fa-solid fa-skull",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT,
            minActorOwnership: 0,
            trigger: "false",
            visible: "false",
        });
    });

    it("throws on a blank name", () => {
        expect(() =>
            buildScriptActionDef({ name: "  ", executor: MACRO }),
        ).toThrow(/name/i);
    });

    it("throws on a blank executor (a Macro UUID is required — never inline code)", () => {
        expect(() => buildScriptActionDef({ name: "x", executor: "" })).toThrow(
            /executor/i,
        );
    });
});

describe("script-action-attach — upsertActionDef", () => {
    const def = (shortcode: string, executor = MACRO): SohlAction.Data =>
        buildScriptActionDef({ name: shortcode, executor });

    it("appends a new def", () => {
        const list = upsertActionDef([], def("a"));
        expect(list.map((d) => d.shortcode)).toEqual(["a"]);
    });

    it("replaces the def with the same shortcode (idempotent re-attach, no dupes)", () => {
        const list = upsertActionDef(
            [def("a", "Macro.old"), def("b")],
            def("a", "Macro.new"),
        );
        expect(list.filter((d) => d.shortcode === "a")).toHaveLength(1);
        expect(list.find((d) => d.shortcode === "a")?.executor).toBe(
            "Macro.new",
        );
    });

    it("preserves pre-existing (e.g. intrinsic) defs untouched", () => {
        const intrinsic = {
            shortcode: "useMystery",
            subType: ACTION_SUBTYPE.INTRINSIC,
        } as unknown as SohlAction.Data;
        const list = upsertActionDef([intrinsic], def("a"));
        expect(list.map((d) => d.shortcode)).toEqual(["useMystery", "a"]);
    });
});

describe("script-action-attach — attachScriptAction", () => {
    it("writes the WHOLE actionDefs array back (never by index) and returns the def", async () => {
        const doc = mockDoc([
            {
                shortcode: "existing",
                subType: ACTION_SUBTYPE.INTRINSIC,
            } as unknown as SohlAction.Data,
        ]);
        const def = await attachScriptAction(doc as any, {
            name: "checkForBandits",
            executor: MACRO,
        });
        expect(doc.update).toHaveBeenCalledTimes(1);
        const payload = doc.update.mock.calls[0][0];
        expect(Object.keys(payload)).toEqual(["system.actionDefs"]);
        const written = payload["system.actionDefs"] as SohlAction.Data[];
        expect(written.map((d) => d.shortcode)).toEqual([
            "existing",
            "checkForBandits",
        ]);
        expect(def.shortcode).toBe("checkForBandits");
    });

    it("is idempotent: re-attaching the same name replaces, not duplicates", async () => {
        const doc = mockDoc();
        await attachScriptAction(doc as any, {
            name: "a",
            executor: "Macro.1",
        });
        // Simulate the persisted state after the first write.
        doc.system.actionDefs = doc.update.mock.calls[0][0][
            "system.actionDefs"
        ] as SohlAction.Data[];
        await attachScriptAction(doc as any, {
            name: "a",
            executor: "Macro.2",
        });
        const written = doc.update.mock.calls[1][0][
            "system.actionDefs"
        ] as SohlAction.Data[];
        expect(written).toHaveLength(1);
        expect(written[0].executor).toBe("Macro.2");
    });
});
