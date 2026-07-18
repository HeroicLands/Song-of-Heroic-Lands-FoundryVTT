/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
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
 * The entity-class registry barrel.
 *
 * The registry itself — the backing record, the `entity` access surface, and the
 * `register`/`base` override API — lives in the cycle-free leaf
 * {@link entity | @src/entity/entityRegistry}, which value-imports none of the
 * classes. This module is the **eager-load entrypoint**: the side-effect imports
 * below pull in every registered class module, and each self-registers
 * (`registerEntity("X", X)`) as it loads, so importing this barrel guarantees a
 * fully-populated surface.
 *
 * `SohlSystem` imports this at init to publish the complete `sohl.entity` global.
 * Ordinary internal code just does `import { entity } from "@src/entity/registry"`
 * (this barrel), which both populates and exposes the surface. The handful of
 * base classes that can't import the barrel without a load cycle import the leaf
 * directly instead — see the "Entity class registry" section of
 * docs/reference/runtime-contracts.md.
 *
 * Curated to the classes meant to be `new`ed or subclassed by macros and variant
 * modules: modifiers, test/combat results, strike modes, {@link sohl.entity.action.SohlAction}, and
 * body modeling. Function modules (`aggregateArmor`, `move-helpers`, injury
 * helpers, weighted-random) and non-constructable helpers (`calcSkillBase`) are
 * deliberately excluded.
 */

// Side-effect imports: load every registered class so its `registerEntity`
// call runs. Keep in sync with the registry membership in `entityRegistry.ts`.
import "@src/entity/modifier/ValueModifier";
import "@src/entity/modifier/ValueDelta";
import "@src/entity/modifier/CombatModifier";
import "@src/entity/modifier/ImpactModifier";
import "@src/entity/modifier/MasteryLevelModifier";
import "@src/entity/result/TestResult";
import "@src/entity/result/SuccessTestResult";
import "@src/entity/result/OpposedTestResult";
import "@src/entity/result/ImpactResult";
import "@src/entity/result/AttackResult";
import "@src/entity/result/DefendResult";
import "@src/entity/result/CombatResult";
import "@src/entity/strikemode/StrikeModeBase";
import "@src/entity/strikemode/MeleeStrikeMode";
import "@src/entity/strikemode/MissileStrikeMode";
import "@src/entity/action/SohlAction";
import "@src/entity/body/BodyStructure";
import "@src/entity/body/BodyPart";
import "@src/entity/body/BodyLocation";

export { entity } from "@src/entity/entityRegistry";
export type {
    SohlEntityRegistry,
    SohlEntityName,
    SohlEntitySurface,
} from "@src/entity/entityRegistry";
