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
 * The overridable-entity-class registry backing.
 *
 * This module is intentionally a **leaf**: it VALUE-imports nothing from the
 * entity class tree (only `import type`, which is erased at compile time). That
 * is what lets *any* entity module — including a base class whose own subclasses
 * are registered — `import { entity }` here without triggering a
 * `Class extends value undefined` load cycle. Classes self-register at module
 * load (`registerEntity("MyClass", MyClass)`, mirroring
 * {@link registerKind}), so importing a class is enough to make it resolvable
 * through the registry; there is no central hub to keep in sync.
 *
 * Two ways to reach these classes (see the "Entity class registry" section of
 * docs/reference/runtime-contracts.md):
 *
 * - **Inside SoHL** — `import { entity }` from here, then `new entity.X(...)`.
 * - **Outside SoHL** (macros / variant modules) — the same surface is exposed
 *   on the runtime global as `sohl.entity.X`, plus `sohl.entity.register(...)`.
 */

import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { ValueDelta } from "@src/entity/modifier/ValueDelta";
import type { CombatModifier } from "@src/entity/modifier/CombatModifier";
import type { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { TestResult } from "@src/entity/result/TestResult";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import type { ImpactResult } from "@src/entity/result/ImpactResult";
import type { AttackResult } from "@src/entity/result/AttackResult";
import type { DefendResult } from "@src/entity/result/DefendResult";
import type { CombatResult } from "@src/entity/result/CombatResult";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyLocation } from "@src/entity/body/BodyLocation";

/**
 * The overridable entity-class registry, keyed by class name. Each value is the
 * class constructor itself (`typeof ClassName`), so `new sohl.entity.X(...)` and
 * `class Y extends sohl.entity.X {}` both type-check. Hand-declared (rather than
 * `typeof someObjectLiteral`) because the backing is populated dynamically by
 * self-registration, not a literal — keep it in sync with the `ENTITY_NAMES`
 * list and the `registerEntity` call in each class module. Each property is the
 * class **constructor** (`typeof X`), not an instance.
 */
export interface SohlEntityRegistry {
    /** Auditable base-plus-ordered-deltas value tracker. See {@link sohl.entity.modifier.ValueModifier}. */
    ValueModifier: typeof ValueModifier;
    /** One operator-tagged delta applied by a {@link sohl.entity.modifier.ValueModifier}. See {@link ValueDelta}. */
    ValueDelta: typeof ValueDelta;
    /** Combat-tagged mastery-level modifier (attack/defense tests). See {@link CombatModifier}. */
    CombatModifier: typeof CombatModifier;
    /** Damage/impact modifier — dice plus aspect. See {@link ImpactModifier}. */
    ImpactModifier: typeof ImpactModifier;
    /** {@link sohl.entity.modifier.ValueModifier} specialized for d100 roll-under mastery tests. See {@link sohl.entity.modifier.MasteryLevelModifier}. */
    MasteryLevelModifier: typeof MasteryLevelModifier;
    /** Abstract base for test/combat resolution outcomes. See {@link TestResult}. */
    TestResult: typeof TestResult;
    /** Single d100 roll-under mastery test outcome. See {@link sohl.entity.result.SuccessTestResult}. */
    SuccessTestResult: typeof SuccessTestResult;
    /** Two success tests compared to determine a winner. See {@link OpposedTestResult}. */
    OpposedTestResult: typeof OpposedTestResult;
    /** Resolved impact/damage outcome. See {@link ImpactResult}. */
    ImpactResult: typeof ImpactResult;
    /** The attacker's side of a combat exchange. See {@link sohl.entity.result.AttackResult}. */
    AttackResult: typeof AttackResult;
    /** The defender's side of a combat exchange. See {@link DefendResult}. */
    DefendResult: typeof DefendResult;
    /** Full attack-vs-defense exchange outcome. See {@link CombatResult}. */
    CombatResult: typeof CombatResult;
    /** Abstract base for a weapon/technique's mode of use in combat. See {@link StrikeModeBase}. */
    StrikeModeBase: typeof StrikeModeBase;
    /** A melee strike mode. See {@link MeleeStrikeMode}. */
    MeleeStrikeMode: typeof MeleeStrikeMode;
    /** A missile (ranged) strike mode. See {@link MissileStrikeMode}. */
    MissileStrikeMode: typeof MissileStrikeMode;
    /** Executable action — a context-menu entry / chat-card button. See {@link sohl.entity.action.SohlAction}. */
    SohlAction: typeof SohlAction;
    /** Root anatomy: parts, adjacency, and hit-location resolution. See {@link sohl.entity.body.BodyStructure}. */
    BodyStructure: typeof BodyStructure;
    /** One anatomical division (head, torso, a limb). See {@link sohl.entity.body.BodyPart}. */
    BodyPart: typeof BodyPart;
    /** One hit location within a {@link sohl.entity.body.BodyPart}. See {@link BodyLocation}. */
    BodyLocation: typeof BodyLocation;
}

/** The registrable class names (`keyof` the registry). */
export type SohlEntityName = keyof SohlEntityRegistry;

