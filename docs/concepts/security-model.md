# Security Model & Guardrails

This document is the security mental model for the SoHL system and the standing
guardrails every change must respect. It is written for both human and AI
developers: if you are adding a feature, reviewing a PR, or letting an agent
touch this codebase, read this first.

It is derived from a full security review of the system (see the epics linked in
[Tracking](#tracking)). The findings themselves live in the issue tracker; this
document distills the _durable rules and decisions_ so we do not reintroduce the
same classes of bug.

## Threat model

SoHL is a **FoundryVTT game system**. The code runs in players' and GMs'
browsers. The attacker-controlled inputs that matter are:

1. **Installed content** — world save files, modules, and shared compendium
   packs. Their item/actor/effect fields, action definitions, expression
   strings, domain-registry entries, and imported JSON are authored by whoever
   produced the package, and are then rendered or executed on the client of
   **every user who installs the content**, including the GM.
2. **Chat messages and their flags** — these propagate to every connected client
   and are re-rendered on each. Any client, including a non-GM player, can craft
   message content and `data-*` attribute values.

The high-consequence outcomes we defend against:

- **Arbitrary code execution** in a victim's browser (full Foundry API access
  with their session and world) via a compiled string or unsafe deserialization.
- **Stored/DOM XSS** via HTML built from data and rendered into sheets, dialogs,
  or chat.
- **Client-side denial of service** via catastrophic-backtracking regexes.
- **Cross-actor state corruption** via a client acting on documents it does not
  own.

The load-bearing consequence: **untrusted _data_ is the primary attack surface,
not untrusted _code_.** A malicious module author already runs code; our job is
to ensure that _data_ — a chat flag, an effect field, a serialized payload —
can never _become_ code or script on someone else's machine.

## The core principle: reference code, never compile it from data

**Never turn data into executable code.** No `eval`, no `new Function`, no
`Function`/`AsyncFunction` constructor, no `Handlebars.compile` of
data-derived source — anywhere a value could have originated from installed
content or a cross-client message.

Data may only ever carry a **reference** to code that already exists:

| Reference  | For                                                | Encoding     | Resolves to                                            |
| ---------- | -------------------------------------------------- | ------------ | ------------------------------------------------------ |
| Class kind | Domain objects round-tripped through JSON          | `__kind` tag | A constructor looked up in `src/utils/kindRegistry.ts` |
| Method     | A shipped behavior on a Logic class (intrinsic)    | method name  | A bound method on the scoped target logic              |
| Macro      | GM-authored "homebrew" behavior created after ship | Macro UUID   | A Foundry `Macro`, run via `Macro#execute()`           |

Functions themselves are **never serialized** — not as source, and not as a
reference. A domain object carries **data plus its `__kind`**, and any behavior
is re-derived locally on the receiving client from that kind and data.

An attacker can put any value in a reference slot, but the worst they can do is
_select_ something the system already ships — they can never _introduce_ new
code. This makes the dangerous state unrepresentable rather than merely screened.

### Why not a sandbox / denylist?

The system previously screened author-supplied script with a regex denylist
(`textToFunction`) before compiling it with `new Function`. **A denylist over
source text is not a security boundary.** During review it was defeated four
independent ways, each verified by execution:

- **Unicode identifier escapes** — `fetch` is the identifier `fetch`; the
  literal substring never appears in the source, so a `\bfetch\b` scan misses it.
- **Function-constructor by string concatenation** —
  `(()=>{})['con'+'structor']('return this')()` reaches `globalThis`; the word
  `constructor` never appears as one literal.
- **Template-literal interpolation** — a comment/string stripper deletes
  `` `${...}` `` before scanning, but it still executes at runtime.
- **Comment interposition** — `x./**/constructor` slips past a `\.\s*constructor`
  pattern.

These are not patchable one at a time. The only sound options are an **AST
allowlist** (parse, then permit a fixed set of nodes/identifiers — this is what
`SafeExpression` does for predicates and why it is safe) or **not compiling at
all** (the reference model above). SoHL chose _not compiling at all_ for
behavior; `SafeExpression` remains the only string→logic path, and it is an
allowlist, not a denylist.

### Why not digital signatures?

Signing serialized code was considered and rejected. A **symmetric MAC cannot
work** in a client-only Foundry system: there is no server-side secret, so any
client that can verify a signature can also forge one — and the attacker is one
of those clients. **Asymmetric signing** would only help a hypothetical "signed
content pack" feature, and even then verifies _provenance_, not _safety_. Foundry
macros give us provenance for free and at _write_ time (see below), with no key
to distribute or leak. Prefer the reference model; reach for signatures only if a
future feature genuinely must move novel code across the trust boundary, and then
only with asymmetric keys plus an AST allowlist.

### GM "homebrew": use Foundry macros, not a bespoke sandbox

Post-ship, GM-authored behavior runs through **Foundry `Macro` documents**,
referenced by UUID and executed with `Macro#execute()`. This inherits Foundry's
own, audited permission model:

- Creating or importing a _script_ macro is blocked unless the user holds the
  `MACRO_SCRIPT` permission (`common/documents/macro.mjs`). A malicious
  compendium cannot land auto-running script on a player who lacks it.
- `Macro#execute()` re-checks `canUserExecute` (ownership **and**
  `MACRO_SCRIPT`) before running, and passes `{ speaker, actor, token, ...scope }`.

Rules for using macros:

- **Only ever execute via `Macro#execute()`**, never by reading a macro's
  `command` into your own compiler.
- **Only invoke on the client that owns the acting document** — keep the
  target-addressed acknowledge model (a defense runs because the _defender's_
  user clicked, on the defender's client). A player-authored chat flag must never
  cause a macro to run on the GM's client without the GM's action.
- Understand the trade-off: a macro runs with full page authority. This is
  **authorization, not isolation** — the same trust decision as installing a
  module, but gated and explicit rather than silent. True isolation of shared
  homebrew (Realm/iframe/worker with a brokered API) is a separate, much larger
  effort and is out of scope.

> Note: **intrinsic** action executors resolve by method-name lookup on a bound
> target logic. That is already safe (no compilation, the name is system-authored,
> and it resolves to an existing method) and is _not_ a `new Function` path — it
> does not need to become a macro.

### Extension points: which tool for which need

The safe extension mechanism depends on two axes — who authors it (shipped in
code vs. GM post-ship) and how it runs (a synchronous value vs. asynchronous
imperative behavior):

|                                  | **Shipped (in code)** | **GM-authored (post-ship)**              |
| -------------------------------- | --------------------- | ---------------------------------------- |
| **Synchronous, returns a value** | a method / intrinsic  | a {@link SafeExpression} (AST allowlist) |
| **Asynchronous, imperative**     | a method / intrinsic  | a Foundry **Macro** (`Macro#execute`)    |

Two consequences to internalize:

- **A GM who needs a synchronous computed value uses a `SafeExpression`, not a
  macro.** `SafeExpression` parses to an AST, allowlists nodes, and evaluates
  synchronously and safely. Macros are asynchronous (`Macro#execute` returns a
  `Promise`), so they cannot return a value to a synchronous caller.
- **Synchronous _imperative_ GM code is intentionally unsupported.** You cannot
  let an untrusted author supply synchronous side-effecting code without
  compiling it — which is exactly the RCE this model removes. If you hit this,
  express the value as a `SafeExpression`, or restructure so the work runs
  asynchronously (a macro) and the synchronous path reads a cached result.

## Guardrail: safe serialization

`defaultToJSON` / `defaultFromJSON` in `src/utils/helpers.ts` are the JSON
round-trip for domain objects. Their security contract:

- **`defaultFromJSON` never revives executable code.** There is no
  `new Function` path and no function-reference path. (The historical
  `__func__:`/`deserializeFn` path that compiled a string into a function has
  been removed — do not reintroduce it.)
- **`defaultToJSON` never emits a function.** Functions are dropped to
  `undefined` — no source, and no reference. Behavior is not serialized.
- **Reconstruction of `__kind`-tagged objects** goes through the kind registry
  and should validate/allowlist the tag and the shape — a client can craft the
  JSON, so treat revived data as untrusted input to the constructor.
- **`buildActionScope`** reads chat-card `data-scope` (fully attacker-controlled)
  and rejects any legacy `__func__:` marker outright as defense-in-depth.

A serialized object carries **data plus its `__kind`**. If the receiving client
needs a behavior, it re-derives it locally from the kind and data (e.g. a small
strategy enum resolved to a shipped function on that side) — never by carrying a
function across the wire, and never by `JSON.parse` + evaluate.

## Guardrail: HTML rendering / XSS

Author-controlled strings (item/actor/effect names and descriptions, domain and
calendar names, modifier breakdowns) reach dialogs, sheets, and chat cards.

- **Never interpolate data into Handlebars _template source_.** Building a
  template string with `` `...${item.name}...` `` and then `Handlebars.compile`
  turns the name into markup — stored XSS, and with prototype access enabled, a
  template-injection code-execution primitive. Put values in the **data context**
  (`{{name}}`, auto-escaped) or build inputs with the
  `foundry.applications.fields.*` DOM factories.
- **Do not enable `allowProtoMethodsByDefault` / `allowProtoPropertiesByDefault`**
  when the Handlebars context could carry non-plain objects; they disable the
  prototype-access guard.
- **Escape data destined for raw-HTML sinks** (`DialogV2`/`Dialog` content,
  `innerHTML`) with `foundry.utils.escapeHTML`, or render through a template.
  `i18n.localize`/`format` do **not** escape.
- **Do not `{{{triple-mustache}}}` untrusted or data-derived HTML.** If a value
  is assembled from data (e.g. a modifier breakdown), escape at the source or use
  double-mustache.
- **Prefer an allowlist sanitizer** (DOMPurify or
  `foundry.applications.ux.TextEditor.cleanHTML`) over a hand-rolled tag/attribute
  denylist. Denylist sanitizers miss whitespace/entity-obfuscated `javascript:`,
  `data:` URLs, `<base>`, SVG `xlink:href`, surviving `style`, and mXSS.

## Guardrail: cross-client authorization

- **Client-side gating is UX, not authorization.** Removing a button at render
  time (e.g. gating automated-defense buttons by `actor.isOwner`) only changes
  what a cooperating client shows. A malicious client can call the handler
  directly. The **real** authorization boundary is Foundry's document-ownership
  check at _write_ time — a client can only update documents it owns.
- **Chat-card handlers must verify authority before acting.** An `onChatCardButton`
  handler that resolves a target document by UUID from the dataset must confirm
  the current user owns it (or is GM) before executing — for intrinsic actions as
  well as gated ones — rather than relying on render-time DOM removal.
- **Actor-state sovereignty.** An actor mutates only itself. Cross-actor effects
  go through a target-addressed chat acknowledge button, resolved on the target's
  own client. See [Architecture](architecture.md) and
  [Extension Points](../how-to/extension-points.md).

## Guardrail: no unbounded regex on data (ReDoS)

A regex driven by attacker-influenced input can hang the client tab.

- **Length caps are not a ReDoS guard.** A short pattern with nested quantifiers
  still backtracks catastrophically.
- **Remove quantifier ambiguity** (do not let a character class overlap the
  separator that starts a repeated group; use atomic/possessive forms).
- For user-influenced patterns, use a non-backtracking matcher, an evaluation
  timeout, or restricted regex features.

## Red-flag checklist (for reviewers and AI agents)

Treat any of these as a blocker until proven safe against the threat model:

- `eval(`, `new Function(`, `Function(`, `AsyncFunction`, or reintroducing a
  `textToFunction`/`deserializeFn`-style "compile a string" path.
- `Handlebars.compile(` on a string built by interpolating data.
- `.innerHTML =` / `insertAdjacentHTML` / `{{{ }}}` / `new Handlebars.SafeString`
  with a value that could come from data.
- `allowProtoMethodsByDefault` / `allowProtoPropertiesByDefault`.
- A hand-rolled HTML sanitizer (tag/attribute denylist).
- A `data-*` attribute or chat flag passed to `defaultFromJSON` /
  `JSON.parse` + evaluate.
- A document `update`/`delete` in a socket/hook/chat handler with no
  `isOwner`/`canUserModify`/`isGM` check.
- A `RegExp` built from, or matched against, attacker-influenced data without a
  backtracking bound.
- A new string→function or string→predicate path that is not `SafeExpression`.

## Tracking

- The reference-code remediation is tracked under the "eliminate runtime code
  compilation" epic; the XSS and ReDoS hardening under their respective epics.
  Browse `gh issue list --label security`.
- The class registry: `src/utils/kindRegistry.ts`. The predicate allowlist:
  {@link SafeExpression}. GM homebrew runs through Foundry `Macro` documents.
