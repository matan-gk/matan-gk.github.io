# English version: plan (tabled, not started)

Status: **tabled** (2026-11-27). Nothing in the code has changed. The audience question (Israel vs the US) is open; market research comes first. This file records the review and the decisions so the work can start later without redoing them.

## Decisions taken
1. **US English, US dollar.** The half-shekel coin question (`gMoneyCoins`) becomes a quarter question; every help example changes to match.
2. **One game, one codebase.** The language is a setting that loads a language file; the switch is mostly hidden. Entry by `?lang=en` (and a stored per-device setting). Two small non-cosmetic consequences: the installed app (PWA) needs an English manifest or a start page ending in `?lang=en` (about half a day), and a separate stub page for a stable English link is optional (10 minutes).
3. **Inches for US.** The 16 "ס״מ" spots become "in"/"inches" and the numbers can stay (the shapes are abstract); the 19 "מטר" spots and any realistic heights need a quick look.
4. **Ship as soon as there is something playable**, then add one level per branch. The reading level ("ספריית הסיפורים", level 9) comes last.
5. **Audience:** early stage. Before a public US launch the cloud features need a children's-privacy review (US rules treat under-13 data specially); that is a legal question, not an engineering one. A private alpha with friends does not need it.

## What the code review found (main at 2026.11.25-era, 906 KB page)
- **Text:** about 197 KB of Hebrew in 1,870 lines (1,410 string literals plus 438 template lines). Help system 35% (105 entries, 127 worked examples), reading banks 25% (9,400 vowel marks), the 106 question generators 9%, the rest is the parent panel, cloud and save text, the clue-grid guide, the 205 room item names and the two themes.
- **Language-bound question types (about 16 of 106):** the reading type and its 8 vocalized variants (`gReading`, `gSh*`), `gAnalogyWord`, `gPairAnalogy`, `gWordsToNum`, `gNumToWords`, `gClockWords`, `gDigitOf`, `gPolygonName`. The other ~90 only need their sentences rewritten.
- **Hebrew grammar in the templates:** 55 calls address the child by gender (`G()`), 20 pick the pronoun for a name (`v()`), 76 prefix-glued spots (`ל${name}`, `ב-${n}`), about 170 dual-form words (שני/שתי). English drops the child-gender part but still needs he/she, plurals and a/an. Shop items need singular forms too.
- **Direction:** less tied to RTL than expected. The scene and room positioning is physical left/top and symmetric; fonts (Rubik, Baloo 2) already include Latin. About 40 spots need work: the clue grid (`direction:rtl`), 3 `margin-left`, the arrows (← → ›), 9 scroll calls, 5 swipe handlers, 21 "right/left" wording spots in questions and help, row order of emoji sequences.
- **Names:** 16 names tied to portrait faces. Hiro, Rohan, Priya, Amal, Miko, Dana already work in English; about 9 need new names that suit their faces.
- **Money:** the shekel; `gMoneyCoins`, `gChange`, `gBudget`, `gCheaperBundle`, `gCheaperPerItem`, `gSplitCost`, `gCompareTotals` and their help (about 24 "ש"ח" spots).
- **Tests:** 90 of 107 test files contain Hebrew text assertions (587 lines). `tests/golden/logicgrid.json` is language-specific.
- **Size:** English text would pass the 950 KB page limit in `splittest`, so the languages must load from separate files (the file split also solves the page-size issue).
- **No audio or speech** to localize. Images contain no text (the screenshots in the repository root are documentation).

## Phases (required unless marked optional)
| Phase | What | Effort (engineer-days, as if one person did it) |
|---|---|---|
| 0. Decisions | Settled above | 0.5 |
| 1. Language layer | All Hebrew moved into a `he` language file behind `t()`; language files load on demand and are cached by the service worker; language switch and an English skeleton. Safety net: a seeded before/after comparison of generated questions, so Hebrew stays byte-identical. | 5–7 |
| 2. Left-to-right | Direction per language, the ~40 spots, the clue-grid guide, visual checks on 4 screen sizes | 2–3 |
| 3a. Question sentences | Rewrite the ~90 translatable generators and pools (items, names, pronouns, plurals, money, clock phrases, number words) | 5–7 |
| 3b. Help system | 105 entries, 127 examples, rewritten to match the new sentences, currency and names | 4–5 |
| 3c. UI and parent text | Parent panel, cloud and save text, welcome, shop, room (205 items), both themes, guide, privacy text | 4–5 |
| 4. Tests | Suite runs in both languages; checks for Hebrew leaking into English, grammar checks on generated English, direction checks | 3–5 |
| 5. Polish | Visual pass, English proofread, reading-level check for grades 1–3 | 3–4 |
| Optional: reading level | New English content (5 comprehension types, about 30 passages), not a translation | 5–7 |
| Optional: admin page | `admin.html` (39 Hebrew lines) | 0.5 |
| Optional: space theme | About 7 KB of text | 1 |

Core English game: about 27–36 engineer-days; with the optional parts about 34–45. About ±30%.

**What the "days" mean:** a yardstick for the size of the work, not days spent together. In our working terms (Claude working, you reviewing and merging) the first playable English game is about 10–14 hours of work over 4–5 branches (language layer, left-to-right, essential screens, one level with its help); each further level is a small branch of about 2–4 hours. The core game is about 25–40 hours of work plus about 10 hours of your play-testing across 10–14 branches. Fully unattended it would be about 1.5 to 3 days nonstop, but automated tests cannot judge clarity for a young child or how the left-to-right layout feels.

## Ship-early slicing (proposed order)
1. **Language layer** (Phase 1), alone, Hebrew unchanged and proven identical.
2. **Left-to-right and the English skeleton** (Phase 2), including the English PWA manifest.
3. **Essential screens in English** (welcome, play flow, parent area basics) and **one level**, the story/store level (1), with its help (money, names and plurals exercise most of the machinery). **First playable English game; ship here.**
4. One branch per remaining level: number palace (7), magic symbols (2), clock (6; clock phrases), dessert machine (3), logic detective (4), shape garden (8; polygon names), rainbow mix (5).
5. Room and shop names, themes, parent and cloud text in full; tests in both languages.
6. Polish, English proofread.
7. Reading level (optional, last).

## Risks
- **Phase 1 is the riskiest** (it touches almost every line of text). The seeded comparison is the safeguard, which is why it goes first and alone.
- Help examples and templates must stay in sync, or the help shows a currency or name the question never uses.
- Automated tests cannot judge wording for a child or the feel of the left-to-right layout; each branch needs a short human play-test.
