// Smoke test: a consumer using the generated types. Not shipped.
import type { ValueModifier, SuccessTestResult } from "../index";

// The `sohl` global is ambient (from the package's `declare global`).
const _flat: typeof sohl.entity.ValueModifier = sohl.entity.ValueModifier;
const _ns: typeof sohl.entity.modifier.ValueModifier =
    sohl.entity.modifier.ValueModifier;
// A document class reached via its namespace path (not a flat named export).
const _doc: typeof sohl.document.effect.foundry.SohlActiveEffect =
    sohl.document.effect.foundry.SohlActiveEffect;

export type { ValueModifier, SuccessTestResult };
export { _flat, _ns, _doc };
