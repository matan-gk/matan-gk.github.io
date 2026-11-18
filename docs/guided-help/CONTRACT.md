# Guided help: the contract between generators, boards and the engine (18 Nov 2026, step 2 of the engine research)

Status: PROPOSED. Nothing is built. This is the part that has to be right before code, because every later guide pays for a mistake here. It was written after the type inventory (`INVENTORY.md`), after reading how tutoring systems are usually structured (see "Research notes"), and it was tested on paper against five very different types (see "Paper tests"). The paper tests found real gaps, and the contract below already includes the fixes. Decisions still needed from Matan are listed at the end.

## 1. The shape of the idea
Three parts, each with one job:
- **Generator** (exists, one per question type): makes the question. New: it also returns `guide`, a plain data object that describes the problem and its worked solution. No text, no drawing.
- **Recipe** (new, small, one per type): turns that data into the guide's prompts, the typical mistakes and the hints. Pedagogy lives here.
- **Board** (new, about a dozen, each built once): draws a family of problems and reports what the child does (see `INVENTORY.md` for the families).
- **Engine** (new, once): runs the steps, judges answers, climbs the hint ladder, protects the streak rules, offers the follow-up, writes the analytics. It knows nothing about any type or any board.

The engine is only the **inner loop** of a tutoring system (what happens inside one problem). The **outer loop** (which question comes next, difficulty, rewards) stays in the game as it is. Keeping this line narrow is what keeps the game and the guides from tangling: the game calls `startGuide(question, source)` and gets back `{outcome: 'done' | 'quit', steps, tries}`.

## 2. What a generator returns (the `guide` field)
```js
q.guide = {
  v: 1,                       // contract version
  mode: 'script' | 'state',   // see 3
  board: 'TL',                // a board family from INVENTORY.md
  model: { ... },             // the data the board draws; board specific; no Hebrew text; names carry gender
  steps: [ Step, ... ],       // mode 'script': the solution as the child performs it
  rules: 'logic-grid',        // mode 'state': the name of a rules module (see 3.2)
  answer: q.answer            // must equal the question's answer (checked by the harness)
}
```
The question text is built from the same `model`, so the story and the guide cannot disagree. This is the one real change inside each generator: it keeps its numbers in an object, then writes the text from it. (For `gWorkBackwards`: `{item, events:[{kind:'minus'|'plus', n}], end}` in story order.)

## 3. Two modes (found by the paper tests)
### 3.1 `script` mode: a fixed list of steps
For types whose solution is a sequence the child must walk through in order (shop, written arithmetic, sequences, clock). A step:
```js
{ id: 'undo1', skill: 'inverse-op',          // the knowledge component this step exercises (for analytics)
  act: 'type' | 'tap' | 'pick' | 'drag' | 'show',   // what the child does; `show` has no input (the board animates, she taps "next")
  target: 'event:1',                        // a reference into `model` (the board knows how to find it)
  ask: 'tl.undo.op',                         // a prompt key in the recipe's prompt table
  say: 'tl.undo.op',                         // the key of the spoken line, if any (fixed text only, see 8)
  expect: Expect,                            // how to judge the input (below)
  mistakes: [ {when: Expect, tag: 'added-instead', conseq: 'plus-grows'} ],   // known wrong answers and what to show for each
  hints: { conseq: ViewRef, smaller: StepRef, demo: ViewRef }                 // the ladder (7)
}
```
`Expect` is data, not code, so it can be stored, compared and tested:
- `{value: 16}` a number or string; `{oneOf: [..]}`; `{all: [Expect, ..]}` for a step with two fields, for example `{op: '-', n: 8}`;
- `{check: 'sum-to', args: [24, 8]}` a validator from a small registry in the engine, for answers that are valid but not unique (for example "any number that makes the sum right", or "a valid way to break a ten");
- `{format: 'time'}` is a property of a typed input (clock answers like `12:15`).
The paper tests needed `oneOf`, `all` and `check`; a plain `value` is not enough.

A step may read values the child produced earlier (`vars`): the equation that builds up on screen is a `vars` object the board draws.

