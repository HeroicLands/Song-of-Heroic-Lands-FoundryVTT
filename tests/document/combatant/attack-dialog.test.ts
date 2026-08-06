/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { showAttackDialog } from "@src/document/combatant/logic/combatant-dialogs";
import { defaultModeIndex } from "@src/document/combatant/logic/SohlCombatantLogic";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

afterEach(() => vi.restoreAllMocks());

const ATTACK_DIALOG = "systems/sohl/templates/dialog/attack-dialog.hbs";

/** A minimal strike-mode stub: only `name` and `pointerData` are used here. */
function strikeMode(itemUuid: string, smId: string, name: string): any {
    return { name, shortcode: smId, pointerData: { itemUuid, smId } };
}

const SWING = strikeMode("Item.sword", "swing", "Arming Sword Swing");
const THRUST = strikeMode("Item.sword", "thrust", "Arming Sword Thrust");
const PUNCH = strikeMode("Item.unarmed", "punch", "Unarmed Punch");

describe("attack-dialog.hbs", () => {
    it("renders a strike-mode select from modeChoices with the default selected", () => {
        const html = renderTemplateReal(ATTACK_DIALOG, {
            aimChoices: { hd: "Head", th: "Thorax" },
            defaultAim: "th",
            modeChoices: {
                "0": "Arming Sword Swing",
                "1": "Arming Sword Thrust",
            },
            defaultModeIdx: "1",
            situationalModifier: 0,
        });

        expect(html).toContain('name="modeIdx"');
        expect(html).toContain('<option value="0">Arming Sword Swing</option>');
        expect(html).toContain(
            '<option value="1" selected>Arming Sword Thrust</option>',
        );
        // The other two inputs are unchanged.
        expect(html).toContain('name="aim"');
        expect(html).toContain('<option value="th" selected>Thorax</option>');
        expect(html).toContain('name="situationalModifier"');
    });
});

describe("showAttackDialog", () => {
    /** Show the dialog, answering it with `form`; returns the resolved result. */
    function answerWith(form: Record<string, unknown>, modes: any[] = []) {
        let spec: any;
        vi.spyOn(FoundryHelpersMock, "dialog").mockImplementation(
            async (s: any) => {
                spec = s;
                return s.callback(form, "ok");
            },
        );
        const promise = showAttackDialog(
            "Aldric vs. Brynn Attack",
            { hd: "Head", th: "Thorax" },
            "th",
            modes,
            1,
        );
        return promise.then((result) => ({ result, spec }));
    }

    it("hands the template index-keyed mode choices and the default index", async () => {
        const { spec } = await answerWith({ modeIdx: "0" }, [SWING, THRUST]);
        expect(spec.template).toBe(ATTACK_DIALOG);
        expect(spec.data.modeChoices).toEqual({
            "0": "Arming Sword Swing",
            "1": "Arming Sword Thrust",
        });
        expect(spec.data.defaultModeIdx).toBe("1");
    });

    it("resolves the selected mode's pointer data", async () => {
        const { result } = await answerWith(
            { aim: "hd", modeIdx: "1", situationalModifier: "5" },
            [SWING, THRUST],
        );
        expect(result).toEqual({
            aim: "hd",
            mode: { itemUuid: "Item.sword", smId: "thrust" },
            situationalModifier: 5,
        });
    });

    it("falls back to the default mode when modeIdx is missing or out of range", async () => {
        const missing = await answerWith({ aim: "th" }, [SWING, THRUST]);
        expect(missing.result?.mode).toEqual({
            itemUuid: "Item.sword",
            smId: "thrust",
        });

        const outOfRange = await answerWith({ aim: "th", modeIdx: "9" }, [
            SWING,
            THRUST,
        ]);
        expect(outOfRange.result?.mode).toEqual({
            itemUuid: "Item.sword",
            smId: "thrust",
        });
    });

    it("resolves to null without opening a dialog when there are no modes", async () => {
        const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
        await expect(
            showAttackDialog("Aldric vs. Brynn Attack", {}, "th", [], 0),
        ).resolves.toBeNull();
        expect(dlg).not.toHaveBeenCalled();
    });
});

describe("defaultModeIndex", () => {
    const MODES = [SWING, THRUST, PUNCH];
    /** Effective ML by mode — Punch is the best chance. */
    const ML: Record<string, number> = { swing: 60, thrust: 55, punch: 80 };
    const ml = (sm: any) => ML[sm.shortcode]!;

    it("honours the first available preference, in order", () => {
        expect(
            defaultModeIndex(
                MODES,
                [THRUST.pointerData, SWING.pointerData],
                ml,
            ),
        ).toBe(1);
    });

    it("skips absent and unavailable preferences", () => {
        expect(
            defaultModeIndex(
                MODES,
                [
                    undefined,
                    { itemUuid: "Item.gone", smId: "swing" },
                    SWING.pointerData,
                ],
                ml,
            ),
        ).toBe(0);
    });

    it("falls back to the best-chance mode when no preference matches", () => {
        expect(defaultModeIndex(MODES, [undefined], ml)).toBe(2);
        expect(defaultModeIndex(MODES, [], ml)).toBe(2);
    });

    it("returns -1 for an empty mode list", () => {
        expect(defaultModeIndex([], [SWING.pointerData], ml)).toBe(-1);
    });
});
