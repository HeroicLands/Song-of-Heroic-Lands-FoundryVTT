---
type: doc
subType: reference
name:
  full: SoHL Developer & API Documentation
  aliases: []
shortcode: devdocs
pack: none
sohl:
  kbcat: devdocs
---

# SoHL Developer & API Documentation

The entry point for working **on** the Song of Heroic Lands (SoHL) system — for developers extending the API, contributors changing core, and anyone who needs a mental model of the code.

This documentation is **developer- and API-facing only**. Player- and GM-facing rules and play guides are not duplicated here — they live on the project site (see [Player & GM rules](#player--gm-rules-external) below).

Every page below carries `sohl.kbcat: devdocs`, and each table is generated from the content index, so a page is listed by being written rather than by being added here.

## Start here

1. [[doc-architecture|Architecture Overview]] — the system's mental model and a map of the `src/` tree. **Read this first.**
2. [[doc-gettingstarted|Getting Started]] — environment setup, codebase tour, and your first change.
3. [API Reference](/sohl/api/) — generated TypeDoc, with a sidebar grouped to mirror the source: Core / Documents / Domain / Utility.

> **Security-critical change?** If you are touching serialization, HTML
> rendering, actions/executors, or chat/cross-client flows, read
> [[doc-securitymodel|Security Model & Guardrails]] **first**. Its
> keystone rule — _data carries a **reference** to code (a `__kind` tag, a method
> name, a Macro UUID), never source; functions are never serialized_ — is the
> system's top security constraint.

## Concepts

Design and rationale — how and why the system is built the way it is.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Page",
       description  AS "Description"
FROM notes
WHERE type = 'doc'
  AND sohl.kbcat = 'devdocs'
  AND file.folder = 'Dev_Docs/concepts'
ORDER BY name.full COLLATE NOCASE
```

## How-to

Task-oriented guides for getting something done.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Page",
       description  AS "Description"
FROM notes
WHERE type = 'doc'
  AND sohl.kbcat = 'devdocs'
  AND file.folder = 'Dev_Docs/how-to'
ORDER BY name.full COLLATE NOCASE
```

## Content Creator

Authoring the content notes in `assets/content/` that compile into compendium documents — for the person writing notes rather than changing the system. Start with [[doc-contentcreator|Content Creator]], the section's own introduction.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Page",
       description  AS "Description"
FROM notes
WHERE type = 'doc'
  AND sohl.kbcat = 'devdocs'
  AND file.folder = 'Dev_Docs/content-creator'
ORDER BY name.full COLLATE NOCASE
```

## Reference

Contracts, catalogs, and specifications.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Page",
       description  AS "Description"
FROM notes
WHERE type = 'doc'
  AND sohl.kbcat = 'devdocs'
  AND file.folder = 'Dev_Docs/reference'
ORDER BY name.full COLLATE NOCASE
```

## Contributing

How to contribute: standards, the development workflow, and maintainer/project-meta.

```sql
SELECT address.slug AS _ref,
       name.full    AS "Page",
       description  AS "Description"
FROM notes
WHERE type = 'doc'
  AND sohl.kbcat = 'devdocs'
  AND file.folder = 'Dev_Docs/contributing'
ORDER BY name.full COLLATE NOCASE
```

## Player & GM rules (external)

Rules and play guides are content of their own, published beside these pages:

- [SoHL on heroiclands.org](https://www.heroiclands.org/projects/song-of-heroic-lands/)
- [[doc-userguide|User Guide]]
- [[doc-rulesintro|Rules]]
- [[doc-quickstartug|Quickstart]]
- [[doc-charcreationug|Character Creation]]
