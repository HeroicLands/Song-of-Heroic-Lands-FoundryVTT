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

import { SohlDomains, type DomainEntry } from "@src/core/SohlDomains";
import {
    DOMAIN_FAMILY,
    DomainFamilies,
    domainFamilyLabels,
    type DomainFamily,
} from "@src/utils/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DomainManagerApp_Base: any =
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2,
    );

interface RenderRow extends DomainEntry {
    canDelete: boolean;
    isOverride: boolean;
}

interface RenderGroup {
    family: DomainFamily;
    familyLabel: string;
    entries: RenderRow[];
}

/**
 * GM-facing manager for the world-scoped Domain registry. Lists all
 * registered domains grouped by family and exposes add / edit / delete
 * actions. System and module entries can be edited (override) but not
 * deleted; only entries with `source === "world"` may be removed through
 * the UI.
 */
export class DomainManagerApp extends (DomainManagerApp_Base as typeof foundry.applications.api.ApplicationV2) {
    static override DEFAULT_OPTIONS = {
        id: "sohl-domain-manager",
        classes: ["sohl", "domain-manager"],
        window: {
            title: "SOHL.DomainManager.title",
            icon: "fa-solid fa-circle-nodes",
            contentClasses: ["standard-form"],
        },
        position: {
            width: 720,
            height: "auto" as const,
        },
        tag: "form" as const,
        form: {
            closeOnSubmit: false,
        },
        actions: {
            addDomain: DomainManagerApp._onAddDomain,
            editDomain: DomainManagerApp._onEditDomain,
            deleteDomain: DomainManagerApp._onDeleteDomain,
        },
    };

    static PARTS: Record<string, any> = {
        form: {
            template: "systems/sohl/templates/apps/domain-manager.hbs",
        },
    };

    override async _prepareContext(_options: any): Promise<any> {
        const all = SohlDomains.getAll();
        const grouped = new Map<DomainFamily, RenderRow[]>();
        for (const family of DomainFamilies) {
            grouped.set(family as DomainFamily, []);
        }
        for (const entry of Object.values(all)) {
            const family = entry.family;
            const list = grouped.get(family);
            if (!list) continue;
            list.push({
                ...entry,
                canDelete: entry.source === "world",
                // The current registry stores only the active entry per
                // shortcode, so we cannot detect "overridden a default" by
                // looking at the live registry alone. We mark world
                // entries whose shortcode begins with `sohl.` as overrides
                // — that is the only way a GM can shadow a system default
                // through the UI.
                isOverride:
                    entry.source === "world" &&
                    entry.shortcode.startsWith("sohl."),
            });
        }
        // Sort within each family by sort then label.
        for (const [, list] of grouped) {
            list.sort((a, b) => {
                if (a.sort !== b.sort) return a.sort - b.sort;
                return a.label.localeCompare(b.label);
            });
        }

        const groups: RenderGroup[] = [];
        for (const [family, entries] of grouped) {
            if (entries.length === 0) continue;
            const familyKey = Object.entries(DOMAIN_FAMILY).find(
                ([, v]) => v === family,
            )?.[0];
            const familyLabel = familyKey
                ? domainFamilyLabels[
                      familyKey as keyof typeof domainFamilyLabels
                  ]
                : family;
            groups.push({ family, familyLabel, entries });
        }

        return {
            groups,
            isEmpty: groups.length === 0,
        };
    }

    /**
     * Open the add-domain dialog. The shortcode is automatically prefixed
     * with `world.` so GM-created entries can never collide with system
     * or module shortcodes.
     */
    static async _onAddDomain(
        this: DomainManagerApp,
        _event: Event,
        _target: HTMLElement,
    ): Promise<void> {
        const result = await DomainManagerApp._promptForEntry({
            isNew: true,
        });
        if (!result) return;
        await SohlDomains.register(result, "world");
        this.render();
    }

    /**
     * Open the edit dialog for an existing entry. System and module
     * entries can be edited; the resulting save creates a `world.`
     * override (because we cannot mutate system defaults persistently).
     */
    static async _onEditDomain(
        this: DomainManagerApp,
        _event: Event,
        target: HTMLElement,
    ): Promise<void> {
        const shortcode = target
            .closest("[data-shortcode]")
            ?.getAttribute("data-shortcode");
        if (!shortcode) return;
        const existing = SohlDomains.get(shortcode);
        if (!existing) return;
        const result = await DomainManagerApp._promptForEntry({
            isNew: false,
            existing,
        });
        if (!result) return;
        await SohlDomains.register(result);
        this.render();
    }

