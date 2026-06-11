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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import type { FilePath, HTMLString } from "@src/utils/helpers";

/**
 * The Foundry-free foundation of the actor logic layer.
 *
 * This module owns the contracts between actor logic classes and the
 * Foundry-side data models: the {@link SohlActorLogic} and
 * {@link SohlActorData} interfaces and the {@link SohlActorBaseLogic} base
 * class. The Foundry layer (`foundry/SohlActor.ts`) implements
 * {@link SohlActorData} via `SohlActorDataModel` and re-exports these
 * symbols; logic classes import them from here so they remain loadable
 * without Foundry globals. References to the {@link SohlActor} document type
 * are type-only and erased at compile time.
 */

/**
 * Logic interface implemented by all actor logic classes — {@link SohlLogic}
 * specialized for {@link SohlActor} data.
 */
export interface SohlActorLogic<
    TData extends SohlLogicData<SohlActor>,
> extends SohlLogic<TData> {}

/**
 * An interface representing the common data structure for all Actor types in the SoHL system.
 * @remarks The base shape of `system` on every SoHL actor; each concrete actor type's `*Data` extends it.
 */
export interface SohlActorData<
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> extends SohlLogicData<SohlActor, TLogic> {
    /** The actor's display label; with `withName`, includes the actor's name. */
    label(options?: { withName: boolean }): string;
    /** Rich-text dossier / background notes. */
    dossier: HTMLString;
    /** Rich-text physical-appearance description. */
    appearance: HTMLString;
    /** Path to the actor's portrait image. */
    portrait: FilePath;
}

/**
 * Base logic class for all actor types (Being, Cohort, Structure, Vehicle, Assembly).
 *
 * Provides the foundation that all actor logic classes build upon.
 * Concrete actor logic classes extend this to implement type-specific rules:
 * health tracking, anatomy modeling, passenger management, etc.
 *
 * @typeParam TData - The actor data interface, extending {@link SohlActorData}.
 */
export class SohlActorBaseLogic<
    TData extends SohlActorData = SohlActorData,
> extends SohlLogic<TData> {
    /** Initialize-phase hook; base actor logic does nothing. */
    override initialize(): void {}
    /** Evaluate-phase hook; base actor logic does nothing. */
    override evaluate(): void {}
    /** Finalize-phase hook; base actor logic does nothing. */
    override finalize(): void {}
}
