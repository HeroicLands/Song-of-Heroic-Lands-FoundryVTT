import { BRAND } from "@src/utils/constants";

/**
 * Brand a plain mock object as a `SohlLogic`.
 *
 * The entity-constructor `(parent)` shorthand (`new entity.X(parent)`)
 * discriminates a parent Logic from a data bag with `isA(x, "SohlLogic")`, which
 * tests the `BRAND.SohlLogic` symbol. Real logic instances carry it through an
 * inherited getter; a hand-built mock used directly as an entity's parent must
 * opt in — wrap it in this helper so the shorthand accepts it.
 *
 * @param o - The mock logic object.
 * @returns The same object, branded as a `SohlLogic`.
 */
export function brandLogic<T extends object>(o: T): T {
    return Object.assign(o, { [BRAND.SohlLogic]: true });
}
