---
"sohl": minor
---

**Body Part and Body Location editor sheets**

Add two small auto-saving `ApplicationV2` editors for a Being's anatomy, patterned
on the strike-mode editor: an identity header (editable name + shortcode) and
`submitOnChange` persistence, so every field change saves on blur — there is no
Save button. Each is opened from the Combat tab's Body Structure tree via a
per-row **⋮ → Edit** context menu.

- **Body Part editor** (#721) edits a part's name, shortcode, functional roles,
  combat area (the random-selection weight), permanent impairment, and the
  can-hold-item / permanently-unusable flags. The part's child locations, held
  item, and legacy flags are preserved untouched.
- **Body Location editor** (#722) edits a location's name, shortcode, probability
  weight, shock, bleeding susceptibility, amputability, natural protection per
  impact aspect (blunt / edged / piercing / fire), and the stumble / fumble flags.

A changed shortcode is validated for uniqueness — among the being's other parts,
or the part's other locations — and a rejected change keeps the current shortcode
with a warning. All writes rewrite the whole `system.body.structure.parts` array
rather than a single element by index, avoiding the array-corruption trap.

Closes #721
Closes #722
