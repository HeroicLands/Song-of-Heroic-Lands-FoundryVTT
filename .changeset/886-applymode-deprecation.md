---
"sohl": patch
---

**Stop calling the deprecated `ChatMessage.applyRollMode`**

Every roll logged a Foundry v14 deprecation warning
(`ChatMessage.applyRollMode is deprecated in favor of ChatMessage.applyMode`,
removed in v16). The `fvttApplyRollMode` shim now calls `ChatMessage.applyMode`.

Because v14 also switched from the legacy roll-mode vocabulary
(`publicroll`/`gmroll`/`selfroll`/`blindroll`) to message-mode keys
(`public`/`gm`/`self`/`blind`), a Foundry-free `toMessageMode` translation was
added alongside `CHAT_MODE_LABEL_BY_ROLL_MODE` in `constants.ts`. SoHL keeps
storing the legacy values (they are serialized in results and back stable lang
keys); the mapping happens only at the Foundry boundary, with the default
(system) mode mapping to `undefined` so `applyMode` uses the client's configured
default.

Closes #886
