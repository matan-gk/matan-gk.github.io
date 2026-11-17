# Cupcake Quest: cloud setup (Firebase, free plan)

What this gives you: progress saved in the cloud (all profiles, with statistics) in two ways, a Google account or an anonymous backup reached with a family code, and a "report a problem" button whose reports land in a list only you can read. No server code, no credit card. The game keeps working offline and without an account (the cloud is a mirror of what is on the device).

Time needed: about 15 minutes. Everything below happens in your browser.

## 1. Create the project
1. Go to https://console.firebase.google.com and sign in with the Google account you want to own this.
2. **Create a project**, name it (e.g. `cupcake-quest`). When asked about Google Analytics, turn it **off** (not needed).
3. Stay on the **Spark** plan (free, asks for no payment method). Do not upgrade. On Spark you can never be charged: if a free limit is hit, the service just stops answering until the daily reset.

## 2. Register the web app and copy its settings
1. On the project home page click the **`</>` (Web)** icon, name the app, leave "Firebase Hosting" unchecked, click **Register app**.
2. You will see a block like:
   ```js
   const firebaseConfig = { apiKey: "...", authDomain: "...firebaseapp.com", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
   ```
   Keep this page open (you can always find it again under Project settings, General, Your apps).
   These values are not secrets. What protects the data is the rules in step 5 and the allowed-domains list in step 4.

## 2b. Paste the settings into the game
Open `math-quest.html` in a text editor, search for `const CLOUD_CONFIG = null;` and replace `null` with the object from the previous step:
```js
const CLOUD_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };
```
(`apiKey`, `authDomain`, `projectId` and `appId` are the four that are needed.) Save. This is the only edit to the game file.

## 3. Turn on sign-in
Build, Authentication, **Get started**, then the **Sign-in method** tab:
1. Enable **Google**. Pick a project support email. Save.
2. Enable **Anonymous**. It is **required** for the anonymous cloud backup (a device joins a family with a code and needs no account), and it also lets a signed-out visitor send a problem report. If you skip it, the anonymous backup option shows a message that it is not enabled yet; the Google account option keeps working.

## 4. Allow your site's address
Authentication, **Settings**, **Authorized domains**, **Add domain**: add `YOURNAME.github.io` (just the host name, no `https://` and no path). `localhost` is already there for testing. Without this step the Google popup says "unauthorized domain".

## 5. Create the database and the rules
1. Build, **Firestore Database**, **Create database**. Edition: **Standard**. Database ID: leave `(default)` (the free quota applies to the default database). Location: pick one near your users (for Israel, `eur3` or `me-west1`); it cannot be changed later. Mode: **Production mode**.
2. Open the **Rules** tab. Delete everything and paste the contents of `firestore.rules`.
3. In the file, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with the Google account email you will use to read reports. Click **Publish**.

### How access works (one paragraph)
Progress lives in **families**: `families/<familyId>/profiles/<profileId>`. A family id is 26 random characters (130 bits, shown to the parent as the "family code"). Anyone who is signed in, with Google or anonymously, and who knows the exact id can read and write that family; nobody can list or search the `families` collection, so ids cannot be discovered. A Google account remembers its family in `users/<uid>`. The anonymous option is therefore a shared secret, not an identity: whoever holds the code can see and change that family's progress.

### Check the rules (3 minutes)
In the Rules tab open **Rules playground** and try:
- **get** `/families/ABCDEFGHJKLMNPQRSTUVWXYZ23/profiles/x`, **Authenticated** (any provider, any UID) -> **Allowed**. Unauthenticated -> **Denied**. (The id must be exactly 26 characters: this example is 26.)
- **get** `/families/SHORT/profiles/x`, Authenticated -> **Denied** (an id of the wrong length is refused).
- The playground has no "list" option. Listing the `families` collection itself is blocked simply because no rule allows it, so ids cannot be browsed.
- **get** `/users/abc`, provider google, UID `abc` -> **Allowed**. Same with UID `zzz` -> **Denied**. With provider anonymous -> **Denied**.
- **get** `/reports/r1`, unauthenticated -> **Denied**.

