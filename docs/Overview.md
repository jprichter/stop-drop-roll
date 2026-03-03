---

## 🎯 Core Use Case (north star)

> “I’m in **X** city this weekend. Show me **open mats** near me between **Saturday 10am–2pm**.”

So the system must:

* Know **where gyms are**
* Know **when open mats happen**
* Let users filter by **location + time**
* Stay **up to date** without you manually maintaining it

---


## 🗺 UI Concept

### Main screen:

Map (Google Maps style):

* Pins = gyms with open mats *right now* (or in time window)
* Time slider or dropdown:

  * “Now”
  * “Today”
  * “Tomorrow”
  * Custom time range

Tap a pin → Gym card:

* Gym name
* “Open mat: Sat 11am–1pm”
* Button: **View Google Reviews**
* Button: **Website**
* Button: **Report incorrect info**

No reviews inside your app = smart:

* You avoid moderation hell
* You leverage Google’s trust system

You’re the *index*, not the judge.

---

## 🏗 How gyms get added (critical part)

You want:

* Low friction
* No account required initially
* But prevent spam

### Owner-claim model (v2)

Flow:

1. Someone adds gym
2. Owner clicks “Claim this gym”
3. Verify by:

   * Email on domain
   * Or text to phone listed on Google

This lets them:

* Edit open mat times
* Add holiday exceptions
* Add “cancelled today” flags

---

## ⏱ Time filtering logic (core magic)

User gives:

* Location (GPS or city)
* Time window (now, today, custom)

Query:

```
SELECT gyms
JOIN open_mats
WHERE distance < X
AND open_mat.start_time <= requested_time
AND open_mat.end_time >= requested_time
```

Recurring events:

* Store day_of_week (0–6)
* Compute today’s window dynamically

One-off events:

* Store date + time

---

## 🧩 Tech Stack (MVP-minded)

You want boring, reliable tech:

### Frontend:

* Map: Google Maps or Mapbox
* Web first (mobile-friendly)
* Later: wrap as native app

### Backend:

* Postgres (with PostGIS for geo queries)
* Simple API:

  * `/gyms?lat=&lng=&time=`
  * `/submit-gym`
  * `/report`

### Hosting:

* Cheap:

  * Fly.io / Railway / Render
  * Or Firebase + Cloud Functions

---

## 🧼 Data quality & maintenance

You need:

* Drift detection

Ideas:

* “Last verified X months ago” badge
* Auto email gym every 3–6 months:

  > “Are these open mat times still correct?”
* Community report:

  * “This open mat no longer exists”

Soft trust system:

* Verified owner > unverified
* Recently confirmed > stale

---

## 🧪 MVP Feature Set (tight)

Version 1:

* Map
* Filter by:

  * distance
  * time (“now / today / custom”)
* Edit gym for gym owners form
* Link to Google reviews
* Report incorrect info

---

Oh yeah — this is *exactly* where your app can be more useful than Google Maps. You’re not just answering “where is a gym,” you’re answering:

> “Can I train there *comfortably* and *without surprises*?”

So think in terms of **decision friction reducers**.

---

## 🧠 Categories of “Should I go here?” info

### 🚿 Facilities (quality of life)

These matter *a lot* when traveling:

* **Shower available?** (yes/no)
* **Towels provided?** (rare but clutch)
* **Changing rooms?**
* **Lockers?** (free / bring lock / none)
* **Water fountain?**
* **On-site parking?** (free / paid / street)
* **Mat space size** (small / medium / big)

These are perfect as:

* Icons (🚿 🔒 🚗)
* Binary or enum fields (easy to filter)

---

### 💸 Drop-in logistics

This is *huge* anxiety for visitors:

* **Drop-in fee**

  * Free
  * $10
  * $20
  * “Contact gym”
* **Cash only?**
* **Waiver required?** (online vs in-person)
* **Advance notice required?** (yes/no)

You could literally have a badge:

> “Drop-in friendly”
> “Call ahead required”

---

### 🥋 Training environment

People care about *vibe*, but you shouldn’t host reviews. Instead: **descriptors**.

Structured fields:

* **Gi / No-gi / Both**
* **Open mat style**

  * Free roll
  * Positional rounds
  * Mixed

* **Typical attendance**

  * < 10
  * 10–50
  * 50+
