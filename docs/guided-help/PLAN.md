# Guided help: build plan (19 Nov 2026) - PROPOSED, for approval
Replaces the "work packages" order in `CONTRACT.md` section 13. Matan's sequencing: first an interactive grid tool for the multi-step clue question (not guided help), with only the plumbing that tool needs, built so it generalizes; then the grid; then the remaining plumbing and the guide for the grid; then a guide for a different type; and so on.

## Decided (from Matan's answers, 19 Nov)
- Streak rules as in `CONTRACT.md` section 6, confirmed. A guide opened before answering: her answer to the original question is accepted as correct, with no reward and no streak change.
- Everything is backed up with the profile; new data must live inside the profile's existing stats so nothing new needs backing up (see 1.C).
- Audio: another agent will make the files; the spoken sentences are written when we get there (Phase 2 or later).
- The first build is a tool under the question, with no effect on streaks, rewards or difficulty.

## Phase 1: the clue-grid tool (no guide)
### What the child sees
Under the question text of the bonus clue question (3 kids, 3 animals, 3 fruits) there is a small grid she can fill in while she thinks. It is the standard logic-puzzle grid, with three blocks:
- kids against animals (3 x 3) and kids against fruits (3 x 3) side by side across the top;
- animals against fruits (3 x 3) below the fruits block;
- the block below the animals is greyed out (animals against animals means nothing).
Rows: the 3 kids, then the 3 animals. Columns: the 3 animals, then the 3 fruits. Headers are the kid's name and an emoji for each animal and fruit, so no new art is needed.
A tap on a cell cycles empty, then "no" (a cross), then "yes" (a tick), then empty again. There is a clear button and a hide/show button. The grid does not fill anything in, does not check anything, and does not know the answer: she does all the thinking. It stays on screen after she answers and goes away with the question.
Why three blocks: the relational clues ("whoever has the cat does not like apples") go straight into the animals-against-fruits block. That means this tool does not need the "anonymous owner" card from the early sketch; the standard grid already has a place for that clue.
Size: 7 columns including the header, cells at least 44 px, so it fits a 360 px wide phone without sideways scrolling (a test checks this).

### Plumbing built for it (each is generic; Phase 2 and later reuse it)
**1.A Structured question data.** `logicGrid` keeps its names, animals, fruits and clues as data (`q.model`) and writes the question text from that data, so the tool and the text cannot disagree. A clue is data (`{kind: 'has'|'not'|'rel', ...}`) with one function that writes its Hebrew text. This is the "generator returns `model`" part of the contract, done for the first type. A regression test compares the generated text with text captured from main before the change (seeded, a few hundred questions), so the wording cannot drift.
**1.B A tool slot under the question.** One container in the question card between the text and the answer area. A question can carry `q.tool = {kind, model}`; a small registry (`QTOOLS[kind] = {mount(el, model, ctx), unmount(el)}`) mounts the tool when the question is shown and removes it on the next question or when she leaves. The tool's state belongs to the question and is dropped with it. This is the board interface of the contract (`mount` / `unmount`, no judging) in its first form; later, guide boards mount in the same slot with the same lifecycle.
**1.C A help flag in the stats record.** Each answer record in the profile's stats log gets an optional small field `h` (a bit set: 1 = she used a tool on this question; later 2 = guided, 4 = tried again after a guide). It goes through `statsRecord`, `statsSanitize` (the strict clean-up used on load and restore) and the backup, so it is stored and backed up with the rest of the profile. The Progress report can later compare accuracy with and without a tool. This replaces what I called "per-type counters" in the contract: there are no new counters, only a flag on the existing log, and the per-type daily totals are untouched.
**1.D A setting.** One parents-area setting, "tools under the question" (on by default), stored with the profile's other settings. Hiding the tool per question is the child's own button. The setting is a general "question tools" switch so later tools do not need a new one.
Not built now (Phase 2): the engine, steps, hint ladder, answer-reveal hold, streak holding, the rules module that checks marks against clues, the harness, debug flag for guides, audio.

### Branches (stacked, code off the latest main)
1. `qtool-plumbing`: 1.A to 1.D with a throwaway-free design: the slot and registry are real, and a trivial test tool (only in tests) proves mount and unmount. Includes the text regression test. Small to medium.
2. `clue-grid` (on top of 1): the grid component, the registration for the bonus clue type, tests, help text line, ENHANCEMENTS step. Small to medium.
Each branch gets its own ENHANCEMENTS step, a version bump, and a full test run before I push. Roughly the size of one short-reading group each, together a little under the 3D wall step.

### Tests
Generator text unchanged; model matches the text; tap cycle (empty, no, yes, empty); the greyed block does nothing; clear; hide and show; the tool appears only on the questions that declare it; the setting hides it; marks change nothing in score, streak, rewards or the difficulty adaptation; the `h` flag is written once, survives a backup and restore and is dropped by the sanitizer if malformed; no horizontal overflow at 360 px; the tool is removed on the next question; every cell has an accessible label.

### Choices for you (all optional; my default in bold)
- Also show the tool on the regular one-attribute clue question (3 kids, 3 animals): **yes** (the same component with one attribute; costs almost nothing). Say no if you want it on the bonus question only.
- Let her tap a clue to strike it through as "used": **no for now** (it is a separate small feature; easy to add to the same component later).
- Auto-cross the rest of a row when she places a tick: **no** (that does her thinking; it can become a hint in Phase 2).

## Phase 2: remaining plumbing, then the guide for the grid
Plumbing (all of `CONTRACT.md` that the grid guide needs; built generic): the answer-reveal hold and the streak rules, the engine state machine, the `state` mode with a rules module (for the grid: which marks the clues support), the hint ladder with consequence views, typed-input and tap actions through the board interface, the guide flag `h` bits, the debug-panel flag and the parents-area switch with the idle time (default 30 s), the test harness with correct-answer, incorrect-answer and random runs, the spoken-line table (text only; audio comes from the other agent). Then the grid guide itself: the recipe (prompts, mistakes, hints) on top of the tool built in Phase 1, with the rules module deciding whether a mark is supported by the clues. Size: P0 plus P1 of the contract (medium) plus the guide (medium to large).

## Phase 3: the guide for a second type
Proposed: the shop question (`gWorkBackwards`), because its design is complete: it needs the timeline board and a typed-input step, and brings the number-line primitive. It checks the generic parts on a type with a different shape (a fixed list of steps, not a state). Alternative: a "solve it in small steps" guide for multi-step arithmetic first, to cover many types cheaply. To decide after Phase 2, with her mistake data if it can be shown.
## After that
One type at a time, each a recipe on an existing board or a new board, in the order of her mistakes. The inventory (`INVENTORY.md`) is the list.
