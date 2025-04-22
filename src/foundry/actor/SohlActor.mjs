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

import { SohlMap } from "../../utils/collection/SohlMap.js";
import { Itr } from "../../utils/Itr.js";
import { SohlLogic } from "../../logic/common/core/SohlLogic.js";
import { SohlAction } from "../../logic/common/core/event/SohlAction.js";
import { SohlEffect } from "../../logic/common/core/event/SohlEffect.js";

export class SohlActor extends Actor {
    constructor() {
        super();
        this._logics = new SohlMap();
        this._actions = new SohlMap();
        this._effects = new SohlMap();
    }

    get logic() {
        return this.system.logic;
    }

    static createUniqueName(baseName) {
        if (!baseName) {
            throw new Error("Must provide baseName");
        }
        const takenNames = new Set();
        for (const document of game.actors) takenNames.add(document.name);
        let name = baseName;
        let index = 1;
        while (takenNames.has(name)) name = `${baseName} (${++index})`;
        return name;
    }

    prepareBaseData() {
        Object.getPrototypeOf(this).prepareBaseData.call(this);
        this._logics.clear();
        this._actions.clear();
        this._effects.clear();
    }

    get logics() {
        return this._logics.entries();
    }

    addLogic(name, logic) {
        if (!(logic instanceof SohlLogic)) {
            throw new Error("Logic must be an instance of SohlLogic");
        }
        if (this._logics.has(name)) return;
        sohl.utils.inIdCache(logic.id);
        this._logics.set(name, logic);
    }

    get effects() {
        return this._effects.entries();
    }

    addEffect(name, effect) {
        if (!(effect instanceof SohlEffect)) {
            throw new Error("Effect must be an instance of SohlEffect");
        }
        if (this._effects.has(name)) return;
        sohl.utils.inIdCache(effect.id);
        this._effects.set(name, effect);
    }

    get actions() {
        return this._actions.entries();
    }

    addAction(name, action) {
        if (!(action instanceof SohlAction)) {
            throw new Error("Action must be an instance of SohlAction");
        }
        if (this._actions.has(name)) return;
        sohl.utils.inIdCache(action.id);
        this._actions.set(name, action);
    }
}
