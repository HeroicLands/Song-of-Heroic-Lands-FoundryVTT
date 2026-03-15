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

import fs from "fs";
import crypto from "crypto";
import path from "path";
import { globSync } from "glob";
import yaml from "yaml";

const INDEX_OUTPUT_DIR = path.resolve("build/stage/packs/user-manual");
const INDEX_OUTPUT_FILE = path.join(INDEX_OUTPUT_DIR, "journal-index.json");

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

const STATS = {
    systemId: "sohl",
    systemVersion: "0.6.0",
    coreVersion: "13",
    createdTime: 0,
    modifiedTime: 0,
    lastModifiedBy: "sohlbuilder00000",
};

function makeId(namespace, value) {
    return crypto
        .createHash("sha1")
        .update(`${namespace}:${value}`)
        .digest("hex")
        .slice(0, 16);
}

function slugify(name) {
    return name
        .toLowerCase()
        .replace("'", "")
        .replace(/[^a-z0-9]+/gi, " ")
        .trim()
        .replace(/\s+|-{2,}/g, "-");
}

function cleanOutputDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function stripQuotes(value) {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }
    return trimmed;
}

function toFoundrySrcPath(srcPath) {
    const trimmed = srcPath.trim();
    if (!trimmed) return trimmed;

    if (
        /^(https?:\/\/|data:|blob:|file:|\/|#|@UUID\[)/i.test(trimmed) ||
        trimmed.startsWith("system/sohl/") ||
        trimmed.startsWith("systems/sohl/")
    ) {
        return trimmed;
    }

    const normalized = trimmed.replace(/^\.\//, "");
    return `system/sohl/${normalized}`;
}

function rewriteSrcPathsInMarkdown(markdown) {
    let rewritten = markdown;

    rewritten = rewritten.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (full, alt, srcPath) => `![${alt}](${toFoundrySrcPath(srcPath)})`,
    );

    rewritten = rewritten.replace(
        /\bsrc\s*=\s*"([^"]+)"/gi,
        (full, srcPath) => `src="${toFoundrySrcPath(srcPath)}"`,
    );
    rewritten = rewritten.replace(
        /\bsrc\s*=\s*'([^']+)'/gi,
        (full, srcPath) => `src='${toFoundrySrcPath(srcPath)}'`,
    );

    return rewritten;
}

function rewriteSrcPathsInHtml(html) {
    let rewritten = html;
    rewritten = rewritten.replace(
        /\bsrc\s*=\s*"([^"]+)"/gi,
        (full, srcPath) => `src="${toFoundrySrcPath(srcPath)}"`,
    );
    rewritten = rewritten.replace(
        /\bsrc\s*=\s*'([^']+)'/gi,
        (full, srcPath) => `src='${toFoundrySrcPath(srcPath)}'`,
    );
    return rewritten;
}

function parseFrontmatter(frontmatterText) {
    const parsed = yaml.parse(frontmatterText) || {};
    const result = {
        ...parsed,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        foundry:
            parsed.foundry && typeof parsed.foundry === "object" ?
                parsed.foundry
            :   {},
    };

    const orderValue = result.order ?? result.sort;
    if (typeof orderValue === "string" || typeof orderValue === "number") {
        const parsed = Number(orderValue);
        result.order = Number.isFinite(parsed) ? parsed : undefined;
    }

    return result;
}

function parseJournalPages(markdown, defaultPageName) {
    const lines = markdown.split("\n");
    const pages = [];
    const beforeFirstH1Lines = [];
    let currentPage = null;
    let inCodeBlock = false;

    const closeCurrentPage = () => {
        if (!currentPage) return;
        pages.push({
            name: currentPage.name,
            id: currentPage.id,
            type: "text",
            markdown: currentPage.lines.join("\n").trim(),
        });
        currentPage = null;
    };

    for (const line of lines) {
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
        }

        const h1Match =
            !inCodeBlock ?
                line.match(/^\s*#\s+(.+?)\s*#*\s*$/)
            :   null;
        if (h1Match) {
            closeCurrentPage();
            const rawHeading = h1Match[1].trim();
            const headingIdMatch = rawHeading.match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
            const name =
                (headingIdMatch ? headingIdMatch[1] : rawHeading).trim() ||
                defaultPageName;
            const headingId = headingIdMatch?.[2]?.trim();

            currentPage = {
                name,
                id: headingId || undefined,
                lines: [],
            };
            continue;
        }

        if (currentPage) {
            currentPage.lines.push(line);
        } else {
            beforeFirstH1Lines.push(line);
        }
    }

    closeCurrentPage();

    const overviewMarkdown = beforeFirstH1Lines.join("\n").trim();
    if (overviewMarkdown) {
        pages.unshift({
            name: "Overview",
            type: "text",
            markdown: overviewMarkdown,
        });
    }

    if (!pages.length) {
        pages.push({
            name: defaultPageName,
            type: "text",
            markdown: "",
        });
    }

    return pages;
}

