// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Song of Heroic Lands knowledgebase (kb.heroiclands.org).
//
// Renders two in-repo Markdown roots, sectioned by audience:
//   - ../docs           → Developer section (Starlight docs)
//   - ../assets/content → Reference section (typed content collection + infoboxes)
//
// See src/content.config.ts for the collection wiring.
export default defineConfig({
    site: "https://kb.heroiclands.org",
    integrations: [
        starlight({
            title: "SoHL Knowledgebase",
            description:
                "Developer and reference documentation for the Song of Heroic Lands system.",
            sidebar: [
                {
                    label: "Developer",
                    items: [{ autogenerate: { directory: "." } }],
                },
                {
                    label: "Reference",
                    items: [{ label: "Weapons", link: "/reference/weapons/" }],
                },
            ],
        }),
    ],
});