## 6. Publish the game and test
1. Upload the edited `math-quest.html` to GitHub Pages as before.
2. Open the game, parent area, tab **גיבוי ושחזור**. It has three options: **גיבוי מקומי** (the code you copy and paste, no cloud), **חשבון בענן** (Google) and **גיבוי אנונימי**.
3. **Google:** choose **חשבון בענן**, **התחברות עם Google**. After signing in it says **מסונכרן**, and the page shows the **family code**. In the Firebase console, Firestore Database, Data, you should see `users / <your uid>` (with the family id) and `families / <id> / profiles / ...`. Open the game on a second device or browser and sign in with the same account (from the welcome screen, "יש לי חשבון"): the same profiles appear, with no code.
4. **Anonymous:** on a device with no Google login (for example a child's device), choose **גיבוי אנונימי**, **התחלת גיבוי אנונימי**. The page shows the family code. On another device choose "יש לי קוד" (or "יש לי קוד משפחה" on the welcome screen) and enter it: the profiles appear and both devices keep each other up to date. Signing in with Google later, on a device that has an anonymous backup, attaches that family to the account.
5. Send a test report (parent area, tab **דיווח**, or the menu): it appears under `reports`. As the admin you can also delete reports there.

### Upgrading from an earlier version of the game
Profiles used to be stored under `users/<uid>/profiles`. The first time an existing Google user signs in with this version, the game moves them into a family and deletes the old copy. Publish the new rules first (they still allow reading and deleting the old location, and nothing else there).

## Admin page (read only): `admin.html`
A separate page for looking at the data: summary and things worth checking, every family with its profiles (name, score, level, answers, accuracy, last played, raw data), and the problem reports with the question attached. It cannot change or delete anything. It can also download what it loaded as a JSON backup.

**1. Update the rules.** Publish the latest `firestore.rules` (it adds two read-only lines for the admin email). If you prefer to edit your live rules by hand: in `match /users/{uid}` change the first line to `allow read: if isGoogle(uid) || isAdmin();` (and `allow delete: if isGoogle(uid);` on its own line), and add this block before the final catch-all:
```
match /{path=**}/profiles/{pid} {
  allow read: if isAdmin();
}
```
**2. Open the page.** Two ways:
- **Next to the game** on GitHub Pages: upload `admin.html` to the same folder. That address is already in Authorized domains, so Google sign-in works. Nothing links to it, but the protection is the rules, not the hidden address.
- **On your own computer:** put `admin.html` in a folder, run `python3 -m http.server 8000` there, and open `http://localhost:8000/admin.html`. `localhost` is authorized by default. Double-clicking the file (`file://`) does **not** work, because Google sign-in does not run from a file.

**3. Sign in** with the admin Google account (the email in the rules), then press **טעינת הכול**. Every document loaded counts as one read on the free plan (50,000 a day), so the page loads only on request and shows how many it read.

**Secrets:** none in `admin.html`. It contains the same Firebase web settings as the game (they identify the project and are not secret) and no password or service-account key. The admin email is only in the rules. Anyone who opens the page sees a sign-in button, and without the admin account every load is refused. Check in the Rules playground: **get** `/families/ABCDEFGHJKLMNPQRSTUVWXYZ23/profiles/x` with provider google, a different email -> allowed for any signed-in user (that is the family access); the admin-only part is the collection-group read, which you see working when the page loads all families.

## Reading problem reports
Firestore Database, Data, collection `reports`. Each report has the message, optional contact, game version, and (when sent from a help page) the question's type, level, text and the answer the game expects. Reports do not contain the child's name or progress.

## What it costs on the free plan, and how far it stretches
Official free limits (Cloud Firestore, Spark plan, per project; reads, writes, deletes reset daily around midnight Pacific time): **1 GiB** stored, **50,000 reads/day**, **20,000 writes/day**, **20,000 deletes/day**, **10 GiB/month** outbound data. A document is limited to 1 MiB. Firebase Authentication with Google/anonymous sign-in has no cost on Spark.

What one player uses per day (measured by simulating the game's real sync code: 20 minutes of play, plus three returns to the tab):

| | 20 min/day | 45 min/day |
|---|---|---|
| Writes (uploads) | about 21 | about 46 |
| Reads | about 5 | about 8 |
| Downloads | 4 x profile size | 4 x profile size |

A profile starts at about 4 KB and grows to about 110-150 KB once it holds the maximum 2,000 logged answers (that takes weeks of daily play).

| Limit (free) | Players per day it supports | Which usage it assumes |
|---|---|---|
| 20,000 writes/day | about 950 (20 min/day) or about 430 (45 min/day) | all players active the same day |
| 50,000 reads/day | several thousand | not a concern |
| 10 GiB/month downloads | roughly 800 with fully grown profiles, thousands with typical ones | 4 downloads a day |
| 1 GiB storage | about 7,000 fully grown profiles | not a concern |

So a few dozen players are nowhere near any limit, and several hundred are comfortable. The first limit you would meet is the daily write quota, at around 400-900 players playing on the same day. (The numbers are per project and per day, so players spread over a week count much less.)

The game protects the free quota: at most one upload per profile per minute, at most 150 uploads per device per day, at most 5 reports per device per day, and a size cap on every document. If a limit is ever reached, the game keeps working and shows "ההתקדמות נשמרת במכשיר ותסונכרן מחר".

Honest limit: anyone can sign in anonymously, so a deliberately malicious visitor could create many families and burn the day's write quota for everyone (the rules cap what each document can hold but cannot rate-limit). For a parents' community that is very unlikely; if it ever happens, turn on Firebase App Check (free) or contact me to add it.

## Troubleshooting
| What you see | Likely cause |
|---|---|
| Popup says "unauthorized domain" / game says the address is not allowed | Step 4 not done, or typed with `https://` |
| Status says "אין הרשאה לשמור בענן" | Rules not published, or rules still the default; redo step 5 |
| Sign-in popup closes immediately on a phone | Browser blocks popups; allow popups for the site and retry |
| Backup tab shows only the local backup | `CLOUD_CONFIG` is still `null`, or the edited file was not uploaded |
| "הגיבוי האנונימי עדיין לא הופעל", or reports from signed-out visitors fail | Anonymous sign-in not enabled (step 3.2) |
| "לא נמצא גיבוי עם הקוד הזה" | The code was typed wrong, or the family was deleted from the cloud |
| "מכסת השרת היומית הסתיימה" | A free daily limit was reached; resets by itself |

## Privacy
This stores children's progress under a parent's account or under an anonymous family code. A code is a shared secret: tell parents to keep it private, because whoever has it can see and change that family's progress. If other parents use your copy, you are the one holding that data. Keep it minimal (the game only stores what is listed on the backup page), tell parents plainly what is stored, and keep the "delete my data from the cloud" button. I can draft a short privacy notice in Hebrew if you want one.


## Home screen and offline (optional)
Host these files in the same folder over https (GitHub Pages works): `math-quest.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`. Keep the game's file name (the manifest's start_url points at it). It does not work from a local file or the Claude preview. For every new release, change `APP_VERSION` in the game and `VERSION` in `sw.js` to the same value so devices fetch the update.


## Updating the rules after a format change
The documents carry a format number (`CLOUD_DOC_V` in `math-quest.html`, `minDocVersion()` in `firestore.rules`). Raise both together; builds that write an older number then become read-only. Follow the order in `docs/SYNC_SAFETY_PLAN.md` (update every device first, check the admin page, then paste the rules). `firebase/rules-test` tests the rules against the emulator: `cd firebase/rules-test && npm install && npm test` (needs Java).