*
---

### 🕒 Schedule reliability

Very underrated:

* **Recurring weekly?** yes/no
* **Cancelled on holidays?** yes/no
* **Seasonal?** (summer only, etc.)
* **Last confirmed date**

Display:

> “Last confirmed: 2 weeks ago”

This builds trust.

---

### 📍 Travel convenience

For travelers:

* **Near airport?**
* **Near downtown?**
* **Transit accessible?**
* **Walkable from hotels?**

You can compute some of this later automatically.

---

## 🧩 Data Model (extended)

Your Gym table starts looking like:

```ts
Gym
- name
- lat
- lng
- google_place_id
- website
- shower: boolean
- lockers: enum('none','free','bring lock')
- parking: enum('none','street','lot','garage')
- drop_in_fee: number | null
- cash_only: boolean
- waiver: enum('online','in person','none')
- gi_allowed: boolean
- nogi_allowed: boolean
- vibe: enum('beginner','mixed','advanced')
- last_verified_at: timestamp
```

OpenMat stays separate.

---

## 🗺 UI: How this shows up

On map:

* Filter panel:

  * ✅ Shower
  * 💲 Free / under $15
  * 🥋 Gi / No-gi
  * ⏰ Time window

On gym card:

* Big:

  * Open mat time
  * Drop-in fee
* Icons:

  * 🚿 🔒 🚗
* Links:

  * Google Reviews
  * Website
  * “Report wrong info”

---

## 🏗 How do you get this info without dying?

Three sources:

### 1. Gym submission form

When adding gym:

* Checkboxes:

  * Shower?
  * Lockers?
  * Drop-in fee?

### 2. Owner-verified edits

Owner can:

* Update fees
* Mark “No open mat this week”

### 3. Community correction

Button:

> “Shower info wrong?”

Low friction:

* One click flag
* Optional note

---

Yesss, this is where the idea turns from “database” into something people *love*. For this kind of app, your UI should feel like:

> **Google Maps + “open mat radar” + zero nonsense**

I’ll break this into:

1. Core screens
2. Interaction flow
3. Filters & controls
4. Gym card design
5. Owner + community flows
6. UX principles (what to avoid)

---

## 1️⃣ Home Screen: Map-first

**Default view: Map**

* User location dot
* Pins = gyms with open mats in the selected time window
* Top: search bar (“City or address”)
* Bottom: time filter pill

### Top bar:

```
[ 📍 Current location ]   [ 🔍 Search city ]
```

### Bottom bar:

```
[ ⏰ Now ▼ ]   [ ⚙ Filters ]
```

Tap a pin → bottom sheet slides up.

Why map-first?
Because “what’s near me” is spatial, not list-based.

List view is optional toggle:

```
[ Map | List ]
```

---

## 2️⃣ Time Selector (your killer control)

This deserves special care.

### Simple mode:

Pill button:

```
Now ▾
```

Options:

* Now
* Today
* Tomorrow
* Custom

### Custom opens:

```
Day: [ Sat ▼ ]
From: [ 10:00 ]
To:   [ 14:00 ]
```

UX goal:
**One gesture = useful result**

Most users will:

* Leave it on “Now”
* Or choose “Tomorrow morning”

---

## 3️⃣ Filters (don’t overwhelm)

Slide-in panel:

### Essentials:

* Distance: 5mi / 10mi / 25mi
* Gi / No-gi
* Max drop-in fee
* Shower ✅
* Parking 🚗

### Advanced (collapsible):

* Lockers
* Waiver online
* Typical attendance
* Owner verified

Design:
Checkboxes + sliders
No free text.

---

## 4️⃣ Gym Card (tap pin)

This is where the decision happens.

### Layout:

**Header**

```
Renzo Gracie Austin
📍 1.2 mi
⏰ Open Mat: Sat 11am–1pm
```

**Badges row**

```
🥋 Gi & No-gi   🚿 Shower   💲$20
```

**Info rows**

* Lockers: Bring lock
* Parking: Street
* Typical attendance: 10–20

**Actions**
[ Google Reviews ]
[ Website ]
[ Directions ]

**Trust footer**

```
Last confirmed: 2 weeks ago
[ Report incorrect info ]
```

No comments. No star ratings.

---

