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
import fs from "node:fs";
import { defineConfig, DERIVED_SYSTEM_VERSION } from "@heroiclands/package-build/content-config";
import { ITEM_BUILDERS } from "./utils/item-builders.mjs";

// A code configuration supplies our duration-validation registry. All other
// options remain the shared toolchain's ordinary configuration contract.
const options = {
    contentPackage: "sohl",
    authors: [
        {
            name: "Tom Rodriguez",
            email: "toasty@heroiclands.org",
            url: "https://www.heroiclands.org/",
            discord: "toasty#8538",
        },
    ],
    packageKind: "systems",
    stats: {
        lastModifiedBy: "sohlbuilder00000",
    },
    compatibility: {
        minimum: "14.359",
        verified: "14.368",
    },
    docs: {
        itemFields: {
            title: "Item Note Frontmatter",
            out: "assets/content/Dev_Docs/content-creator/item-frontmatter.md",
            frontmatter: {
                description:
                    "The generated per-type field reference for all 13 item types: every `sohl:` field, its shape, requiredness, and default.",
                sohl: {
                    kbcat: "devdocs",
                },
            },
            preamble: [
                "See also: [[doc-authoringworkflow|The Authoring Workflow]], [[doc-actornotes|Actor Notes]], [[doc-assetconventions|Asset Conventions]]",
                "",
                "Every item note carries the frontmatter envelope described in [[doc-authoringworkflow|The Authoring Workflow]] — `name.full`, `type`, `shortcode`, and the required `templatePriority`. This page covers what each **type** adds to that: the fields under its `sohl:` block, and nothing else.",
                "",
                "The tables are rendered from the declaration that _builds_ each document, not from a description of it, so a field listed here is a field the compiler reads and a field absent here is one it ignores. An unrecognised `sohl:` key is silently dropped, so a typo shows up as a missing value rather than an error — check the spelling here first.",
                "",
                "Place government is stated on each place as `data.government`, addressing its governing affiliation. An affiliation's persisted system data records its parents and seat; place government metadata supplies the geographic relation.",
            ],
        },
    },
    skipDirectories: ["Templates"],
    icons: "assets/icon-registry.yaml",
    packs: [
        {
            name: "items",
            label: "Items",
            type: "Item",
        },
        {
            name: "journals",
            label: "Journals",
            type: "JournalEntry",
        },
        {
            name: "actors",
            label: "Actors",
            type: "Actor",
        },
        {
            name: "macros",
            label: "Macros",
            type: "Macro",
        },
        {
            name: "scenes",
            label: "Scenes",
            type: "Scene",
            companions: [
                {
                    name: "adventures",
                    label: "Map Adventures",
                    type: "Adventure",
                    system: "sohl",
                },
            ],
        },
        {
            name: "tutorial-adventures",
            label: "Tutorial Adventures",
            type: "Adventure",
            system: "sohl",
        },
    ],
    packageBuild: {
        schema: {
            Item: {
                from: "src/core/foundry/sohl-config.ts",
                registry: "ITEM_DM_DEF",
            },
            Actor: {
                from: "src/core/foundry/sohl-config.ts",
                registry: "ACTOR_DM_DEF",
            },
        },
        assets: [
            {
                from: "assets/audio",
                to: "assets/audio",
            },
            {
                from: "assets/icons",
                to: "assets/icons",
            },
            {
                from: "assets/images",
                to: "assets/images",
            },
            {
                from: "assets/fonts",
                to: "assets/fonts",
            },
            {
                from: "assets/ui",
                to: "assets/ui",
            },
            {
                from: "lang",
                to: "lang",
            },
            {
                from: "templates",
                to: "templates",
            },
            {
                from: "LICENSE.md",
                to: "LICENSE.md",
            },
            {
                from: "README.md",
                to: "README.md",
            },
            {
                from: "build/schema.json",
                to: "schema.json",
            },
        ],
        assetTransform: "svg-theme",
        lang: {
            sources: "lang/*.json",
            help: "A dotted-prefix collision makes foundry.utils.expandObject throw, and Foundry then drops the whole translation file. Make each key a leaf OR a branch, never both. See assets/content/Dev_Docs/reference/localization-keys.md for the placeholder and key-segment rules.",
            keyRoots: ["SOHL", "TYPES", "TYPE"],
            references: "./utils/lang-references.mjs",
            retained: [
                {
                    prefix: "SOHL.Gear.Action.",
                    reason: "Intrinsic action titles built as `${titlePrefix}.${shortcode}` — the prefix is a parameter, so no scan can resolve it.",
                },
                {
                    prefix: "SOHL.Skill.Action.",
                    reason: "As above (defineImproveSdrActions is called with the kind's prefix).",
                },
                {
                    prefix: "SOHL.MysticalAbility.Action.",
                    reason: "As above.",
                },
                {
                    prefix: "SOHL.Affliction.Action.",
                    reason: "As above.",
                },
                {
                    prefix: "SOHL.Being.StumbleTest.",
                    reason: "keepControlTable resolves `<prefix>.<SuccessLevel>.label|description` from a success level computed at runtime.",
                },
                {
                    prefix: "SOHL.Being.FumbleTest.",
                    reason: "As above.",
                },
                {
                    prefix: "SOHL.AttackResult.TacticalAdvantage.action",
                    reason: "Resolved from the stored tactical-advantage value, not named in source.",
                },
            ],
            allow: [
                {
                    literal: "item.system.code === 'pyrn'",
                    reason: "A SafeExpression example shown as a placeholder — code, not prose.",
                },
            ],
        },
        bundle: {
            entry: "sohl.js",
        },
        container: {
            name: "heroiclands-foundry",
            stages: {
                leg: {
                    port: 30000,
                    world: "",
                },
            },
        },
        e2e: {
            suite: {
                run: ["npx", "cypress", "run", "--browser", "chromium"],
                open: ["npx", "cypress", "open"],
            },
            build: {
                code: "build:code",
                css: "build:css",
                db: "build:db",
                assets: "build:assets",
                system: {
                    script: "build:system",
                    recreate: true,
                },
            },
        },
        manifestFlags: "./utils/manifest-flags.mjs",
        manifest: {
            title: "Song of Heroic Lands",
            descriptionHtml:
                "<p><strong>Song of Heroic Lands: A Gateway to Adventure!</strong> Embark on a journey through a richly detailed fantasy world with Song of Heroic Lands (SoHL)—a game system built to bring your adventures to life in Foundry Virtual Tabletop. Seamlessly compatible with the renowned HârnMaster system, SoHL allows you to experience the intricacies of one of the most immersive and realistic fantasy role-playing systems ever created.</p><p>Designed for both seasoned veterans and new players, SoHL captures the essence of detailed game mechanics while leveraging the power of Foundry VTT to streamline gameplay, enhance storytelling, and immerse you in the lore-rich environment.</p>",
            license: "LICENSE.md",
            readme: "README.md",
            changelog: "CHANGELOG.md",
            flags: {
                allowBugReporter: true,
                needsMigrationVersion: "0.3.5",
                compatibleMigrationVersion: "0.3.0",
            },
            esmodules: ["sohl.js"],
            styles: ["css/sohl.css"],
            languages: [
                {
                    lang: "en",
                    name: "English",
                    path: "lang/en.json",
                },
            ],
            documentTypes: {
                Actor: {
                    being: {
                        htmlFields: ["dossier", "appearance"],
                    },
                    cohort: {
                        htmlFields: ["dossier", "appearance"],
                    },
                    structure: {
                        htmlFields: ["dossier", "appearance"],
                    },
                    vehicle: {
                        htmlFields: ["dossier", "appearance"],
                    },
                },
                Item: {
                    affiliation: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    affliction: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    armorgear: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    attribute: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    concoctiongear: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    containergear: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    trauma: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    miscgear: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    mystery: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    mysticalability: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    projectilegear: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    skill: {
                        htmlFields: ["notes", "docHtml"],
                    },
                    weapongear: {
                        htmlFields: ["notes", "docHtml"],
                    },
                },
                ActiveEffect: {
                    sohleffectdata: {},
                },
                RegionBehavior: {
                    trigger: {},
                },
            },
            packFolders: [
                {
                    name: "Song of Heroic Lands",
                    sorting: "m",
                    color: "#094fcb",
                    packs: [
                        "items",
                        "journals",
                        "actors",
                        "macros",
                        "scenes",
                        "adventures",
                        "tutorial-adventures",
                    ],
                },
            ],
            media: [
                {
                    type: "setup",
                    url: "systems/sohl/assets/ui/sohl-icon-3d-1920x1080.webp",
                    thumbnail: "systems/sohl/assets/ui/sohl-icon-3d-400x225.webp",
                },
                {
                    type: "logo",
                    url: "systems/sohl/assets/ui/sohl-icon-3d-400x100.webp",
                },
                {
                    type: "icon",
                    url: "systems/sohl/assets/ui/sohl-icon-3d-512x512.webp",
                },
                {
                    type: "banner",
                    url: "systems/sohl/assets/ui/sohl-icon-3d-1200x400.webp",
                },
            ],
            socket: true,
            grid: {
                distance: 5,
                units: "ft",
            },
            primaryTokenAttribute: "health",
        },
    },
    publish: {
        address: {
            prefix: "kb/",
        },
    },
    site: {
        assets: "https://cdn.heroiclands.org",
        description:
            "Song of Heroic Lands — a classless, skill-based fantasy system for Foundry Virtual Tabletop.",
        pass: "sohlKb",
        passOptions: {
            apiBase: "/sohl/api/",
            symbolMap: "build/hugo/data/api-symbols.json",
        },
        notfound: {
            heroimage: "images/brand/sohl-banner.webp",
            tagline: "Song of Heroic Lands has no page at",
            sitenoun: "site",
            links: [
                {
                    title: "Song of Heroic Lands",
                    url: "/",
                    text: "What the system is, and where everything about it lives.",
                },
                {
                    title: "API Documentation",
                    url: "/api/",
                    text: "Generated reference for the current release.",
                },
                {
                    title: "Developer Documentation",
                    url: "/doc-devdocs/",
                    text: "Architecture, extension points, testing, and reference material.",
                },
                {
                    title: "User Guide",
                    url: "/doc-userguide/",
                    text: "Player- and GM-facing guides to playing with Song of Heroic Lands.",
                },
                {
                    title: "Rules",
                    url: "/doc-rulesintro/",
                    text: "Success and opposed tests, injury, healing, shock, bleeding, and trauma.",
                },
            ],
        },
        hugo: {
            params: {
                search: true,
            },
            markup: {
                highlight: {
                    style: "monokai",
                },
            },
        },
    },
    pdf: {
        books: [
            {
                id: "core",
                title: "Song of Heroic Lands",
                subtitle: "Rules, User Guide, and Reference",
                document: "book.yaml",
                out: "sohl",
            },
        ],
    },
};
const manifest = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url), "utf8"));
export default defineConfig({
    ...options,
    rootDir: import.meta.dirname,
    foundryPackage: manifest.name,
    homepage: manifest.homepage,
    stats: { ...options.stats, [DERIVED_SYSTEM_VERSION]: manifest.version },
    itemBuilders: ITEM_BUILDERS,
});
