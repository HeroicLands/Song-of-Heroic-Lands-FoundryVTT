// markdownlint — the shared rule set, applied by `content-build markdown`.
//
// The rules live in `@heroiclands/package-build`, so every content repository
// checks the same things; the shared configuration supplies the rule set,
// `**/*.md` as the glob, `gitignore: true` (which covers the generated
// `build/` tree), and the `CHANGELOG.md` exclusion — that file is regenerated
// by `changeset version` in every repository here, so linting it reports on
// the generator. Nothing about this repository's layout needs adding to it.
import shared from "@heroiclands/package-build/markdownlint";

export default shared;
