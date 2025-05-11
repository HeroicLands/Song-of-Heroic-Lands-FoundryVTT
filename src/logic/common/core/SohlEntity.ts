/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CollectionType, DataField, isOfType, RegisterClass } from "@utils";
import { SohlBase, SohlPerformer } from "@logic/common/core";
import {
    SohlAction,
    ActionMap,
    SohlEffect,
    EffectMap,
} from "@logic/common/core/event";
import { SohlMap } from "@utils/collection";
import { ActionContext } from "@utils";
import { SohlActor } from "@foundry/actor";

/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License: GPL-3.0-or-later
 */
/**
 * @summary Class representing the buiness logic of an Actor
 * @description
 * The SohlEntry class is an abstraction of the business logic of an Actor.
 * It provides a structure for defining the actor and position on a scene
 * in a VTT-neutral manner and managing actions, effects, and nested logics.
 */
@RegisterClass("SohlEntity", "0.6.0")
export class SohlEntity extends SohlBase {
    @DataField("id", { type: String, required: true })
    id!: string;

    @DataField("name", { type: String, initial: "" })
    name!: string;

    @DataField("description", { type: String, initial: "" })
    description!: string;

    @DataField("actor", {
        type: SohlActor,
        required: true,
    })
    actor!: SohlActor;

    @DataField("logic", {
        type: SohlPerformer,
        validator: (value) => isOfType(value, "SohlPerformer"),
    })
    private logics!: SohlMap<string, SohlPerformer>;

    @DataField("actions", {
        type: SohlAction,
        collection: CollectionType.MAP,
        validator: (value) => isOfType(value, "SohlAction"),
    })
    private actions!: SohlMap<string, SohlAction>;

    @DataField("effects", {
        type: SohlEffect,
        collection: CollectionType.MAP,
        validator: (value) => isOfType(value, "SohlEffect"),
    })
    private effects!: SohlMap<string, SohlEffect>;

    /**
     * Realizes any nested or virtual logic instances.
     * Only called on logic types.
     */
    realizeLogics(context: ActionContext, options?: PlainObject): void {}

    /**
     * Executes the full lifecycle for a LifecycleParticipant in the correct sequence.
     *
     * This function should only be called by SohlEntity instances, which control the lifecycle of themselves
     * and their associated SohlPerformer instances.
     */
    runLifecycle(): void {
        this.logics
            .expandingEntries()
            .forEach(([, logic]) => logic.realizeLogics());
        this.logics.values().forEach((logic) => logic.initialize());
        this.logics.values().forEach((logic) => logic.applyEffects());
        this.logics.values().forEach((logic) => logic.evaluate());
        this.logics.values().forEach((logic) => logic.finalize());
    }
}

// Guard function to check if an object is an instance of SohlEntity
export function isSohlEntity(obj: unknown): obj is SohlEntity {
    return obj instanceof SohlEntity;
}
