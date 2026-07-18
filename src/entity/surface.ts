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
 * Builds the public `sohl.entity` surface: the constructable class registry —
 * flat, override-aware getters plus `register`/`base` (from
 * {@link @src/entity/registry | registry}) — merged with the entity
 * sub-namespaces for addressing (`sohl.entity.modifier.ValueModifier`, …).
 *
 * Class getters are PascalCase and the sub-namespaces are lowercase, so both
 * coexist as distinct properties. Construct or override through the flat getters
 * (they honor a `register()` override); use the sub-namespace paths for
 * reference and discovery — a sub-namespace re-export is the *original* class
 * and does not reflect an override.
 *
 * This module aggregates the whole entity subtree, so it is imported **only** by
 * `sohl.ts` (the last-loaded entry, imported by nothing). That keeps it out of
 * every import cycle: `registry.ts` and `SohlSystem` are unchanged, and
 * `SohlSystem` refers to this surface's type via `typeof import(...)` only.
 */

import { entity as classRegistry } from "@src/entity/registry";
import type { SohlEntitySurface } from "@src/entity/registry";
import * as action from "@src/entity/action";
import * as body from "@src/entity/body";
import * as domain from "@src/entity/domain";
import * as event from "@src/entity/event";
import * as expr from "@src/entity/expr";
import * as modifier from "@src/entity/modifier";
import * as movement from "@src/entity/movement";
import * as result from "@src/entity/result";
import * as roll from "@src/entity/roll";
import * as strikemode from "@src/entity/strikemode";

/** The entity sub-namespaces, merged onto the class registry for addressing. */
type EntityNamespaces = {
    action: typeof action;
    body: typeof body;
    domain: typeof domain;
    event: typeof event;
    expr: typeof expr;
    modifier: typeof modifier;
    movement: typeof movement;
    result: typeof result;
    roll: typeof roll;
    strikemode: typeof strikemode;
};

/**
 * The merged `sohl.entity` surface (registry getters + sub-namespaces).
 *
 * @internal Plumbing consumed by `sohl.ts` to build `sohl.entity`.
 * @ns-exclude Not a member of the `entity` namespace — excluded from that
 * barrel (see `utils/check-ns-barrels.mjs`).
 */
export const entitySurface: SohlEntitySurface & EntityNamespaces = (() => {
    const surface = {} as SohlEntitySurface & EntityNamespaces;
    for (const key of Reflect.ownKeys(classRegistry)) {
        Object.defineProperty(
            surface,
            key,
            Object.getOwnPropertyDescriptor(classRegistry, key)!,
        );
    }
    Object.assign(surface, {
        action,
        body,
        domain,
        event,
        expr,
        modifier,
        movement,
        result,
        roll,
        strikemode,
    });
    return Object.freeze(surface);
})();
