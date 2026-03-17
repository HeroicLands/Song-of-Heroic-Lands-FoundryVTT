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

import {
    HYDROLOGY,
    isHydrology,
    isSlope,
    isTerrain,
    isVegetation,
    SLOPE,
    TERRAIN,
    VEGETATION,
} from "@utils/constants";

/**
 * An extension of the base Region class to include support for
 * biome data specific to the SoHL system.
 */
export class SohlRegion extends RegionDocument {
    get scene(): Scene {
        return this.parent as Scene;
    }

    /*
     * The current version of fvtt-types does not include support for Region
     * flags, so we have to use these helper methods to read flag data.
     *
     * TODO: When fvtt-types is updated to include Region flags, we should update
     * this class to properly type the flags and remove these helper methods.
     */
    private _getFlag(scope: string, key: string): unknown {
        return (this as any).getFlag(scope, key);
    }

    get terrain(): string {
        const result = (this._getFlag("sohl", "biome.terrain") ??
            this.scene.getFlag("sohl", "defaultBiome.terrain")) as
            | string
            | undefined;
        return isTerrain(result) ? result : TERRAIN.GROUND_FIRM;
    }

    get vegetation(): string {
        const result = (this._getFlag("sohl", "biome.vegetation") ??
            this.scene.getFlag("sohl", "defaultBiome.vegetation")) as
            | string
            | undefined;
        return isVegetation(result) ? result : VEGETATION.NONE;
    }

    get slope(): string {
        const result = (this._getFlag("sohl", "biome.slope") ??
            this.scene.getFlag("sohl", "defaultBiome.slope")) as
            | string
            | undefined;
        return isSlope(result) ? result : SLOPE.FLAT;
    }

    get hydrology(): string {
        const result = (this._getFlag("sohl", "biome.hydrology") ??
            this.scene.getFlag("sohl", "defaultBiome.hydrology")) as
            | string
            | undefined;
        return isHydrology(result) ? result : HYDROLOGY.DRY;
    }
}

/**
 * Configuration sheet for SoHL regions, extending the base Foundry RegionConfig
 * with a biome tab for terrain, vegetation, slope, and hydrology.
 *
 * Inherits the standard RegionConfig tabs (appearance, shapes, placement,
 * behaviors) and adds a "Biome" tab for SoHL-specific region properties.
 */
export class SohlRegionConfig extends foundry.applications.sheets.RegionConfig {
    static override DEFAULT_OPTIONS = {
        classes: ["sohl", "region-config"],
    };

    static override PARTS: Record<string, any> = {
        tabs: {
            template: "templates/generic/tab-navigation.hbs",
        },
        appearance: {
            template: "templates/scene/parts/region-appearance.hbs",
        },
        shapes: {
            template: "templates/scene/parts/region-shapes.hbs",
            scrollable: [".scrollable"],
        },
        placement: {
            template: "templates/scene/parts/region-placement.hbs",
            scrollable: [".scrollable"],
        },
        biome: {
            template: "systems/sohl/templates/region/region-config-biome.hbs",
        },
        behaviors: {
            template: "templates/scene/parts/region-behaviors.hbs",
            scrollable: [".scrollable"],
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    } as const;

    static TABS = {
        sheet: {
            tabs: [
                {
                    id: "appearance",
                    icon: "fa-solid fa-paint-roller",
                },
                {
                    id: "shapes",
                    icon: "fa-solid fa-shapes",
                },
                {
                    id: "placement",
                    icon: "fa-solid fa-location-dot",
                },
                {
                    id: "biome",
                    icon: "fa-solid fa-tree",
                    label: "SOHL.Region.SHEET.tab.biome.label",
                },
                {
                    id: "behaviors",
                    icon: "fa-solid fa-child-reaching",
                },
            ],
            initial: "appearance",
            labelPrefix: "REGION.TABS",
        },
    };

    override async _preparePartContext(
        partId: string,
        context: any,
        options: any,
    ): Promise<any> {
        const result = await super._preparePartContext(partId, context, options);
        if (partId === "biome") {
            const region = this.document as unknown as SohlRegion;
            Object.assign(result, {
                terrain: region.terrain,
                vegetation: region.vegetation,
                slope: region.slope,
                hydrology: region.hydrology,
                tab: context.tabs?.biome,
            });
        }
        return result;
    }
}
