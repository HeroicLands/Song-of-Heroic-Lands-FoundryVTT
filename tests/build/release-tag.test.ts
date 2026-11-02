/* Copyright (c) 2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolveReleaseTag } from "../../utils/resolve-release-tag.mjs";

const published = {
    tag_name: "v0.8.2",
    draft: false,
    prerelease: false,
    published_at: "2026-08-08T02:59:23Z",
};
const response = (body: unknown, status = 200, headers = {}) =>
    new Response(JSON.stringify(body), { status, headers });

describe("published API documentation release", () => {
    it("reads the published latest tag with the existing credential", async () => {
        let request: RequestInit | undefined;
        let url = "";
        const tag = await resolveReleaseTag({
            token: "fixture-token",
            fetcher: async (input, options) => {
                url = String(input);
                request = options;
                return response(published);
            },
        });
        expect(tag).toBe("v0.8.2");
        expect(url).toBe(
            "https://api.github.com/repos/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest",
        );
        expect(new Headers(request?.headers).get("Authorization")).toBe("Bearer fixture-token");
    });
    it("passes the trigger through the workflow without substituting its ref", () => {
        const workflow = fs.readFileSync(
            new URL("../../.gitea/workflows/deploy-sohl.yml", import.meta.url),
            "utf8",
        );
        const step = workflow
            .split("- name: Resolve the newest release tag")[1]
            .split("- name: Checkout the release tag")[0];
        expect(step).toContain("node utils/resolve-release-tag.mjs");
        expect(step).toContain("RELEASE_REF_TYPE: ${{ github.ref_type }}");
        expect(step).toContain("RELEASE_REF_NAME: ${{ github.ref_name }}");
    });
    it("waits for the triggering tag to publish before resolving the latest release", async () => {
        const calls: string[] = [];
        const delays: number[] = [];
        let tagChecks = 0;
        const next = { ...published, tag_name: "v0.9.0" };
        const tag = await resolveReleaseTag({
            refType: "tag",
            refName: "v0.9.0",
            wait: async (ms) => {
                delays.push(ms);
            },
            fetcher: async (input) => {
                const url = String(input);
                calls.push(url);
                if (url.endsWith("/tags/v0.9.0"))
                    return ++tagChecks === 1 ?
                            response({ message: "Not Found" }, 404)
                        :   response(next);
                return response(tagChecks > 1 ? next : published);
            },
        });
        expect(tag).toBe("v0.9.0");
        expect(calls.map((url) => url.split("/releases/")[1])).toEqual([
            "tags/v0.9.0",
            "tags/v0.9.0",
            "latest",
        ]);
        expect(delays).toEqual([20_000]);
    });
    it("bounds an unpublished tag without selecting the previous release", async () => {
        let calls = 0;
        const delays: number[] = [];
        await expect(
            resolveReleaseTag({
                refType: "tag",
                refName: "v0.9.0",
                publicationAttempts: 2,
                wait: async (ms) => {
                    delays.push(ms);
                },
                fetcher: async () => {
                    calls++;
                    return response({ message: "Not Found" }, 404, {
                        "x-github-request-id": "fixture-request",
                    });
                },
            }),
        ).rejects.toThrow(/unpublished after 2 checks.*HTTP 404.*fixture-request/);
        expect(calls).toBe(2);
        expect(delays).toEqual([20_000]);
    });
    it("waits for a draft and keeps prerelease or older tags from replacing latest", async () => {
        for (const trigger of [
            { ...published, tag_name: "v0.8.8", prerelease: true },
            { ...published, tag_name: "v0.8.1" },
        ]) {
            let tagChecks = 0;
            const calls: string[] = [];
            expect(
                await resolveReleaseTag({
                    refType: "tag",
                    refName: trigger.tag_name,
                    wait: async () => {},
                    fetcher: async (input) => {
                        const url = String(input);
                        calls.push(url);
                        if (!url.endsWith("/latest"))
                            return response(
                                ++tagChecks === 1 ?
                                    { ...trigger, draft: true, published_at: null }
                                :   trigger,
                            );
                        return response(published);
                    },
                }),
            ).toBe("v0.8.2");
            expect(calls.map((url) => url.split("/releases/")[1])).toEqual([
                `tags/${trigger.tag_name}`,
                `tags/${trigger.tag_name}`,
                "latest",
            ]);
        }
    });
    it("fails a denied tag lookup immediately instead of retrying or falling back", async () => {
        const calls: string[] = [];
        await expect(
            resolveReleaseTag({
                refType: "tag",
                refName: "v0.9.0",
                wait: async () => {
                    throw new Error("No wait after denial");
                },
                fetcher: async (input) => {
                    calls.push(String(input));
                    return response({ message: "fixture denial" }, 403);
                },
            }),
        ).rejects.toThrow("HTTP 403");
        expect(calls).toHaveLength(1);
        expect(calls[0]).toMatch(/\/tags\/v0\.9\.0$/);
    });
    it("reports a missing published release separately", async () => {
        await expect(
            resolveReleaseTag({ fetcher: async () => response({ message: "Not Found" }, 404) }),
        ).rejects.toThrow("No published release found (GitHub HTTP 404)");
    });
    it("reports denial, rate-limit evidence and a safe message without a token", async () => {
        const error = await resolveReleaseTag({
            token: "fixture-token",
            fetcher: async () =>
                response({ message: "API rate limit exceeded fixture-token" }, 403, {
                    "x-ratelimit-remaining": "0",
                    "x-ratelimit-reset": "1793589460",
                }),
        }).catch((e: Error) => e);
        if (!(error instanceof Error)) throw new Error("The denied request must fail");
        expect(error.message).toContain("GitHub release lookup fails with HTTP 403");
        expect(error.message).toContain("x-ratelimit-remaining=0");
        expect(error.message).toContain("API rate limit exceeded");
        expect(error.message).not.toContain("fixture-token");
        expect(error.message).not.toContain("No published release");
    });
    it("reports transport failure without claiming that no release exists", async () => {
        await expect(
            resolveReleaseTag({
                fetcher: async () => {
                    throw new Error("fixture transport");
                },
            }),
        ).rejects.toThrow("Release lookup transport failure");
    });
    it("refuses drafts, prereleases, absent publication and invalid tag output", async () => {
        for (const change of [
            { draft: true },
            { prerelease: true },
            { published_at: null },
            { tag_name: "main" },
            { tag_name: "v1.0.0\n" },
            { tag_name: "v1.0.0\nother=value" },
        ]) {
            await expect(
                resolveReleaseTag({ fetcher: async () => response({ ...published, ...change }) }),
            ).rejects.toThrow("valid published release");
        }
    });
    it("writes only a published tag to the workflow output and writes nothing after denial", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-release-lookup-"));
        try {
            for (const status of [200, 403]) {
                const output = path.join(root, `output-${status}`);
                const body =
                    status === 200 ?
                        { ...published, tag_name: "v0.9.0" }
                    :   { message: "fixture denial" };
                const preload = `globalThis.fetch=async()=>new Response(${JSON.stringify(JSON.stringify(body))},{status:${status}});`;
                const result = spawnSync(
                    process.execPath,
                    [
                        "--import",
                        `data:text/javascript,${encodeURIComponent(preload)}`,
                        fileURLToPath(
                            new URL("../../utils/resolve-release-tag.mjs", import.meta.url),
                        ),
                    ],
                    {
                        env: {
                            ...process.env,
                            GITHUB_OUTPUT: output,
                            RELEASE_REF_TYPE: "tag",
                            RELEASE_REF_NAME: "v0.9.0",
                            GH_RELEASE_TOKEN: "fixture-token",
                        },
                        encoding: "utf8",
                    },
                );
                expect(result.status).toBe(status === 200 ? 0 : 1);
                if (status === 200) expect(fs.readFileSync(output, "utf8")).toBe("tag=v0.9.0\n");
                else expect(fs.existsSync(output)).toBe(false);
                expect(result.stdout + result.stderr).not.toContain("fixture-token");
            }
        } finally {
            fs.rmSync(root, { recursive: true });
        }
    });
});
