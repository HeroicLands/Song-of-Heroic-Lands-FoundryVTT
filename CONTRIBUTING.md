# Contributing to Song of Heroic Lands (SoHL)

Thank you for your interest in contributing to _Song of Heroic Lands_.

# System Development

If you are interested in contributing directly to the _Song of Heroic Lands_
system codebase, please review the **System Development guide**, which holds the
rules of development in this repo. It is published on the website and mirrored
in-repo:

- Website: <https://www.heroiclands.org/sohl/doc-systemdevelopment/>
- In-repo: [assets/content/Dev_Docs/contributing/system-development.md](assets/content/Dev_Docs/contributing/system-development.md)

# Writing Modules

If you are interested in developing a module integrating with or extending the
capabilities of _Song of Heroic Lands_, please review the **Module developer
guide**, which provides guidance on standard methods to extend the functionality
of the system with a module. It is published on the website and mirrored in-repo:

- Website: <https://www.heroiclands.org/sohl/doc-moduledevelopment/>
- In-repo: [assets/content/Dev_Docs/contributing/module-development.md](assets/content/Dev_Docs/contributing/module-development.md)

# Macro or Actions developers

If you are interested in writing **Script Action** functions or **Foundry VTT
Macros** that utilize the capabilities of the system, please review the **Macros
and Actions guide**. It is published on the website and mirrored in-repo:

- Website: <https://www.heroiclands.org/sohl/doc-macrosandactions/>
- In-repo: [assets/content/Dev_Docs/concepts/macros-and-actions.md](assets/content/Dev_Docs/concepts/macros-and-actions.md)

# Browse the API

If you simply want a more detailed look at the available public API, it is
publicly available here:

- [API Reference](https://www.heroiclands.org/sohl/api/)

## Pull request checks

A pull request whose title starts with `WIP:` runs the light checks. An existing
required check runs a short guard and fails, blocking merges while the expensive
steps stay skipped. Remove the prefix with `earl pr ready`; it starts fresh
required checks before scheduling a merge. Changing the title by hand does not
start those checks. Main, release and manual runs keep their existing checks.

Check the workflow gating locally with `node --test utils/wip-workflows.test.mjs`.

The light lint runner reads the tasks from `package.json` at runtime, so static
guards added to `lint` also run on WIP pull requests. Full content analysis and
TypeScript compilation stay in the build job. List the selected tasks with
`node utils/light-ci.mjs --list`.
