# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities privately via the "Report a vulnerability"
button on this repo's Security tab (Security → Advisories). Please do not
open a public issue for security problems.

I'll acknowledge the report, develop a fix in a private advisory, and credit
you on publication if you'd like.

## Supported versions

The latest released version receives security fixes; older versions do not.

## Scope

This is a Foundry VTT game system. The most relevant concerns are inputs
rendered into other users' clients (item names/descriptions, journal content),
macro/script execution, and the handling of untrusted, serialized world data.

For the system's full threat model and the standing security guardrails every
change must respect, see
[docs/concepts/security-model.md](docs/concepts/security-model.md).