function rewriteInternalLinks(markdown, sourcePath, slugByRelativePath) {
    return markdown;
}

function formatInline(text) {
    const imagePlaceholders = [];
    let normalized = text.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (full, alt, srcPath) => {
            const placeholder = `__SOHL_IMG_${imagePlaceholders.length}__`;
            imagePlaceholders.push(
                `<img alt="${escapeHtml(alt)}" src="${escapeHtml(toFoundrySrcPath(srcPath))}" />`,
            );
            return placeholder;
        },
    );

    let formatted = escapeHtml(normalized);
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
    formatted = formatted.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2">$1</a>',
    );

    for (let index = 0; index < imagePlaceholders.length; index += 1) {
        formatted = formatted.replace(
            `__SOHL_IMG_${index}__`,
            imagePlaceholders[index],
        );
    }

    return formatted;
}

function markdownToHtml(markdown) {
    const lines = markdown.split("\n");
    const html = [];
    let inCodeBlock = false;
    let listType = null;
    let paragraph = [];

    const flushParagraph = () => {
        if (!paragraph.length) return;
        html.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
        paragraph = [];
    };

    const closeList = () => {
        if (!listType) return;
        html.push(listType === "ol" ? "</ol>" : "</ul>");
        listType = null;
    };

    for (const line of lines) {
        if (line.trim().startsWith("```")) {
            flushParagraph();
            closeList();
            if (!inCodeBlock) {
                html.push("<pre><code>");
                inCodeBlock = true;
            } else {
                html.push("</code></pre>");
                inCodeBlock = false;
            }
            continue;
        }

        if (inCodeBlock) {
            html.push(escapeHtml(line));
            continue;
        }

        if (!line.trim()) {
            flushParagraph();
            closeList();
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            flushParagraph();
            closeList();
            const level = heading[1].length;
            html.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
            continue;
        }

        const orderedItem = line.match(/^\d+\.\s+(.+)$/);
        if (orderedItem) {
            flushParagraph();
            if (listType !== "ol") {
                closeList();
                html.push("<ol>");
                listType = "ol";
            }
            html.push(`<li>${formatInline(orderedItem[1])}</li>`);
            continue;
        }

        const unorderedItem = line.match(/^[-*]\s+(.+)$/);
        if (unorderedItem) {
            flushParagraph();
            if (listType !== "ul") {
                closeList();
                html.push("<ul>");
                listType = "ul";
            }
            html.push(`<li>${formatInline(unorderedItem[1])}</li>`);
            continue;
        }

        paragraph.push(line.trim());
    }

    flushParagraph();
    closeList();

    return html.join("\n");
}

function buildJournalDocument(entry) {
    const journalId = entry.foundry.id || makeId("journal-entry", entry.slug);
    const sourceHash = crypto
        .createHash("sha1")
        .update(entry.contentMarkdown)
        .digest("hex");

    const pages = entry.pages.map((page, index) => {
        const pageId = makeId(
            "journal-page",
            `${entry.slug}:${index}:${page.name}:${page.type}`,
        );
        const resolvedPageId = page.id || pageId;
        return {
            _id: resolvedPageId,
            name: page.name,
            type: "text",
            title: {
                show: true,
                level: 1,
            },
            text: {
                format: 1,
                content: page.html,
            },
            _key: `!journal.pages!${journalId}.${resolvedPageId}`,
        };
    });

    return {
        name: entry.title,
        pages,
        folder: entry.foundry.folderId,
        sort: entry.order,
        ownership: entry.foundry.ownership || { default: 0 },
        flags: entry.foundry.flags || {},
        _id: journalId,
        _stats: {
            ...STATS,
            coreVersion: entry.foundry.coreVersion || STATS.coreVersion,
        },
        _key: `!journal!${journalId}`,
    };
}

