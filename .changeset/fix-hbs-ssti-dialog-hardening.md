---
"sohl": patch
---

**Security:** Fix Handlebars SSTI and XSS in dialog HTML builders (#159, #164).

**`SohlItem._moveQtyDialog` (#159):** Item names, source/target container names, and quantity were interpolated directly into Handlebars template source before compilation, allowing SSTI (proto-chain code execution) via crafted names and enabling stored XSS. Names are now placed in the Handlebars data context (`{{itemName}}`, auto-escaped) and compiled from a static template string. The `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags are removed.

**Defense-in-depth hardening (#164):**

- `SohlDataModel._addChoiceArrayItem`: choice labels and values from `data-choices` are now HTML-escaped with `Handlebars.escapeExpression` rather than concatenated into a template source string; the `Handlebars.compile` + `allowProto*` step is eliminated.
- `selectArray` Handlebars helper: `option.value` is now escaped with `Handlebars.escapeExpression` to match the existing escaping on `option.label`.
- `FoundryHelpers.toHTMLWithContent`: removed `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags; plain-object contexts do not need proto-chain access.
