import { describe, it, expect } from "vitest";
import * as utils from "@src/utils";
import * as constants from "@src/utils/constants";
import { romanize } from "@src/utils/helpers";
import { ACTOR_KIND } from "@src/utils/constants";
import { SohlMap } from "@src/utils/collection/SohlMap";

/**
 * The `sohl.utils` / `sohl.constants` reconciliation (#408). `sohl.utils` is
 * bound (in `sohl.ts`) to the **`utils` namespace** — the superset barrel that
 * re-exports helpers and constants at its top level and nests `collection` — so
 * the runtime surface matches the namespace tree the docs (#404) render. The
 * curated `sohl.constants` alias is kept for backwards compatibility.
 *
 * These assert the shape of the objects the global is bound to (`@src/utils` and
 * `@src/utils/constants`), mirroring how the entity-registry suite tests the
 * surface object directly rather than wiring a runtime global.
 */
describe("sohl.utils / sohl.constants surface (#408)", () => {
    describe("sohl.utils is the utils-namespace superset", () => {
        it("re-exports the helpers at its top level (sohl.utils.romanize)", () => {
            expect(utils.romanize).toBe(romanize);
            expect(utils.romanize).toBeTypeOf("function");
            expect(utils.romanize(4)).toBe("IV");
        });

        it("re-exports the constants at its top level (sohl.utils.ACTOR_KIND)", () => {
            expect(utils.ACTOR_KIND).toBe(ACTOR_KIND);
            expect(utils.ACTOR_KIND.BEING).toBe("being");
        });

        it("nests the collection sub-namespace (sohl.utils.collection.SohlMap)", () => {
            expect(utils.collection).toBeTypeOf("object");
            expect(utils.collection.SohlMap).toBe(SohlMap);
        });
    });

    describe("sohl.constants is kept as the curated alias", () => {
        it("exposes the constant values (sohl.constants.ACTOR_KIND)", () => {
            expect(constants.ACTOR_KIND).toBe(ACTOR_KIND);
            expect(constants.ACTOR_KIND.BEING).toBe("being");
        });
    });

    it("resolves consistently — sohl.utils.* and sohl.constants.* are the same symbols", () => {
        // The whole point of the reconciliation: the superset and the alias
        // never disagree about a constant.
        expect(utils.ACTOR_KIND).toBe(constants.ACTOR_KIND);
        expect(utils.ITEM_KIND).toBe(constants.ITEM_KIND);
    });
});
