# Guided help: design notes (docs only)

Discussion material from 17 Nov 2026 for interactive, child-guided step-by-step help on hard questions. Nothing here is implemented. No code or art was changed or generated.

Files:
- `DESIGN_LOG.md`: the living design log, copied from the Notion page. Start at "Current agreed design" for the shop "work backwards" type. Later sections cover the logic-grid types (gLogicGrid, bLogicGrid2), with agreed, proposed and open items kept separate, and the artwork inventory. The log is a snapshot at the time of the commit. The Notion page remains the live version.
- `logic-implementation-prompt-DRAFT.txt`: draft build prompt for the logic-grid guided help. Discussion draft only, not authority to implement. Open choices are marked.
- `logic-art-prompt-DRAFT.txt`: draft artwork brief for card icons and faces. Discussion draft only. No images generated.
- `logic-cards-discussion-sketch.png`: adult-facing layout sketch of the card idea with an anonymous owner card. Tentative, not child UI, not approved, not tested with a child.

Status of decisions: see the log. Agreed items are listed as decided; anything labelled proposed or open is not approved.

- `INVENTORY.md` (added 18 Nov): all 127 question types tagged by board family and by how cheaply the generator can return a worked solution. Kept in sync with the game by `tests/guideinventorytest.js`. Proposed classification, not built.
- `CONTRACT.md` (added 18 Nov): the proposed contract between generators, boards and the engine, tested on paper against five types; work packages; research notes; decisions still needed. Not built.
