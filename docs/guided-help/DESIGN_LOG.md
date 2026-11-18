Living design log for the guided problem-solving subproject of the math game. Started 17 Nov 2026. The primary reading path is the 'Current agreed design' summary right below; everything after it is open items, flagged issues, and history.
# Current agreed design (summary, 17 Nov ~15:30)
Decisions only, for prototyping. Everything else in this doc is history or still open - see "Open / proposed" and the discussion log.
- WHAT: animated, interactive, child-guided step-by-step solving for the game's hard questions. First type: the shop "work backwards" question. Slower and more deliberate than today's help: more explanation and more child input. The child does the thinking; the game never reveals the answer and never computes her steps for her.
- ENTRY, both: 1) a quiet button at the edge of the question card after roughly 5-10 seconds of no activity, no popup (timing provisional); 2) a stronger recommendation to solve together after a mistake.
- THE TIMELINE: the story's events sit on a visual timeline and she interacts with the timeline itself, clicking actual event locations, not text or multiple-choice options.
- ACT 1, forward run (child-controlled): the equation builds visually as she goes. An unknown "?" holds the morning amount and is never revealed early. Numbers fly into the equation from the events' positions on the timeline (the owl's 8 flies in from the owl). The original operators are emphasized.
- ACT 2, the turn: a short, mostly visual transition with minimal text - we know the end, we need the start, so we run the film backwards. Opposites (plus becomes minus, and back) are taught with a generic visual example, separate from her actual question.
- ACT 3, guided reverse: starts at the known end (24) and she clicks the preceding timeline points. For each event, the original forward expression appears with reverse-direction arrows; SHE constructs the inverse exercise herself and then solves it. Nothing is auto-filled in reverse: no operands, no signs.
- MISTAKES INSIDE A STEP: she gets to retry a step a couple of times before further help.
- LATER (not now): pen and paper for bigger numbers.
# Update 18 Nov: decisions after the review comments (read this together with the summary above)
Matan answered the review point by point. Decided unless marked otherwise.
- IDLE BUTTON: 30 seconds by default, configurable in the parents area, in the same place as the on/off switch for the feature (see FLAG).
- FLAG: the whole feature sits behind a flag in the debug area (the password-gated debug panel in the parents area) while it is being built. At release: a parents-area switch for the feature next to the "how long until the button shows" setting.
- EXIT: she can quit or skip the whole walkthrough at any point. A parent switch turns the feature off.
- REWARDS AND STREAK: no reward for a guided solve, but NO STREAK RESET. (Reading, not yet confirmed by him: a wrong answer on a type that has a walkthrough pauses the streak reset until she decides. If she takes the guide, the streak is kept; if she declines or skips, it resets then. The wrong answer is still logged as a mistake in the stats; only the streak is protected. Open: what the streak does if she quits the walkthrough half way.)
- FOLLOW-UP QUESTION: at the end she is offered a fresh question of the same type, her choice. It is built as the last step of the walkthrough (not as a separate later feature). That question is a normal question: normal reward and streak rules apply to it.
- ANSWER REVEAL: for a type that has a walkthrough, the wrong-answer flow does not reveal the answer immediately; it offers the walkthrough first (with a way to skip, which then shows the answer as today). Answer choices are hidden during the walkthrough.
- NUMBER ENTRY: she types numbers. No choosing from number tiles.
- RETRY LOOPS: a child stuck in a retry loop who has to quit the tutorial is acceptable ("nothing is 100% foolproof"). No special end state is built now. Analytics (tries per step, quits per step) will show if it happens a lot, and then it gets improved.
- SHOP DESIGN: all the points in the review's section 2 are agreed (the generator returns a structured payload; she picks the operators herself in Act 1; a number-line or ten-frame hint she moves herself; Act 2 shortens once seen; the hint ladder; hiding the choices). The transfer of a number into the reverse equation is triggered by her own action (she clicks the event); the operator and the result are hers.
- STEPS: agreed in principle (structured generator and hook, then the first interactive parts, then the rest, then wiring, then a play-test with the child), but the ORDER is now gated by the engine question below, which Matan marked as critical and to be settled first.
- SPOKEN PROMPTS: Matan asked whether it is reasonable and how it works with variable text. See the architecture section at the end (answer and recommendation, proposed).
- ART: Matan notes that art from Gemini is cheap. Agreed; the review overstated it. See the correction in the review section.
- STILL OPEN: spoken prompts approach, the engine architecture below, streak behaviour if she quits half way.

# Update 18 Nov, second round: decisions and answers (read after the first "Update 18 Nov")
Matan's second set of comments, with my answers. Decided unless marked.
- SPOKEN PROMPTS must work on other children's devices too (it is being shared soon), not only on her device. Consequence (my analysis, PROPOSED): the browser's built-in speech is not reliable enough for that; see the research note in the architecture section. Recommended approach: a closed, fixed script of spoken lines (recorded or generated once, shipped as audio files), with every variable thing (numbers, names, items) shown and highlighted on screen, not spoken. No audio is built yet.
- ENGINE RESEARCH FIRST: yes. Step 1 (type inventory, `INVENTORY.md`) and step 2 (the contract, `CONTRACT.md`) are done on stacked branches before any code, and the choice of what to build first follows from them.
- WORDING: not "perfect/wrong child" for the automated tests; use "correct-answer run" and "incorrect-answer run".
- STREAK RULES (decided, replaces my earlier reading):
  1. Wrong answer, then guide, then another try with the correct answer: the streak continues.
  2. Wrong answer without a guide, or without another try: the streak resets.
  3. Guide opened before answering: the streak continues.
  Still no reward for a guided solve. Implementation note (mine): on a wrong answer for a type that has a guide, the reset is held (not applied) until she either skips the guide (then it resets) or tries again; the wrong answer is still logged as a mistake. "Another try" means she must answer the same question again after the guide, and the answer must be correct for the streak to continue; a second wrong answer then resets it.
- ART: Gemini work is cheap; the integration is routine. Individual images or sheets: see the answer in the chat and the note in the review section: roughly equal for me; sheets are cheaper for Matan (fewer prompts) and keep a style together, single images are better for redoing one picture. No change to the plan.
- HELP-PAGE BUG: fixed in branch `logic-help-example` off main (Step 59): the clue-table help now teaches with "isn't" clues only, like the real questions.
- "CHANGE WHAT SHE SEES" after a wrong tap: defined below, "Hint ladder, concretely".

