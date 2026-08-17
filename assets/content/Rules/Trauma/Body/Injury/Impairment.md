---
aliases:
  - Impairment
  - doc-imprmnt
id: Aa8GO0i94Gh9cyGi
type: doc
package: sohl
category: rules
name:
  full: Impairment
  aliases: []
folder: F4NGyU9QQgWwTcHe
shortcode: imprmnt
---

Injury penalizes actions that use the injured body part. Although an injury sits at a single body location, the **entire body part** containing it suffers the impairment.

### Indefinite Impairment

Indefinite impairment lasts only as long as the injury is present and active, and scales with severity. As a wound heals from Grievous to Serious to Minor, the penalty tracks down with it.

| Severity | Indefinite Impairment                                                  |
| -------- | ---------------------------------------------------------------------- |
| Minor    | −5, but only while the wound is slow to heal (Healing Rate 5 or less)  |
| Serious  | −10                                                                    |
| Grievous | Body part **unusable** — tests using it automatically Critically Fail. |

Impairment is **worst-of, never additive**: a part bearing three serious wounds is impaired by −10, not −30, and takes only the single worst penalty among its injuries and its permanent impairment.

Which tests an impaired part actually penalizes is decided by the part's [[doc-character#body-part-roles|body roles]] — each skill and attribute names the roles whose injury impairs it, and takes the worst penalty among the parts holding those roles (or Critically Fails outright if any of them is unusable).

### Permanent Impairment

Wounds that are subject to permanent impairment and take a long time to heal leave a lasting mark. The level depends on how long the wound took to reach Injury Level 0:

| Time to heal | Permanent Impairment |
| ------------ | -------------------- |
| < 20 days    | None                 |
| 20–39 days   | −5                   |
| 40–59 days   | −10                  |
| 60–79 days   | −15                  |
| 80–99 days   | −20                  |
| 100+ days    | −25                  |

Permanent impairment never heals by natural means — the arm or leg withered, the sight dimmed, and so on.
