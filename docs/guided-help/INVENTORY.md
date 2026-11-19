# Guided help: inventory of the 127 question types (18 Nov 2026, step 1 of the engine research)

Status: PROPOSED classification, written from reading a sample of every generator on main (v2026.11.18a). Nothing here is built. It answers one question: how many different things do the guides have to be built from? The tags are my judgement and should be checked, especially "trace" (how cheaply the generator can hand over a worked solution) and the board per type.

## How to read it
- **Board**: the visual model a guide would be drawn on (a family, see the table below). **Trace**: can the generator return the worked solution as data? `easy` = the numbers and the formula are already in the generator and need only be returned in a structured way; `medium` = needs a small solver, a restructuring, or the picture is built in code; `hard` = the rule is hidden in the drawing; `none` = there is no computation to trace (vocabulary, relations, reading inference).
- **Hard** = difficulty 3 in `SKILL_DIFFICULTY` (44 of 127). This is the game's own rating, not her mistake data. Her real mistakes (the parents area, Progress) should decide which types come first; I have not seen them.

## Summary
| Board | What it is | Types | Of them hard |
|---|---|---|---|
| SEQ | Sequence strip (numbers or shapes in a row) | 14 | 6 |
| PV | Place value and number sense | 13 | 2 |
| GRP | Groups and sharing (equal groups, division, price per item) | 12 | 5 |
| GEO | Shapes: sides, perimeter, symmetry | 11 | 4 |
| TEXT | Evidence in a text (tap the words) | 10 | 4 |
| SYM | Symbol equations (substitute, balance) | 9 | 5 |
| CLOCK | Clock face | 9 | 4 |
| VERB | Vocabulary and relations (no board; at most a hint) | 8 | 1 |
| BAR | Bar model (part and whole, more and less) | 7 | 1 |
| PROC | Written and number-line arithmetic | 7 | 0 |
| SCAN | Look, tap and count; odd one out | 7 | 3 |
| TL | Timeline of events (a quantity changing over time) | 6 | 3 |
| RULE | Rule machine (what happens to the input) | 6 | 2 |
| CLUE | Clue cards, number candidates, latin square | 5 | 4 |
| ORD | Ordering chain (line things up from clues) | 3 | 0 |
| | **Total** | **127** | **44** |

Trace: easy 90, medium 24, hard 1, none 12.

### What the count says
- My earlier guess of "8 to 10 boards" was a little low: this is 14 families plus the types with no board. But the families are not 14 separate pieces of work. They are built from about ten primitives that repeat: a **number line**, **groups of items** (counters, coins), **cards with choice chips**, a **row of cells**, a **clock face**, a **polygon with labelled sides**, **text with tappable words**, plus the **actions** (type a number, tap an element, drag a token, mark a cell). A family is mostly a particular arrangement of these.
- Three families (TL, BAR, GRP) cover 25 of the 26 word-problem types (the 26th, gDaysMore, is a sequence) and share one idea: the story's quantities drawn as a picture. If they share their primitives, they are one board with three views, not three.
- Arithmetic and number sense (PROC, PV: 20 types) mostly need the number line and a place-value chart; the arithmetic steps inside every other guide need them too, so they are the first shared primitives to build.
- 12 types have no computation to trace (VERB, most of TEXT). A guide for these is a different kind of help (point to the evidence, give the context clue); I would leave them out of the first wave and decide separately.
- Types marked `easy` are the bulk (90). For them the main cost is not the trace; it is writing a good recipe (the key insight and the typical mistakes).

## All types
One row per type, grouped by area. Difficulty: 1 easy, 2 medium, 3 hard.

