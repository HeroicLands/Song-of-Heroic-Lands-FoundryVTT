import { describe, it, expect } from "vitest";
import { SohlSceneLogic } from "@src/document/scene/SohlSceneLogic";

function makeData(isTotm: boolean) {
    return { isTotm } as any;
}

describe("SohlSceneLogic", () => {
    it("reports isTotm = false from a default scene data model", () => {
        const logic = new SohlSceneLogic(makeData(false));
        expect(logic.isTotm).toBe(false);
    });

    it("reports isTotm = true when the data model has it enabled", () => {
        const logic = new SohlSceneLogic(makeData(true));
        expect(logic.isTotm).toBe(true);
    });

    it("reflects later changes to the underlying data model", () => {
        const data = makeData(false);
        const logic = new SohlSceneLogic(data);
        expect(logic.isTotm).toBe(false);
        data.isTotm = true;
        expect(logic.isTotm).toBe(true);
    });

    it("exposes the data model through .data", () => {
        const data = makeData(true);
        const logic = new SohlSceneLogic(data);
        expect(logic.data).toBe(data);
    });
});
