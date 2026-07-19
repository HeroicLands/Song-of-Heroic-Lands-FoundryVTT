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

import { entity } from "@src/entity/registry";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { BASE_INJURY_THRESHOLDS, ITEM_KIND } from "@src/utils/constants";

/**
 * A being's **body** — its physical baseline, derived from `system.body`.
 *
 * Dissolved from the former Corpus item into the Being (#535): rather than a
 * separate embedded document, a Being owns its body directly. `BodyLogic` is a
 * plain, Being-owned domain object (not a `SohlLogic`) that wraps the persisted
 * {@link BodyLogic.Data | body data} into live derived state — the
 * {@link sohl.entity.body.BodyStructure | anatomy}, and `weight` / `reach` /
 * `bodyScale` as {@link sohl.entity.modifier.ValueModifier}s so runtime effects
 * (size changes, encumbrance) can layer on.
 *
 * The body's entities ({@link sohl.entity.body.BodyStructure} and its parts /
 * locations) are parented to the owning {@link sohl.document.actor.logic.BeingLogic}
 * (a real Logic), so ValueModifiers, actor lookups, and persistence resolve
 * against the being document; this object is only the derivation + accessor
 * seam exposed as `being.body`.
 *
 * **Incorporeality** is an empty body — `structure.parts.length === 0` — not an
 * absent object (see {@link isIncorporeal}).
 */
export class BodyLogic {
    /**
     * The anatomical structure of the being — body parts, hit locations, and
     * adjacency. Constructed during {@link initialize}.
     */
    structure!: BodyStructure;

    /**
     * Per-creature body-scale factor as a {@link sohl.entity.modifier.ValueModifier}
     * (`1.0` = baseline human), seeded from `body.bodyScaleBase` and floored at
     * `0.01`. Active Effects can layer deltas (shrink/enlarge), which re-scale
     * {@link injuryTable}.
     */
    bodyScale!: ValueModifier;

    /**
     * The being's body weight (pounds, excluding gear) as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from `body.weight.base`
     * (when set) or the `body.weight.calc` `SafeExpression` of strength.
     */
    weight!: ValueModifier;

    /**
     * The being's base melee reach (feet) as a `ValueModifier` so runtime
     * modifiers (size-changing effects) can layer on. Sourced from
     * `body.reachBase`; combined with a melee strike mode's effective length to
     * produce that mode's actual reach.
     */
    reach!: ValueModifier;

    /**
     * This creature's effective injury-level thresholds — the master
     * {@link BASE_INJURY_THRESHOLDS} scaled by {@link bodyScale}, derived during
     * {@link evaluate}. Consumed by `injuryLevelFromImpact` (via
     * {@link sohl.entity.body.BodyStructure.injuryTable}) so an absolute impact
     * reads size-correct on this body.
     */
    injuryTable!: number[];

    /**
     * Build a being's body sub-object bound to its owning logic.
     * @param being - The owning being logic; the entities of this body are
     *   parented to it, and it supplies the `str` attribute for `weight.calc`.
     */
    constructor(private readonly being: BeingLogic) {}

    /** The persisted body data (`being.system.body`). */
    get data(): BodyLogic.Data {
        return this.being.data.body;
    }

    /**
     * Whether this being is **incorporeal** — it has no body structure (a
     * spirit). Replaces the former "no corpus item" check.
     */
    get isIncorporeal(): boolean {
        return this.structure.parts.length === 0;
    }

    /**
     * Build the body structure and seed the `bodyScale` / `weight` / `reach`
     * modifiers from persisted {@link data}. Mirrors a logic's `initialize`
     * phase; called from {@link sohl.document.actor.logic.BeingLogic.initialize}.
     */
    initialize(): void {
        this.structure = new entity.BodyStructure(this.data.structure, {
            parent: this.being,
        });
        this.bodyScale = new entity.ValueModifier(this.being)
            .setBase(this.data.bodyScaleBase)
            .floor("Body-scale minimum", "bodyScaleMin", 0.01);
        this.weight = new entity.ValueModifier(this.being);
        // A fixed body weight can be seeded now; a `weight.calc` of `str`
        // depends on the strength attribute, which has NOT been prepared yet
        // (the actor's initialize runs before any item), so it is deferred to
        // {@link evaluate}.
        if (this.data.weight.base !== null) {
            this.weight.setBase(this.data.weight.base);
        }
        this.reach = new entity.ValueModifier(this.being).setBase(
            this.data.reachBase,
        );
        // Pre-evaluate fallback so BodyStructure.injuryTable reads a sane value
        // before the evaluate phase scales it.
        this.injuryTable = [...BASE_INJURY_THRESHOLDS];
    }

    /**
     * Complete body derivation once sibling items are prepared: seed the
     * strength-derived {@link weight} (when `weight.base` is null) and derive
     * the size-scaled {@link injuryTable} from {@link bodyScale}. Mirrors a
     * logic's `evaluate` phase; a `bodyScale` delta (shrink/enlarge) re-scales
     * the table within the same prepare cycle.
     */
    evaluate(): void {
        if (this.data.weight.base === null) {
            const bodyWeightCalc = new SafeExpression(
                { source: this.data.weight.calc },
                { parent: this.being },
            );
            this.weight.setBase(
                (bodyWeightCalc.evaluate({
                    str:
                        this.being.getItemLogic("str", ITEM_KIND.ATTRIBUTE)
                            ?.score?.effective ?? 0,
                }) as number) ?? 0,
            );
        }
        this.injuryTable = BASE_INJURY_THRESHOLDS.map(
            (threshold) => threshold * this.bodyScale.effective,
        );
    }
}

/**
 * The {@link BodyLogic} of an actor logic, or `undefined` when the actor has no
 * body (a non-Being actor, or before its `initialize`). The seam consumers use
 * to reach a being's anatomy/reach without importing {@link sohl.document.actor.logic.BeingLogic}
 * or knowing the owning actor kind.
 *
 * @param logic - Any actor (or item's owning-actor) logic.
 * @returns The body sub-object, or `undefined`.
 */
export function getActorBody(logic: unknown): BodyLogic | undefined {
    return (logic as { body?: BodyLogic } | null | undefined)?.body;
}

export namespace BodyLogic {
    /**
     * The persisted shape of a being's body (`system.body`), implemented by the
     * `body` SchemaField on `BeingDataModel`.
     */
    export interface Data {
        /** Persisted anatomical structure (body parts, hit locations, adjacency). */
        structure: BodyStructure.Data;
        /**
         * Body weight (pounds, excluding gear): a fixed `base`, or a
         * `SafeExpression` `calc` of strength (`str`) when `base` is null.
         */
        weight: {
            /** Fixed body weight in pounds; null to compute from `calc`. */
            base: number | null;
            /** `SafeExpression` source of `str` → body weight (used when `base` is null). */
            calc: string;
        };
        /** Base melee reach (feet) for this being. */
        reachBase: number;
        /** Per-creature body-scale factor (`1.0` = baseline human). */
        bodyScaleBase: number;
        /** `SafeExpression` source of encumbrance (`enc`) → personal fatigue. */
        personalFatigue: string;
    }
}
