/* SPDX-License-Identifier: GPL-3.0-or-later */
import { describe, expect, it, vi } from "vitest";
import { guardUndrawnTokenTargets } from "../../cypress/support/headless-token-targets.js";

describe("undrawn headless token target graphics", () => {
    it.each([
        ["_drawTargetArrows", "targetArrows"],
        ["_drawTargetPips", "targetPips"],
    ])(
        "guards missing %s graphics while retaining the initialized native path",
        (method, graphics) => {
            const native = vi.fn(function (this: any, ...args: any[]) {
                this[graphics].clear();
                return args[0];
            });
            const proto: any = { [method]: native };
            guardUndrawnTokenTargets(proto);
            const targets = new Set(["owner"]);
            const undrawn: any = { targeted: targets };
            expect(() => proto[method].call(undrawn, "options")).not.toThrow();
            expect(native).not.toHaveBeenCalled();
            expect(undrawn.targeted).toBe(targets);
            expect([...targets]).toEqual(["owner"]);
            const clear = vi.fn();
            const drawn = { [graphics]: { clear }, targeted: targets };
            expect(proto[method].call(drawn, "options")).toBe("options");
            expect(native).toHaveBeenCalledWith("options");
            expect(native.mock.instances[0]).toBe(drawn);
            expect(clear).toHaveBeenCalledOnce();
            expect(() => proto[method].call({ [graphics]: {} })).toThrow();
        },
    );
});
