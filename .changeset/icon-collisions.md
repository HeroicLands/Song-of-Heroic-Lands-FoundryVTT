---
"sohl": patch
---

**Action icons** — unrelated actions no longer share a glyph (#1124).

The generated Icon Legend put every action icon side by side for the first time
and showed several unrelated mechanics landing on the same one, so the glyph
stopped identifying the action:

| Was              | Action                                 | Now                     |
| ---------------- | -------------------------------------- | ----------------------- |
| `fa-heart-pulse` | Arm Healing Check / Arm Recovery Check | `fa-bed-pulse`          |
| `fa-heart-pulse` | Course Test                            | `ginf-heart-beats`      |
| `fa-skull`       | Resist the Pall                        | `fa-heart-circle-bolt`  |
| `fa-skull`       | Pall Recovery Test                     | `fa-heart-circle-check` |
| `fa-bullseye`    | Calculate Impact                       | `fa-burst`              |
| `fa-star`        | Improve with SDR                       | `fa-arrow-trend-up`     |

Where two actions are two halves of one flow the shared glyph is kept on
purpose — Request and Perform Blood Stoppage, the treatment flow, and each
action beside its `Resume (…)` continuation all still match, because there the
glyph names the _concept_ rather than the button.

The five "Arm …" actions now agree on what the icon names: the **subject** being
scheduled, following the three that already did (`fa-hourglass` for onset,
`fa-skull` for resolution, `fa-droplet` for blood loss).

Also corrects `Item_Attribute.md`, which documented two Font Awesome _Pro_ names
that had been replaced, pointing readers at glyphs that no longer render.
