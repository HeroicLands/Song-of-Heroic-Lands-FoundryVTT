---
"sohl": patch
---

**Document the Node template-render harness in the testing guide**

Add a _Asserting rendered HTML in unit tests_ section to the testing guide covering
`renderTemplateReal` — how card/dialog templates render in Node (Foundry's
`renderTemplate` is a Handlebars wrapper; cards and dialogs share the same shims),
the two usage patterns (render a template directly, or drive an action and spy the
shim), and the fidelity tiers (cards + dialogs render fully; sheet form builders
render as binding placeholders). Note the narrow exception to the logic-layer scope
so the guide stays internally consistent.

Closes #585
