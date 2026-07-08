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
 * This file is **types-only**: it re-exports the interfaces and class types
 * that a macro or extension module needs for annotations. It declares no
 * runtime values. Runtime binding is always through the live `sohl` global,
 * never through this file.
 *
 * ## Access model
 *
 * - **Documents (actors/items):** reach a document through Foundry's
 *   collections — `game.actors` / `game.items` — then use the `.logic` getter
 *   to get the typed rules surface. `document.logic` (equivalently
 *   `document.system.logic`) is the object typed by the `*Logic` interfaces
 *   re-exported below.
 * - **System services:** available on the `sohl` global — `sohl.log`,
 *   `sohl.i18n`, `sohl.events`, `sohl.utils`, `sohl.constants`, `sohl.CONFIG`.
 * - **Constructable domain classes:** available at runtime via
 *   `sohl.domain.<ClassName>` — e.g. `new sohl.domain.ValueModifier(...)` or
 *   `class X extends sohl.domain.SuccessTestResult {}`. The corresponding class
 *   types are re-exported below so they can be used in annotations.
 *
 * ## Usage in a module project
 *
 *   1. Copy this file into your module's `types/` directory.
 *   2. Reference it in your `tsconfig.json`:
 *      `"types": ["./types/sohl-public-api"]`.
 *   3. Import the types you need for annotations, and bind to values at runtime
 *      through the `sohl` global, e.g.:
 *
 *      ```ts
 *      import type { ValueModifier } from "./types/sohl-public-api";
 *      const mod: ValueModifier = new sohl.domain.ValueModifier(...);
 *      ```
 */

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------
export type { SohlSystem } from "../src/core/logic/SohlSystem";
export type { SohlLogic } from "../src/core/logic/SohlLogic";
export type { SohlActionContext } from "../src/entity/action/SohlActionContext";
export type { SohlSpeaker } from "../src/core/logic/SohlSpeaker";

// ---------------------------------------------------------------------------
// Actors — the typed `document.logic` surface for each actor type
// ---------------------------------------------------------------------------
export type {
    BeingLogic,
    BeingData,
} from "../src/document/actor/logic/BeingLogic";
export type {
    AssemblyLogic,
    AssemblyData,
} from "../src/document/actor/logic/AssemblyLogic";
export type {
    CohortLogic,
    CohortData,
} from "../src/document/actor/logic/CohortLogic";
export type {
    StructureLogic,
    StructureData,
} from "../src/document/actor/logic/StructureLogic";
export type {
    VehicleLogic,
    VehicleData,
} from "../src/document/actor/logic/VehicleLogic";

// ---------------------------------------------------------------------------
// Items — the typed `document.logic` surface for each item type
// ---------------------------------------------------------------------------
export type { GearLogic, GearData } from "../src/document/item/logic/GearLogic";
export type {
    AffiliationLogic,
    AffiliationData,
} from "../src/document/item/logic/AffiliationLogic";
export type {
    AfflictionLogic,
    AfflictionData,
} from "../src/document/item/logic/AfflictionLogic";
export type {
    ArmorGearLogic,
    ArmorGearData,
} from "../src/document/item/logic/ArmorGearLogic";
export type {
    AttributeLogic,
    AttributeData,
} from "../src/document/item/logic/AttributeLogic";
export type {
    CombatTechniqueLogic,
    CombatTechniqueData,
} from "../src/document/item/logic/CombatTechniqueLogic";
export type {
    ConcoctionGearLogic,
    ConcoctionGearData,
} from "../src/document/item/logic/ConcoctionGearLogic";
export type {
    ContainerGearLogic,
    ContainerGearData,
} from "../src/document/item/logic/ContainerGearLogic";
export type {
    LineageLogic,
    LineageData,
} from "../src/document/item/logic/LineageLogic";
export type {
    MiscGearLogic,
    MiscGearData,
} from "../src/document/item/logic/MiscGearLogic";
export type {
    MysteryLogic,
    MysteryData,
} from "../src/document/item/logic/MysteryLogic";
export type {
    MysticalAbilityLogic,
    MysticalAbilityData,
} from "../src/document/item/logic/MysticalAbilityLogic";
export type {
    ProjectileGearLogic,
    ProjectileGearData,
} from "../src/document/item/logic/ProjectileGearLogic";
export type {
    SkillLogic,
    SkillData,
} from "../src/document/item/logic/SkillLogic";
export type {
    TraitLogic,
    TraitData,
} from "../src/document/item/logic/TraitLogic";
export type {
    TraumaLogic,
    TraumaData,
} from "../src/document/item/logic/TraumaLogic";
export type {
    WeaponGearLogic,
    WeaponGearData,
} from "../src/document/item/logic/WeaponGearLogic";

// ---------------------------------------------------------------------------
// Domain classes — constructable via `sohl.domain.<ClassName>` at runtime
// ---------------------------------------------------------------------------

// Modifiers
export type { ValueModifier } from "../src/entity/modifier/ValueModifier";
export type { ValueDelta } from "../src/entity/modifier/ValueDelta";
export type { CombatModifier } from "../src/entity/modifier/CombatModifier";
export type { ImpactModifier } from "../src/entity/modifier/ImpactModifier";
export type { MasteryLevelModifier } from "../src/entity/modifier/MasteryLevelModifier";

// Results
export type { TestResult } from "../src/entity/result/TestResult";
export type { SuccessTestResult } from "../src/entity/result/SuccessTestResult";
export type { OpposedTestResult } from "../src/entity/result/OpposedTestResult";
export type { ImpactResult } from "../src/entity/result/ImpactResult";
export type { AttackResult } from "../src/entity/result/AttackResult";
export type { DefendResult } from "../src/entity/result/DefendResult";
export type { CombatResult } from "../src/entity/result/CombatResult";

// Strike modes
export type { StrikeModeBase } from "../src/entity/strikemode/StrikeModeBase";
export type { MeleeStrikeMode } from "../src/entity/strikemode/MeleeStrikeMode";
export type { MissileStrikeMode } from "../src/entity/strikemode/MissileStrikeMode";

// Action
export type { SohlAction } from "../src/entity/action/SohlAction";

// Body
export type { BodyStructure } from "../src/entity/body/BodyStructure";
export type { BodyPart } from "../src/entity/body/BodyPart";
export type { BodyLocation } from "../src/entity/body/BodyLocation";

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
export type { SimpleRoll } from "../src/entity/roll/SimpleRoll";
export type { SohlMap } from "../src/utils/collection/SohlMap";
