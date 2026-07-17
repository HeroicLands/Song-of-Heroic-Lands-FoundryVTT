import { describe, it, expect, vi, afterEach } from "vitest";
import { SohlItemBaseLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import { ContainerGearLogic } from "@src/document/item/logic/ContainerGearLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

describe("SohlItemBaseLogic intrinsic actions", () => {
    afterEach(() => vi.restoreAllMocks());

    function makeBase() {
        const logic = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL);
        logic.initialize();
        return logic;
    }

    it("defines an editItem and a deleteItem intrinsic action", () => {
        const shortcodes = SohlItemBaseLogic.defineIntrinsicActions().map(
            (a) => a.shortcode,
        );
        expect(shortcodes).toContain("editItem");
        expect(shortcodes).toContain("deleteItem");
    });

    it("every intrinsic executor resolves to a real method", () => {
        // SohlAction throws at construction when an INTRINSIC executor names a
        // missing method, so constructing the logic at all is the assertion.
        expect(() => makeBase()).not.toThrow();
    });

    it("editItem renders the item's sheet through the shim", async () => {
        const render = vi
            .spyOn(FoundryHelpersMock, "fvttRenderSheet")
            .mockResolvedValue(undefined);
        const logic = makeBase();
        await logic.editDocument({} as any);
        expect(render).toHaveBeenCalledWith(logic.item);
    });

    it("deleteItem deletes the item once the dialog is confirmed", async () => {
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
        const logic = makeBase();
        const del = vi.fn(async () => undefined);
        (logic.item as any).delete = del;
        await logic.deleteDocument({} as any);
        expect(del).toHaveBeenCalled();
    });

    it("deleteItem does NOT delete when the dialog is declined", async () => {
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(false);
        const logic = makeBase();
        const del = vi.fn(async () => undefined);
        (logic.item as any).delete = del;
        await logic.deleteDocument({} as any);
        expect(del).not.toHaveBeenCalled();
    });

    it("deleteItem does NOT delete when the dialog is dismissed (null)", async () => {
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
        const logic = makeBase();
        const del = vi.fn(async () => undefined);
        (logic.item as any).delete = del;
        await logic.deleteDocument({} as any);
        expect(del).not.toHaveBeenCalled();
    });

    it("the confirm dialog passes the item name as data, never interpolated into the HTML", async () => {
        const spy = vi
            .spyOn(FoundryHelpersMock, "dialog")
            .mockResolvedValue(false);
        const logic = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL, {}, {
            name: "<img src=x onerror=alert(1)>",
        } as any);
        logic.initialize();
        await logic.deleteDocument({} as any);
        const spec = spy.mock.calls[0]![0] as any;
        // Rule #10 / #163: author-static template; the name rides in `data`,
        // where Handlebars escapes it — it must never reach the source string.
        expect(spec.content).not.toContain("<img");
        expect(spec.data.name).toBe("<img src=x onerror=alert(1)>");
    });

    it("a plain item shows no extra warning", async () => {
        const spy = vi
            .spyOn(FoundryHelpersMock, "dialog")
            .mockResolvedValue(false);
        const logic = makeBase();
        await logic.deleteDocument({} as any);
        expect((spy.mock.calls[0]![0] as any).data.warning).toBeUndefined();
    });

    it("a container warns that its contents are deleted too", async () => {
        const spy = vi
            .spyOn(FoundryHelpersMock, "dialog")
            .mockResolvedValue(false);
        const logic = makeItemLogic(
            ContainerGearLogic,
            ITEM_KIND.CONTAINERGEAR,
            {
                quantity: 1,
                weightBase: 2,
                valueBase: 15,
                isCarried: true,
                isEquipped: false,
                qualityBase: 9,
                durabilityBase: 10,
                sharedWithCohortIds: [],
                containerId: null,
                maxCapacityBase: 50,
            },
        );
        logic.initialize();
        await logic.deleteDocument({} as any);
        expect((spy.mock.calls[0]![0] as any).data.warning).toBe(
            "SOHL.ContainerGear.delete.warning",
        );
    });
});
