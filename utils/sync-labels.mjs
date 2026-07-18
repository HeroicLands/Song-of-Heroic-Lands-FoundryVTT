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
 * Reconcile GitHub's repository labels to the authoritative registry in
 * `.github/labels.yml`. The registry is a CLOSED set: labels present here are
 * created or updated (color + description); labels on GitHub that are absent
 * here are deleted. This is the "no invented labels" enforcement from
 * docs/how-to/issue-reporting.md §3.
 *
 * Usage:
 *   node utils/sync-labels.mjs --dry-run     # print the plan, change nothing
 *   node utils/sync-labels.mjs               # apply
 *
 * Auth/target come from the environment (as in GitHub Actions):
 *   GITHUB_TOKEN / GH_TOKEN   a token with `issues: write` on the repo
 *   GITHUB_REPOSITORY          "owner/repo" (falls back to `--repo owner/repo`)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const DRY_RUN = process.argv.includes("--dry-run");
const repoArg = process.argv[process.argv.indexOf("--repo") + 1];
const REPO =
    (process.argv.includes("--repo") ? repoArg : null) ??
    process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!REPO) {
    console.error(
        "No repository — set GITHUB_REPOSITORY or pass --repo owner/repo.",
    );
    process.exit(1);
}
if (!TOKEN && !DRY_RUN) {
    console.error("No token — set GITHUB_TOKEN (or run with --dry-run).");
    process.exit(1);
}

const API = "https://api.github.com";
const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

/** Read and validate the label registry. */
function readRegistry() {
    const file = resolve(".github/labels.yml");
    const list = parse(readFileSync(file, "utf8"));
    if (!Array.isArray(list)) {
        throw new Error(".github/labels.yml must be a list of labels.");
    }
    const byName = new Map();
    for (const entry of list) {
        if (!entry?.name || !entry?.color) {
            throw new Error(
                `Each label needs a name and color: ${JSON.stringify(entry)}`,
            );
        }
        byName.set(entry.name, {
            name: entry.name,
            color: String(entry.color).replace(/^#/, "").toLowerCase(),
            description: entry.description ?? "",
        });
    }
    return byName;
}

/** GET every label on the repository (paginated). */
async function fetchCurrentLabels() {
    const out = new Map();
    for (let page = 1; ; page++) {
        const res = await fetch(
            `${API}/repos/${REPO}/labels?per_page=100&page=${page}`,
            { headers },
        );
        if (!res.ok) {
            throw new Error(
                `GET labels failed: ${res.status} ${await res.text()}`,
            );
        }
        const batch = await res.json();
        for (const l of batch) {
            out.set(l.name, {
                name: l.name,
                color: String(l.color).toLowerCase(),
                description: l.description ?? "",
            });
        }
        if (batch.length < 100) break;
    }
    return out;
}

async function api(method, path, body) {
    if (DRY_RUN) return;
    const res = await fetch(`${API}${path}`, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        throw new Error(
            `${method} ${path} failed: ${res.status} ${await res.text()}`,
        );
    }
}

async function main() {
    const want = readRegistry();
    const have = await fetchCurrentLabels();

    const creates = [];
    const updates = [];
    const deletes = [];

    for (const label of want.values()) {
        const cur = have.get(label.name);
        if (!cur) creates.push(label);
        else if (
            cur.color !== label.color ||
            (cur.description ?? "") !== label.description
        ) {
            updates.push(label);
        }
    }
    for (const name of have.keys()) {
        if (!want.has(name)) deletes.push(name);
    }

    const plan = `${creates.length} to create, ${updates.length} to update, ${deletes.length} to delete`;
    console.log(`sync-labels (${REPO})${DRY_RUN ? " [dry-run]" : ""}: ${plan}`);
    for (const l of creates) console.log(`  + create  ${l.name}`);
    for (const l of updates) console.log(`  ~ update  ${l.name}`);
    for (const n of deletes) console.log(`  - delete  ${n}`);

    for (const l of creates) {
        await api("POST", `/repos/${REPO}/labels`, {
            name: l.name,
            color: l.color,
            description: l.description,
        });
    }
    for (const l of updates) {
        await api(
            "PATCH",
            `/repos/${REPO}/labels/${encodeURIComponent(l.name)}`,
            { color: l.color, description: l.description },
        );
    }
    for (const n of deletes) {
        await api("DELETE", `/repos/${REPO}/labels/${encodeURIComponent(n)}`);
    }

    console.log(
        DRY_RUN ?
            "✅ dry-run complete — no changes made."
        :   "✅ labels synced.",
    );
}

main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
});