### stories (26)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gSharing` | בעיית חלוקה | 2 | GRP | easy | equal sharing, divide |
| `gMultiplyChain` | בעיית כפל | 2 | TL | easy | two "times" events in a row |
| `gLeftover` | בעיית שאריות | 1 | BAR | easy | whole minus the named parts |
| `gCompareTotals` | השוואת סכומים | 3 | GRP | easy | two products, then the difference |
| `gRoundsTransfer` | משחק בסבבים | 3 | TL | medium | transfers keep the total the same; two people at once |
| `gDifferenceMore` | בעיית הפרש | 1 | BAR | easy | compare two bars, "more than" means add |
| `gGroups` | בעיית קבוצות | 1 | GRP | easy | groups times how many in each |
| `gRemainder` | בעיית שארית | 2 | GRP | easy | deal out, see what is left |
| `gEvenShare` | חלוקה שווה | 2 | GRP | medium | which divisors work: try and check |
| `gDaysMore` | סכום ימים | 2 | SEQ | easy | list the days, then add them |
| `gMoneyCoins` | מטבעות | 1 | GRP | easy | total price, then count the coins |
| `gCheaperBundle` | השוואת מחירים: סך הכל | 2 | GRP | easy | two totals, compare |
| `gCheaperPerItem` | השוואת מחירים: ליחידה | 3 | GRP | easy | price per item: divide the bundle |
| `gChange` | עודף | 1 | BAR | easy | number line from the price up to what was paid |
| `gSplitCost` | חלוקת הוצאה | 1 | GRP | easy | total divided by people |
| `gCompareChain` | שרשרת השוואות | 3 | BAR | easy | chain of "more/less than"; each step needs a name |
| `gWorkBackwards` | מחשבים אחורה | 3 | TL | easy | the first guided type (see the log) |
| `gBudget` | תקציב | 3 | GRP | easy | how many fit in the money, what is left |
| `gPartWhole` | כמה מכל סוג | 1 | BAR | easy | whole, one part known, find the other |
| `gTookAway` | כמה נשארו | 1 | TL | easy | one "minus" event |
| `gGotMore` | כמה יש עכשיו | 1 | TL | easy | one "plus" event |
| `gTwoGroups` | שני מדפים | 2 | BAR | easy | two parts, add |
| `gMadeAndLeft` | הכינו ומכרו | 2 | BAR | easy | two made, some left, how many sold |
| `bL1_CombineThenDivide` | בונוס: חלוקה דו-שלבית | 3 | GRP | easy | two steps, add then divide |
| `bL1_ChainMinusLoss` | בונוס: שרשרת עם אובדן | 3 | TL | easy | a "times" event, then a loss |
| `bL3_ComboMoneyChange` | בונוס: כסף ועודף | 3 | GRP | easy | three steps, add, share, take from the note |

### numbers (22)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gMulFact` | לוח הכפל | 1 | PROC | easy | groups or skip counting |
| `gFillNumber` | השלימו את המספר | 1 | PROC | easy | number line, how far to the target |
| `gDigitOf` | ספרות: עשרות ואחדות | 1 | PV | easy | place value chart |
| `gBuildNumber` | בונים מספר מספרות | 1 | PV | easy | tens and ones, build it |
| `gWordsToNum` | ממילים למספר | 1 | PV | easy | number words to digits |
| `gNumToWords` | ממספר למילים | 2 | PV | easy | digits to number words |
| `gDigitCompare` | ספרות: נכון או לא נכון | 2 | PV | easy | compare the tens first |
| `gFindByDigit` | מי מהם: לפי ספרה | 1 | PV | easy | look at the tens digit |
| `gBiggestOfFour` | הגדול והקטן | 1 | PV | easy | compare tens first, then ones |
| `gOrderNumbers` | מסדרים מספרים | 2 | PV | easy | line up, tens first |
| `gMissingDigit` | ספרה חסרה | 2 | PV | easy | compare the tens, then the ones |
| `gBetween` | מספר באמצע | 1 | PV | easy | number line |
| `gNumberRiddle` | מי המספר | 2 | CLUE | easy | candidates narrowed by each clue |
| `gPredSucc` | הקודם והעוקב | 1 | PV | easy | number line, one step |
| `gAddTwoDigit` | חיבור דו-ספרתי | 1 | PROC | easy | tens, then ones |
| `gAddCarry` | חיבור עם נשיאה | 2 | PROC | easy | carry the ten |
| `gSubTwoDigit` | חיסור דו-ספרתי | 1 | PROC | easy | tens, then ones |
| `gSubBorrow` | חיסור עם פריטה | 2 | PROC | easy | break a ten |
| `gBiggerExpr` | איזה תרגיל גדול יותר | 2 | PROC | easy | work out both, compare |
| `gDigitsMinMaxDiff` | הפרש בין הגדול לקטן | 3 | PV | medium | build the biggest and the smallest, then subtract |
| `gHowManyBuild` | כמה מספרים אפשר לבנות | 3 | PV | medium | list the numbers in an order so none is missed |
| `bNum_Clues` | בונוס: חידת מספר | 3 | CLUE | medium | needs a small solver to check the candidates |

