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

import { SohlMap } from "@utils/collection";
import { SohlEvent } from "@common/event";

export enum EffectScope {
    SELF = "self",
    ITEM = "item",
    ACTOR = "actor",
    OTHER = "other",
}

/**
 * @summary Represents an effect on an actor or item.
 *
 * @remarks
 * Instances of this class represent changes to the value of a property
 * of an actor or item, for a specified period of time. The effect is contained
 * within a particular actor or item, but the value change may occur on
 * another actor or item.
 */
export class SohlEffect extends SohlEvent {}