    /**
     * Remove a world-source entry after a confirmation dialog. The button
     * is disabled in the template for non-world entries; this is a
     * defensive second guard.
     */
    static async _onDeleteDomain(
        this: DomainManagerApp,
        _event: Event,
        target: HTMLElement,
    ): Promise<void> {
        const shortcode = target
            .closest("[data-shortcode]")
            ?.getAttribute("data-shortcode");
        if (!shortcode) return;
        const existing = SohlDomains.get(shortcode);
        if (!existing) return;
        if (existing.source !== "world") {
            ui.notifications.warn(
                game.i18n.localize("SOHL.DomainManager.cannotDelete"),
            );
            return;
        }
        const confirmed =
            await foundry.applications.api.DialogV2.confirm({
                window: { title: "SOHL.DomainManager.delete" },
                content: `<p>${game.i18n.format(
                    "SOHL.DomainManager.deleteConfirm",
                    { label: existing.label },
                )}</p>`,
            } as any);
        if (!confirmed) return;
        await SohlDomains.remove(shortcode);
        this.render();
    }

    /**
     * Build a small DialogV2 form for adding or editing an entry. Returns
     * the resulting `DomainEntry` or `null` if the user cancels.
     */
    private static async _promptForEntry(opts: {
        isNew: boolean;
        existing?: DomainEntry;
    }): Promise<DomainEntry | null> {
        const existing = opts.existing;
        const familyOptions = DomainFamilies.map((f) => {
            const familyKey = Object.entries(DOMAIN_FAMILY).find(
                ([, v]) => v === f,
            )?.[0];
            const label = familyKey
                ? game.i18n.localize(
                      domainFamilyLabels[
                          familyKey as keyof typeof domainFamilyLabels
                      ],
                  )
                : (f as string);
            const selected =
                existing?.family === f ? "selected" : "";
            return `<option value="${f}" ${selected}>${label}</option>`;
        }).join("");

        const content = `
            <form class="domain-edit-form">
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.shortcode.label",
                    )}</label>
                    <input type="text" name="shortcode"
                        value="${existing?.shortcode ?? "world."}"
                        ${opts.isNew ? "" : "readonly"} required />
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.label.label",
                    )}</label>
                    <input type="text" name="label" value="${existing?.label ?? ""}" required />
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.family.label",
                    )}</label>
                    <select name="family">${familyOptions}</select>
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.iconFAClass.label",
                    )}</label>
                    <input type="text" name="iconFAClass" value="${existing?.iconFAClass ?? ""}" />
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.img.label",
                    )}</label>
                    <input type="text" name="img" value="${existing?.img ?? ""}" />
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.sort.label",
                    )}</label>
                    <input type="number" name="sort" value="${existing?.sort ?? 0}" />
                </div>
                <div class="form-group">
                    <label>${game.i18n.localize(
                        "SOHL.DomainEntry.description.label",
                    )}</label>
                    <textarea name="description" rows="4">${existing?.description ?? ""}</textarea>
                </div>
            </form>
        `;

        const result = await foundry.applications.api.DialogV2.prompt({
            window: {
                title: opts.isNew
                    ? "SOHL.DomainManager.add"
                    : "SOHL.DomainManager.edit",
            },
            content,
            ok: {
                label: "Save",
                callback: (_event: Event, button: any) => {
                    const form = button.form as HTMLFormElement;
                    const fd = new FormDataExtended(form).object as any;
                    return fd as Record<string, unknown>;
                },
            },
        } as any);
        if (!result) return null;
        const data = result as Record<string, unknown>;
        const shortcode = String(data.shortcode ?? "").trim();
        if (!shortcode) return null;
        // Carry forward fields the form does not expose (e.g.
        // parentShortcode) so editing a system entry through the UI
        // creates a faithful world override rather than dropping data.
        return {
            ...(existing ?? {}),
            shortcode,
            label: String(data.label ?? "").trim(),
            family: String(data.family ?? DOMAIN_FAMILY.ARCANE) as DomainFamily,
            iconFAClass: String(data.iconFAClass ?? ""),
            img: String(data.img ?? ""),
            description: String(data.description ?? ""),
            sort: Number(data.sort ?? 0) || 0,
            source: "world",
        };
    }
}
