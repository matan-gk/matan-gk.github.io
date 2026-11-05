# Cupcake Quest: icon inventory

Every emoji the game uses today, grouped by how much it matters, with the filename each image should have. Emoji are drawn by each device's own emoji font, so they look different on iPhone, Android and Windows, and a few newer ones can show as an empty box on old devices. Images fix both.

**Current count:** 152 distinct symbols. Only **114** need an image from you; the other 38 (colored circles, squares, hearts, and typographic marks) I will draw in code, which is crisper and keeps the colors exact.

## Status

- **Groups 1, 2 and 3 (46 icons): done and live in the game.** The neutral avatar uses your separate image.
- **Group 4 (5 icons): next, and the most visible gap.** Level 2 puzzles mix these with the Group 1 items, so a puzzle can show a donut image next to an emoji watermelon.
- **Group 5 (63) and the drawn shapes (38): not started.**

## How to hand them over

- One sheet per group below, icons in a grid **in the order listed**, on a plain flat background (same way as the earlier sprite sheets). I will cut, remove the background and shrink each one.
- Style: match the existing unicorn and upgraded-reward art (soft outline, pastel). Same light direction and outline weight across a sheet.
- Please make the *regular* reward icons look like the simpler version of the upgraded ones you already gave me (donut, cupcake, etc.), so merging reads as an upgrade.
- Do it in any order and in stages. Until an icon has an image, the game keeps showing its emoji, so nothing breaks half-way.
- Size: about 96 px is enough for everything (shown at 24 to 64 px). Expect roughly 3 to 8 KB each, so all 114 add about 0.5 MB to the file.

## Group 1: collectible rewards (14) — done

The 14 things the child collects. Today the regular version is an emoji, and the upgraded version is already your artwork.

| Emoji | File | Notes |
|---|---|---|
| 🦄 | `unicorn.png` | also level 2 icon, party text |
| 🧁 | `cupcake.png` | also party text |
| 🍦 | `soft_serve.png` |  |
| 🍩 | `donut.png` |  |
| 🌈 | `rainbow.png` | also level 5 icon, party text |
| 🍓 | `strawberry.png` |  |
| 🍒 | `cherries.png` |  |
| 🎀 | `ribbon.png` | also looks/wardrobe and "new look" text |
| 🍬 | `candy.png` | also level 1 icon |
| 🍨 | `ice_cream.png` |  |
| 🩷 | `pink_heart.png` | newest emoji (2022), empty box on older devices |
| ✨ | `sparkles.png` | also the merge button and the sparkle on upgraded items |
| 🍭 | `lollipop.png` | also the bonus-question tag and "next question" button |
| 🧋 | `bubble_tea.png` | newer emoji (2020) |

## Group 2: level icons and celebration (14) — done

Seen on the level buttons, in praise messages and in pop-ups.

| Emoji | File | Notes |
|---|---|---|
| 🍰 | `cake_slice.png` | level 3 icon, party text |
| 🔍 | `magnifier.png` | level 4 icon |
| 🎉 | `party_popper.png` | cotton candy win, party text |
| 🎊 | `confetti_ball.png` | party text |
| 💖 | `sparkling_heart.png` | "איזה יופי" button, party text |
| 🌟 | `glowing_star.png` | praise |
| 💫 | `dizzy_star.png` | praise |
| 🎯 | `bullseye.png` | praise |
| 🪄 | `magic_wand.png` | party text (newer emoji) |
| 👋 | `waving_hand.png` | welcome title |
| 🙂 | `smile.png` | footer tip |
| 🎁 | `gift.png` | rewards room title and strip |
| 🔥 | `fire.png` | streak counter in the top bar |
| ⭐ | `star.png` | score chip, strong-skill label, gold counter |

## Group 3: admin panel and profile icons (18) — done

| Emoji | File | Notes |
|---|---|---|
| ⚙ | `gear.png` | profile chip and panel title |
| 👤 | `profile.png` | profile chip, Profiles tab |
| ✏ | `pencil.png` | edit profile |
| 🗑 | `trash.png` | delete profile |
| ➕ | `plus.png` | new profile |
| 🔒 | `lock.png` | locked look |
| 📊 | `bar_chart.png` | Progress tab |
| 🧭 | `compass.png` | areas heading |
| 📅 | `calendar.png` | activity heading |
| 🌱 | `seedling.png` | needs-practice label, empty state |
| 🌿 | `herb.png` | on-the-way label |
| ❔ | `question_mark.png` | not-enough-data label |
| 📈 | `trend_up.png` | trend up |
| ➡ | `trend_flat.png` | trend flat |
| 📉 | `trend_down.png` | trend down |
| 👧 | `avatar_girl.png` | girl profile avatar |
| 👦 | `avatar_boy.png` | boy profile avatar |
| 🧒 | `avatar_neutral.png` | neutral profile avatar |

