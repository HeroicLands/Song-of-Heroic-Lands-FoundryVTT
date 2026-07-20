---
aliases:
    - Injury
    - Injury Level
    - Healing Rate
    - Impairment
    - Injury Treatment
    - Injury Healing Test
id: Inj9ryLv2Hk7pXq3
type: doc
package: sohl
category: user-guide
name:
    full: Injury
    aliases: []
folder: RqKUTBUBN2Y3MHYB
slug: sohl-injury
---

An **injury** is a physical [Trauma](Trauma.md) — a disability of the body,
usually the result of combat or accident. Each injury is recorded on its own,
with a severity ([Injury Level](#injury-level)), an aspect (how it was inflicted),
a body location, and — once treated — a [Healing Rate](#healing-rate).

## Injury Level

The **Injury Level (IL)** is a number from **1 to 5** measuring the severity of a
wound. Severity bands group the levels:

| Injury Level | Severity | Label |
| ------------ | -------- | ----- |
| 1            | Minor    | M1    |
| 2            | Serious  | S2    |
| 3            | Serious  | S3    |
| 4            | Grievous | G4    |
| 5            | Grievous | G5    |

When an injury's Injury Level falls **below 1**, the wound is **healed**.

## Shock

Whenever an injury is sustained, it drives a [Shock](Shock.md) test. The injury's
contribution to the **Shock State Index** is the body location's Shock Value +
the Injury Level + the Shock test result — see
[Shock → Shock State Index](Shock.md#shock-state-index).

## Healing Rate

The **Healing Rate (HR)** is a factor from **0 to 6** representing the likelihood
of recovering from an injury — lower is worse. It is generally **fixed once the
injury is treated** (see [Injury Treatment](#injury-treatment)), though some
circumstances change it. Two thresholds always apply, however the Healing Rate
reaches them:

- **HR 0** — the victim **dies**.
- **HR 7** — the injury is **healed** (the victim recovers).

## Impairment

Injury penalizes actions that use the injured body part. Although an injury sits
at a single body location, the **entire body part** containing it suffers the
impairment.

### Indefinite Impairment

Indefinite impairment lasts only as long as the injury is present and active, and
scales with severity. As a wound heals from Grievous to Serious to Minor, the
penalty tracks down with it.

| Severity | Indefinite Impairment                                                  |
| -------- | ---------------------------------------------------------------------- |
| Minor    | −5                                                                     |
| Serious  | −10                                                                    |
| Grievous | Body part **unusable** — tests using it automatically Critically Fail. |

### Permanent Impairment

Wounds that are subject to permanent impairment and take a long time to heal
leave a lasting mark. The level depends on how long the wound took to reach
Injury Level 0:

| Time to heal | Permanent Impairment |
| ------------ | -------------------- |
| < 20 days    | None                 |
| 20–39 days   | −5                   |
| 40–59 days   | −10                  |
| 60–79 days   | −15                  |
| 80–99 days   | −20                  |
| 100+ days    | −25                  |

Permanent impairment never heals by natural means — the arm or leg withered, the
sight dimmed, and so on. Which injuries are eligible is listed under
[Special Injury Effects](#special-injury-effects).

## Injury Treatment

A new injury is **untreated**, and healing cannot begin until it is treated. An
untreated wound is resolved as though its treatment roll were a **Critical
Failure**.

Each wound has a **required treatment** — the specific action that must be taken:

| Code    | Treatment                                                                                 |
| ------- | ----------------------------------------------------------------------------------------- |
| **CLN** | Clean and dress the injury with water and bandages.                                       |
| **CMP** | Apply a cool, wet dressing to ease discomfort.                                            |
| **EXT** | Surgically extract a lodged projectile (S3/G4/G5). An MF or CF roll causes a **bleeder**. |
| **SET** | Splint a simple fracture.                                                                 |
| **SUR** | Complex surgery (requires surgical tools). An MF or CF roll causes a **bleeder**.         |
| **WRM** | Warm the victim (blankets, hot drinks, warm compresses).                                  |
| **AMP** | Amputate the affected location.                                                           |

Treatment is a **Physician** test with the treatment's difficulty modifier. Its
result sets the injury's Healing Rate:

**Treatment table** — resulting Healing Rate by roll and severity:

| Roll    | Minor | Serious | Grievous |
| ------- | ----- | ------- | -------- |
| CF (−1) | HR 4  | HR 3    | HR 2     |
| MF (0)  | HR 5  | HR 4    | HR 3     |
| MS (1)  | HR 6  | HR 5    | HR 4     |
| CS (2)  | HEAL  | HR 6    | HR 5     |

A result of **HEAL** heals the wound immediately.

**Treatment actions** — the required action and its difficulty modifier by aspect
and severity (_action_ / _modifier_):

| Aspect                  | Minor     | Serious   | Grievous  |
| ----------------------- | --------- | --------- | --------- |
| Blunt                   | CMP / +30 | SET / +10 | SUR / 0   |
| Edged                   | CLN / +20 | CLN / +10 | SUR / 0   |
| Piercing                | CLN / +10 | CLN / 0   | SUR / −10 |
| Projectile              | CLN / +10 | EXT / 0   | EXT / −10 |
| Projectile (broad-head) | CLN / 0   | EXT / −20 | EXT / −30 |
| Fire                    | CMP / +20 | CLN / +10 | CLN / 0   |
| Frost                   | WRM / +40 | WRM / +20 | AMP / 0   |

### Special Injury Effects

Certain wounds carry an additional effect:

- **Possible permanent impairment** — Serious HR 3–4 or Grievous HR 2–4 blunt
  wounds; Grievous HR 2–4 edged wounds; Serious HR 3 or Grievous HR 2–4 piercing
  wounds; Serious HR 3–4 or Grievous HR 2–4 projectile wounds; Grievous HR 1–3
  fire wounds; Serious HR 3 frost wounds.
- **Bleeder** — Grievous HR 2 or HR 3 blunt, edged, point, or projectile wounds.
- **Amputation required** (Grievous frost wounds) — the treatment roll inflicts an
  edged wound to the affected location, and (except on a CS) a bleeder:

    | Treatment roll | Result                          |
    | -------------- | ------------------------------- |
    | CF (−1)        | G5 edged wound, **bleeder**.    |
    | MF (0)         | G4 edged wound, **bleeder**.    |
    | MS (1)         | S3 edged wound, **bleeder**.    |
    | CS (2)         | S2 edged wound (not a bleeder). |

## Injury Healing Test

Once treated, an injury recovers through periodic **Injury Healing Tests**, one
per injury on that injury's own healing period. Each is a test of
**`Healing Base × Healing Rate`** (see [Healing Base](Healing_Base.md)):

| Success Level | Result                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| CF (−1)       | No healing. If infection was possible, an [infection](Infection.md) occurs. |
| MF (0)        | No healing.                                                                 |
| MS (1)        | Reduce Injury Level by 1.                                                   |
| CS (2)        | Reduce Injury Level by 2.                                                   |

When an Injury Level reaches **0 or less** the injury is healed, and no further
Injury Healing Tests are made for it.

**An active infection halts healing.** While the patient carries _any_ active
[infection](Infection.md), **no** Injury Healing Tests are made for them until
every infection has been defeated.

## See also

- [Healing Base](Healing_Base.md), [Bleeding](Bleeding.md),
  [Infection](Infection.md), [Shock](Shock.md), [Trauma](Trauma.md).
