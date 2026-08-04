import { describe, it, expect } from "vitest";
import { buildAstrologyTraditionsViewModel } from "@src/apps/logic/astrology-traditions-view";
import type { AstrologyTraditions } from "@src/entity/astrology";

const REGISTRY: AstrologyTraditions = {
    builtin1: {
        key: "builtin1",
        label: "Zephyr",
        signs: [{} as any, {} as any],
        source: "builtin",
    },
    world1: {
        key: "world1",
        label: "Arcane",
        signs: [{} as any],
        source: "world",
    },
};

describe("buildAstrologyTraditionsViewModel", () => {
    it("lists all traditions sorted by label with sign counts", () => {
        const vm = buildAstrologyTraditionsViewModel(REGISTRY, ["world1"]);
        expect(vm.traditions.map((t) => t.label)).toEqual(["Arcane", "Zephyr"]);
        expect(vm.traditions.find((t) => t.key === "builtin1")?.signCount).toBe(2);
        expect(vm.hasTraditions).toBe(true);
    });

    it("flags world-defined keys and reports hasWorld", () => {
        const vm = buildAstrologyTraditionsViewModel(REGISTRY, ["world1"]);
        expect(vm.traditions.find((t) => t.key === "world1")?.isWorld).toBe(true);
        expect(vm.traditions.find((t) => t.key === "builtin1")?.isWorld).toBe(
            false,
        );
        expect(vm.hasWorld).toBe(true);
    });

    it("reports no world traditions when the world set is empty", () => {
        const vm = buildAstrologyTraditionsViewModel(REGISTRY, []);
        expect(vm.hasWorld).toBe(false);
    });

    it("handles an empty registry", () => {
        const vm = buildAstrologyTraditionsViewModel({}, []);
        expect(vm.traditions).toEqual([]);
        expect(vm.hasTraditions).toBe(false);
    });
});
