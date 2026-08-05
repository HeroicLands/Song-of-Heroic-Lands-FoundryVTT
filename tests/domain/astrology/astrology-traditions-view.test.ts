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
    module1: {
        key: "module1",
        label: "Modular",
        signs: [{} as any],
        source: "module",
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
        const vm = buildAstrologyTraditionsViewModel(REGISTRY);
        expect(vm.traditions.map((t) => t.label)).toEqual([
            "Arcane",
            "Modular",
            "Zephyr",
        ]);
        expect(vm.traditions.find((t) => t.key === "builtin1")?.signCount).toBe(
            2,
        );
        expect(vm.hasTraditions).toBe(true);
    });

    it("flags each tradition by its provenance", () => {
        const vm = buildAstrologyTraditionsViewModel(REGISTRY);
        const bySource = (key: string) =>
            vm.traditions.find((t) => t.key === key)?.source;
        expect(bySource("builtin1")).toBe("builtin");
        expect(bySource("module1")).toBe("module");
        expect(bySource("world1")).toBe("world");
        expect(vm.traditions.find((t) => t.key === "world1")?.isWorld).toBe(
            true,
        );
        expect(vm.hasWorld).toBe(true);
    });

    it("defaults an untagged tradition to builtin", () => {
        const vm = buildAstrologyTraditionsViewModel({
            x: { key: "x", label: "X", signs: [] },
        });
        expect(vm.traditions[0].source).toBe("builtin");
    });

    it("reports no world traditions when none are world-sourced", () => {
        const vm = buildAstrologyTraditionsViewModel({
            builtin1: REGISTRY.builtin1,
            module1: REGISTRY.module1,
        });
        expect(vm.hasWorld).toBe(false);
    });

    it("handles an empty registry", () => {
        const vm = buildAstrologyTraditionsViewModel({});
        expect(vm.traditions).toEqual([]);
        expect(vm.hasTraditions).toBe(false);
    });
});
