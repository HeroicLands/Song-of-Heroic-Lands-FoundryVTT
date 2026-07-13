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
                    items: [
                        {
                            label: "Concepts",
                            items: [{ autogenerate: { directory: "concepts" } }],
                        },
                        {
                            label: "How-to",
                            items: [{ autogenerate: { directory: "how-to" } }],
                        },
                        {
                            label: "Reference",
                            items: [{ autogenerate: { directory: "reference" } }],
                        },
                        {
                            label: "Contributing",
                            items: [
                                { autogenerate: { directory: "contributing" } },
                            ],
                        },
                    ],
                },
                {
                    label: "Compendium",
                    items: [{ label: "Weapons", link: "/reference/weapons/" }],
                },
            ],
        }),
    ],
});