## Hint ladder, concretely (18 Nov, PROPOSED; answers Matan's question on how to "change what she sees")
A wrong tap does not just say "try again". The ladder per step:
1. First miss: show the CONSEQUENCE of her choice, briefly, then rewind. Example (shop, choosing the operator for "6 were sold"): she taps "+"; the shelf shows 6 more yo-yos arriving and the covered "?" box grows, then everything rewinds. She can see that "sold" cannot make more. No words about the answer.
2. Second miss (a different wrong choice; the same wrong choice twice does not count): ask a SMALLER, more concrete question about the same step instead of the original one. Example: "After the sale, are there more or fewer yo-yos on the shelf?" with two picture buttons (more / fewer). Her answer maps to the operator for her, which she then places herself.
3. Third miss: demonstrate once (the correct move plays on screen), rewind, and she does it herself.
Other steps follow the same pattern: a wrong timeline point: the tapped event pulses and the order numbers appear on the timeline; a wrong "is/isn't" mark in the clue cards: the clue that rules it out lights up next to the chip she marked. A typed number cannot be brute-forced, so it gets a hint (the two numbers to combine are highlighted, then a number-line hop) but no consequence animation unless the operation itself is the mistake.
Needs per-board work: each board must supply, for each of its steps, a consequence view and a smaller question. That is part of the recipe (see CONTRACT.md).

# What's decided (Matan's choices, from voice notes)
- Direction: explore animated, interactive, child-guided step-by-step solutions for hard questions, instead of static instructions. Discussion stage, no implementation yet. (17 Nov)
- Entry points: BOTH of these. (17 Nov)
- 
  1. A quiet button at the edge of the question card after roughly 5-10 seconds of no activity (thinking time). No popup. The exact timing is provisional.
- 
  1. A stronger recommendation to solve together after a mistake.
- First example to flesh out: the shop "work backwards" question (חנות ההפתעות, generator gWorkBackwards). (17 Nov)
- Pen and paper may be needed later; wants a specific walkthrough now. (17 Nov)
- Pacing: slower and more deliberate, with more explanation AND more child input at every step. (17 Nov)
- Walkthrough structure (agreed 17 Nov), three acts: Act 1, a child-controlled FORWARD run of the story, starting from the unknown morning amount shown as "?" and going through the real events (sell 6, the delivery owl brings 8), landing on the known 24. The morning number stays unknown through the whole forward run; it is never revealed early. Act 2, a short explicit explanation: we know the end and need the start, so we have to run the film backwards. Act 3, the deliberate guided reverse (its step details below remain proposals).
- Matan asked for a few minutes to think, then returned (~15:18) with the concrete timeline-driven design below. (17 Nov)
- Interaction is TIMELINE-driven: the story events sit on a visual timeline and she interacts with the timeline itself. (17 Nov ~15:18)
- Act 1 forward run: the equation builds visually as she goes. An unknown "?" holds the morning amount, and numbers fly into the equation from the actual event positions (for example the owl's 8 flies in from the owl's spot on the timeline). (17 Nov)
- Act 2 transition to reverse: a visual turn-around with minimal supporting text. (17 Nov)
- Act 3 reverse: she clicks the actual timeline location of an event, not text or multiple-choice stage options, and the selected number transfers visually into the reverse equation. (17 Nov)
- She solves each simple isolated arithmetic step herself; the game does not auto-compute answers. (17 Nov)
- Retries: let her try a step a couple of times before offering further help. (17 Nov)
- Reverse anchor (CONFIRMED 17 Nov ~15:20): the reverse act starts at the known end (24), then she clicks the preceding timeline points moving backwards.
- Working preference for THIS project (17 Nov): actively scrutinize the design, flag holes and issues rather than accepting every suggestion.
- Inversion ownership (decided 17 Nov ~15:26; he accepted this gap as central): the child constructs the inverse herself, nothing is auto-filled in reverse. After she clicks the preceding timeline point, the ORIGINAL forward expression appears with reverse-direction arrows, and she builds the inverse exercise herself, then solves it. No automatic operand or sign reveal in reverse. How much of the exercise is prefilled, and the exact input method, are NOT settled.
- Forward run (Act 1) emphasizes the original operator. (17 Nov)
- Reverse teaching is generic and visual: opposites (plus becomes minus, and the reverse) taught with a generic example, separate from her actual question. (17 Nov)
- Superseded (17 Nov): the earlier reverse auto-fill idea (numbers flying into a finished reverse expression). The FORWARD number-flight into the building equation remains agreed.
# Open / proposed (NOT yet approved)
- After a mistake, hold back the instant answer reveal for types that have a walkthrough and offer "solve together" first. Today the game shows the correct answer immediately, which would kill the walkthrough before it starts.
- Hide the answer choices during the walkthrough (proposed).
- RESOLVED (17 Nov ~15:18): she solves each simple isolated arithmetic step herself; no auto-counter answers. (Was the open question: on-screen counter animates each result vs she computes.)
- Reward/streak semantics for a guided solve entered before answering. (Entering after a mistake changes nothing: the streak is already reset.)
- Offer a fresh question of the same type after a guided solve, as a mini-check.
- Hint escalation inside a step: rephrase the prompt, then highlight the right element, then demo once, rewind, and she redoes it herself (demo-then-redo, never demo-instead).
- Possible later layers: voice-over of prompts, pen-and-paper support for bigger numbers, per-type rollout starting with work-backwards.
- Unspecified mechanics (17 Nov): how she enters each arithmetic answer (keypad vs taps). How the undo operation itself gets chosen is part of the flagged inversion question in the scrutiny section.
- Proposal (from Instinct, 17 Nov, NOT decided): the generic reverse-teaching example should use different numbers from her actual question, so the teaching cannot hand her the answer.
# What the game has today (from the code, 17 Nov)
- Static per-type help pages behind an עזרה button: all 127 question types covered, worked examples, but generic and text-heavy, and never about her actual question.
- Wrong answer: choices lock, the correct one lights up, streak resets, one line reveals the answer, straight to the next question. No retry and no walkthrough of the question she missed.
- The parents area already tracks mistake kinds (e.g. digit swaps) and frames help as a parent-child conversation.
# Flagged issues / scrutiny (open)
- Forward-preview leak (flagged 17 Nov): Act 1 must not show the morning stock in a countable way and must not reveal intermediate totals, or the unknown is given away before any reasoning happens. A covered container marked "?" holding the stock while events animate in and out (opening only on the known 24) is one possible mitigation; proposed, not decided.
- Inversion ownership - RESOLVED (17 Nov ~15:26): he accepted this as the central gap. The child constructs the inverse exercise herself from the forward expression shown with reverse-direction arrows, then solves it; no auto-filled operands or signs in reverse.
- Order is not arithmetically forced in this instance: 24−8+6 and 24+6−8 both give 22, so "undo the last event first" is the film metaphor, not a math rule here. Fine to enforce as storytelling (his confirmed anchor leans this way), but picking the other event first should not be treated as a math error.
# Walkthrough draft history (early proposal, largely superseded - read the summary above first)
UPDATE (17 Nov, agreed): this walkthrough now runs in three acts: a child-controlled forward run of the story first (morning amount stays "?"), then a short explicit explanation of why we go backwards, then the guided reverse. Steps 1-6 below describe only that final reverse act and remain proposed detail, not approved. The earlier reverse-first shape is superseded.
UPDATE 2 (17 Nov, agreed interaction style): the steps run on a visual timeline. She clicks event locations on it, numbers fly from event positions into the equation, and she computes each arithmetic step herself. The text action-buttons in steps 2-3 below are superseded by timeline-location clicks; the underlying reasoning (last event first, undo each event) still stands.
UPDATE 3 (17 Nov, agreed): in the reverse act nothing is auto-filled. After she clicks the preceding timeline point, the original forward expression appears with reverse-direction arrows and she constructs the inverse exercise herself, then solves it. Reverse teaching of opposites (plus becomes minus and back) uses a generic visual example, separate from her question.
Real generated instance: "In the morning the surprise shop had some sparkling yo-yos. During the day 6 were sold, and then the delivery owl brought 8 more. Now there are 24. How many were there in the morning?" Answer: 22. Real distractors: 24, 38, 30, 26, 16 (each is a typical mistake, like repeating the last number or adding everything).
- 
  1. Orient: "Let's turn time backwards, like a reverse film! What was the LAST thing that happened?" She taps the last event card. Wrong pick: a soft wiggle and "that happened earlier, what came after?" Last-thing-first is the actual skill, and the random event order means it can't be memorized.
