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

import { ACTIVE_EFFECT_SCOPE } from "@src/utils/constants";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import {
    buildChangeTypesMap,
    resolveEffectMetadataType,
    resolveEffectKeyChoices,
} from "@src/document/effect/logic/effect-sheet-view";

const BaseAEConfig = foundry.applications.sheets.ActiveEffectConfig;

/**
 * SoHL's Active Effect editor. Extends Foundry's `ActiveEffectConfig` (the
 * standard editor application for ActiveEffect documents) with the system's
 * scope (including the strike-mode scopes) and change-key fields.
 *
 * @internal
 */
export class SohlActiveEffectSheet extends BaseAEConfig {
    /** @inheritDoc */
    static override PARTS = {
        header: { template: "templates/sheets/active-effect/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        details: {
            template: "systems/sohl/templates/effects/details.hbs",
            scrollable: [""],
        },
        duration: { template: "templates/sheets/active-effect/duration.hbs" },
        changes: {
            template: "systems/sohl/templates/effects/changes.hbs",
            scrollable: ["ol[data-changes]"],
        },
        footer: { template: "templates/generic/form-footer.hbs" },
    };

    /** @inheritDoc */
    protected override async _preparePartContext(
        partId: string,
        context: PlainObject,
    ): Promise<foundry.applications.api.ApplicationV2.RenderContextOf<this>> {
        const partContext: PlainObject = await super._preparePartContext(
            partId,
            context as any,
            {},
        );
        if (partContext.tabs?.partId)
            partContext.tab = partContext.tabs[partId];
        const document: SohlItem | SohlActor = (this as any).object;
        switch (partId) {
            case "details": {
                partContext.targetTypes = {};
                if (partContext.isActorEffect) {
                    partContext.targetTypes[ACTIVE_EFFECT_SCOPE.THIS] =
                        sohl.i18n.localize("EFFECT.ThisActor");
                } else {
                    partContext.targetTypes[ACTIVE_EFFECT_SCOPE.THIS] =
                        sohl.i18n.format("EFFECT.ThisItem", {
                            itemType: (document.parent?.system as any)
                                ?.typeLabel,
                        });
                    partContext.targetTypes[ACTIVE_EFFECT_SCOPE.ACTOR] =
                        sohl.i18n.localize("EFFECT.Actor");
                }
                // Add an entry for each registered item kind.
                for (const [key, clazz] of Object.entries(
                    sohl.CONFIG.Item.dataModels,
                )) {
                    partContext.targetTypes[key] = (clazz as any).typeLabel;
                }
                // Strike-mode scopes: target strike-mode entities across the
                // actor's items, selected by the `test` predicate.
                partContext.targetTypes[ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE] =
                    sohl.i18n.localize(
                        "SOHL.ActiveEffect.Scope.MELEE_STRIKE_MODE",
                    );
                partContext.targetTypes[
                    ACTIVE_EFFECT_SCOPE.MISSILE_STRIKE_MODE
                ] = sohl.i18n.localize(
                    "SOHL.ActiveEffect.Scope.MISSILE_STRIKE_MODE",
                );
                break;
            }

            case "duration":
                // partContext.startTimeTemporal = new SohlTemporal(
                //     partContext.startTime,
                // );
                // partContext.endTimeTemporal = new SohlTemporal(
                //     partContext.endTime,
                // );
                break;

            case "changes": {
                // v14: Use ActiveEffect.CHANGE_TYPES (string-keyed registry)
                // instead of deprecated CONST.ACTIVE_EFFECT_MODES (numeric)
                partContext.changeTypes = buildChangeTypesMap(
                    (ActiveEffect as any).CHANGE_TYPES,
                );
                // The `key` dropdown should reflect the EFFECT_KEY namespace
                // determined by `system.scope`:
                //   - "this": the parent doc's own type
                //   - "actor": the owning actor's type
                //   - "meleestrikemode"/"missilestrikemode": the strike-mode keys
                //   - <itemKind>: that item kind's metadata
                const scope = (document as any).system?.scope;
                const metadataType = resolveEffectMetadataType(
                    scope,
                    document.type,
                    (document.parent as any)?.type,
                    (document as any).actor?.type,
                );
                partContext.keyChoices = resolveEffectKeyChoices(metadataType);
                break;
            }
        }
        return partContext as foundry.applications.api.ApplicationV2.RenderContextOf<this>;
    }
}
