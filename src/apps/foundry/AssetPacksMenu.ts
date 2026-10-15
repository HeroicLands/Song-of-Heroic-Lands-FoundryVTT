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

import {
    addAssetPack,
    packageRecord,
    readAssetPackFile,
    removeAssetPack,
    selectAssetPack,
    type PackFileProblem,
} from "@src/apps/logic/asset-packs";
import {
    ASSET_PACKS_SETTING,
    discoverContentPackages,
    getAssetPacksSetting,
    registerAssetPackHooks,
    runFix,
    setAssetPacksSetting,
} from "@src/apps/foundry/asset-packs";

const AssetPacksMenu_Base: any = foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
);

/** Localization key for each reason a pack file is refused. */
const PROBLEM_KEYS: Record<PackFileProblem, string> = {
    invalid: "SOHL.AssetPacks.Add.invalid",
    package: "SOHL.AssetPacks.Add.wrongPackage",
    default: "SOHL.AssetPacks.Add.reserved",
};

/**
 * The Asset Packs settings menu: per content package, the selected pack
 * (Default or an added one) and **Add new…**; and one **Fix** button that
 * makes the world match every package's selected pack.
 *
 * @internal Foundry settings-menu UI binding; not part of the public API.
 */
export class AssetPacksMenu extends (AssetPacksMenu_Base as typeof foundry.applications.api.ApplicationV2) {
    /** @inheritDoc */
    static override DEFAULT_OPTIONS = {
        id: "sohl-asset-packs",
        classes: ["sohl", "asset-packs"],
        window: {
            title: "SOHL.AssetPacks.title",
            icon: "fa-solid fa-images",
            contentClasses: ["standard-form"],
        },
        position: { width: 560, height: "auto" as const },
        tag: "form" as const,
        form: {
            handler: AssetPacksMenu._onChangePack,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {
            addPack: AssetPacksMenu._onAddPack,
            removePack: AssetPacksMenu._onRemovePack,
            fix: AssetPacksMenu._onFix,
        },
    };

    static PARTS: Record<string, any> = {
        form: { template: "systems/sohl/templates/apps/asset-packs.hbs" },
    };

    /**
     * Build one row per content package.
     * @param _options - The render options (unused).
     * @returns The template render context.
     */
    protected override async _prepareContext(_options: any): Promise<any> {
        const setting = getAssetPacksSetting();
        const packages = await discoverContentPackages();
        return {
            packages: packages.map((p) => {
                const rec = packageRecord(setting, p.pkg);
                return {
                    pkg: p.pkg,
                    title: p.title,
                    options: [
                        {
                            value: "",
                            label: game.i18n.localize("SOHL.AssetPacks.default"),
                            selected: rec.current === null,
                        },
                        ...rec.assetPacks.map((a) => ({
                            value: a.url,
                            label: a.name,
                            selected: a.url === rec.current,
                        })),
                    ],
                    removable: rec.assetPacks
                        .filter((a) => a.url !== rec.current)
                        .map((a) => ({ url: a.url, name: a.name })),
                    folder: rec.assetPacks.find((a) => a.url === rec.current)?.folder ?? "",
                };
            }),
        };
    }

    /**
     * Save a changed selection.
     * @param _event - The submit event (unused).
     * @param _form - The form (unused).
     * @param formData - The submitted data: one `pack.<package>` per row.
     */
    protected static async _onChangePack(
        this: AssetPacksMenu,
        _event: Event,
        _form: HTMLFormElement,
        formData: any,
    ): Promise<void> {
        const data = foundry.utils.expandObject(formData.object) as {
            pack?: Record<string, string>;
        };
        let setting = getAssetPacksSetting();
        for (const [pkg, url] of Object.entries(data.pack ?? {})) {
            setting = selectAssetPack(setting, pkg, url ? url : null);
        }
        await setAssetPacksSetting(setting);
    }

    /**
     * Ask for a pack file's URL, fetch it, and store and select it.
     * @param _event - The click (unused).
     * @param target - The button, carrying `data-package`.
     */
    protected static async _onAddPack(
        this: AssetPacksMenu,
        _event: Event,
        target: HTMLElement,
    ): Promise<void> {
        const pkg = target.dataset.package;
        if (!pkg) return;
        const url = (await foundry.applications.api.DialogV2.prompt({
            window: { title: "SOHL.AssetPacks.Add.title" },
            content: `<div class="form-group"><label>${game.i18n.localize(
                "SOHL.AssetPacks.Add.url",
            )}</label><input type="url" name="url" required autofocus></div>`,
            ok: {
                label: "SOHL.AssetPacks.Add.ok",
                callback: (_e: Event, button: any) =>
                    String(button.form.elements.url.value ?? "").trim(),
            },
            rejectClose: false,
        } as any)) as string | null;
        if (!url) return;
        await addAssetPackFromUrl(pkg, url);
        void this.render();
    }

    /**
     * Ask for confirmation, then remove an added pack from the setting. The
     * pack's downloaded files stay.
     * @param _event - The click (unused).
     * @param target - The button, carrying `data-package` and `data-url`.
     */
    protected static async _onRemovePack(
        this: AssetPacksMenu,
        _event: Event,
        target: HTMLElement,
    ): Promise<void> {
        const { package: pkg, url, name } = target.dataset;
        if (!pkg || !url) return;
        const ok = await foundry.applications.api.DialogV2.confirm({
            window: { title: "SOHL.AssetPacks.Remove.title" },
            content: `<p>${foundry.utils.escapeHTML(
                game.i18n.format("SOHL.AssetPacks.Remove.confirm", { pack: name ?? url }),
            )}</p>`,
            rejectClose: false,
        } as any);
        if (!ok) return;
        await setAssetPacksSetting(removeAssetPack(getAssetPacksSetting(), pkg, url));
        void this.render();
    }

    /**
     * Run Fix.
     * @param _event - The click (unused).
     * @param _target - The button (unused).
     */
    protected static async _onFix(
        this: AssetPacksMenu,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        await runFix();
        void this.render();
    }
}

/**
 * Fetch a pack file and, unless it is refused, store it in the setting and
 * select it for the package. Downloads no artwork.
 * @param pkg - Content package.
 * @param url - The pack file's URL.
 * @returns Whether the pack was added.
 */
export async function addAssetPackFromUrl(pkg: string, url: string): Promise<boolean> {
    let json: unknown;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = await res.json();
    } catch (err) {
        ui.notifications.error(
            game.i18n.format("SOHL.AssetPacks.Add.fetchFailed", {
                url,
                error: (err as Error).message ?? String(err),
            }),
        );
        return false;
    }
    const result = readAssetPackFile(url, json, pkg, window.location.href);
    if (!result.ok) {
        ui.notifications.error(
            game.i18n.format(PROBLEM_KEYS[result.problem], { url, package: pkg }),
        );
        return false;
    }
    await setAssetPacksSetting(
        addAssetPack(getAssetPacksSetting(), pkg, {
            url,
            name: result.contents.name,
            contents: result.contents,
        }),
    );
    return true;
}

/**
 * Register the asset-pack setting, its menu and its import hooks. Called once
 * from the system's `init`.
 */
export function registerAssetPacks(): void {
    game.settings.register(
        "sohl" as any,
        ASSET_PACKS_SETTING as any,
        {
            name: "SOHL.Settings.imageLocations.name",
            scope: "world",
            config: false,
            type: Object,
            default: {},
        } as any,
    );
    game.settings.registerMenu(
        "sohl" as any,
        "assetPacksMenu" as any,
        {
            name: "SOHL.Settings.assetPacksMenu.name",
            label: "SOHL.Settings.assetPacksMenu.label",
            hint: "SOHL.Settings.assetPacksMenu.hint",
            icon: "fa-solid fa-images",
            type: AssetPacksMenu as any,
            restricted: true,
        } as any,
    );
    registerAssetPackHooks();
}
