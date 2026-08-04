---
"sohl": patch
---

**Add a Security Model & Guardrails developer document**

New `docs/concepts/security-model.md` captures the system's threat model and the
standing security guardrails for developers: reference code rather
than compiling it from data (the `__kind` registry, intrinsic method names,
Foundry macros), why regex "sandboxes" and client-only signatures are not boundaries,
safe serialization, XSS/HTML rules, cross-client authorization vs. client-side
gating, ReDoS, and a reviewer red-flag checklist. Linked from the docs index, and
the contributing standards gain a matching non-negotiable rule.