### 3.2 `state` mode: a board with a state and a rules module
For types where there is no fixed order: the clue grid (`gLogicGrid`, `bLogicGrid2`), the latin square, number riddles. The child may apply clues in any order and place marks as she likes, so a list of steps cannot describe the solution. Instead:
```js
rules.legal(state, move) -> {ok, supportedBy: [clueId..], tag}     // is this mark supported by the clues? (this is the "per-step validation" in the log)
rules.next(state)        -> a move that is supported and not yet made (for hints)
rules.done(state)        -> true when the question can be answered
rules.consequence(state, move) -> ViewRef      // what to show when an unsupported move is made
```
A rules module is a small deductive solver for one family (for the clue grid: the closure of the clues). It is written once per family, and the engine treats `state` mode like `script` mode: moves are judged, wrong moves climb the same ladder, the same analytics are written.
This is the main finding of the paper tests: **a single linear trace is not enough; two modes are.** The `script` mode covers most of the 127 types (the types tagged `easy`/`medium` in `INVENTORY.md` other than the clue family); `state` mode covers the clue family (5 types).

## 4. What a board is
```js
Board = {
  id: 'TL',
  mount(el, model, vars),            // draw the problem (answer choices are not shown)
  run(step) -> Promise<Input>,       // wait for the child's action on the step's target; resolves with what she did
  show(viewRef, vars) -> Promise,    // play a named view: a consequence, a demonstration, a highlight, a rewind
  clear(), unmount()
}
```
Boards never judge and never know the answer. They draw, wait for an action and report it; they play views the recipe names. A board is built from primitives (number line, groups of items, cards with chips, a row of cells, a clock face, a polygon with labelled sides, text with tappable words, typed input). The typed-input primitive (decided: she types numbers) is shared by all boards.

## 5. The engine, in one table
| State | What happens | Leaves by |
|---|---|---|
| `offered` | the quiet button (idle time, default 30 s, configurable) or the after-mistake offer is on screen; the answer is not yet revealed | she taps it (`running`), skips (`skipped`), or answers (normal flow) |
| `running` | one step at a time; the ladder (7) on a wrong input; per step the engine records tries and time | last step (`done`), she quits (`quit`) |
| `done` | a short celebration, deliberately small; the original question's answer choices come back (or, after a mistake, are replaced by the follow-up) | the follow-up is offered |
| `followup` | "want to try one like this yourself?" Her choice. A fresh question of the same type | she accepts (normal question) or declines |

The engine's only calls into the game: `game.hold(q)` (do not reveal the answer yet), `game.release(q)`, `game.streak.{keep,reset}()`, `game.next(sameType)`, `game.log(event)`.

## 6. Streak and reward rules (decided by Matan, 18 Nov)
1. Wrong answer, then a guide, then another try with the correct answer: the streak continues.
2. Wrong answer without a guide, or without another try: the streak resets.
3. A guide opened before answering: the streak continues.
No reward for a guided solve. The "another try" is the follow-up question of the same type (my reading, to confirm): it is a fresh question, and normal reward and streak rules apply to it. So after a wrong answer and a guide, the streak reset is *held*; it is dropped when she answers the follow-up correctly and applied if she declines it or answers it wrong. After a guide opened before answering, her answer to the original question changes nothing about the streak (no reward, no reset, no increase), and the follow-up is offered the same way. A wrong answer is always logged as a mistake in the stats; only the streak is protected.

## 7. The hint ladder (per step; see the design log for the shop examples)
1. **Consequence** (`hints.conseq`): show what her choice would lead to, then rewind. Defined per `mistakes` entry; a mistake with no entry gets a generic "look again" highlight of the target.
2. **Smaller question** (`hints.smaller`): a more concrete question about the same step (a step of its own, with its own `expect`). Only a different wrong input moves the ladder up; repeating the same wrong input does not count.
3. **Demonstration** (`hints.demo`): the correct move plays once, rewinds, and she does it herself. Never shown instead of her doing it.
Typed numbers cannot be brute-forced, so they skip the consequence rung unless the mistake is a known operation error. A retry loop is allowed; she can always quit. Tries and time per step are recorded, so guessing (fast, repeated taps) and loops show in the analytics.

## 8. Spoken lines
Every prompt has the form `{key: {text, say}}`. `text` is the voweled Hebrew shown on screen, with slots (`{n}`, `{name}`, gender forms). `say` is a *fixed* sentence with **no slots**: whatever varies (numbers, names, items) is on screen and highlighted, not spoken. The set of spoken lines is therefore finite and can be made once as audio files and shipped. A lint check in the harness fails any `say` string that contains a slot and any `say` key that has no audio entry. No audio is built yet; the browser's built-in speech is not reliable across devices (see Research notes), so it is not the plan.