## Group 4: symbols used inside the symbol puzzles (5) — next

Used as the "magic symbols" in the level 2 equations (together with the Group 1 items).

| Emoji | File | Notes |
|---|---|---|
| 🍥 | `swirl.png` | retired as a reward, still a puzzle symbol |
| 🍪 | `cookie.png` |  |
| 🍉 | `watermelon.png` |  |
| 🍇 | `grapes.png` |  |
| 🎈 | `balloon.png` |  |

## Group 5: objects inside questions (63) — optional, do last

These appear in the "which one does not belong" and similar logic questions. The game can keep using emoji for them indefinitely; they only matter if you want every device to look identical, or are worried about older devices. Many are old, universally supported emoji.

**Food (16)**

| Emoji | File |
|---|---|
| 🍫 | `chocolate.png` |
| 🍎 | `apple.png` |
| 🍌 | `banana.png` |
| 🍊 | `orange.png` |
| 🍐 | `pear.png` |
| 🍑 | `peach.png` |
| 🍋 | `lemon.png` |
| 🍅 | `tomato.png` |
| 🥕 | `carrot.png` |
| 🥔 | `potato.png` |
| 🧅 | `onion.png` |
| 🧄 | `garlic.png` |
| 🍠 | `sweet_potato.png` |
| 🥒 | `cucumber.png` |
| 🌽 | `corn.png` |
| 🍆 | `eggplant.png` |

**Animals (29)** (🦭 seal is a 2020 emoji)

| Emoji | File |
|---|---|
| 🐶 | `dog.png` |
| 🐱 | `cat.png` |
| 🐹 | `hamster.png` |
| 🐰 | `rabbit.png` |
| 🐻 | `bear.png` |
| 🐠 | `tropical_fish.png` |
| 🐬 | `dolphin.png` |
| 🐙 | `octopus.png` |
| 🦑 | `squid.png` |
| 🐳 | `whale_spouting.png` |
| 🦭 | `seal.png` |
| 🐋 | `whale.png` |
| 🦈 | `shark.png` |
| 🐔 | `chicken.png` |
| 🐢 | `turtle.png` |
| 🐍 | `snake.png` |
| 🐊 | `crocodile.png` |
| 🐮 | `cow.png` |
| 🐜 | `ant.png` |
| 🐝 | `bee.png` |
| 🐞 | `ladybug.png` |
| 🦋 | `butterfly.png` |
| 🕷 | `spider.png` |
| 🦅 | `eagle.png` |
| 🦉 | `owl.png` |
| 🦜 | `parrot.png` |
| 🕊 | `dove.png` |
| 🦆 | `duck.png` |
| 🐧 | `penguin.png` |

**Vehicles, instruments, clothes (18)**

| Emoji | File |
|---|---|
| 🚗 | `car.png` |
| 🚌 | `bus.png` |
| 🚲 | `bicycle.png` |
| 🚓 | `police_car.png` |
| 🚚 | `truck.png` |
| ✈ | `airplane.png` |
| 🚢 | `ship.png` |
| 🚁 | `helicopter.png` |
| 🎸 | `guitar.png` |
| 🎹 | `piano.png` |
| 🥁 | `drum.png` |
| 🎺 | `trumpet.png` |
| 🎻 | `violin.png` |
| 👕 | `t_shirt.png` |
| 👗 | `dress.png` |
| 🧦 | `socks.png` |
| 👖 | `jeans.png` |
| 🧥 | `coat.png` |

## Not needed from you: I will draw these in code (38)

- **Colored circles (9):** 🔴 🟠 🟡 🟢 🔵 🟣 🟤 ⚫ ⚪
- **Colored squares (9):** 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬛ ⬜
- **Colored hearts (9):** ❤️ 🧡 💛 💚 💙 💜 🤎 🖤 🤍
- **Typographic marks (11):** ✕ ✓ ▾ ▴ → ← ● ■ ▲ ◆ ★ (close button, check mark, dropdown arrows, matrix shapes)

These are plain shapes. Drawing them as CSS or SVG makes them exactly the same on every device and fixes color-blind confusion between similar emoji colors.

## Suggested order

1. Group 1 (14), then Group 3 (18): everything the child and parent see all the time.
2. Group 2 (14).
3. Group 4 (5).
4. Group 5 (63) only if you want it.

Groups 1 to 4 are 51 images. Group 5 is optional.

## Added later: level 7 icon (ארמון המספרים)
- 🏰 `castle.png`: done (supplied by you, background removed). Level 7 icon.
- 🏪 `store.png` (חנות ההפתעות) and ⛲ `garden.png` (גן הצורות): done, supplied by you. The level buttons for the new names use them.
