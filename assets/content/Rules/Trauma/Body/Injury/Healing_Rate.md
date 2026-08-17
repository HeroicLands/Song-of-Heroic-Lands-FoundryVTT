---
aliases:
  - Healing Rate
  - doc-hlngrt
id: MRqOJqtZ0rvN9AQD
type: doc
package: sohl
category: rules
name:
  full: Healing Rate
  aliases: []
shortcode: hlngrt
folder: F4NGyU9QQgWwTcHe
---

The **Healing Rate (HR)** is a factor from **0 to 6** representing the likelihood of recovering from an injury — lower is worse. It is generally **fixed once the injury is treated** (see [[doc-trtnginj|Injury Treatment]]), though some circumstances change it.

An **untreated** injury has **no Healing Rate at all** — which is not the same as a Healing Rate of 0. Having a rate is what makes a wound treated: the moment one is established, that is the moment of treatment, and until then the wound has nothing to test against. A rate of **0** is a real (and lethal) rate that some poor treatment produced.

Two thresholds always apply, however the Healing Rate reaches them:

- **HR 0** — the victim **dies**.
- **HR 7** — the injury is **healed** (the victim recovers).

The Healing Test is made against Heal Base (HB) × HR, so a character with HB 14 and HR 4 rolls against an EML of 56.

**An untreated injury has no Healing Rate**, and therefore nothing to roll against. Every Healing Test on such an injury is an **automatic Critical Failure** — no dice are rolled. The injury makes no progress for as long as it goes untreated, and takes the Critical Failure consequences each period, including infection.

This applies to healing tests only. The Physician's **Treatment Test** is not a healing test: it is rolled against the Physician's own skill and is what _establishes_ the Healing Rate in the first place — see [[doc-trtnginj|Treating Injuries]].
