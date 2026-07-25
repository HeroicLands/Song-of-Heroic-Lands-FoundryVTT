---
"sohl": patch
---

**Polish Skill action labels and the success-test roll-visibility dropdown**

- The `successTest` action now reads **Success Test** (was "Test") and
  `toggleImproveFlag` reads **Toggle Improve Flag** (was "Toggle Improvement
  Flag").
- The separate `setImproveFlag` / `unsetImproveFlag` intrinsic actions are now
  hidden from the context menu (`visible: "false"`, `HIDDEN` group); the single
  `toggleImproveFlag` entry supersedes them. Both remain available as executors.
- The success-test **Roll Visibility** dropdown now labels its options with
  Foundry's localized `CHAT.MODES.*` chat-visibility strings and submits the
  stored roll-mode value (e.g. `"publicroll"`) instead of the enum key, so the
  selection round-trips correctly.

Closes #688