## 9. Analytics (local, with the rest of the profile's progress)
- Per answer record: a `g` flag: `0` none, `1` answered after a guide (the original), `2` answered the follow-up after a guide. Guided answers do not count toward difficulty adaptation or mastery.
- Per type, a small counter object: offered, started, completed, quit (with the step), tries per step (histogram), consequence/smaller/demo rungs used, follow-up accepted/correct.
- Events: `guide_offered{type, source: idle|mistake}`, `guide_started`, `guide_step{id, tries, rung, ms}`, `guide_done`, `guide_quit{step}`, `followup{accepted, correct}`.
- Open: what of this is synced or backed up. It must follow `docs/PRIVACY.md`; I have not checked whether the profile's progress counters are synced today. To check before building.

## 10. The test harness (free tests per type)
A fake board and a scripted input source drive the real engine for hundreds of generated questions per type:
- **Correct-answer run**: the input source gives the expected input at every step. Check: it reaches `done`, no step shows the answer, and the final value equals `q.answer`.
- **Incorrect-answer run**: at every step with `mistakes`, give each listed wrong input, then check the ladder order (consequence, then smaller, then demo) and that the same wrong input twice does not move it.
- **Guess run**: random inputs; check no crash and that a quit is always possible.
- **Trace check** (script mode): the `op` fields recomputed from the numbers reproduce every `expect.value` and the final answer.
- **State mode**: the correct-answer run plays `rules.next` until `done`; the incorrect-answer run plays a move that `rules.legal` rejects and checks the consequence is shown.
- **Lint**: every `ask`/`say` key exists; no `say` has slots; every `conseq` view exists in the board; spoken keys have audio; Hebrew text is voweled (the game's existing check).
A new type on an existing board gets all of this by adding its recipe to a list.

## 11. Entry, flag and settings
- Behind a flag in the debug panel until release (decided). At release: a parents-area switch for the feature, next to the idle setting (default 30 s). A guide can always be quit; skipping it shows the answer as today.
- For a type with a guide, the wrong-answer flow does not reveal the answer immediately; it offers the guide first (decided). Types without a guide keep today's flow.

## 12. Paper tests (five very different types)
Each was written out as far as the contract allows, to find what it cannot say.

**`gWorkBackwards` (shop; board TL, script).** model `{item, events:[{kind:'minus', n:8},{kind:'plus', n:6}], end:25}`. Steps: for each event in story order, `pick` the operator (`{value:'-'}`); a `show` step (the turn: "we run the film backwards", generic example on different numbers); then for each event last to first: `tap` the event, `pick` the inverse operator, `type` the result (the last event was +6, so undo it: 25 − 6 = `{value:19}`; the first was −8, so undo it: 19 + 8 = `{value:27}`, the answer). Hints: the consequence for a wrong operator (the shelf grows when she picks "+" for a sale). *Gaps found:* (a) steps with no input (`show`), now `act:'show'`; (b) one step with two fields (operator and number): `expect:{all:[..]}`; (c) the generator did not keep its numbers, now `model`; (d) the order of the two reverse events is not arithmetically forced; the recipe may mark either order as accepted with `{oneOf:[..]}` and still prompt for the story order.

**`gSubBorrow` (85 − 7; board PROC, script).** model `{a:85, b:7}`. A strategy has to be chosen: break a ten (`type` 15, then `type` 8, then `type` 78), or jump to the tens (85 − 5 = 80, 80 − 2 = 78). *Gaps found:* (a) the recipe picks a method but she may type a different valid intermediate value: `expect:{check:'valid-split', args:[85,7]}`; (b) the board needs a number line with hops she moves herself, which is also the support asked for in the log's review; (c) the trace is trivial (`easy`), so the cost is the recipe.

**`gSequence` (3, 6, 12, 24, ?; board SEQ, script).** Steps: `pick` how the numbers change (`{all:[{op:'×'},{n:2}]}`, because the same question type also has "add 3" rules), then `type` each missing term. *Gaps found:* the rule step is two fields (`all`), and the rule's kind varies by question, so the prompt key depends on `model.rule.kind` (the recipe chooses the key from the model).

**`gLogicGrid` (kids and pets; board CLUE, state).** No fixed order: she may apply any clue first, mark in any order, and some marks are only implied after two others. A linear `steps` list cannot say this. *Finding:* the `state` mode with a rules module (3.2), where `rules.legal` is "is this mark supported by the clues" (the per-step validation the log adopted) and `rules.next` gives the hint. Also found: the relational clue of the bonus type needs a state element that is not a kid (the anonymous owner), so the state object must allow extra entities; and "cannot tell" is a real answer the child can reject only when the state is fully resolved (`rules.done`).

**`gClockLater` (5:35, in 45 minutes; board CLOCK, script).** Steps: `type` the minutes to the next full hour (25), `type` the minutes that are left (20), `type` the time (`format:'time'`, 6:20). The board animates the minute hand. *Gaps found:* (a) the typed answer is a time (`format:'time'`, accepts `6:20` and `06:20`); (b) the board must expose animations by name (`show` views such as `hand-to`) that the recipe calls from `hints.demo`; (c) the question's own clock picture is drawn in the question, so the board must be able to take it over or redraw it (a question for the clock board's design).

