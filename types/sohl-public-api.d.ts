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
 * Public API type declarations for Song of Heroic Lands.
 *
 * This file declares the types available to variant modules and
 * house-rules modules via `globalThis.sohl.classes`.
 *
 * Usage in a module project:
 *   1. Copy this file into your module's types/ directory
 *   2. Reference it in your tsconfig.json: "types": ["./types/sohl-public-api"]
 *   3. Access classes via: const { BeingLogic } = sohl.classes;
 *
 * The classes are available at runtime on globalThis.sohl.classes after
 * the SoHL system's init hook completes.
 */

// Re-export key types that modules will need for type annotations
// Modules access classes at runtime via sohl.CONFIG.base.*
export type { SohlSystem } from "../src/common/SohlSystem";
export type { SohlLogic } from "../src/common/SohlLogic";
export type { SohlActionContext } from "../src/common/SohlActionContext";
export type { SohlSpeaker } from "../src/common/SohlSpeaker";

// Actor types
export type { BeingLogic, BeingData } from "../src/common/actor/logic/BeingLogic";
export type { AssemblyLogic, AssemblyData } from "../src/common/actor/logic/AssemblyLogic";
export type { CohortLogic, CohortData } from "../src/common/actor/logic/CohortLogic";
export type { StructureLogic, StructureData } from "../src/common/actor/logic/StructureLogic";
export type { VehicleLogic, VehicleData } from "../src/common/actor/logic/VehicleLogic";

// Item types — base classes
export type { GearLogic, GearData } from "../src/common/item/logic/GearLogic";
export type { MasteryLevelLogic, MasteryLevelData } from "../src/common/item/logic/MasteryLevelLogic";

// Item types — concrete
export type { ActionLogic, ActionData } from "../src/common/item/logic/ActionLogic";
export type { AffiliationLogic, AffiliationData } from "../src/common/item/logic/AffiliationLogic";
export type { AfflictionLogic, AfflictionData } from "../src/common/item/logic/AfflictionLogic";
export type { ArmorGearLogic, ArmorGearData } from "../src/common/item/logic/ArmorGearLogic";
export type { CombatTechniqueLogic, CombatTechniqueData } from "../src/common/item/logic/CombatTechniqueLogic";
export type { ConcoctionGearLogic, ConcoctionGearData } from "../src/common/item/logic/ConcoctionGearLogic";
export type { ContainerGearLogic, ContainerGearData } from "../src/common/item/logic/ContainerGearLogic";
export type { InjuryLogic, InjuryData } from "../src/common/item/logic/InjuryLogic";
export type { MiscGearLogic, MiscGearData } from "../src/common/item/logic/MiscGearLogic";
export type { MysteryLogic, MysteryData } from "../src/common/item/logic/MysteryLogic";
export type { MysticalAbilityLogic, MysticalAbilityData } from "../src/common/item/logic/MysticalAbilityLogic";
export type { ProjectileGearLogic, ProjectileGearData } from "../src/common/item/logic/ProjectileGearLogic";
export type { SkillLogic, SkillData } from "../src/common/item/logic/SkillLogic";
export type { TraitLogic, TraitData } from "../src/common/item/logic/TraitLogic";
export type { WeaponGearLogic, WeaponGearData } from "../src/common/item/logic/WeaponGearLogic";

// Modifier types
export type { ValueModifier } from "../src/common/modifier/ValueModifier";
export type { ValueDelta } from "../src/common/modifier/ValueDelta";
export type { CombatModifier } from "../src/common/modifier/CombatModifier";
export type { ImpactModifier } from "../src/common/modifier/ImpactModifier";
export type { MasteryLevelModifier } from "../src/common/modifier/MasteryLevelModifier";

// Result types
export type { TestResult } from "../src/common/result/TestResult";
export type { SuccessTestResult } from "../src/common/result/SuccessTestResult";
export type { OpposedTestResult } from "../src/common/result/OpposedTestResult";
export type { ImpactResult } from "../src/common/result/ImpactResult";
export type { AttackResult } from "../src/common/result/AttackResult";
export type { DefendResult } from "../src/common/result/DefendResult";
export type { CombatResult } from "../src/common/result/CombatResult";

// Utility types
export type { SimpleRoll } from "../src/utils/SimpleRoll";
export type { SohlMap } from "../src/utils/collection/SohlMap";
export type { SkillBase } from "../src/common/SkillBase";
