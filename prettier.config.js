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
    ],
};