Summary of what the paper tests changed: `show` steps, `all` / `oneOf` / `check` expectations, `format`, `vars`, the `state` mode with a rules module, named board views, and the rule that prompts are chosen from the model.

## 13. Work packages (sizes compared with recent work; the units are the same as the review: a reading group is small to medium, the 3D wall step was large)
1. **P0 plumbing, no guide yet**: the flag in the debug panel, the settings (idle time, switch), the answer-reveal hold, the streak rules, the `g` flag, the counters. Small to medium; it changes a core path (`checkAnswer`), so it needs its own tests.
2. **P1 contract and harness**: `guide` validation, the engine state machine, the fake board and the runs of section 10, with one throwaway toy type. Medium. This is what makes every later guide testable for free.
3. **P2 shared primitives and tier 0**: typed input, number line with hops, place-value chart; a first recipe for multi-step arithmetic types. Medium. Proves the plumbing on real types.
4. **P3 the TL board (shop)**: timeline, covered "?", flying numbers, operator choice, the turn, the reverse. Medium to large. First real board.
5. **P4 `state` mode and the CLUE board**: the rules module for the clue grid, cards with chips, the anonymous owner. Large. Wait for the paper test with the child.
6. **P5 audio**: the fixed spoken script, files, a switch. Small to medium, mostly outside the code.
7. Each additional type on an existing board: a recipe, its mistakes and a harness entry. Small.

## 14. Research notes (what I read, and what I could not verify)
- **Tutoring-system structure** (VanLehn, 2006, [The Behavior of Tutoring Systems](https://www.cs.uky.edu/~sgware/reading/papers/vanlehn2006behavior.pdf)): a tutoring system has an **outer loop** (per task: which task next) and an **inner loop** (per step: minimal feedback, hints, error-specific feedback, assessment, review). Hints are usually a sequence from weak to strong (point, teach, bottom-out). The paper describes options and does not compare them, so it does not say which is best. How it informs this design: the engine is an inner loop only; the ladder (consequence, smaller question, demonstration) matches "error-specific feedback, then a hint sequence ending in a bottom-out"; per-step assessment is what the analytics are for. I read only the first 100,000 of about 140,000 characters of the paper.
- **Browser speech** ([Readium: SpeechSynthesis in browsers and OSes](https://readium.org/speech/docs/WebSpeech.html)): which voices exist depends on the device and the browser: Chrome desktop has a small set of online-only voices; Chrome on Android returns an unfiltered list and falls back to an English voice if the language pack is not installed; Safari does not list downloaded voices; on Windows the natural voices are not listed in Chrome or Firefox; Firefox ships no voices of its own. The page does not mention Hebrew at all. So whether a Hebrew voice is present cannot be assumed on another child's device, which is why the plan is shipped audio for a fixed script. I did not test any device, and I did not evaluate Hebrew speech services (several exist; quality and licence terms for shipping the audio need checking).
- What I did not research: published findings on how effective step-by-step guidance is for children of this age, and the design of existing children's maths tutors. The contract is built from the game's own constraints and from the paper tests, not from that literature. If Matan wants the design checked against it, that is a separate piece of reading.

## 15. Decisions (Matan, 19 Nov) and what is still open
1. Streak reset rules in section 6: confirmed.
2. A guide opened before answering: her answer to the original question is accepted as correct, with no reward and no streak change. (Decided.)
3. Sequencing: replaced by `PLAN.md` (the grid tool first, then its guide, then the next type). Section 13 is kept as the list of work packages; the order in `PLAN.md` wins.
4. Data and backup: everything is backed up with the profile. The "per-type counters (replaced by the `h` flag, see section 15)" in section 9 are replaced by one optional field `h` on the existing stats log records (see `PLAN.md` 1.C), so nothing new is stored outside the profile's stats.
5. Audio: another agent will produce the files; the spoken sentences are written when we get there.