### symbols (12)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gTwoSymbols` | חידת סמלים | 2 | SYM | easy | put one equation into the other |
| `gThreeSymbols` | חידת סמלים משולשת | 3 | SYM | easy | same, with a longer chain |
| `gCirclePattern` | מספרים בקשת | 2 | RULE | easy | find the rule on the first arc, apply it on the second |
| `gInequality` | אי-שוויון | 2 | SYM | easy | cancel the same part on both sides |
| `gSingleSymbolMul` | חידת סמל בודד | 1 | SYM | easy | one symbol repeated, divide |
| `gSumDiff` | סכום והפרש | 2 | SYM | easy | add the two equations, halve |
| `gDigitSymbol` | ספרה בסמל | 3 | SYM | medium | try the digit; start from the units column |
| `gCompareSymbols` | השוואת סמלים | 1 | ORD | easy | a chain of ">" |
| `gSymbolsMul` | סמלים וכפל | 3 | SYM | easy | solve the easy symbol first, then the other |
| `bL2_ThreeEquations` | בונוס: שלוש משוואות | 3 | SYM | easy | three equations, the question gives a hint |
| `gFourLinkChain` | שרשרת של ארבעה | 2 | ORD | easy | a longer chain of ">" |
| `bL4_WordToSymbol` | בונוס: משימה כפולה | 3 | SYM | easy | a word problem, then a symbol equation |

### patterns (18)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gMachine` | מכונת הקינוחים | 2 | RULE | easy | the same step on every example |
| `gSequence` | סדרה | 2 | SEQ | easy | find the step, apply it |
| `gMissingMiddleSeq` | סדרה עם חור | 1 | SEQ | easy | the step from the neighbours |
| `gShapeAnalogy` | מצאו את החוק | 1 | RULE | easy | what happened to the shape |
| `gShapeSequence` | סדר הקשת בענן | 1 | SEQ | easy | cycle of colours |
| `gCountingPattern` | כמה יופיעו | 1 | SEQ | easy | one more each time |
| `gMovingSquare` | הריבוע ההולך | 3 | SEQ | medium | position on a board, drawn in code |
| `gTwoRules` | שני חוקים ביחד | 3 | RULE | easy | two changes together |
| `gInterleavedSeq` | שתי סדרות מעורבבות | 3 | SEQ | easy | two sequences mixed, split them |
| `gSkipPair` | דילוגים: מה הלאה | 1 | SEQ | easy | skip counting forward |
| `gSkipFill` | דילוגים: מה חסר | 2 | SEQ | easy | the step from the two known ends |
| `gSkipMember` | האם המספר בסדרה | 2 | SEQ | easy | does skip counting land on it |
| `gCountInSeries` | כמה מספרים בסדרה | 3 | SEQ | easy | the n-th term |
| `bNum_FirstOver` | בונוס: חידת סדרה | 3 | SEQ | easy | first term over a limit |
| `gGrowingSteps` | צעדים שגדלים | 3 | SEQ | easy | dots per step, the step itself grows |
| `bL3_TwoStepMachine` | בונוס: מכונה כפולה | 3 | RULE | medium | two hidden steps, found from the examples |
| `bL4_SpotErrorSequence` | בונוס: מצאו את הטעות | 3 | SEQ | medium | find which term breaks the step |
| `gComboRule` | שני שינויים ביחד | 2 | RULE | easy | two changes together, different parts |

