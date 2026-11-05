# Question categories: analysis and proposal

**Status: all 3 steps built (sections re-organised; stories re-themed for חנות ההפתעות; new types for גן הצורות). Steps 2 and 3 await your review.**

Analysis of all 97 question types (84 regular, 13 bonus, plus the mix level). Suggestion only: nothing has been changed in the game yet.

## What is confusing today

1. **The sections mix three different ideas.** Some are named after a topic (שעון הקסמים, ארמון המספרים), some after a feeling or story (טירונות מתוקה, מגדל הקינוחים), and some after the picture style (סימנים קסומים, בלש הצורות). The original six levels were also a difficulty ladder (level 1 easiest). Difficulty is now a separate setting, so the sections should be pure topics.
2. **"טירונות מתוקה" says nothing.** It holds 13 word problems and 1 odd type. Parents will not know what it practises.
3. **Numbers appear everywhere.** Arithmetic is spread over four sections: the castle (add and subtract), word problems, money (in the tower) and symbol puzzles. Sequences are spread over four sections too (castle, tower, detective, and a bonus).
4. **סימנים קסומים and בלש הצורות feel the same** because both are "emoji pictures". The real difference is that in the symbols section a picture stands for a number (it is algebra with pictures), while the detective section needs no calculation (it is reasoning about pictures and words). Today the detective section also contains counting and rule-finding types that are really patterns.
5. **בלש הצורות is a grab bag:** 22 types in four different topics (word logic, picture logic, a pattern type, and geometry).
6. **Two taxonomies.** The game has 7 sections, but the progress report groups by 10 different "areas". A parent sees "visual logic" in the report and has no section by that name.

## Where the types sit today

| Section | Types | Areas it mixes |
|---|---|---|
| טירונות מתוקה | 14 | word problems 13, patterns 1 |
| ארמון המספרים | 23 | numbers 19, patterns 4 |
| סימנים קסומים | 9 | symbols 9 |
| שעון הקסמים | 7 | clock 7 |
| מגדל הקינוחים | 9 | patterns 4, money 5 |
| בלש הצורות | 22 | logic 6, visual 11, patterns 1, geometry 4 |

## Proposal: 7 topic sections plus the mix

Each type goes to exactly one section (checked by script: no type missing, none twice).

| # | Section | What the child does | Types (regular / bonus) | Easy / medium / hard |
|---|---|---|---|---|
| 1 | 🏰 **ארמון המספרים** (keep) | Number sense and calculation: digits, number words, order and compare, between, riddles, add and subtract two-digit | 20 / 1 | 10 / 8 / 2 |
| 2 | 🏪 **חנות ההפתעות** (replaces טירונות מתוקה) | Story problems, including money and shopping | 18 / 3 | 9 / 6 / 3 |
| 3 | 🦄 **סימנים קסומים** (keep) | A picture stands for a number: equations with unknowns | 9 / 2 | 2 / 5 / 2 |
| 4 | 🕒 **שעון הקסמים** (keep) | Reading a clock, time that passes, schedules | 7 / 2 | 2 / 3 / 2 |
| 5 | 🍰 **מכונת הקינוחים** (replaces מגדל הקינוחים) | Rules and patterns: machines, number sequences, skip counting, picture rules | 15 / 3 | 5 / 5 / 5 |
| 6 | 🔍 **בלש ההיגיון** (replaces בלש הצורות) | Pure reasoning, no calculation: odd one out, analogies, grids, clue tables, counting by property | 11 / 2 | 3 / 3 / 5 |
| 7 | 📐 **גן הצורות** (new) | Geometry: polygon names, perimeter, completing shapes | 4 / 0 | 0 / 3 / 1 |
| 8 | 🌈 **אתגר הקשת בענן** (keep) | The mix | all | all |

**Names:** "חנות ההפתעות" (chosen) fits the shop story and the shopping questions. "מכונת הקינוחים" is already the name of one of the pattern questions, and it keeps the dessert theme. "בלש ההיגיון" says what it is. If you prefer other names, only the label changes; ids stay.

### What moves

- To **חנות ההפתעות**: the five money types (coins, price comparison, change, splitting a cost, budget) and the two money-flavoured bonus types, from the tower.
- To **מכונת הקינוחים**: skip counting (4 types) from the castle; the machine and sequence types from the tower; from the detective, the shape sequence, counting pattern, growing steps, find-the-rule, the two double-rule types and the moving square; and the bonus types about machines and finding the error.
- To **ארמון המספרים**: the one odd type in the old טירונות (fill the number).
- To **גן הצורות**: the four geometry types, out of the detective section.
- **Detective keeps** only the reasoning types.

### Make the progress report match

Replace the 10 "areas" with the same 7 names, so the report says exactly what the child sees (word problems and money merge; verbal and visual logic merge). This also fixes confusion 6.

## Open points

1. **גן הצורות is too thin** (4 types, none easy, one hard). The rule "at least 2 types per level" needs about 4 more: for example *how many sides or corners*, *which shape is a rectangle*, *count the squares on a grid*, *perimeter of an L-shape* (hard). Until they exist there are two choices: build them (recommended), or keep geometry inside בלש ההיגיון for now (then call it "בלש הצורות וההיגיון").
2. **ארמון המספרים is the biggest** (20). If you want it split: calculation (add, subtract, compare expressions) as its own section needs hard types as well (for example three-number addition, missing digit in an addition).
3. **Layout:** 8 buttons on a phone is 3 + 3 + 2. Easy to lay out (the two last buttons get wider).
4. **Saved progress is safe.** Section ids do not change, only names and which types they contain. A child who was on "מגדל הקינוחים" will land on "מכונת הקינוחים". Progress history is kept per question type, so moving types does not lose anything.
5. The sample tests' items fit well: number sense and arithmetic in the castle, story problems in the bakery, sequences in the machine, shapes in the garden.

## Built in step 1

- Level order and ids: ארמון המספרים (7), חנות ההפתעות (1), סימנים קסומים (2), שעון הקסמים (6), מכונת הקינוחים (3), בלש ההיגיון (4), גן הצורות (8, new), אתגר הקשת בענן (5). Ids of existing sections did not change, so saved progress stays valid.
- Every regular type is in exactly one section; the mix has all of them. Bonus types moved with their section; the mix level now draws from every bonus type, and גן הצורות uses the mix bonuses until it has its own.
- Progress-report areas now equal the sections: מספרים וחישוב, סיפורים וכסף, חידות סמלים, שעון וזמן, דפוסים וסדרות, היגיון, צורות והיקף. Old stats keep working (areas are derived from the question type, not stored).
- Layout: 3 per row on phones (a short last row gets wider buttons), 4 per row on tablets, one row on large screens.
- Icons: store and garden images added (the garden's faint rainbow was removed with the background). Test: `sections.js`.
- Gap closed in step 3: גן הצורות now has 4 easy, 3 medium and 3 hard regular types, plus its own bonus.
