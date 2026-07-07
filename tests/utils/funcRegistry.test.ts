import {
    registerFunc,
    getFunc,
    getIdForFunc,
    _clearFuncRegistryForTests,
} from "@src/utils/funcRegistry";

describe("funcRegistry", () => {
    beforeEach(() => {
        _clearFuncRegistryForTests();
    });

    it("registers a function and looks it up by id", () => {
        const fn = () => 42;
        registerFunc("test.answer", fn);
        expect(getFunc("test.answer")).toBe(fn);
    });

    it("returns the id for a registered function (reverse lookup)", () => {
        const fn = () => 42;
        registerFunc("test.answer", fn);
        expect(getIdForFunc(fn)).toBe("test.answer");
    });

    it("returns undefined for an unknown id", () => {
        expect(getFunc("does.not.exist")).toBeUndefined();
    });

    it("returns undefined for an unregistered function", () => {
        expect(getIdForFunc(() => 1)).toBeUndefined();
    });

    it("is idempotent when the same id is re-registered with the same function", () => {
        const fn = () => 42;
        registerFunc("test.answer", fn);
        expect(() => registerFunc("test.answer", fn)).not.toThrow();
        expect(getFunc("test.answer")).toBe(fn);
    });

    it("throws when an id is registered with a different function", () => {
        registerFunc("test.answer", () => 42);
        expect(() => registerFunc("test.answer", () => 0)).toThrow(
            /funcref id/i,
        );
    });

    it("throws when the same function is registered under a different id", () => {
        const fn = () => 42;
        registerFunc("test.answer", fn);
        expect(() => registerFunc("test.other", fn)).toThrow(/funcref/i);
    });

    // Adversarial: ids are Map keys, not object property lookups, so
    // prototype-chain names must never resolve to a built-in function.
    it("does not resolve prototype-chain ids when unregistered", () => {
        for (const id of [
            "__proto__",
            "constructor",
            "prototype",
            "toString",
            "hasOwnProperty",
            "valueOf",
        ]) {
            expect(getFunc(id)).toBeUndefined();
        }
    });

    it("treats a prototype-chain name as an ordinary id when explicitly registered", () => {
        const fn = () => "ok";
        registerFunc("__proto__", fn);
        expect(getFunc("__proto__")).toBe(fn);
        // Registering under a reserved-looking id must not pollute anything.
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
});