/**
 * The canonical order and membership of the registry. The source of truth for
 * *which* names exist (the class *values* arrive later via self-registration).
 * Keep in sync with {@link SohlEntityRegistry}.
 */
const ENTITY_NAMES = [
    "ValueModifier",
    "ValueDelta",
    "CombatModifier",
    "ImpactModifier",
    "MasteryLevelModifier",
    "TestResult",
    "SuccessTestResult",
    "OpposedTestResult",
    "ImpactResult",
    "AttackResult",
    "DefendResult",
    "CombatResult",
    "StrikeModeBase",
    "MeleeStrikeMode",
    "MissileStrikeMode",
    "SohlAction",
    "BodyStructure",
    "BodyPart",
    "BodyLocation",
] as const satisfies readonly SohlEntityName[];

const KNOWN = new Set<string>(ENTITY_NAMES);

/** The currently-registered class per name (override if one was registered). */
const current = new Map<SohlEntityName, Function>();

/** The first (canonical SoHL) class registered per name; {@link base} reads it. */
const canonical = new Map<SohlEntityName, Function>();

/**
 * Register the SoHL base class for `name`. Called once per class from the
 * bottom of its own module (`registerEntity("ValueModifier", ValueModifier)`).
 * The first registration for a name is captured as the canonical base (what
 * {@link SohlEntitySurface.base} returns); it also becomes the current class.
 * Idempotent for the same class; a different class re-seeding a name replaces
 * the current binding but never the canonical one.
 *
 * @param name - The registered class name.
 * @param cls - The class constructor to register.
 */
export function registerEntity<K extends SohlEntityName>(
    name: K,
    cls: SohlEntityRegistry[K],
): void {
    if (!canonical.has(name)) canonical.set(name, cls as unknown as Function);
    current.set(name, cls as unknown as Function);
}

/**
 * The `sohl.entity` access surface: the class getters plus the override API.
 */
export interface SohlEntitySurface extends SohlEntityRegistry {
    /**
     * Override the class registered under `name`. `cls` must extend (or be) the
     * canonical SoHL base for that name. Every construction routed through
     * `sohl.entity.<name>` — and every subclass of it — then resolves to `cls`.
     *
     * Call from a module's `init`/`setup` hook, before the first construction of
     * that class.
     *
     * @param name - The registered class name to override.
     * @param cls - The replacement class (a subclass of the canonical base).
     * @throws If `name` is unknown or `cls` does not extend the canonical base.
     */
    register<K extends SohlEntityName>(
        name: K,
        cls: SohlEntityRegistry[K],
    ): void;

    /**
     * The canonical SoHL base class registered under `name`, ignoring any
     * override — useful for a module that wants to extend the original.
     *
     * @param name - The registered class name.
     * @returns The canonical base class.
     */
    base<K extends SohlEntityName>(name: K): SohlEntityRegistry[K];
}

/**
 * The getter-backed entity-class access surface, exposed inside SoHL as the
 * `entity` import and outside as the runtime global `sohl.entity`.
 *
 * Each class name is a getter returning the currently-registered class, so an
 * override applied via {@link SohlEntitySurface.register} is picked up
 * automatically at every access and every construction site. The
 * `register`/`base` members are non-enumerable, so `Object.keys(sohl.entity)`
 * lists only class names. The surface itself is frozen.
 *
 * @example
 * const vm = new entity.ValueModifier({}, { parent });
 * class MyResult extends entity.SuccessTestResult {}
 * sohl.entity.register("SuccessTestResult", MyResult);
 */
export const entity: SohlEntitySurface = (() => {
    const surface = {} as SohlEntitySurface;
    for (const name of ENTITY_NAMES) {
        Object.defineProperty(surface, name, {
            get: () => current.get(name),
            enumerable: true,
        });
    }
    const register = <K extends SohlEntityName>(
        name: K,
        cls: SohlEntityRegistry[K],
    ): void => {
        if (!KNOWN.has(name)) {
            throw new Error(
                `sohl.entity.register: unknown class "${String(name)}"`,
            );
        }
        const canon = canonical.get(name) as
            | ({ name: string } & Function)
            | undefined;
        if (!canon) {
            throw new Error(
                `sohl.entity.register: canonical "${String(name)}" is not yet loaded; import the class before overriding it`,
            );
        }
        const candidate = cls as unknown as { name: string } & Function;
        const extendsBase =
            candidate === canon || candidate.prototype instanceof canon;
        if (!extendsBase) {
            throw new Error(
                `sohl.entity.register: ${candidate.name} must extend ${canon.name}`,
            );
        }
        current.set(name, cls as unknown as Function);
    };
    const base = <K extends SohlEntityName>(name: K): SohlEntityRegistry[K] =>
        canonical.get(name) as unknown as SohlEntityRegistry[K];
    Object.defineProperty(surface, "register", {
        value: register,
        enumerable: false,
    });
    Object.defineProperty(surface, "base", { value: base, enumerable: false });
    return Object.freeze(surface);
})();
