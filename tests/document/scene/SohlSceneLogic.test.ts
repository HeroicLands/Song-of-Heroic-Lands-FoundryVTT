import { describe, it, expect } from "vitest";
import {
    SohlSceneLogic,
    createSceneData,
    TOTM_FLAG_KEY,
    SCENE_FLAG_SCOPE,
} from "@src/document/scene/logic/SohlSceneLogic";

/**
 * A stand-in for the live Scene document: a flag store backed by a plain map,
 * matching the `getFlag(scope, key)` surface `createSceneData` reads through.
 */
function makeScene(flags: Record<string, unknown> = {}) {
    return {
        flags,
        getFlag(scope: string, key: string): unknown {
            return scope === SCENE_FLAG_SCOPE ? flags[key] : undefined;
        },
    } as any;
}

describe("createSceneData", () => {
    it("reports isTotm = false when the scene carries no flag", () => {
        expect(createSceneData(makeScene()).isTotm).toBe(false);
    });

    it("reports isTotm = true when the flag is set", () => {
        const data = createSceneData(makeScene({ [TOTM_FLAG_KEY]: true }));
        expect(data.isTotm).toBe(true);
    });

    it("reads the flag live, so a later change is reflected", () => {
        const flags: Record<string, unknown> = {};
        const data = createSceneData(makeScene(flags));
        expect(data.isTotm).toBe(false);
        flags[TOTM_FLAG_KEY] = true;
        expect(data.isTotm).toBe(true);
    });

    it("exposes the owning scene", () => {
        const scene = makeScene();
        expect(createSceneData(scene).scene).toBe(scene);
    });
});

describe("SohlSceneLogic", () => {
    it("reports isTotm = false for a scene with the flag unset", () => {
        const logic = new SohlSceneLogic(createSceneData(makeScene()));
        expect(logic.isTotm).toBe(false);
    });

    it("reports isTotm = true for a scene with the flag set", () => {
        const logic = new SohlSceneLogic(createSceneData(makeScene({ [TOTM_FLAG_KEY]: true })));
        expect(logic.isTotm).toBe(true);
    });

    it("reflects later changes to the underlying flag", () => {
        const flags: Record<string, unknown> = {};
        const logic = new SohlSceneLogic(createSceneData(makeScene(flags)));
        expect(logic.isTotm).toBe(false);
        flags[TOTM_FLAG_KEY] = true;
        expect(logic.isTotm).toBe(true);
    });

    it("exposes the scene data adapter through .data", () => {
        const data = createSceneData(makeScene());
        const logic = new SohlSceneLogic(data);
        expect(logic.data).toBe(data);
    });

    it("exposes the owning scene through .scene", () => {
        const scene = makeScene();
        const logic = new SohlSceneLogic(createSceneData(scene));
        expect(logic.scene).toBe(scene);
    });
});
