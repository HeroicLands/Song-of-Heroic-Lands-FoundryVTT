import { describe, it, expect, vi, afterEach } from "vitest";
import {
    SohlItemBaseLogic,
    buildItemDescCardData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import { ContainerGearLogic } from "@src/document/item/logic/ContainerGearLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { buildActionCard } from "@src/document/chat/action-card";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

describe("SohlItemBaseLogic intrinsic actions", () => {
    afterEach(() => vi.restoreAllMocks());

    function makeBase() {
        const logic = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL);
        logic.initialize();
        return logic;
    }

    it("defines an editDocument and a deleteDocument intrinsic action", () => {
        const shortcodes = SohlItemBaseLogic.defineIntrinsicActions().map(
            (a) => a.shortcode,
        );
        expect(shortcodes).toContain("editDocument");
        expect(shortcodes).toContain("deleteDocument");
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

    it("defines an outputDescription intrinsic action on every item kind", () => {
        const action = SohlItemBaseLogic.defineIntrinsicActions().find(
            (a) => a.shortcode === "outputDescription",
        );
        expect(action).toBeDefined();
        expect(action!.executor).toBe("outputDescription");
        expect(action!.title).toBe(
            "SOHL.SohlItemBaseLogic.Action.outputDescription.title",
        );
    });
});

describe("buildItemDescCardData → item-desc-card", () => {
    afterEach(() => vi.restoreAllMocks());

    it("populates the card from the item, enriching the description", async () => {
        const actor = makeMockActor();
        const logic = makeItemLogic(
            SohlItemBaseLogic,
            ITEM_KIND.SKILL,
            {
                notes: "A short note",
                docHtml: "<p>The long description.</p>",
            },
            { actor, name: "Sword & Board" },
        );
        logic.initialize();

        const spec = await buildItemDescCardData(logic);
        expect(spec.template).toContain("item-desc-card.hbs");
        expect(spec.buttons).toBeUndefined(); // informational — no follow-up
        expect(spec.data).toMatchObject({
            actorId: actor.id,
            name: "Sword & Board",
            notes: "A short note",
            desc: "<p>The long description.</p>",
        });
    });

    it("renders (real Handlebars) the item's name, subtitle, notes and description", async () => {
        vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(((
            tpl: any,
            data: any,
        ) => Promise.resolve(renderTemplateReal(String(tpl), data))) as any);

        const actor = makeMockActor();
        const logic = makeItemLogic(
            SohlItemBaseLogic,
            ITEM_KIND.SKILL,
            {
                notes: "Guild-taught",
                docHtml: "<p>A trusty broadsword.</p>",
            },
            { actor, name: "Broadsword" },
        );
        logic.initialize();

        const html = await buildActionCard(await buildItemDescCardData(logic));
        expect(html).toContain(`data-actor-id="${actor.id}"`);
        expect(html).toContain("Broadsword");
        expect(html).toContain("Guild-taught");
        expect(html).toContain("A trusty broadsword.");
        // No charges on a skill → the charges row is omitted.
        expect(html).not.toContain("Charges:");
    });

    it("does not interpolate item data into template source (escaped, never raw)", async () => {
        vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(((
            tpl: any,
            data: any,
        ) => Promise.resolve(renderTemplateReal(String(tpl), data))) as any);

        const logic = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL, {}, {
            name: "<script>alert(1)</script>",
        } as any);
        logic.initialize();

        const html = await buildActionCard(await buildItemDescCardData(logic));
        // The name rides in `data`, where Handlebars escapes it in the `{{name}}`
        // title — it must never reach the card as a live tag.
        expect(html).not.toContain("<script>alert(1)</script>");
        expect(html).toContain("&lt;script&gt;");
    });

    it("shows a concrete charges count when the item uses charges", async () => {
        vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(((
            tpl: any,
            data: any,
        ) => Promise.resolve(renderTemplateReal(String(tpl), data))) as any);

        const logic = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL, {
            charges: { value: 3, max: 5 },
        });
        logic.initialize();

        const spec = await buildItemDescCardData(logic);
        expect(spec.data!.charges).toBe("3 / 5");
        const html = await buildActionCard(spec);
        expect(html).toContain("Charges:");
        expect(html).toContain("3 / 5");
    });

    it("omits charges when the item has infinite (null value) or no charges", async () => {
        const infinite = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL, {
            charges: { value: null, max: 5 },
        });
        infinite.initialize();
        expect(
            (await buildItemDescCardData(infinite)).data!.charges,
        ).toBeUndefined();

        const none = makeItemLogic(SohlItemBaseLogic, ITEM_KIND.SKILL);
        none.initialize();
        expect(
            (await buildItemDescCardData(none)).data!.charges,
        ).toBeUndefined();
    });
});
