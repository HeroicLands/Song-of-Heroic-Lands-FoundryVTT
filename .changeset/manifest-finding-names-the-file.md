---
"sohl": patch
---

**An unusable link manifest is now reported by file, not by package name**
(#1673)

`check-content-links` reported a stale or unreadable cross-package manifest as
`  thalorna: manifest version 1, expected one of 4, 5` — naming the package,
while the comment above that code said the report existed so the failure would
point "at the file at fault". It now does:

```text
assets/manifests/thalorna.json: error: unusable link manifest: manifest version 1, expected one of 4, 5
```

This was the one finding in the lint chain still emitted as prose after #1668.
The path needed no new information — `loadForeignManifests` derives each package
name from the filename — so the manifests directory is now stated once and
shared by the load and the report, which keeps the two from disagreeing about
where it looked.

Exit code and failure condition are unchanged.
