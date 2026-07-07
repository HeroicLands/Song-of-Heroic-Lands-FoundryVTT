---
"sohl": patch
---

**Bug fix:** `SohlSpeaker._toChatWithContent` now correctly awaits `toHTMLWithContent`.

The inline-content chat path was assigning a `Promise` to `messageData.content` instead of the resolved HTML string, causing chat messages to render as `[object Promise]` or empty. Added `await` to match the sibling `_toChatWithTemplate` path.
