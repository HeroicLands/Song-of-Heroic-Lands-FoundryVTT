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

import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ValueDelta } from "@src/entity/modifier/ValueDelta";
import { CombatModifier } from "@src/entity/modifier/CombatModifier";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { TestResult } from "@src/entity/result/TestResult";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { AttackResult } from "@src/entity/result/AttackResult";
import { DefendResult } from "@src/entity/result/DefendResult";
import { CombatResult } from "@src/entity/result/CombatResult";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { SohlAction } from "@src/entity/action/SohlAction";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import { BodyPart } from "@src/entity/body/BodyPart";
import { BodyLocation } from "@src/entity/body/BodyLocation";

/**
 * The backing record of currently-registered entity-layer classes, seeded with
 * the SoHL base classes.
 *
 * The {@link entity} surface reads from this record through per-name getters, so
 * that when `sohl.entity.register()` (issue #83) swaps an entry here, every
 * `sohl.entity.X` access — and every construction site routed through it — picks
 * up the override automatically. This record is intentionally mutable and
 * module-private; it is never exported directly.
 *
 * Curated to the classes meant to be `new`ed or subclassed by macros and variant
 * modules: modifiers, test/combat results, strike modes, {@link SohlAction}, and
 * body modeling. Function modules (`aggregateArmor`, `move-helpers`, injury
 * helpers, weighted-random) and non-constructable helpers (`calcSkillBase`) are
 * deliberately excluded.
 */
const registry = {
    // Modifiers
    ValueModifier,
    ValueDelta,
    CombatModifier,
    ImpactModifier,
    MasteryLevelModifier,
    // Results
    TestResult,
    SuccessTestResult,
    OpposedTestResult,
    ImpactResult,
    AttackResult,
    DefendResult,
    CombatResult,
    // Strike modes
    StrikeModeBase,
    MeleeStrikeMode,
    MissileStrikeMode,
    // Action
    SohlAction,
    // Body modeling
    BodyStructure,
    BodyPart,
    BodyLocation,
};

/**
 * The set of overridable entity-layer classes, keyed by class name. Each value
 * is the class constructor itself (`typeof ClassName`), so `new sohl.entity.X(...)`
 * and `class Y extends sohl.entity.X {}` both type-check.
 */
export type SohlEntityRegistry = typeof registry;

/** The registrable class names (`keyof` the registry). */
export type SohlEntityName = keyof SohlEntityRegistry;

/**
 * The getter-backed entity-class access surface exposed as `sohl.entity`.
 *
 * Each property is a getter returning the currently-registered class from
 * {@link registry}; the object itself is frozen so the getters cannot be
 * reassigned. Overrides are applied by mutating the backing record (via the
 * `register()` API added in #83), never by writing to this surface.
 *
 * @example
 * const vm = new sohl.entity.ValueModifier({}, { parent });
 * class MyResult extends sohl.entity.SuccessTestResult {}
 */
export const entity: SohlEntityRegistry = Object.freeze(
    (Object.keys(registry) as SohlEntityName[]).reduce((surface, name) => {
        Object.defineProperty(surface, name, {
            get: () => registry[name],
            enumerable: true,
        });
        return surface;
    }, {} as SohlEntityRegistry),
);
