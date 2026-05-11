# UI Happy Path & Edge Case Testing

Before starting, make sure the server is running with seed data:

```bash
npm run seed
npm run dev
```

Open **http://localhost:5173** and work through each section.

---

## 1. Document List

- [ ] All 3 seeded documents appear in the sidebar
- [ ] Clicking a document loads it in the main panel
- [ ] The active document is visually highlighted in the list

## 2. Create a New Document

- [ ] Click **+ New** — modal opens
- [ ] Tab order works: title → content → submit
- [ ] Press **Escape** — modal closes without saving
- [ ] Click the backdrop — modal closes without saving
- [ ] Submit with no title — should show an error or be blocked
- [ ] Submit with title but no content — should show an error or be blocked
- [ ] Create a valid doc — it appears in the list and is selected automatically

Use this sample when testing document creation:

**Title:** `Service Agreement`

**Content:**

```
This Service Agreement is entered into by Acme Corp and the Client.

Acme Corp agrees to provide software development services to the Client. The Client agrees to pay Acme Corp a monthly fee of $5,000.

Either party may terminate this agreement with 30 days written notice. Upon termination, the Client shall pay all outstanding fees owed to Acme Corp.

Acme Corp shall maintain confidentiality of all Client information. The Client shall not share Acme Corp proprietary information with third parties.
```

This gives you repeated terms (`Acme Corp`, `Client`) for testing occurrence targeting, multiple clauses for search snippets, and enough content to walk through a full create → search → change → log flow.

## 3. Global Search

- [ ] Type `indemnification` — results appear, document list is replaced
- [ ] Results show the document title and a snippet with the matching text
- [ ] Click a result — navigates to that document
- [ ] Clear the search — document list comes back
- [ ] Search for something that doesn't exist — shows empty state, not a crash

## 4. Document Viewer

- [ ] Title and version number are visible
- [ ] Full document content renders
- [ ] **Select a word or phrase** with your mouse — a "Replace" tooltip appears above the selection
- [ ] Click **Replace** in the tooltip — the change drawer opens pre-filled with the selected text
- [ ] Click anywhere else — the tooltip dismisses without opening the drawer
- [ ] With the drawer already open, select another phrase — clicking Replace adds it as a new row without resetting existing rows
- [ ] Click **Update Doc** — drawer opens empty

## 5. Per-Document Search

- [ ] Type a term that exists in the open document — results replace the content
- [ ] Match count is shown
- [ ] Snippets highlight the matching text
- [ ] Search for something not in the document — shows "No matches"
- [ ] Clear the search — document content comes back
- [ ] While document search results are showing — the change drawer should be closed

## 6. Apply a Change (Drawer)

- [ ] Open the drawer, fill in target text that exists, fill in replacement — occurrence counter shows a number
- [ ] Fill in target text that doesn't exist — occurrence counter shows 0 or a warning
- [ ] Submit with occurrence counter at 0 — should be blocked
- [ ] Apply a valid single change — document content updates, version bumps, drawer closes
- [ ] Add a second row with **+ Add another change**
- [ ] Apply two changes at once — both apply, version bumps once
- [ ] Remove a row with the **×** button — row disappears
- [ ] Submit with one row's replacement empty — should be blocked

## 7. Change Log

- [ ] After applying a change, it appears in the change log below the document
- [ ] Multiple changes show in the correct order
- [ ] Log shows target text, replacement, and timestamp

## 8. Edge Cases

- [ ] Apply a change where `occurrence: 2` but the word only appears once — should get an error
- [ ] Apply the same change twice — second attempt should fail (target text no longer exists)
- [ ] Create a document, immediately search for its content — it should appear in global search results
