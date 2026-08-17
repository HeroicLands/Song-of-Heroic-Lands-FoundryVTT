/** @type {import("prettier").Config} */
export default {
    // Core style
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    quoteProps: "as-needed",
    jsxSingleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    // Keep the closing `>` of a multi-line tag on the same line as the last attr.
    bracketSameLine: true,
    singleAttributePerLine: false,
    arrowParens: "always",
    endOfLine: "lf",
    // Opt into the newer, flatter ternary formatting.
    experimentalTernaries: true,
    overrides: [
        {
            // Handlebars templates parse cleanly with the Angular HTML parser.
            files: "**/*.hbs",
            options: { parser: "angular" },
        },
        {
            // Markdown indents at 2, not the global 4. `assets/content/` is
            // authored content whose YAML frontmatter is nested lists; at
            // tabWidth 4 every note in the tree reindents away from the form it
            // was written in, and 1441 of 1442 notes differed from their source
            // on nothing else. Two also matches the other repositories that
            // hold this content, so a note can move between them unchanged.
            //
            // Prose is untouched either way — `proseWrap` defaults to
            // "preserve", so Prettier never rewraps a paragraph here.
            files: "**/*.md",
            options: { tabWidth: 2 },
        },
    ],
};
