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
 * Registry mapping serialization "kind" tags to their constructors, enabling
 * {@link instanceToJSON} / {@link defaultFromJSON} to round-trip domain class
 * instances (results, modifiers, rolls) through plain JSON — e.g. when an
 * `AttackResult` is embedded in a chat-card data attribute and rehydrated on
 * the defender's client.
 *
 * This module is intentionally a leaf: it imports nothing from the domain or
 * from `helpers`, so the serialization layer and the domain classes can both
 * depend on it without an import cycle. Classes self-register at module load
 * (`registerKind(MyClass.Kind, MyClass)`), so importing a class is enough to
 * make it serializable — there is no central hub to keep in sync.
 */

/** Any constructor that accepts `(data, options)` — the shape every
 * serializable domain class shares. */
export type KindConstructor = new (data?: any, options?: any) => object;

const kindToCtor = new Map<string, KindConstructor>();
const ctorToKind = new Map<Function, string>();

/**
 * Register a class under its kind tag. Idempotent; a later registration for
 * the same kind replaces the earlier one (last definition wins).
 * @param kind - The kind tag to register the class under.
 * @param ctor - The constructor to associate with the kind tag.
 */
export function registerKind(kind: string, ctor: KindConstructor): void {
    kindToCtor.set(kind, ctor);
    ctorToKind.set(ctor, kind);
}

/**
 * The kind tag a class was registered under, or `undefined` if unregistered.
 * @param ctor - The constructor to look up.
 * @returns The registered kind tag, or `undefined` if the class is unregistered.
 */
export function getKindForCtor(ctor: Function): string | undefined {
    return ctorToKind.get(ctor);
}

/**
 * The constructor registered for a kind tag, or `undefined` if unknown.
 * @param kind - The kind tag to look up.
 * @returns The registered constructor, or `undefined` if the kind is unknown.
 */
export function getCtorForKind(kind: string): KindConstructor | undefined {
    return kindToCtor.get(kind);
}
