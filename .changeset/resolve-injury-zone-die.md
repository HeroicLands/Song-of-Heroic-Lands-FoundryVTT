---
"sohl": minor
---

**Resolve Injury: Zone-Number + Zone-Die hit location targeting**

The Resolve Injury action now determines its hit location by **Zone-Number aiming
with a Zone Die** instead of a body part plus a spread radius, matching the body
model's zone tier.

**Dialog.** "Target Body Part" becomes **Target ZN** (a Zone Number, default 1)
and "Spread" becomes **Zone Die**. The **Location** dropdown defaults to
"(derive from Target ZN + ZD)"; Target ZN and Zone Die are enabled and required
only while that derive option is selected, and disabled when a specific location
is chosen. The Aspect dropdown now shows localized labels instead of the raw
value.

**Derivation.** `Hit ZN = (Target ZN − 1) + a 1..ZD roll`; the zone owning that
number yields a weighted part, then a weighted location within it. A Hit ZN beyond
the body's zone range is a **miss** — a no-impact card and no recorded Trauma. An
incorporeal being (empty body) cannot take a physical injury and the action aborts
with a notice.

**Result card.** When the location was derived, the card shows the aim trace
(Target ZN, `d<ZD>`, the rolled value, the final Hit ZN, and the zone — or
"Missed"); when the location was set by hand, it shows a "Location overridden by
player" notice.

**Combat.** An aimed blow's impact card maps the aimed body part onto its zone's
number so combat-driven injuries resolve automatically under the new model.

**Removed the "Use Zone Die" world setting** — strike-mode scatter is now always
presented as a Zone Die (`d<n>`) on the Combat tab, the strike-mode editor, and
the print sheet.

Closes #828
