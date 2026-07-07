/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Registry mapping stable ids to their functions, enabling
 * {@link defaultToJSON} / {@link defaultFromJSON} to round-trip a function
 * through plain JSON as a `__funcref__:<id>` *reference* rather than as
 * executable source. This is the safe counterpart to serializing a function
 * body: revival resolves the id to an already-defined, code-authored function,
 * so untrusted serialized data (world/module/compendium content, cross-client
 * chat payloads) can never introduce new code — it can only *select* a function
 * the system already ships.
 *
 * This mirrors the `kindRegistry` module (which does the same for class
 * constructors) and is likewise a deliberate leaf module: it imports nothing
 * from the domain or from `helpers`, so the serialization layer and the code
 * that registers functions can both depend on it without an import cycle.
 * Functions self-register at module load (`registerFunc("my.id", myFn)`), so
 * importing the owning module is enough to make the function referenceable —
 * there is no central hub to keep in sync.
 *
 * The mapping is strictly one-to-one: an id resolves to exactly one function,
 * and a function serializes to exactly one id. Re-registering the identical
 * `(id, fn)` pair is a harmless no-op (module reload); any conflicting
 * registration throws, so serialization stays deterministic.
 */

/** Any callable that can be registered for reference-based serialization. */
export type RegisterableFunc = (...args: any[]) => any;

const idToFunc = new Map<string, RegisterableFunc>();
const funcToId = new Map<RegisterableFunc, string>();

/**
 * Register a function under a stable id so it can be serialized as a
 * `__funcref__:<id>` reference and revived to the same function.
 *
 * @remarks
 * Idempotent for an identical `(id, fn)` pair (tolerates module reload).
 * Throws on any conflict — an id already bound to a different function, or a
 * function already registered under a different id — to keep the mapping
 * one-to-one and serialization deterministic.
 *
 * @param id - The stable, unique id to register the function under.
 * @param fn - The function to associate with the id.
 * @throws Error if `id` is already bound to a different function, or if `fn` is
 *   already registered under a different id.
 */
export function registerFunc(id: string, fn: RegisterableFunc): void {
    const existingFn = idToFunc.get(id);
    if (existingFn !== undefined && existingFn !== fn) {
        throw new Error(
            `funcref id "${id}" is already registered to a different function`,
        );
    }
    const existingId = funcToId.get(fn);
    if (existingId !== undefined && existingId !== id) {
        throw new Error(
            `function is already registered under a different funcref id ` +
                `("${existingId}", not "${id}")`,
        );
    }
    idToFunc.set(id, fn);
    funcToId.set(fn, id);
}

/**
 * The function registered under an id, or `undefined` if the id is unknown.
 * @param id - The id to look up.
 * @returns The registered function, or `undefined` if the id is unregistered.
 */
export function getFunc(id: string): RegisterableFunc | undefined {
    return idToFunc.get(id);
}

/**
 * The id a function was registered under, or `undefined` if unregistered.
 * @param fn - The function to look up.
 * @returns The registered id, or `undefined` if the function is unregistered.
 */
export function getIdForFunc(fn: RegisterableFunc): string | undefined {
    return funcToId.get(fn);
}

/**
 * Clear the registry. Test-only seam so suites can start from a known state;
 * not part of the public API.
 * @internal
 */
export function _clearFuncRegistryForTests(): void {
    idToFunc.clear();
    funcToId.clear();
}