## 5️⃣ Add Gym Flow (UX goldmine)

Button:

```
➕ Add gym
```

Wizard-style:
**Step 1**

* Search Google Maps place
* Select gym

**Step 2**
Checkboxes:

* Has shower?
* Lockers?
* Drop-in fee?

**Step 3**
Open mat schedule:

```
Day: [ Sat ]
From: [ 11:00 ]
To: [ 13:00 ]
Recurring weekly? ✅
```

Submit.

UX goal:
**Under 60 seconds to add a gym**

---

## 6️⃣ Owner Flow (later)

On gym card:

```
Claim this gym
```

Owner dashboard:

* Edit schedule
* Cancel today
* Add logo
* Update fees

But this is v2+.

---

## 7️⃣ Anti-friction principles

### What to copy from Google Maps:

* Pin tap = bottom sheet
* Swipe up for more info
* Swipe down to close
* Zoom clusters

### What NOT to copy:

* Ads
* Reviews
* Infinite photos
* Overloaded categories

---

## 8️⃣ Empty state UX (super important)

If no open mats:
Show:

```
No open mats nearby right now 😞
Try:
• Expanding distance
• Checking tomorrow
• Adding a gym
```

This prevents dead-end feeling.

---

## 9️⃣ Accessibility & trust

* Large tap targets (sweaty fingers)
* Dark mode (gyms are dim)
* Time always in local timezone
* Clear “unverified” badges

---

## 🧭 User Journey Example

> Traveling to Denver

1. Opens app
2. Types “Denver”
3. Sets:

   * Day: Saturday
   * Time: 10–2
4. Sees 5 pins
5. Taps closest
6. Sees:

   * $10
   * Shower
   * Gi/no-gi
7. Taps “Directions”
8. Goes train

> “We don’t want to *be* Google Maps. We want to be an **open-mat layer on top of Google Maps** — optimized for travelers and gym owners.”

---

## 📱 Mobile-first webapp → later “native”

Yes, perfect choice.

Design assumption:

* 90% of use = phone
* One-hand usable
* Fast load
* No signup wall

Tech-wise:

* PWA (Progressive Web App)

  * “Add to home screen”
  * Offline cache for recent searches
  * GPS access
* Later: wrap with Capacitor or Expo into App Store

UX implication:

* Big map
* Bottom sheet
* Filters as slide-up panel
* Everything thumb-reachable

---

## 🗺 Can we seed gyms automatically (no manual DB)?

Short answer: **Yes, mostly.**
Long answer: **You still need a tiny DB for your stuff.**

You can use Google Places API (or similar) to:

* Search for:

  * “Brazilian Jiu Jitsu”
  * “BJJ gym”
  * “Martial arts”
* Get:

  * Name
  * Address
  * lat/lng
  * Google Place ID

So your model becomes:

**Google owns:**

* Gym existence
* Location
* Reviews
* Phone
* Website

**You own:**

* Open mat schedule
* Gi / No-gi / Both
* Drop-in rules
* Shower / lockers
* Verified owner status

You **don’t need to store gyms fully**, just:

```ts
PlaceID
+ your metadata
```

When user taps a gym:

* You fetch live Google info
* Merge with your “open mat layer”

This makes you:

> A time-based index of open mats, not a gym directory

Which is clean and powerful.

---

## 📲 No website — only Instagram or SMS

This is actually smart UX.

On gym card:

Buttons:

* 📸 Instagram
* 📱 Text gym
* 🗺 Directions

Flow:

* Tap IG → opens DM
* Tap SMS → opens phone app
* Tap Directions → opens Google Maps

You’re just:
**Discovery + routing + schedule**

---

## 🧭 Dual-purpose: travelers + gym owners

You nailed the dynamic:

Travelers want:

* Open mats
* No awkwardness
* No surprises

Gym owners want:

* Heads up
* Culture control
* Safety

You can support this without accounts by:

On gym card:

```text
“Message gym before visiting”
[ DM on Instagram ]
[ Text gym ]
```

And optionally:

> “Let the gym know you’re visiting — helps with mat space & safety.”

That’s it. No internal chat.

---

## 🏷 Gi / No-gi / Both

This should be:

* Required field for open mat entry
* Filterable
* Icon-based

Example:

* 🥋 Gi
* 🩳 No-gi
* 🥋🩳 Both