### logic (13)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gAnalogyWord` | אנלוגיה | 2 | VERB | none | name the relation |
| `gPairAnalogy` | זוגות תואמים | 3 | VERB | none | name the relation |
| `gOddOneOutCategory` | מי לא שייך (קבוצה) | 1 | SCAN | medium | what do three share? needs the rule the generator used |
| `gHiddenOdd` | מי לא שייך | 3 | SCAN | medium | which attribute differs |
| `gHeightOrder` | סדר גבהים | 2 | ORD | easy | line the children up by the clues |
| `gLogicGrid` | טבלת רמזים | 3 | CLUE | easy | three kids, three pets (see the log) |
| `gOddOneOutShape` | מי לא שייך (צורות) | 1 | SCAN | medium | which attribute differs |
| `gCountAttribute` | ספרו בעיון | 1 | SCAN | easy | tap each match, count |
| `gOddGrid` | איזה לוח שונה | 3 | SCAN | hard | the secret rule is in the drawn boards |
| `gCondCount` | ספירה חכמה | 3 | SCAN | easy | look at the neighbours, count |
| `gCountCircles` | ספירת עיגולים | 2 | SCAN | easy | tap each circle, count |
| `bLogicMatrix` | בונוס: מטריצה | 3 | CLUE | medium | each row and column once |
| `bLogicGrid2` | בונוס: טבלת רמזים | 3 | CLUE | medium | relational clue, anonymous owner (see the log) |

### clock (9)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gClockHour` | שעון: שעה וחצי | 1 | CLOCK | easy | hour hand, minute hand |
| `gClockQuarter` | שעון: רבעי שעה | 1 | CLOCK | easy | quarters of the circle |
| `gClockFive` | שעון: דקות | 2 | CLOCK | easy | count the fives |
| `gClockWords` | שעון: איך אומרים | 2 | CLOCK | easy | say the time in words |
| `gClockPick` | שעון: איזה שעון מתאים | 2 | CLOCK | easy | find the clock for a time |
| `gClockLater` | שעון: בעוד כמה זמן | 3 | CLOCK | easy | move the hands on |
| `bClock_Earlier` | בונוס: לפני כמה זמן | 3 | CLOCK | easy | move the hands back |
| `bClock_Duration` | בונוס: כמה זמן עבר | 3 | CLOCK | easy | from the start to the end |
| `gSchedule` | לוח זמנים | 3 | CLOCK | easy | work backwards in time |

### shapes (11)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `gPolygonName` | שם המצולע | 2 | GEO | easy | count the sides, then the name |
| `gPerimeter` | היקף | 2 | GEO | easy | walk around, add the sides |
| `gRectPerimeter` | היקף מלבן | 3 | GEO | easy | two lengths and two widths |
| `gCompleteShape` | משלימים צורה | 1 | GEO | medium | the picture is drawn in code |
| `gShapeSides` | כמה צלעות | 1 | GEO | easy | count the sides |
| `gWhichShape` | איזו צורה | 1 | GEO | easy | properties of the shape |
| `gCountSquares` | סופרים ריבועים | 1 | GEO | easy | count by rows |
| `gSymmetryLine` | קו סימטריה | 2 | GEO | medium | fold the shape |
| `gLPerimeter` | היקף צורת L | 3 | GEO | medium | two missing sides must be worked out |
| `gMissingSide` | צלע חסרה | 3 | GEO | easy | perimeter minus the known sides |
| `bShapes_JoinedRects` | בונוס: שני מלבנים מחוברים | 3 | GEO | medium | the inner edges are not part of the outline |

