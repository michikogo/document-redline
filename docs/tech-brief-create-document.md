# Technical Brief: Create Document Modal

**Status:** Draft
**Date:** 2026-05-11
**Stack:** React · TypeScript · Vite

---

## Overview

Add a "New Document" button to the sidebar that opens a modal with a title field and content textarea. On submit, calls `POST /api/documents` and adds the new document to the list.

---

## Behaviour

- "New Document" button sits at the top of the sidebar, above the search bar
- Clicking it opens a centered modal overlay
- Modal has: title input, content textarea, "Create" button, "Cancel" button (or click outside to dismiss)
- "Create" is disabled while title or content is empty
- On success: modal closes, document list refreshes, new document is auto-selected
- On error: show inline error message inside the modal, keep it open

---

## Implementation

### NewDocumentModal component

```tsx
type Props = {
  onClose: () => void;
  onCreated: (doc: Document) => void;
};
```

- Local state: `title`, `content`, `loading`, `error`
- On submit: call `createDocument(title, content)` from `client.ts`, then call `onCreated(doc)`
- Trap focus inside modal while open
- Dismiss on `Escape` key or backdrop click

### App changes

- Add `showNewDoc: boolean` state
- Render `<NewDocumentModal>` when `showNewDoc` is true
- `onCreated` handler: append doc to document list, set it as selected, close modal

---

## Files

| File | Change |
|------|--------|
| `client/src/components/NewDocumentModal.tsx` | New — modal with title + content form |
| `client/src/styles/NewDocumentModal.module.css` | New — modal overlay and container styles |
| `client/src/App.tsx` | Add "New Document" button, `showNewDoc` state, `onCreated` handler |

No backend changes required — `POST /api/documents` already exists.

---

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Empty title or content | Create button disabled |
| Network error on submit | Show error inline, modal stays open |
| Escape / backdrop click | Modal closes, form state discarded |
| Very long content pasted in | Textarea scrolls, no truncation |
