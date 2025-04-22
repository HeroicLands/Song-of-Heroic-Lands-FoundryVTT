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

import { SohlLogic } from "../../logic/common/core/SohlLogic.js";
import { SohlActor } from "../actor/SohlActor.js";
import { SohlItem } from "../item/SohlItem.js";
const ObjectField = foundry.data.fields.ObjectField;

/**
 * The `SohlDataModel` class extends the Foundry VTT `TypeDataModel` to provide
 * a structured data model for items in the "Song of Heroic Lands" module. It
 * encapsulates logic and behavior associated with items, offering a schema
 * definition and initialization logic.
 */
export class SohlActorDataModel extends foundry.abstract.TypeDataModel {
    /**
     * Represents the embedded logic associated with the item.
     * @type {SohlEntity}
     */
    _entity;

    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            entityData: new ObjectField(),
        });
    }

    get entity() {
        if (!this._entity) {
            this._entity = sohl.registeredClassFactory(this, this.entityData);
        }
        return this._entity;
    }

    set entity(entity) {
        this._entity = entity;
        this.updateSource(entity.toJSON());
    }

    get actor() {
        return super.parent;
    }

    get propertyPath() {
        return "system.entityData";
    }

    /** @inheritdoc */
    prepareBaseData() {
        super.prepareBaseData();
        this.entity.addLogics(this);
        this.entity.prepareBaseData();
    }

    /** @inheritdoc */
    prepareDerivedData() {
        super.prepareDerivedData();
        this.entity.processEffects();
        this.entity.processActions();
        this.entity.processSiblings();
        this.entity.postProcess();
    }
}