### reading (16)
| Type | Name | Diff. | Board | Trace | Note |
|---|---|---|---|---|---|
| `rdCause` | קריאה: סיבה | 2 | TEXT | medium | find the because-sentence |
| `rdWordRole` | קריאה: תפקיד מילה | 3 | TEXT | none | what does the word do in the sentence? |
| `rdPhrase` | קריאה: משמעות ביטוי | 2 | VERB | none | vocabulary; at most a hint from the context |
| `rdPurpose` | קריאה: מטרת משפט | 3 | TEXT | none | what is the text for? |
| `rdNotInText` | קריאה: מה אין בקטע | 3 | TEXT | medium | check each answer against the text |
| `rdWordMeaning` | קריאה: פירוש מילה | 2 | VERB | none | vocabulary; at most a hint from the context |
| `rdMotive` | קריאה: למה עשה | 2 | TEXT | medium | find the reason in the text |
| `rdSynonyms` | מילים נרדפות | 2 | VERB | none | vocabulary; at most a hint from the context |
| `gShNotInText` | קריאה קצרה: מה אין בטקסט | 2 | TEXT | medium | check each answer against the text |
| `gShSynonyms` | קריאה קצרה: מילים נרדפות | 2 | VERB | none | vocabulary; at most a hint from the context |
| `gShPurpose` | קריאה קצרה: מטרת הטקסט | 2 | TEXT | none | what is the text for? |
| `gShCause` | קריאה קצרה: סיבה | 2 | TEXT | medium | find the because-sentence |
| `gShMotive` | קריאה קצרה: למה עשה | 2 | TEXT | medium | find the reason in the text |
| `gShWordRole` | קריאה קצרה: תפקיד מילה | 3 | TEXT | none | what does the word do in the sentence? |
| `gShPhrase` | קריאה קצרה: משמעות ביטוי | 2 | VERB | none | vocabulary; at most a hint from the context |
| `gShWordMeaning` | קריאה קצרה: פירוש מילה | 2 | VERB | none | vocabulary; at most a hint from the context |

## First-wave candidates (my suggestion, to be checked against her real mistakes)
Chosen as: hard in the game's own rating, trace `easy` or `medium`, and a board that other types can reuse.
- TL: `gRoundsTransfer`, `gWorkBackwards`, `bL1_ChainMinusLoss`
- BAR: `gCompareChain`
- GRP: `gCompareTotals`, `gCheaperPerItem`, `gBudget`, `bL1_CombineThenDivide`, `bL3_ComboMoneyChange`
- SYM: `gThreeSymbols`, `gDigitSymbol`, `gSymbolsMul`, `bL2_ThreeEquations`, `bL4_WordToSymbol`
- SEQ: `gMovingSquare`, `gInterleavedSeq`, `gCountInSeries`, `bNum_FirstOver`, `gGrowingSteps`, `bL4_SpotErrorSequence`
- RULE: `gTwoRules`, `bL3_TwoStepMachine`
- CLUE: `gLogicGrid`, `bNum_Clues`, `bLogicMatrix`, `bLogicGrid2`
- CLOCK: `gClockLater`, `bClock_Earlier`, `bClock_Duration`, `gSchedule`
- GEO: `gRectPerimeter`, `gLPerimeter`, `gMissingSide`, `bShapes_JoinedRects`

## Open questions
- Her mistake data (parents area, Progress) is the right way to order the types. Can it be exported, or shown per type, so the order is not a guess?
- Is the reading area out of scope for the first wave? (8 + 8 types, none with a simple trace.)
- Do the `none` types get a lighter kind of help later (a hint from the context) or stay with the static help page?
