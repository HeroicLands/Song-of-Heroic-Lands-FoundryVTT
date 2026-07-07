---
"sohl": patch
---

**Security:** Fix stored XSS in `ValueModifier.chatHtml` via unescaped delta names (#162).

Delta `name` and `value` fields were interpolated unescaped into the `chatHtml` string that is rendered via triple-mustache (`{{{ }}}`) in `opposed-result-card.hbs` and `standard-test-card.hbs`. A crafted delta `name` embedded in an opposed-request card's `data-scope` would be revived on the target's client and re-broadcast to all connected clients as live HTML.

Both `m.name` and `getValue(m)` are now HTML-escaped via the new pure `escapeHTML` utility added to `src/utils/helpers.ts`. Delta names/shortcodes are not validated upstream, so escaping at the source is required.
