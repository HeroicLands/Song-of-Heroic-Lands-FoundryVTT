---
"sohl": patch
---

**Security:** Fix catastrophic ReDoS in `FILE_PATH_REGEX` (#165).

The inner character class `[^<>:"|?*\n\r]` allowed `/` and `\`, which overlapped with the adjacent `(?:[\\/]...)` group. For an N-segment path ending with a forbidden character, the engine explored O(2^N) backtracking paths — a 30-segment input caused a ~60-second hang.

The fix excludes `/` and `\` from both inner char classes (`[^<>:"|?*\n\r\\/]+`), making each path separator consumed by exactly one arm and reducing matching to O(N).
