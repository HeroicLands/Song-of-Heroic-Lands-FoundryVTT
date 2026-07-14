import type { Loader } from "astro/loaders";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import matter from "gray-matter";
import apiSymbols from "../api-symbols.json";

/** Base URL of the generated API reference (see #427). */
const API_BASE = "https://api.heroiclands.org/latest";
/** GitHub blob base for in-repo source links. */
const REPO_BLOB =
    "https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/blob/main";

/** Resolve a `{@link}` target to its API page URL, if it names a documented symbol. */
function apiUrl(target: string): string | undefined {
    const url = (apiSymbols as Record<string, string>)[target];
    return url ? `${API_BASE}/${url}` : undefined;
}

/** Recursively collect every `.md` file under `dir`. */
async function walk(dir: string): Promise<string[]> {
    const out: string[] = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...(await walk(full)));
        else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
    }
    return out;
}

/** Map a docs entry id to its KB route (`concepts/architecture` → `/concepts/architecture/`). */
function toRoute(entryId: string): string {
    const t = entryId
        .replace(/(^|\/)README$/i, "$1index")
        .replace(/(^|\/)index$/i, "$1");
    return t === "" ? "/" : `/${t.replace(/\/$/, "")}/`;
}

/**
 * Rewrite in-repo Markdown for the web target:
 *   - `{@link Symbol}` TypeDoc refs → a link to the symbol's API page (or, if it
 *     names no documented symbol — e.g. a syntax example — a code span);
 *   - relative `*.md` links → the corresponding KB route (resolved from `id`);
 *   - other relative in-repo links (`../../src/*.ts`, `package.json`, …) → the
 *     GitHub blob URL.
 * Absolute/external links and already-resolved routes are left alone.
 */
function rewriteForWeb(body: string, id: string): string {
    const dir = id === "index" ? "" : path.posix.dirname(id);
    return body
        .replace(
            /\{@link\s+([^}\s|]+)(?:[\s|]+([^}]+?))?\}/g,
            (_m, target, label) => {
                const text = (label ?? target.split(".").pop()).trim();
                const url = apiUrl(target.trim());
                return url ? `[${text}](${url})` : `\`${text}\``;
            },
        )
        .replace(
            /\]\((?!https?:|\/|#)([^)\s]+?\.md)(#[^)]*)?\)/g,
            (_m, rel, anchor = "") => {
                const targetId = path.posix
                    .normalize(path.posix.join(dir, rel))
                    .replace(/\.md$/i, "");
                return `](${toRoute(targetId)}${anchor})`;
            },
        )
        .replace(/\]\((?!https?:|\/|#)(\.\.?\/[^)\s]+)\)/g, (_m, rel) => {
            const repoPath = path.posix
                .normalize(path.posix.join("docs", dir, rel))
                .replace(/^(\.\.\/)+/, "");
            return `](${REPO_BLOB}/${repoPath})`;
        });
}

/** Title from frontmatter, else the first `# H1`, else the id. */
function deriveTitle(
    fm: Record<string, unknown>,
    body: string,
    id: string,
): string {
    if (typeof fm.title === "string" && fm.title.trim()) return fm.title.trim();
    const h1 = /^#\s+(.+?)\s*$/m.exec(body);
    if (h1) return h1[1].replace(/\{@link\s+[^}]*\}/g, "").trim();
    return id;
}

/**
 * Astro content loader for the repo's `docs/` tree.
 *
 * Most pages carry no `title:` frontmatter (they open with an `# H1`), which the
 * Starlight docs schema requires — so this derives the title from that heading
 * and passes only the Starlight-known fields, ignoring repo-specific frontmatter
 * keys the docs schema would reject. `README.md` maps to the section index.
 *
 * @param base - Path to the docs root, relative to the Astro project root.
 */
export function repoDocs({ base }: { base: string }): Loader {
    return {
        name: "repo-docs",
        async load({ store, parseData, renderMarkdown, generateDigest, config }) {
            const root = path.resolve(fileURLToPath(config.root), base);
            store.clear();
            for (const file of await walk(root)) {
                const raw = await readFile(file, "utf8");
                const { data: fm, content: body } = matter(raw);

                let id = path
                    .relative(root, file)
                    .replace(/\\/g, "/")
                    .replace(/\.md$/, "");
                id = id.replace(/(^|\/)README$/i, "$1index").replace(/\/index$/, "");
                if (id === "" || id === "index") id = "index";

                const data = await parseData({
                    id,
                    data: {
                        title: deriveTitle(fm, body, id),
                        ...(typeof fm.description === "string"
                            ? { description: fm.description }
                            : {}),
                    },
                });
                // Starlight renders the title as the page heading, so drop the
                // leading `# H1` from the body to avoid rendering it twice, then
                // rewrite in-repo links for the web target.
                const bodyForRender = rewriteForWeb(
                    body.replace(/^\s*#\s+.*$\r?\n?/m, ""),
                    id,
                );
                const rendered = await renderMarkdown(bodyForRender);
                store.set({
                    id,
                    data,
                    body: bodyForRender,
                    // Starlight derives sidebar routes from a docs-collection-relative
                    // filePath; present these as if they lived in the canonical
                    // src/content/docs/ location so route computation works.
                    filePath: `src/content/docs/${id}.md`,
                    rendered,
                    digest: generateDigest(raw),
                });
            }
        },
    };
}