On map:

* Small colored badge on pin
* Or filter-only

---

## 🤖 Owner claim — automate as much as possible

This is where you can be clever.

### Goal:

> Don’t make owners create accounts unless they *really* want to.

#### Step 1: “Claim this gym” button

Gym card:

```text
Claim this gym
```

#### Step 2: Verify using something they already control

Options (ranked best → worst):

**A. Instagram DM verification (very good)**

* You show a code:

  > “DM us this code from your gym’s Instagram: X7K92”
* You match sender IG handle to gym’s IG link

**B. SMS verification (also good)**

* You text the gym number on Google:

  > “Reply YES to verify your gym on OpenMatMap”
* They reply
* Boom, verified

**C. Website token (power user)**

* Put a code on homepage
* You scrape it

No passwords.
No dashboards at first.
Just:

> “You are now the owner.”

Store:

* place_id
* verified = true
* verified_by = ig / sms

---

## 👥 Community without accounts (important)

You’re right to avoid:

* Logins
* Profiles
* Reputation systems

You only need:
**lightweight feedback**

### What users can do anonymously:

* Report wrong schedule
* Report gym closed
* Report “no open mat anymore”
* Suggest edit

Form:

```text
What’s wrong?
[ ] Time wrong
[ ] No open mat
[ ] Closed
[ ] Other
(optional note)
```

You log:

* place_id
* timestamp
* reason

Then:

* If multiple reports → mark as “stale”
* Notify owner (if verified)
* Auto-hide if too many

Trust model:

* Recency > popularity
* Owner > crowd
* Crowd > nothing

No usernames.
No karma.
No drama.

---

## 🔁 Data lifecycle (important UX truth)

Open mats change. Constantly.

So your UI should show:

```text
Last confirmed: 10 days ago
```

And have:

```text
Confirm this is still happening?
[ Yes ] [ No ]
```

That’s community validation with:

* One tap
* No account

You can cookie-limit abuse.

---

## 🧩 Overall architecture (mentally)

You’re building:

```text
Google Maps (source of truth for gyms)
          +
Your DB (open mats + rules + verification)
          =
Open Mat Map
```

You are:

* A temporal filter
* A logistics layer
* A culture-preserving gateway

Not:

* Yelp
* ClassPass
* Social network

---

## 🚨 Big UX risks (avoid these)

* Requiring login to browse
* Showing stale schedules without warning
* Hosting reviews
* Hosting chat
* Letting spam gyms in
* Making owners “manage another platform”

You win by:

* Being invisible
* Being accurate
* Being fast

---

# 🏷 OWNER CLAIM FLOW

## Goal

Let gym owners:

* Prove “this is my gym”
* Edit open mat info
* Get notified when things change

WITHOUT:

* creating usernames/passwords
* building a whole dashboard app

---

## 🧩 Entry point (Gym Card)

On gym card:

```
Claim this gym
```

Subtext:

> “Manage open mat info & get notified of changes.”

---

## 🔐 Step 1: Choose verification method

```
How do you want to verify ownership?

[ Verify via Instagram DM ]
[ Verify via Text Message ]
[ Verify via Website (advanced) ]
```

### Why these?

They match:

* Google’s listed contact methods
* What gym owners already use

---

## 📸 Option A: Instagram DM (best UX)

### Screen:

```
DM us this code from your gym’s Instagram:

X7K9P2

We will link that Instagram account to this gym.
```

User taps:

```
[ Open Instagram ]
```

Backend:

* Waits for DM containing `X7K9P2`
* Matches sending IG handle with gym’s IG link
* If match → verified

Result:

```
✅ Gym verified
You can now edit open mat info
```

Store:

* place_id
* verified = true
* verified_via = instagram
* ig_handle

---

## 📱 Option B: SMS verification

### Screen:

```
We will text the phone number listed for this gym.

Reply YES to verify.
```

Flow:

1. App sends SMS to Google-listed number:

   > “Reply YES to verify your gym on OpenMatMap”
2. Owner replies YES
3. Match sender number to place_id

Result:

```
✅ Verified via phone
```

This is:

* Simple
* Familiar
* No login

---

## 🌐 Option C: Website token (power users)

### Screen:

```
Add this code to your homepage:

OPENMAT-49321
```

