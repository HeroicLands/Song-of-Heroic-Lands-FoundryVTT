---
"sohl": patch
---

**API site: fix the nav dropdown hover gap and add API/KB links (#442)**

The brand masthead's **Projects** dropdown closed before an item could be clicked:
the menu sits `0.5rem` below the trigger, and that gap belonged to no hoverable
element, so moving the cursor down to the menu dropped `:hover` and hid it. A
transparent full-width `.dropdown-menu::before` now bridges the gap, so the pointer
stays within `.nav-dropdown` on the way to the menu.

The dropdown also gains **API Documentation** (api.heroiclands.org) and
**KnowledgeBase** (kb.heroiclands.org) links, cross-linking the three properties.

This is the API-site half (the `typedoc-plugin-brand-chrome` static nav); the same
fix for www and the KB lands in the shared Hugo theme.
