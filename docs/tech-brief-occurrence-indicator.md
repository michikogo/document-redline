# Technical Brief: Occurrence Indicator

**Status:** Draft
**Date:** 2026-05-11
**Stack:** React · TypeScript · Vite

---

## Overview

When a user types a target phrase in the change form, show a live count of how many times that phrase appears in the current document. The user can then set `occurrence` knowing how many valid values exist.

---

## Behaviour

- As the user types in the target textarea, debounce 300ms then scan the current document content client-side
- Display "X occurrence(s) found" below the target field
- If 0 occurrences: show "not found" in a muted/warning style so the user knows the change will fail before submitting
- The occurrence number input remains free-entry — the indicator is informational only

---

## Implementation

### Debounce hook

```ts
// client/src/hooks/useDebounce.ts
const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};
export default useDebounce;
```

### Count helper

```ts
const countOccurrences = (content: string, target: string): number => {
  if (!target.trim()) return 0;
  const lower = content.toLowerCase();
  const lowerTarget = target.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(lowerTarget, idx)) !== -1) {
    count++;
    idx += lowerTarget.length;
  }
  return count;
};
```

### ChangeForm changes

- Accept `documentContent: string` as a new prop (passed from App via the selected document)
- Add `target` state (controlled textarea)
- Derive `const debouncedTarget = useDebounce(target, 300)`
- Derive `const count = countOccurrences(documentContent, debouncedTarget)`
- Render below the target textarea:
  - `count > 0` → `"X occurrence(s) found"` (muted text)
  - `debouncedTarget && count === 0` → `"not found"` (warning/red text)

---

## Files

| File | Change |
|------|--------|
| `client/src/hooks/useDebounce.ts` | New — generic debounce hook |
| `client/src/components/ChangeForm.tsx` | Add `documentContent` prop, occurrence count display |
| `client/src/App.tsx` | Pass `content` from selected document to `ChangeForm` |
| `client/src/styles/ChangeForm.module.css` | Add `.occurrenceHint` and `.occurrenceWarn` styles |

---

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Target is empty | Show nothing |
| Target not in document | Show "not found" in warning style |
| Document not loaded yet | `documentContent` is empty string — count is 0, show nothing |
| Very fast typing | Debounce absorbs it — no per-keystroke scan |
