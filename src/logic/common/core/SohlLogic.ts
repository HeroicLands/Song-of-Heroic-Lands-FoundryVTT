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

import { SohlMap } from "@utils";
import { SohlAction, SohlEffect } from "./event";
import { LifecycleParticipant } from "@logic/common/core";
import {
    CollectionType,
    DataField,
    isKind,
    RegisterClass,
} from "@utils/decorators";
import { ActionContext } from "@foundry/core/ActionContext.mjs";

export type LogicMap = SohlMap<string, SohlLogic>;

@RegisterClass("SohlLogic", "0.6.0")
export abstract class SohlLogic extends LifecycleParticipant {
    @DataField("name", { type: String, initial: "" })
    name!: string;

    @DataField("type", { type: String, initial: "" })
    type!: string;

    @DataField("description", { type: String })
    description!: string;

    @DataField("img", { type: String })
    img!: string;

    @DataField("nestedLogics", {
        collection: CollectionType.MAP,
        type: SohlLogic,
    })
    nestedLogics!: SohlMap<string, SohlLogic>;

    @DataField("nestedActions", {
        type: SohlAction,
        collection: CollectionType.MAP,
        validator: (value: SohlAction) => isKind(value, "Action"),
    })
    nestedActions!: SohlMap<string, SohlAction>;

    @DataField("nestedEffects", {
        type: SohlEffect,
        collection: CollectionType.MAP,
        validator: (value: SohlEffect) => isKind(value, "Effect"),
    })
    nestedEffects!: SohlMap<string, SohlEffect>;

    @DataField("actionContext", {
        type: ActionContext,
        required: true,
    })
    actionContext!: ActionContext;

    /**
     * Realizes any nested or virtual logic instances.
     */
    realizeLogics(options: PlainObject = {}): void {}

    /** @inheritdoc */
    override initialize(options: PlainObject = {}): void {}

    /** @inheritdoc */
    override applyEffects(options: PlainObject = {}): void {}

    /** @inheritdoc */
    override evaluate(options: PlainObject = {}): void {}

    /** @inheritdoc */
    override finalize(options: PlainObject = {}): void {}
}
