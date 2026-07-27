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

import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { SohlItemSheetBase } from "@src/document/item/foundry/SohlItemSheetBase";
import { SKILL_SUBTYPE } from "@src/utils/constants";
import {
    addStrikeMode,
    bindStrikeModeContextMenu,
    prepareStrikeModesContext,
    withStrikeModesTab,
} from "@src/document/item/foundry/strike-mode-sheet";

/** @internal */
export class SkillSheet extends SohlItemSheetBase {
    /** @inheritDoc */
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/skill-properties.hbs",
            scrollable: [""],
        },
        strikemodes: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/strikemodes.hbs",
            scrollable: [""],
        },
    };

    /**
     * Only a `combattechnique` skill has a strike mode, so the Strike Modes tab
     * is declared here but shown only for that subtype (see
     * {@link SkillSheet._getTabsConfig}).
     */
    static override TABS = withStrikeModesTab(SohlItemSheetBase.TABS);

    /** @inheritDoc */
    static override DEFAULT_OPTIONS: PlainObject = {
        actions: {
            addStrikeMode: SkillSheet._onAddStrikeMode,
        },
    };

    /** Whether this skill is a combat technique (carries a strike mode). */
    private get isCombatTechnique(): boolean {
        return (
            (this.document.system as any).subType ===
            SKILL_SUBTYPE.COMBATTECHNIQUE
        );
    }

    /**
     * Hide the Strike Modes tab for every skill subtype except
     * `combattechnique`, without mutating the shared static `TABS`.
     * @param group - The tab group being prepared.
     * @returns The tab configuration, with `strikemodes` filtered out for
     *   non-technique skills.
     */
    protected override _getTabsConfig(group: string): any {
        // Mirrors ApplicationV2#_getTabsConfig (returns `this.constructor.TABS[group]`),
        // then drops the strike-modes tab for non-technique skills.
        const cfg = (this.constructor as any).TABS?.[group] ?? null;
        if (!cfg || group !== "sheet" || this.isCombatTechnique) return cfg;
        return {
            ...cfg,
            tabs: cfg.tabs.filter((t: any) => t.id !== "strikemodes"),
        };
    }

    /**
     * `data-action="addStrikeMode"`: seed this combat technique's strike mode
     * and open the editor on it (only reachable when it currently has none).
     * @param _event - The triggering pointer event (unused).
     * @param _target - The clicked add control (unused).
     */
    protected static async _onAddStrikeMode(
        this: SkillSheet,
        _event: PointerEvent,
        _target: HTMLElement,
    ): Promise<void> {
        await addStrikeMode(this.document);
    }

    /** @inheritDoc */
    protected override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);
        if (!(this.document as any).limited && this.isCombatTechnique) {
            options.parts?.push("strikemodes");
        }
    }

    /**
     * Add the strike-mode `⋮`-row context menus after the base render.
     * @param context - The render context.
     * @param options - The render options.
     */
    protected override async _onRender(
        context: PlainObject,
        options: PlainObject,
    ): Promise<void> {
        await super._onRender(context, options);
        const el = (this as any).element as HTMLElement | undefined;
        if (el && this.isEditable && this.isCombatTechnique) {
            bindStrikeModeContextMenu(this.document, el);
        }
    }

    /**
     * Adds skill-specific fields to the properties tab context.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context extended with skill properties.
     */
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            skillBaseFormula: system.skillBaseFormula,
            masteryLevelBase: system.masteryLevelBase,
            initSkillMult: system.initSkillMult,
            parentSkillCode: system.parentSkillCode,
            adoptParentMasteryLevel: system.adoptParentMasteryLevel,
            improveFlag: system.improveFlag,
            subType: system.subType,
            combatCategory: system.combatCategory,
            impairedByRoles: system.impairedByRoles ?? [],
        });
    }

    /** @inheritDoc */
    protected override async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        context = await super._preparePartContext(partId, context, options);
        if (partId === "strikemodes") {
            Object.assign(context, prepareStrikeModesContext(this.document));
        }
        return context;
    }
}
