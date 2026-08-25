/**
 * This repository's Prettier configuration — the shared one it already uses.
 *
 * The values were spelled out here and are now declared once in
 * `@heroiclands/package-build`, which every content repository in the project
 * runs through `content-build format`. They were already identical; stating
 * them in four places was four chances to drift, which is what #20 exists to
 * remove. This file remains so that an editor's format-on-save agrees with the
 * lint chain — Prettier's editor integrations read a config file rather than
 * asking the toolchain.
 *
 * Two pieces of rationale that lived in the removed body, kept because they are
 * about *this* repository:
 *
 * - **Markdown indents at 2, not the global 4.** `assets/content/` is authored
 *   content whose YAML frontmatter is nested lists; at tabWidth 4 every note
 *   reindents away from the form it was written in. Two also matches the other
 *   repositories holding this content, so a note moves between them unchanged.
 *   (That override is part of the shared configuration for exactly this
 *   reason.) Prose is untouched either way — `proseWrap` defaults to
 *   "preserve", so Prettier never rewraps a paragraph.
 * - **There is no `**\/*.hbs` override.** One used to claim the templates
 *   "parse cleanly with the Angular HTML parser"; they do not — that parser
 *   fails on `{{!-- … --}}`, the comment form of every template's mandated
 *   licence header. The claim went unnoticed because `.prettierignore` excludes
 *   the templates, so the override never ran. See that file for what formatting
 *   them would take.
 *
 * @type {import("prettier").Config}
 */
export { default } from "@heroiclands/package-build/prettier";
