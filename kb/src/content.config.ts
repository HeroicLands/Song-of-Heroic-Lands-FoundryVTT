import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { repoDocs } from "./loaders/repo-docs";

/**
 * Developer section — the repo's `docs/` tree rendered as Starlight docs.
 *
 * Most `docs/` pages carry no `title:` frontmatter (they open with an `# H1`),
 * so a custom loader derives the title from that heading; everything else is a
 * standard Starlight docs collection.
 */
const docs = defineCollection({
    loader: repoDocs({ base: "../docs" }),
    schema: docsSchema(),
});

/**
 * Reference section — the authoritative `assets/content/` tree.
 *
 * Loaded whole and routed by frontmatter `type` at query time (a file is a
 * weapon because `type: weapongear`, not because of its folder). The schema
 * validates the common frontmatter every entry shares; type-specific data under
 * `sohl` is validated per type where it is consumed (see `schema/weapon.ts`).
 */
const content = defineCollection({
    loader: glob({ base: "../assets/content", pattern: "**/*.md" }),
    schema: z.object({
        id: z.string(),
        type: z.string(),
        package: z.string(),
        slug: z.string().optional(),
        shortcode: z.string().optional(),
        img: z.string().optional(),
        name: z.object({ full: z.string() }).passthrough(),
        description: z.string().optional().default(""),
        folder: z.string().nullable().optional(),
        sohl: z.record(z.unknown()).optional().default({}),
    }),
});

export const collections = { docs, content };
