/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Real-Handlebars template rendering for tests — in Node, no Foundry.
 *
 * Foundry's `renderTemplate` shim is just a file-loading wrapper around
 * Handlebars, so a test can render a SoHL `.hbs` for real by reading it off disk
 * and compiling it with the same Handlebars the app uses. This lets card-assembly
 * tests (e.g. {@link buildActionCard}) assert the *actual emitted HTML* — the
 * button attributes, escaping, and scope serialization — instead of only the data
 * handed to a stubbed renderer.
 *
 * Use it as a `toHTMLWithTemplate` mock implementation:
 * ```ts
 * vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(
 *     (tpl, data) => Promise.resolve(renderRealTemplate(String(tpl), data)),
 * );
 * ```
 * Only for **helper-free** templates (the action-card button block, and any body
 * template that uses no custom helpers). A template that uses `toJSON` / `or` /
 * `eq` / `selectOptions` / … must have those helpers registered on this module's
 * Handlebars instance first (see {@link registerTestHelper}).
 */

import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Map a Foundry system template path to its on-disk repo location. */
function toRepoPath(foundryPath: string): string {
    // "systems/sohl/templates/chat/x.hbs" -> "<repo>/templates/chat/x.hbs"
    const rel = foundryPath.replace(/^systems\/sohl\//, "");
    return resolve(process.cwd(), rel);
}

const cache = new Map<string, ReturnType<typeof Handlebars.compile>>();

/**
 * Register a custom Handlebars helper on the test instance (for body templates
 * that need one). Call before {@link renderRealTemplate}.
 * @param name - The helper name as used in templates.
 * @param fn - The helper implementation.
 */
export function registerTestHelper(
    name: string,
    fn: Handlebars.HelperDelegate,
): void {
    Handlebars.registerHelper(name, fn);
}

/**
 * Render a real SoHL `.hbs` template with real Handlebars.
 * @param foundryPath - The Foundry system template path (`systems/sohl/…`).
 * @param data - The render context.
 * @returns The rendered HTML string.
 */
export function renderRealTemplate(
    foundryPath: string,
    data: Record<string, unknown> = {},
): string {
    let tpl = cache.get(foundryPath);
    if (!tpl) {
        const src = readFileSync(toRepoPath(foundryPath), "utf8");
        tpl = Handlebars.compile(src);
        cache.set(foundryPath, tpl);
    }
    return tpl(data);
}