Backend:

* Polls homepage
* Finds token
* Verifies

This is fallback for:

* gyms without IG
* gyms without SMS

---

## 🧭 After verification (micro-dashboard)

Owner now sees:

```
Manage this gym

Open mats:
[ Add / Edit / Cancel today ]

Gi / No-gi / Both

Drop-in fee

Shower / Lockers / Parking

Notify me if community reports changes ✅
```

No:

* profile
* inbox
* followers

Just **operational controls**.

---

## 🔁 Ongoing trust model

Owner edits:

* Instantly reflected
* Marked:

  ```
  Verified by owner
  ```

Community edits:

* Never overwrite owner data
* Only flag it

---

# 👥 COMMUNITY FEEDBACK FLOW

## Goal

Let travelers:

* Fix bad info
* Keep schedules fresh
* Without accounts or drama

---

## 📍 Entry point (Gym Card footer)

```
Something wrong?
[ Report incorrect info ]
```

---

## 📝 Feedback modal

```
What’s wrong?

[ ] Time is wrong
[ ] No open mat anymore
[ ] Gym closed
[ ] Gi / No-gi wrong
[ ] Other

(optional note)
```

Button:

```
Submit
```

That’s it.

No login.
No CAPTCHA (maybe rate-limited).

---

## ⚙️ Backend logic

You store:

* place_id
* reason
* timestamp
* IP hash (or cookie)

Then apply rules:

### Rule 1: Soft warnings

If 1–2 reports:

* Show badge:

  ```
  ⚠ May be outdated
  ```

### Rule 2: Stale suppression

If 3+ reports:

* Hide open mat from default search
* Still visible if user taps gym

### Rule 3: Owner override

If owner verified:

* They get notified:

  > “Someone reported your open mat time may be wrong.”
* Owner can:

  * Confirm
  * Edit
  * Disable

Owner action clears reports.

---

## 🔄 “Confirm this is still happening” (gold feature)

On gym card:

```
Is this open mat still happening?
[ Yes ]   [ No ]
```

One tap.

Logic:

* “Yes” → updates `last_confirmed_at`
* “No” → triggers report

No login.
Cookie-limited.

This gives you:

* Passive crowd validation
* Freshness signal

---

## 🧠 Trust hierarchy

Data priority:

1. Owner-verified info
2. Recently confirmed by community
3. Old data
4. Reported data

Display rules:

```
Owner verified ✔
Last confirmed: 3 days ago
```

or:

```
⚠ Not confirmed recently
```

---

# 🧱 Abuse prevention (without accounts)

Light-touch:

* Rate limit by IP
* Cookie-based cooldown
* Ignore spammy patterns
* No public edit history

You don’t need:

* usernames
* karma
* mod tools
* ban systems

---

# 🧭 UX Philosophy

Owners feel:

> “I control my gym info and visitors respect my culture.”

Travelers feel:

> “I won’t show up to a dead open mat.”

You feel:

> “I don’t moderate a social network.”

---

## 🎯 Outcome

You end up with:

* **Verified gyms**
* **Fresh schedules**
* **Zero community toxicity**
* **No user accounts**
* **No internal messaging**

Just:
**time + place + trust**

---

## Next step options

We’re now at a very solid product concept.
Pick one and I’ll design it concretely:

1️⃣ Screen-by-screen wireframes (text-based)
2️⃣ Data model for owner + community signals
3️⃣ API endpoints for these flows
4️⃣ Abuse & edge cases (what breaks?)
5️⃣ MVP scope with build order

Say the number and we’ll build it.



# 🧠 CONCEPTUAL MODEL

You really only own **four things**:

1. **Gyms (by Google Place ID)**
2. **Open Mats (time-based events)**
3. **Owner Claims (verification)**
4. **Community Signals (reports + confirmations)**

Google owns:

* Name
* Address
* Photos
* Reviews
* Phone
* Website

You own:

* Open mat schedule
* Gi/No-gi
* Drop-in logistics
* Trust signals

---

# 🧱 CORE TABLES

---

## 🏋️ `gyms`

Minimal — because Google already has most data.

