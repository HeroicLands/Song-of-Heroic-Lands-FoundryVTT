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
import { pathToFileURL } from "node:url";

const endpoint =
    "https://api.github.com/repos/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest";
const evidenceHeaders = [
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
    "retry-after",
    "x-github-request-id",
];
const safe = (text, token) =>
    String(text)
        .replaceAll(token || "\0", "[redacted]")
        .replace(/[\r\n\x00-\x1f]/g, " ")
        .slice(0, 300);

const tagPattern = /^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const validTag = (tag) => typeof tag === "string" && tagPattern.test(tag) && tag === tag.trim();
const publishedDate = (body) =>
    typeof body?.published_at === "string" && Number.isFinite(Date.parse(body.published_at));
const evidenceOf = (response, token) =>
    evidenceHeaders
        .flatMap((name) => {
            const value = response.headers.get(name);
            return value ? [`${name}=${safe(value, token)}`] : [];
        })
        .join(", ");

/** Resolve the newest stable release after a triggering tag reaches publication.
 * @param {{token?: string, refType?: string, refName?: string, fetcher?: typeof fetch, wait?: (ms: number) => Promise<void>, publicationAttempts?: number, onPending?: (message: string) => void}} options Existing credential, trigger and testable HTTP/wait clients.
 * @returns {Promise<string>} Published latest version tag; failures never select a fallback ref.
 */
export async function resolveReleaseTag({
    token,
    refType,
    refName,
    fetcher = fetch,
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    publicationAttempts = 30,
    onPending = () => {},
} = {}) {
    const headers = {
        Accept: "application/vnd.github+json",
        "User-Agent": "HeroicLands-SoHL-API-docs",
        "X-GitHub-Api-Version": "2026-03-10",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const readRelease = async (url) => {
        let response;
        try {
            response = await fetcher(url, { headers, signal: AbortSignal.timeout(20_000) });
        } catch {
            throw new Error(
                "Release lookup transport failure: GitHub does not return a response; no documentation ref is selected.",
            );
        }
        let body;
        try {
            body = await response.json();
        } catch {
            body = null;
        }
        const evidence = evidenceOf(response, token);
        if (!response.ok && response.status !== 404) {
            const message =
                typeof body?.message === "string" ? `: ${safe(body.message, token)}` : "";
            throw new Error(
                `GitHub release lookup fails with HTTP ${response.status}${message}${evidence ? ` (${evidence})` : ""}; no documentation ref is selected.`,
            );
        }
        return { body, status: response.status, evidence };
    };
    if (refType === "tag") {
        if (!validTag(refName))
            throw new Error(
                "The triggering tag is not a valid release tag; no documentation ref is selected.",
            );
        if (
            !Number.isInteger(publicationAttempts) ||
            publicationAttempts < 1 ||
            publicationAttempts > 30
        )
            throw new Error("Publication checks must have a bound between 1 and 30 attempts.");
        const publicationUrl = endpoint.replace(/latest$/, `tags/${encodeURIComponent(refName)}`);
        for (let attempt = 1; attempt <= publicationAttempts; attempt++) {
            const { body, status, evidence } = await readRelease(publicationUrl);
            if (status !== 404) {
                if (
                    body?.tag_name !== refName ||
                    typeof body.draft !== "boolean" ||
                    typeof body.prerelease !== "boolean" ||
                    (body.published_at !== null && !publishedDate(body))
                )
                    throw new Error(
                        "GitHub tag response does not identify a valid release; no documentation ref is selected.",
                    );
                if (!body.draft && publishedDate(body)) break;
            }
            if (attempt === publicationAttempts)
                throw new Error(
                    `GitHub release ${refName} remains unpublished after ${publicationAttempts} checks (last HTTP ${status}${evidence ? `; ${evidence}` : ""}); no documentation ref is selected.`,
                );
            onPending(
                `Waiting for GitHub to publish ${refName} (${attempt}/${publicationAttempts}).`,
            );
            await wait(20_000);
        }
    }
    // Publication is the gate, and latest is the documentation contract: beta
    // releases and an older tag push must never replace the newest stable API.
    const { body, status } = await readRelease(endpoint);
    if (status === 404)
        throw new Error(
            "No published release found (GitHub HTTP 404); no documentation ref is selected.",
        );
    if (
        !validTag(body?.tag_name) ||
        body.draft !== false ||
        body.prerelease !== false ||
        !publishedDate(body)
    )
        throw new Error(
            "GitHub latest-release response does not identify a valid published release; no documentation ref is selected.",
        );
    return body.tag_name;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        const tag = await resolveReleaseTag({
            token: process.env.GH_RELEASE_TOKEN,
            refType: process.env.RELEASE_REF_TYPE,
            refName: process.env.RELEASE_REF_NAME,
            onPending: (message) => console.log(message),
        });
        if (!process.env.GITHUB_OUTPUT)
            throw new Error("GITHUB_OUTPUT is required to record the published documentation ref.");
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\n`);
        console.log(`Building API documentation from published release ${tag}.`);
    } catch (error) {
        console.error(safe(error.message, process.env.GH_RELEASE_TOKEN));
        process.exitCode = 1;
    }
}
