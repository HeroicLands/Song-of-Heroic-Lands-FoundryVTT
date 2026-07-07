---
"sohl": patch
---

**Security:** Fix stored XSS in `DomainManagerApp.promptForEntry` (#160).

Registry fields (`label`, `description`, `img`, `iconFAClass`, `shortcode`, `sort`) were interpolated unescaped into the `DialogV2.prompt` content string. The domain registry is plantable via the `sohl.domains` world setting and module registration, and the dialog runs in GM (full-privilege) context.

All registry field values are now passed through `foundry.utils.escapeHTML` before interpolation. The sibling `domain-manager.hbs` list template already used auto-escaped double-stash and is unaffected.