```sql
gyms
-----
id (uuid)
google_place_id (text, unique)
last_synced_at (timestamp)

-- logistics
drop_in_fee_cents (int, nullable)
cash_only (boolean)
waiver_type (enum: 'online','in_person','none')

-- facilities
has_shower (boolean)
locker_type (enum: 'none','free','bring_lock')
parking_type (enum: 'none','street','lot','garage')

-- contact preference
preferred_contact (enum: 'instagram','sms')

-- trust
owner_verified (boolean)
owner_verified_at (timestamp)
last_confirmed_at (timestamp)

created_at
updated_at
```

Why:

* You don’t duplicate Google’s info
* You only store decision-making info

---

## 🥋 `open_mats`

Time is the heart of your app.

```sql
open_mats
---------
id (uuid)
gym_id (fk -> gyms.id)

-- scheduling
day_of_week (int 0-6, nullable)
start_time (time)
end_time (time)
date_override (date, nullable)  -- for one-off events
is_recurring (boolean)

-- type
gi_type (enum: 'gi','nogi','both')

-- style
format (enum: 'free_roll','positional','mixed')
typical_attendance (enum: '5-10','10-20','20+')

active (boolean)

created_at
updated_at
```

Why:

* Supports recurring AND one-off
* Filterable by time + gi/nogi
* Works for travelers

---

## 🏷 `owner_claims`

Tracks how gyms get verified.

```sql
owner_claims
------------
id (uuid)
gym_id (fk -> gyms.id)

method (enum: 'instagram','sms','website')
external_identifier (text) -- ig handle or phone number
verification_code (text)

verified (boolean)
verified_at (timestamp)

created_at
```

Why:

* No user accounts
* Trust tied to external channel

---

## 👥 `community_reports`

For “this is wrong” signals.

```sql
community_reports
-----------------
id (uuid)
gym_id (fk -> gyms.id)
open_mat_id (fk -> open_mats.id, nullable)

reason (enum:
  'time_wrong',
  'no_longer_happens',
  'gym_closed',
  'gi_type_wrong',
  'other'
)

note (text, nullable)
ip_hash (text)
created_at
```

Why:

* Lightweight moderation
* No identities
* Drives trust logic

---

## 👍 `community_confirmations`

For “yes, this is still happening”.

```sql
community_confirmations
-----------------------
id (uuid)
open_mat_id (fk -> open_mats.id)
ip_hash (text)
created_at
```

Why:

* Positive signal
* Feeds freshness
* One-tap UX

---

# 🧩 DERIVED / COMPUTED FIELDS

You don’t store these — you compute them:

```ts
is_stale = now() - last_confirmed_at > 30 days

is_suppressed =
  reports_last_30_days >= 3
  AND owner_verified = false

trust_label =
  owner_verified ? "Owner verified"
  : recently_confirmed ? "Recently confirmed"
  : "Unverified"
```

---

# 🔁 DATA FLOW

### Gym appears on map:

1. Query Google Places API
2. For each place_id:

   * Lookup in `gyms`
   * Merge:

     * open_mats
     * logistics
     * trust

---

# 🧭 SEARCH QUERY LOGIC

```sql
SELECT *
FROM open_mats
JOIN gyms ON open_mats.gym_id = gyms.id
WHERE
  distance(lat,lng,user_lat,user_lng) < radius
  AND time_overlap(open_mats, user_time_window)
  AND gi_type IN (user_filter)
  AND open_mats.active = true
  AND gyms.is_suppressed = false
```

---

# 🔐 TRUST HIERARCHY (IMPORTANT)

Priority:

1. Owner-edited data
2. Recently confirmed
3. Old
4. Reported

Which maps cleanly to this model.

---

# 🚫 WHAT YOU DO NOT STORE

❌ Reviews
❌ Ratings
❌ User profiles
❌ Chat
❌ Photos
❌ Full addresses

That’s Google’s job.

---

# 🏁 THIS MODEL SUPPORTS:

✔ Map search
✔ Time filtering
✔ Gi/nogi
✔ Owner claim
✔ Community validation
✔ No accounts
✔ Global scaling

---

## Next move (natural continuation)

We can now cleanly do any of these:

1️⃣ Turn this into a Prisma / SQL migration
2️⃣ Design the API endpoints around this model
3️⃣ Design the UI screens based on this schema
4️⃣ Walk through a real user journey using this data
5️⃣ Threat model (what breaks first?)

Say the number.
