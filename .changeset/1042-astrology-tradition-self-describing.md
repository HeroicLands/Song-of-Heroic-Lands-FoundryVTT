---
"sohl": minor
---

**Astrology tradition files are now self-describing (top-level `shortcode`)**

An astrology **tradition** data file (e.g. the shipped `astrokyklos.json`) now carries
its own identity instead of being wrapped in an outer object key:

```json
{ "shortcode": "astrokyklos", "label": "…", "signs": [ … ] }
```

- The reader (`validateTraditions`) consumes a **single** self-describing tradition
  object or an **array** of them, keying each by its own `shortcode`. The former
  map-of-`{ key: tradition }` wrapper is gone.
- The system seeds the shipped built-in tradition into `sohl.astrologyRegistry` at
  init, validating once at registration rather than validating twice.
- Modules and GM imports use the same self-describing shape:
  `sohl.astrologyRegistry.register(traditionJson)` accepts one tradition or an array.

Closes #1042
