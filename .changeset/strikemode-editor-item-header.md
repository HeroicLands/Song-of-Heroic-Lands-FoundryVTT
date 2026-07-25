---
"sohl": patch
---

**Fix: make the Strike Mode editor header read like an Item sheet (#685)**

The Strike Mode editor's identity header is now a vertical stack modeled on the
SoHL item-sheet header — the **name large**, the **shortcode small** beneath it,
and the **type medium** beneath that — instead of three side-by-side fields. No
image, no tabs; the General / Attack / Impact / Defense fieldsets follow below as
before. The item-sheet header styling lives under the `.sohl.sheet` selector,
which this editor's frame does not carry, so the look is replicated in the
editor's own `strike-mode-config` stylesheet.
