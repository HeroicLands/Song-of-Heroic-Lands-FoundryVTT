---
"sohl": patch
---

**Security:** Fix ReDoS in `matches()` expression helper (#166).

`MAX_PATTERN_LENGTH = 200` bounded pattern length but not backtracking complexity. A sub-200-char pattern with nested quantifiers (e.g. `(a+)+`) against attacker-influenced input could hang the JS engine for seconds or minutes.

Adds `hasCatastrophicPattern()` static analysis before `new RegExp(...)` is called. Patterns containing backreferences (`\1`–`\9`) or a quantified group whose body itself contains a quantifier (`(a+)+`, `(.*)* `, `([a-z]+\d)+`) are rejected with a `SafeExpressionError`. Legitimate single-level quantifiers (`a+`, `[a-z]+`, `(?:foo|bar)`) are unaffected.