function buildEntry(filePath) {
    const source = fs.readFileSync(filePath, "utf8");
    const match = source.match(FRONTMATTER_RE);
    if (!match) {
        return {
            skipReason: "Missing front matter",
        };
    }

    const frontmatter = parseFrontmatter(match[1]);
    for (const field of ["title", "slug"]) {
        if (frontmatter[field] === undefined || frontmatter[field] === "") {
            return {
                skipReason: `Missing required front matter field: ${field}`,
            };
        }
    }

    if (frontmatter.order === undefined) {
        return {
            skipReason: "Missing required front matter field: order (or sort)",
        };
    }

    if (!frontmatter.foundry?.folderId) {
        return {
            skipReason: "Missing required front matter field: foundry.folderId",
        };
    }

    const body = source.slice(match[0].length).trim();
    const relativePath = path
        .relative(process.cwd(), filePath)
        .replace(/\\/g, "/");

    return {
        title: frontmatter.title,
        slug: frontmatter.slug,
        order: frontmatter.order,
        category: frontmatter.category ?? "User Guide",
        tags: frontmatter.tags,
        foundry: {
            id: frontmatter.foundry.id,
            folderId: frontmatter.foundry.folderId,
            permissions: frontmatter.foundry.permissions ?? "default",
            ownership: frontmatter.foundry.ownership,
            flags: frontmatter.foundry.flags,
            coreVersion: frontmatter.foundry.coreVersion,
        },
        sourcePath: relativePath,
        wordCount: body ? body.split(/\s+/).length : 0,
        contentMarkdown: body,
        journalRef: `JournalEntry.${frontmatter.slug}`,
    };
}

export class Journals {
    static id = "journals";

    constructor(dataDir, outputDir) {
        Object.defineProperty(this, "dataDir", {
            value: dataDir,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: outputDir,
            writable: false,
        });
    }

    async compile() {
        const sourceGlob = path
            .join(this.dataDir, "**/*.md")
            .replace(/\\/g, "/");

        const files = globSync(sourceGlob, {
            ignore: ["**/README.md"],
        }).sort((a, b) => a.localeCompare(b));

        const entries = [];
        const skipped = [];

        for (const file of files) {
            const entry = buildEntry(path.resolve(file));
            if (entry.skipReason) {
                skipped.push({ file, reason: entry.skipReason });
                continue;
            }
            entries.push(entry);
        }

        entries.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

        const slugByRelativePath = new Map(
            entries.map((entry) => [entry.sourcePath, entry.slug]),
        );

        for (const entry of entries) {
            let pages;
            try {
                pages = parseJournalPages(entry.contentMarkdown, entry.title);
            } catch (error) {
                skipped.push({ file: entry.sourcePath, reason: error.message });
                entry.skipGenerated = true;
                continue;
            }

            for (const page of pages) {
                if (page.type !== "text") continue;
                const rewrittenMarkdown = rewriteInternalLinks(
                    page.markdown,
                    entry.sourcePath,
                    slugByRelativePath,
                );
                page.markdown = rewriteSrcPathsInMarkdown(rewrittenMarkdown);
                page.html = rewriteSrcPathsInHtml(markdownToHtml(page.markdown));
            }

            entry.pages = pages;
        }

        const generatedEntries = entries.filter((entry) => !entry.skipGenerated);
        const generatedDocs = generatedEntries.map((entry) => ({
            entry,
            doc: buildJournalDocument(entry),
        }));

        cleanOutputDir(this.outputDir);

        for (const generatedDoc of generatedDocs) {
            const baseName = generatedDoc.entry.slug || slugify(generatedDoc.doc.name);
            const filename = `${baseName}_${generatedDoc.doc._id}.json`;
            fs.writeFileSync(
                path.join(this.outputDir, filename),
                `${JSON.stringify(generatedDoc.doc, null, 2)}\n`,
                "utf8",
            );
        }

        const output = {
            generatedAt: new Date().toISOString(),
            sourceGlob,
            entryCount: generatedEntries.length,
            folderCount: new Set(
                generatedEntries.map((entry) => entry.foundry.folderId),
            ).size,
            skippedCount: skipped.length,
            entries: generatedEntries,
            skipped,
            packSourceDir: path
                .relative(process.cwd(), this.outputDir)
                .replace(/\\/g, "/"),
        };

        fs.mkdirSync(INDEX_OUTPUT_DIR, { recursive: true });
        fs.writeFileSync(
            INDEX_OUTPUT_FILE,
            `${JSON.stringify(output, null, 2)}\n`,
            "utf8",
        );

        console.log(
            `✅ Generated ${INDEX_OUTPUT_FILE} and ${this.outputDir} with ${generatedEntries.length} entries (${skipped.length} skipped).`,
        );
    }
}
