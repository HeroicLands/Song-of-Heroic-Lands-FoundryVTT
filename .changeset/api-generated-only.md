---
"sohl": patch
---

**Docs: make api.heroiclands.org strictly the generated symbol reference (#427)**

Remove the hand-written guide tree (concepts / how-to / reference / contributing)
from the API docs build — that prose now lives in the knowledgebase
(kb.heroiclands.org, #422). Dropped `projectDocuments` from both TypeDoc configs,
and added `alwaysCreateEntryPointModule` so the single `sohl` entry module is
still emitted — preserving the `sohl`-rooted symbol paths and `{@link sohl.*}`
resolution that previously depended on the projectDocument keeping the module
un-collapsed. The API landing (`api-home.md`) now points developers to the
knowledgebase for the guides.