- 
  1. Reverse the delivery: "The owl brought 8. How do we undo a delivery?" Action choices, not numbers: "take 8 off the shelf" vs "add 8". Right: the owl flies back and 8 yo-yos hop one by one into its sack while the counter ticks 24 down to 16. Wrong: the game shows the consequence (counter jumps to 32), gently rewinds, and she tries again. Mistakes are explored and rewound, never failed.
- 
  1. Reverse the sale: same pattern. A customer walks back in, 6 yo-yos fly back onto the shelf, counter 16 to 22.
- 
  1. Read off the morning: "Nothing left to undo! How many were there in the morning?" She produces 22 herself. The game never said it.
- 
  1. Check (בודקים, the existing help-page house style): the film runs forward from her 22: sell 6 to get 16, owl brings 8 to get 24, "exactly like the story!" A small celebration, deliberately smaller than a prize moment.
- 
  1. Back to the original question card; she taps 22 herself.
- Cast note: the delivery owl (הינשוף השליח) is a real recurring character with existing art. Shop items come from a fixed pool (sparkling yo-yos, glowing stickers, rainbow beads, magic marbles...).
# Discussion log
- 17 Nov ~14:55: Voice note, explore interactive step-by-step guidance for the hard questions; animation and child-led actions over static instructions.
- 17 Nov ~15:00: Initial thoughts delivered (voice): current help is static and generic; candidate types include triple-symbol puzzles, work-backwards stories, rounds transfers, two-rule sequences.
- 17 Nov ~15:08: Voice note, chose BOTH entry points (quiet edge button after ~5-10s idle, plus a stronger after-mistake recommendation) and asked for one detailed example: the shop.
- 17 Nov ~15:10: Voice note, requested this living Notion doc. The detailed shop walkthrough was delivered by voice right after.
- 17 Nov ~15:14: Voice note, steering: slower and more deliberate, more explanation and more child input. Agreed the three-act structure (forward run with unknown "?" start, then why-backwards, then guided reverse). He is thinking it over and will return with concrete examples.
- 17 Nov ~15:18: Voice note with the concrete design: timeline drives the interaction; the forward run builds the equation visually ("?" plus numbers flying from event positions like the owl's 8); the reverse transition is visual with minimal text; she clicks timeline locations, not text or multiple-choice options; the selected number transfers into the reverse equation; she solves each simple arithmetic step herself; retry a couple of times before more help. One ambiguity (reverse anchor) asked back to him.
- 17 Nov ~15:20: Voice note: confirmed the reverse starts at the known end (24) and clicks preceding timeline points. Stated a working preference for this project: actively scrutinize the design and flag holes rather than accepting every suggestion. First scrutiny pass recorded in the Flagged issues section.
- 17 Nov ~15:26: Voice note: accepted inversion ownership as the central gap. Decided: the forward run emphasizes the original operator; opposites (plus to minus and back) are taught visually with a generic example; after clicking the preceding timeline point, the forward expression appears with reverse arrows and she constructs the inverse exercise herself, then solves it; no auto-filled operands or signs in reverse. Transcript was partially garbled; exact input fields and how much of the exercise is prefilled are not settled.
- 17 Nov ~15:30: Voice note: asked for a decided-only summary at the top so he can prototype soon. Summary added as the primary reading path; history and open items kept below.
# Second example comparison: three kids and three pets (17 Nov ~15:40, exploration, all PROPOSED, nothing decided)
This is exploration only. The agreed shop work-backwards design in the summary at the top is unchanged.
## What the question type is (verified in source, main 50a3ed1)
- Type gLogicGrid ("היגיון: טבלת רמזים"), rated hard. Source: math-quest.html, function logicGrid(false), about line 4728. It is multiple choice.
- Three kids, three different pets, exactly three clues, one question: who has pet X. Answer choices are the three kids plus "אי אפשר לדעת" (cannot tell).
- Each clue is either "the dog is with Dani" or "Noa has no cat". The generator keeps only clue sets where all three clues are needed and the answer is unique.
- Checked by enumeration: in this one-attribute version, every valid clue set is three "has no" clues. No "has" clue appears. So the child must use eliminations only.
- The existing static help page for this type (line ~2461) teaches a table with a check and cross per kid and pet, and the "last option left" rule. Its example has one "has" clue and two "no" clues, which the real generator would not produce. That mismatch is worth knowing.
## Example instance (built to follow the generator's rules, checked by brute force)
Dani, Noa and Tamar each have a different pet: dog, cat, fish. Clues: Noa has no dog. Noa has no cat. Tamar has no cat. Question: who has the dog? Answer: Tamar.
Reasoning: Noa has no dog and no cat, so Noa has the fish. Tamar has no cat and the fish is taken, so Tamar has the dog. Dani has the cat.
## Proposed child-led walkthrough (not decided)
1. Three kids on one side, three pets on the other, nothing connected. Clues appear one at a time and stay on screen.
1. The child taps a clue. The matching link between kid and pet gets a visible cross (she places the cross herself).
1. After the Noa clues, the child notices Noa has only one pet left. She taps that link to confirm it. The game does not do this for her.
1. The fish is now taken, so it greys out for the others. She applies this to Tamar herself.
1. She marks the last open link and answers. A wrong choice lets her retry a couple of times before more help, as in the shop design.
1. "Cannot tell" becomes a real choice she can reject because she can see the grid is fully resolved.
## Critical comparison with the shop (work-backwards) type
- Shop: a timeline of events drives everything, and the new skill is inversion (undo an event with the opposite operation). Arithmetic is the central step, and the child builds the reverse expression herself.
- Pets: a grid drives everything, and the skill is elimination. There is no arithmetic and no hidden unknown to protect. Tapping the clue and placing the cross is a fairly mechanical action, so the risk is that she crosses things off without reasoning. The real thinking is the step where one kid has only one option left, and that is the step she must perform herself.
- Fit gap 1: the "forward preview" idea and the number-flying idea do not carry over. The visual-source link here is clue text to a cross in the grid. This is a different interaction pattern, not the same one reused.
- Fit gap 2: the three-act structure (forward, turn, reverse) has no counterpart. There is a natural "clue by clue" order, but the clues are not a timeline.
- Fit gap 3: since every clue is a "no", the child's hardest moment is turning several "nos" into a "yes". That is the one step a prototype must not auto-do.
- Fit gap 4: the clue order is random, so the best clue to start with may not be first. Whether she may choose the clue order is an open design question.
- Where it fits well: it is purely visual, needs almost no text, and is easy to prototype because the generator gives the full state (kids, pets, clues, solution).
- Suggested read for the prototype choice: shop is the better test of the "guided reverse arithmetic" idea. Pets is a better test of a reusable grid and elimination mechanic. They test different things, so the choice depends on what he wants the first prototype to prove. This is an Instinct suggestion only.
# Scaling to the bonus type: kids, pets and favorite fruits (17 Nov ~15:45, exploration, all PROPOSED, nothing decided)
Triggered by his request that one mechanism work for both the three-kid/pet question and the bonus kid/pet/fruit question. The agreed shop design at the top is unchanged.
## What the bonus generator really does (verified in source, main 50a3ed1, logicGrid(true) about line 4728, used by bLogicGrid2)
- Three kids, three pets, three fruits. Exactly 4 clues. The question is which fruit one named kid likes. Choices are the 3 fruits plus "cannot tell".
- Clue kinds, each in a "yes" and a "no" form: (1) kid has / has no pet, (2) kid likes / does not like fruit, (3) RELATIONAL: "whoever has the dog likes the banana" or "whoever has the cat does not like the apple". The relational clue links a pet to a fruit without naming a kid.
- Every clue must be needed and the answer must be unique.
- I enumerated all valid clue sets (two sample solutions, all three questions, 1458 sets). Every one contains at least one relational clue. About 56 percent contain two or more. Only about 8 percent are all "no" clues.
- So a design where every clue is about a kid does not cover this type. The relational clue is the core case, not an edge case.
## Example instance (constructed to the generator's rules, brute-force checked, not a captured live question)
Dani, Noa, Tamar. Pets: dog, cat, fish. Fruits: apple, banana, grapes. Clues: Dani has the dog. Dani does not like apple. Whoever has the cat does not like apple. Whoever has the cat does not like banana. Question: what fruit does Dani like?
Reasoning: the cat owner likes neither apple nor banana, so likes grapes. Dani has the dog, so Dani is not the cat owner, so Dani does not like grapes. Dani does not like apple either, so Dani likes banana.
## Plausible mechanisms compared
A. Three separate grids (kid x pet, kid x fruit, pet x fruit). Standard in logic puzzles, but a 6 to 7 year old must juggle three tables and map across them. Relational clues fit the pet x fruit grid, but the inference chain jumps between grids. High usability risk. Not recommended as the default.
B. Kid cards with candidate chips. One card per kid with a pet row and a fruit row, each showing the three possible chips. Works well for kid-centered clues. Relational clues have no natural place, so this alone is not enough.
C. Kid cards plus loose "tie" tokens (proposed direction). Kid cards as in B. A relational clue appears as a small floating tie token linking a pet chip and a fruit chip, with a cross on it if the clue is a "no". She drags the tie token onto a kid card when she works out who it belongs to. Before that it stays loose, which shows "someone has the cat, and that someone is not the apple or banana kid".
D. Scene with connecting lines (kids, pets, fruits as three columns, she draws lines). Natural for the simple type, but exclusions and unknown relational links get messy as lines cross. Weaker at scale.
## Proposed mechanism C in more detail
- Every clue is a card she places herself. A kid clue crosses or confirms a chip on that kid's card. A relational clue becomes a loose tie token with a cross when negative.
- A confirmed chip is a kid-pet or kid-fruit connection she marks. The game never confirms a chip for her.
- Uniqueness: when she has marked a pet as belonging to one kid, the game does not grey it out for the others. She does that herself, as the earlier pets design says.
- In the example she would tie "cat owner" to grapes by crossing apple and banana on the loose token and picking grapes herself. Then she drags the grapes tie onto the kid who must be the cat owner, or crosses Dani from it once she sees Dani has the dog.
- The same mechanism handles the simple type: with no fruit row and no tie tokens it reduces to cards with a pet row. That is the scaling argument for C.
## Open questions (not decided)
- Whether she or the game decides when a loose tie token can be dragged onto a kid.
- Whether cross marks on a loose token can hold a "someone" who is still unnamed, or whether this is too abstract for age 6 to 7.
- Whether clue order is her choice.
- No prototype was made. This section is a text description; a layout sketch was added later (see the Refinement section).
## Critical read
- C is the only option that represents the relational clue without leaving the child-card view. Its risk is the loose token: it is abstract, and I have not seen a child use it.
- A "whoever has the dog" token must feel like a person-shaped placeholder. Making that tangible is the main design problem and should be tested before anything else.
- The bonus question is clearly harder than the shop question. Starting with the simple pets version and adding fruits later fits the scaling idea.
# Refinement: anonymous owner cards, no requirement to identify every kid (17 Nov ~15:50, exploration, PROPOSED)
Issue raised by the review of the loose-token idea: in the example, the cat owner stays unknown (Noa or Tamar) even after Dani's fruit is fully answered. The mechanism must not require tying a relational clue to a named kid, or solving the whole puzzle, to make progress. This replaces the "drag the tie token onto a kid" step in the previous section.
## Refined mechanism (proposed)
- A relational clue ("whoever has the cat does not like apple") makes an anonymous owner card: a "?" face plus the pet, with its own row of fruit chips. She crosses and confirms chips on it exactly as on a kid card.
- Kid cards stay as before (kid, pet row, fruit row).
- The anonymous card can stay unmatched for the whole question. It is merged with a kid only if she can say who it is. The game never merges and never rules out kids for her.
- She uses the anonymous card in the answer chain herself: it shows grapes. She then sees that Dani cannot be the cat owner (Dani has the dog), so Dani is not grapes. She crosses that on Dani's card herself.
- Where several relational clues name the same pet, they land on the same anonymous card. Clues for different pets make different cards (at most three).
## Cognitive overhead (my read, not tested)
- Cost: a new kind of card and a mental step ("the cat owner is not Dani, so Dani is not what the cat owner likes"). This is the real reasoning of the type, so it should be hers.
- Benefit: the same card idea means "someone who has X" in both types, so there is no special token and no forced identification.
- Risk: she may not see why the anonymous card and Dani's card connect. A visible link between the cat-owner card and Dani's pet row (dog) could help, but that is a hint design question and is open.
## Sketch (layout only, rough)
A first sketch had flaws (pet emoji did not render, crosses partly drawn, cramped labels) and was replaced. The corrected discussion sketch uses labeled chips (Dog/Cat/Fish, Apple/Banana/Grapes) with full crosses, and was delivered by WhatsApp. It is for adult discussion only, not child UI. Layout: three kid cards on top, a clue-cards area below with the anonymous cat-owner card. Minor flaw: crosses run through the crossed labels, so those are slightly harder to read. It has not been tested with a child and is not evidence the interaction is usable or approved.
# Logic grid types: baseline adopted vs still open (17 Nov ~15:50, from his 15:43 voice)
## Decided (his words)
- Card-and-candidate baseline: each kid has a card, and each candidate (pet, fruit) is shown as a picture or icon, not a word. Each candidate can be marked as "is" or "isn't". The guide shows how a clue maps onto a mark and guides the next inference.
- After she confirms an ownership or preference, the guide explicitly prompts her to remove the same option from the OTHER kids because each option is unique. She makes those removals herself; nothing is removed automatically.
## Not decided (liking the cards does not settle these)
- The anonymous-owner card for clues like "whoever has the cat" is still only a proposal.
- Exact visuals, who picks clue order, whether the game checks her marks against the true answer.
## Review notes (my critical read, proposed, not decided)
- Three different rules are easy to mix up and should be taught and prompted separately:
1. Across cards (uniqueness): Dani has the dog, so Noa and Tamar do not. This is the removal he wants her to do.
1. Within a card (one per row): Dani has the dog, so Dani has neither cat nor fish. A different rule, with a different prompt.
1. Category: an apple is not a pet. With separate pet and fruit rows and icons this is built into the layout and needs no elimination step.
- Two states are not enough. Proposed: "is", "isn't" and a neutral unknown that is the starting state. Unknown must not read as "isn't", otherwise untouched options look eliminated.
- Confirmed versus tentative: a guess should be a visibly different mark that does not trigger the uniqueness prompt and is never treated as true. If tentative marks drive removals, a wrong guess would silently spread.
- Do not remove a whole card or kid. Only individual candidates get marked.
- Subtle case for the anonymous card: uniqueness only holds between people known to be different. "The cat owner likes grapes" does not rule grapes out for Dani until she knows Dani is not the cat owner (Dani has the dog). So the uniqueness prompt for an anonymous card has to wait for that step and must not fire automatically.
- Open: whether the game should check a confirmed mark against the true answer, and what it does on a wrong confirmation.
# Implementation prompt and artwork inventory for the logic-card type (17 Nov ~15:55, DRAFT for discussion, nothing built or generated)
## Scope and status
- Scope starts with the logic type only (gLogicGrid and bLogicGrid2), not the shop type. A draft implementation prompt (.txt) was prepared for discussion. No code, no images, no pushes.
- The draft separates SETTLED mechanics (cards, icon candidates, is/isn't marks, child does the uniqueness removals herself, retries, entry points) from PROPOSED (unknown state, tentative marks, single-candidate marking) and OPEN decisions.
- OPEN, left visible in the prompt: how relational clues are shown (the anonymous owner card is a proposal only); feedback details for per-step validation (the validation itself is adopted); clue order; whether unknown is a visible question mark; faces count and style; how the mode ends and what happens to streak and reward.
## Candidate pools in the generator (source: math-quest.html, MG_PETS and MG_FRUITS near line 4726, main 50a3ed1)
- Pets, 6: dog, cat, rabbit, fish, parrot, hamster. Three are drawn per question.
- Fruits, 5: apple, banana, grapes, strawberry, watermelon. Three are drawn per question.
- Today the question shows these as Hebrew words only, with no icons.
- Kids: re-verified in the generator, 16 distinct names in const PEOPLE (near line 3865). Boys (8): דני, תום, איתי, יובל, עומר, גיא, ארי, נדב. Girls (8): דנה, נועה, ליה, מאיה, רוני, שירה, יעל, אלה. The logic types draw 3 with pickPeople(3). The same list feeds about 17 pickPeople calls, so one face per name could be reused across other types. No faces are attached to names today. Matan (17 Nov ~15:56) conditionally wants one dedicated consistent face per name if the amount is reasonable; 16 faces would cover the pool. Not decided: whether 16 is accepted and the face style.
## Existing assets that can be reused (ICON_IMG in math-quest.html, 50 named images; docs/ICONS.md)
- Candidate art confirmed as mapped: strawberry only (others may exist unmapped, see the unreviewed pool below).
- Unknown mark: a question_mark image exists.
- Faces confirmed as mapped: avatar_boy, avatar_girl, avatar_neutral (3). Count and style for the card faces are not decided.
- Check and cross: drawn in code, not images (docs/ICONS.md lists check and close marks as typographic).
- Room-item art in art/ (goldfish bowl, hamster in a dome, and others) is isometric furniture style for the room, not obviously usable as small card chips. Not reused unless he says so.
## No confirmed mapped image found (docs/ICONS.md plans filenames, Group 5 marked not started). The hash-named asset pool is UNREVIEWED: assets/ holds about 1,200 files not all mapped to names, and nobody has checked them for pet, fruit or face art.
- Pets: dog, cat, rabbit, parrot, hamster, and fish. Note: the doc plans a tropical-fish icon, while the generator's pet is plain "fish"; a decision on which fish picture is needed.
- Fruits: apple, banana, grapes, watermelon.
- So about 10 new candidate icons for these two types, plus faces if wanted. Based on the docs and ICON_IMG list in the repo clone; the doc may lag the code, though ICON_IMG confirms the current 50.
## Artwork prompt direction (draft only)
Same style as existing art (soft outline, pastel, same light direction), one icon per cell in a plain background grid, about 96 px, readable small, no text. Faces: OPEN.


# Review comments (Claude Sonnet 5.5, 18 Nov 2026): the guided-help proposal
Written after reading this whole log, the two draft prompts and the sketch, and after checking the code on current main (the generators `gWorkBackwards` and `logicGrid`, `checkAnswer`, the help entry points). Status: my opinion only, nothing here is decided or built. Where I disagree with something above I say so, and I say which of my own points are firm and which are guesses.

One check I ran, because the log leans on it: I called `logicGrid(false)` and `logicGrid(true)` 1,500 times each. The simple type never produced a positive ("has") clue (0 of 1,500), so the log is right that the child can only eliminate. The bonus type produced at least one relational clue ("whoever has the cat...") in 1,500 of 1,500, two or more in 833 (55%), and only "no" clues in 103 (7%). The log's figures hold.

## 1. The guidance feature as a general idea
**Verdict: a good idea, and aimed at the right gap. It only works if it stays a coach and not a solver.**
- Today's help is a generic page per type and the wrong-answer flow is a dead end: `checkAnswer` locks the choices, lights the right one, resets the streak, prints the answer and moves on. She never gets to think about the question she actually missed. Guided help fixes that, and the "she does every inference and every removal herself" rule is what makes it worth building.
- **Risk 1: it can become a way to avoid thinking.** If tapping "solve together" is easier than thinking, a 6 to 7 year old will learn to wait for it. The idle button after 5 to 10 seconds is too eager for a child who reads slowly in Hebrew: reading a 3-line story problem can take that long. I would start at 20 to 30 seconds, never count a tap on the card as "idle", and make it a parent-area setting.
- **Risk 2: rewards and stats.** A guided solve is not an independent success. Without a rule it would inflate the skill stats and the adaptive difficulty (`SKILL_DIFFICULTY`), and she could farm stickers. Minimum rule: a guided solve records as "guided" (its own flag in `logAnswer`), does not raise difficulty, and earns no sticker. The reward goes to a fresh question of the same type afterwards (the log's "mini-check" idea, which I would make part of the core design and not an option). That is also the only evidence we will have that the guide teaches anything.
- **Risk 3: text and reading load.** The agreed principle is "slower, more explanation, more child input", and also "minimal text". Those fight each other in a reader this young. Spoken prompts are listed as "later"; I would move them to "early" (a short recorded or synthesized Hebrew line per step), or at least design every step so it is understandable from the picture alone.
- **Risk 4: per-type bespoke work does not scale.** There are 127 question types. If every guided type is hand-built, only 3 to 5 will ever exist. The shop and the logic grid are different shapes (timeline vs cards), so one engine for both is unrealistic, but a small shared step engine is realistic: a data-driven list of steps, a retry counter, a hint ladder, "she acts, the game checks, the game narrates", and a common exit. Build that first from the shop type and let the logic type reuse it.
- **Pick types by evidence, not by feel.** The parents area already logs mistake kinds. Before building a third type, look at which types she actually misses, and spend effort there.
- **Always keep an exit.** A "skip, show me the answer" for the child and a parent-area switch for the whole feature. A guided mode with no way out is how a frustrated child stops playing.

## 2. The specific design for the shop "work backwards" question
**Verdict: sound structure, three problems to fix before prototyping, and two spots where the log contradicts itself.**
What is right: the covered "?" in the forward run, nothing auto-filled in reverse, retries before help, and treating "undo the last event first" as storytelling because 24 - 8 + 6 and 24 + 6 - 8 both give 22. All good, and the log already caught the order and leak issues.

Problems and gaps:
1. **The generator cannot drive this yet.** `gWorkBackwards` returns only a text string and four choices; the numbers, the order of the two events and the item are not kept. The guided mode needs a structured payload (item, morning amount, the two events with their kind and number in story order, the end amount), and the story text should be built from that same payload so the two cannot disagree. This is a small refactor but it comes first, and the same pattern then applies to the next type.
2. **The step that causes most mistakes is not in the agreed design.** The distractors tell the story: 38 is 24 + 6 + 8, 30 is 24 + 6 and 16 is 24 - 8. The typical error is reading the sentence and choosing the wrong operation ("sold" means minus, "brought more" means plus), or doing both in the wrong direction. In Act 1 the log says the equation "builds visually" and the "original operators are emphasized", which reads as the game placing the operators. I would make her place them: for each event she taps - or + (retry on a wrong tap). That is the cheapest and most valuable interaction in the whole walkthrough, it is language-to-operation, and the game should not do it for her.
3. **The arithmetic inside the steps is itself hard at this age.** Both reverse steps cross a ten (24 - 8, 16 + 6), and the generator allows morning amounts up to 30. "She solves each step herself" is right, but the log postpones pen and paper and has no support for a child who gets 24 - 8 wrong, so she would be stuck inside the guide. Add an optional support in the hint ladder: a number-line or ten-frame hop that she moves herself. This does not break "never solves for her".
4. **Act 2 should be conditional.** A generic opposites lesson (with different numbers, as proposed, which I agree with) is right the first time or two, but a child who has seen it will find it slow. Keep a per-profile flag and shorten or skip it after it has been seen twice. Three acts for a question with only two events is a lot of taps; count the interactions before building and aim for a walkthrough that takes about two minutes.
5. **Tension to resolve in the log:** it says the selected number "transfers visually into the reverse equation" (decided) and also "no auto-filled operands or signs" (decided). I read these as compatible only if the transfer happens because she clicked the event (her action) and the operator and the result are hers. Please confirm that is the intent, or the prototype will argue with itself.
6. **Unspecified, and prototype-blocking:** how she enters a number (a small keypad is likely right for 2-digit results; taps on number tiles are too easy to guess), what happens after the last retry (the log has a hint ladder with demo-then-redo; it needs a terminal state, for example "ask a grown-up" with the parents' hint text), and what the card shows for the other generator wordings (the owl text and the plain delivery text; the owl is the one with art).
7. **Hiding the answer choices during the walkthrough: agree.** Also hold the answer reveal for types that have a walkthrough (the log lists it as proposed; it is not optional, because `checkAnswer` currently reveals the answer immediately and ends the question). That is a change to a core path, with its own tests.

## 3. Suggested next steps and effort
**Required decisions before code** (small, one conversation): idle timing (or make it a setting), the reward and stats rule above, whether the mini-check is part of the core, the number-entry method, and what happens after the last retry.
**Then, in this order**, each as its own branch stacked on the previous one, like the reading groups:
1. **Structured generator + guide hook.** `gWorkBackwards` returns the payload, a "guide" button appears when the type has a walkthrough, the answer reveal can be held, `logAnswer` takes a "guided" flag, no visible walkthrough yet. Small.
2. **Step engine + Act 1** (forward run: timeline, covered "?", she picks the operators, the equation builds, numbers fly from the events). Medium. This is where the animation and layout risk is, and where a child should see it.
3. **Acts 2 and 3** (the turn, then the reverse she builds), retries and the hint ladder, the exit, the mini-check. Medium to large.
4. **Wiring and polish**: the idle button and after-mistake offer, the parents' switch, stats and reward rule, help text, Hebrew copy with vowels, accessibility. Small to medium.
5. **Play-test with the child**, then change the design. I would not build the logic type before this.
Behind a flag (for example a hidden parents-area switch) until step 5 is done, so main stays shippable.

**Effort compared with recent work** (my estimate, same unit: the work done in one of our sessions):
- The welcome-screen rewrite: small. One short-reading group (generators, banks, tests): small to medium.
- The 3D windows + sills + twelve art pieces: large (new rendering path, a new surface host, an art pipeline, many test updates).
- **Shop guided mode, whole thing (steps 1 to 4): about 1.5 to 2 times the 3D wall step**, because it is a new UI engine with animation, a state machine and copy, not data. Each of the four branches is the size of a reading group or a bit more.
- **Logic-grid guided mode: about 2 to 3 times the shop mode**, mostly because of the art (about 10 icons and, if wanted, 16 faces: several Gemini rounds like the windows needed) and the relational/anonymous card, which is the part that is both the hardest to build and the least proven with a child. The log's own draft prompts are right to treat it separately.
- Uncertainty: the estimate for the shop is firm to within a factor of 1.5; the logic one is a guess until the anonymous card has been tried on paper with the child.

## 4. Anything else
- **Test the hard idea on paper first.** The anonymous owner card ("whoever has the cat") is the least proven idea in this log. A pen-and-paper session with the real child, using the sketch, costs nothing and would tell us more than any amount of design.
- **Emoji are fine for the first prototype.** The log worries about 10 pet and fruit icons and 16 faces. The game already falls back to emoji elsewhere; prototype with emoji, and commission art only after the mechanic works. Faces per name (16) look like a nice-to-have, not a requirement.
- **The existing help page for the logic type shows an example the generator never produces** (one "has" clue). It is worth fixing on its own, now, regardless of guided help.
- **Doc housekeeping:** this branch is based on main as of 50a3ed1 and main has moved on a lot; it is docs only so a merge is clean, but please merge it before it drifts. The Notion export lost its numbering (every step in the shop walkthrough reads "1." under empty bullets); I left it as is rather than edit your history. The log says the Notion page is the live version; two versions will drift, so decide which is canonical.
- **The log asks for scrutiny, so one more:** the "mistakes inside a step: retry a couple of times" rule is right for a mistake and wrong for a guess. If a child taps randomly three times she will pass by elimination. Count a wrong try only once per different tile, or let the hint ladder after two misses change the question, not just repeat it.

## Status and corrections after Matan's comments (18 Nov)
- Decisions: see "Update 18 Nov" near the top. Superseded by them: the review's "idle 20 to 30 seconds" (now 30, configurable), "decide the reward rule" (decided), "number entry method" (typing), "what happens after the last retry" (nothing special).
- Correction on art: the review treated art as a big cost driver. Making the pictures with Gemini is cheap. The part that costs on the building side is small and routine: cutting the sheet into pieces, mapping them to names in `ICON_IMG`, a test, and keeping the 26 pictures in one style. The logic type's real weight is the relational "anonymous owner" card, not the pictures. My estimate for the logic type is therefore about 1.5 to 2 times the shop type, not 2 to 3.
- Clarification of the point about the existing help page (the review's section 4): the static help entry for gLogicGrid (math-quest.html, the HELP table, about line 2463) teaches with the example "the fish is with Tamar. Dani has no dog. Who has the cat?". That is one "is" clue and one "isn't" clue. The real generator (checked 1,500 times) only makes "isn't" clues for this type. So the page teaches with a kind of clue she will never meet and never shows the hard step she actually needs: turning two or three "isn't" clues into an "is". Suggested fix, independent of guided help: change the example to three "isn't" clues.
- Clarification of the point about "mistakes inside a step" (the review's section 4, last bullet; it refers to the lines "MISTAKES INSIDE A STEP: she gets to retry a step a couple of times" in the summary and "Retries" in the decided list). Many steps are a choice among very few options: tap + or -, pick which event happened last, mark a chip "is" or "isn't". With two options, "retry a couple of times" means she can pass by trying both, without thinking, and never reaches the help. Suggestion: (1) after a wrong try, change what she sees (highlight, or a smaller question) instead of just letting her try again; (2) do not count the same wrong tile twice; (3) log tries per step and the time between taps, so a pattern of fast guessing shows up in the analytics. For typed numbers this is not a problem because she cannot brute-force a number. Matan's later answer (retry loops are acceptable, analytics will tell) covers the exit; this point is about whether a retry teaches anything, and is a small change to the step rules, not a new feature.

# Architecture proposal: a sustainable way to build guides for most types (18 Nov, PROPOSED, nothing decided)
Triggered by Matan's critique: a "step engine" alone is only a helper and does not make 127 guides cheap; he asked to settle this first.
## The honest answer
A generic step engine (retries, hints, exit, analytics) is plumbing and is worth maybe 15 to 20 percent of the work per guide. It does not cut the cost. What can cut it is reuse at three other levels, and only if they are designed on purpose:
1. BOARDS (the visual model of a problem). The 127 types are not 127 different kinds of thinking. By area in SKILL_META: stories 26, numbers 22, patterns 18, reading 16, logic 13, symbols 12, shapes 11, clock 9. My guess (not verified, needs the inventory below) is that 8 to 10 boards cover most of them: a quantity timeline (the shop and most stories), a number line / ten frame (arithmetic steps), a place-value chart (numbers, rounding), a sequence strip (patterns), a card grid (logic), a "highlight it in the text" board (reading), a clock face, a shape/measure board, an expression builder (symbols). A board owns the drawing and the kinds of child action (tap, type, drag, mark). Writing a board is the expensive part, once.
2. A SOLUTION TRACE FROM THE GENERATOR. Each generator already knows the answer; it should also return the worked solution as data (the model, and the ordered steps with their results). The guide is then a function of the trace, not hand-written text per type. This is the single biggest saving, and it is also what keeps the guide and the question from disagreeing (see the shop point about the structured payload).
3. A FREE TEST HARNESS. With a trace, a test can automatically play every guide with correct answers, and as random incorrect answers, for hundreds of generated questions. Each new guide then comes with its main test for almost nothing, and any change to a generator that breaks its guide is caught.
## Proposed layers (what is generic and what is per type)
- Engine (generic, once): entry points (idle button, after a mistake), holding the answer reveal, no streak reset, flag and settings, exit, tries and time per step, the hint ladder, the final "try one yourself" step, analytics. Small to medium.
- Boards (generic, about 8 to 10 over time): rendering and child actions. Each is a medium to large piece of work, written when the first type that needs it is built.
- Recipe per type (small): maps the generator's payload to a board's data, says which step is the key skill, lists the typical mistakes (the distractors already encode them), and holds the prompt templates (Hebrew, voweled). A type on an existing board should cost less than one short-reading group.
Tiers: tier 0 is a generic "solve it in small steps" for multi-step arithmetic types (she types each intermediate result from the trace, no special board). It is cheap, covers many types and proves the plumbing. Tier 1 is board guides. Tier 2 is bespoke (the shop timeline's reverse act, the logic cards' anonymous owner).
## Where the risk is
- The trace contract must be right for the first two or three types, or every later guide pays for the mistake. That is why the next step below is a design inventory and not code.
- Writing a good recipe is mostly pedagogy (what is the one insight, what do children get wrong), not code. Reuse will not remove that part. It can be made faster by writing recipes in a template with the distractors already listed.
- Reading types are a different problem (evidence in a text, not a computation); they should wait.
## Spoken prompts with variable text (Matan asked, 18 Nov; PROPOSED answer)
- Reasonable, yes, but it depends on the approach.
- Option 1, the browser's speech synthesis (Web Speech API): works for any variable text (names, numbers, items) at no asset cost, nothing to record. Quality and whether a Hebrew voice exists varies by device (the child's device decides), and it must be feature-detected and switchable. Vowel marks in the text can confuse some engines, so the spoken string may need to be a separate unvoweled field from the displayed text.
- Option 2, pre-made audio clips: consistent quality, but the variable parts are the problem. A fixed script of instructions is a closed set and works; names (16), items, and numbers would need a clip each and joined clips sound choppy and break Hebrew gender and inflection.
- Recommendation: build every prompt as a template with slots from the start (so either approach can speak it), ship option 1 first as an optional extra behind a parents setting, listen to it on the child's actual device, and decide on recorded clips for the fixed instruction script only if the quality is not good enough. Do not block the first guide on audio.
## Proposed next step (for discussion)
A design inventory before any code: (a) go through all 127 types and tag each by solution shape and candidate board, and by whether its generator can return a trace cheaply; (b) write the contract (the payload, the trace, the board interface, the step and hint vocabulary, the analytics events) and test it on paper against 4 or 5 very different types (shop, simple arithmetic, a pattern, the logic grid, one clock question); (c) then build the engine and tier 0 behind the debug flag as the first code, because it exercises the entry, reveal hold, streak, typing input and analytics across many types at once, and show real data on which types need a board; (d) then the shop board as the first real board. Plan against the log's earlier step list: it becomes (c) and (d) after (a) and (b).
