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
 * Fixtures and helpers for the asset-pack specs.
 *
 * The specs build everything they need at run time: a shipped pack for the
 * `sohl` content package (served in place of `systems/sohl/asset-sets/default.json`
 * through `cy.intercept`), pack files and their source images uploaded to the
 * test world's user data, and documents carrying `data-asset` and
 * `flags.sohl.assets` directly. Nothing depends on compiled packs.
 */

/** Install root of the `sohl` content package. */
export const INSTALL = "systems/sohl/";

/** Addresses the fixtures use. */
export const A = {
    wolf: "sohl-none-icon-e2ewolf",
    map: "sohl-none-image-e2emap",
    ruin: "sohl-none-image-e2eruin",
    ghost: "sohl-none-icon-e2eghost",
};

/** The shipped pack: no `e2eghost`, which compiles to the icon stand-in. */
export const SHIPPED = {
    name: "Song of Heroic Lands",
    package: "sohl",
    assets: [
        { address: A.wolf, source: "../icons/e2ewolf.svg", target: "icons/e2ewolf.svg", size: 1 },
        { address: A.map, source: "../images/e2emap.svg", target: "images/e2emap.svg", size: 1 },
        { address: A.ruin, source: "../images/e2eruin.svg", target: "images/e2eruin.svg", size: 1 },
        {
            address: "sohl-none-icon-missing",
            source: "../icons/missing.svg",
            target: "icons/missing.svg",
            size: 1,
        },
        {
            address: "sohl-none-image-missing",
            source: "../images/missing.svg",
            target: "images/missing.svg",
            size: 1,
        },
    ],
};

/** Serve {@link SHIPPED} as the system's shipped pack. Call in `beforeEach`. */
export function interceptShippedPack() {
    cy.intercept("GET", "**/systems/sohl/asset-sets/default.json", {
        statusCode: 200,
        body: SHIPPED,
        headers: { "cache-control": "no-store" },
    });
}

/**
 * A small SVG whose text makes each fixture distinct.
 * @param {string} label - Text drawn in the image.
 */
export const svg = (label) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text x="2" y="20">${label}</text></svg>`;

/** Byte length of a string as UTF-8. */
export const byteSize = (text) => new Blob([text]).size;

/**
 * Upload text as a file into a user-data folder, creating the folder level by
 * level.
 * @param {Window} win - The game window.
 * @param {string} dir - Folder below the user-data root, without trailing slash.
 * @param {string} name - File name.
 * @param {string} text - Contents.
 * @param {string} type - MIME type.
 */
export async function uploadText(win, dir, name, text, type) {
    const FP = win.foundry.applications.apps.FilePicker.implementation;
    let parent = "";
    for (const seg of dir.split("/")) {
        const level = parent ? `${parent}/${seg}` : seg;
        const listing = await FP.browse("data", parent).catch(() => ({ dirs: [] }));
        if (!listing.dirs.map((d) => decodeURIComponent(d)).includes(level)) {
            await FP.createDirectory("data", level).catch(() => null);
        }
        parent = level;
    }
    const file = new win.File([text], name, { type });
    const result = await FP.upload("data", dir, file, {}, { notify: false });
    if (!result?.path) throw new Error(`upload of ${dir}/${name} failed`);
    return result.path;
}

/**
 * Upload a pack file and its source images.
 * @param {Window} win - The game window.
 * @param {string} root - Folder holding the pack file, without trailing slash.
 * @param {string} file - Pack file name.
 * @param {string} name - Pack display name.
 * @param {Record<string, {target: string, label: string}>} images - By address.
 * @returns {Promise<string>} The pack file's path, for Add new.
 */
export async function uploadPack(win, root, file, name, images) {
    const stem = file.replace(/\.json$/, "");
    const assets = [];
    for (const [address, { target, label }] of Object.entries(images)) {
        const base = target.slice(target.lastIndexOf("/") + 1);
        const text = svg(label);
        await uploadText(win, `${root}/${stem}`, base, text, "image/svg+xml");
        assets.push({ address, source: `${stem}/${base}`, target, size: byteSize(text) });
    }
    const body = JSON.stringify({ name, package: "sohl", assets });
    await uploadText(win, root, file, body, "application/json");
    return `${root}/${file}`;
}

/** The `sohl.apps.foundry` namespace in the game window. */
export const ap = (win) => win.sohl.apps.foundry;

/** Reset the asset-pack setting and the import hook's locations. */
export function resetAssetPacks() {
    return cy.foundry(async (win) => {
        await win.game.settings.set("sohl", "imageLocations", {});
        await ap(win).refreshImportLocations();
        return null;
    });
}

/**
 * Run Fix with prompts that answer without dialogs.
 * @param {string|null} folder - Folder to choose, or `null` to cancel.
 */
export function fixInto(folder) {
    return cy.foundry((win) =>
        ap(win).runFix({
            chooseFolder: async () => folder,
            confirmOverwrite: async () => true,
        }),
    );
}
