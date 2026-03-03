Tech Stack

This is a solid PRD. You’ve identified the exact pain point of every traveling BJJ practitioner: the "Instagram DM archeology" required just to find out if a gym allows visitors on a Saturday morning.

To get this from "Blue Belt" (concept) to "Black Belt" (deployed app), here is the recommended tech stack and a roadmap to get you rolling.

---

## 1. The Tech Stack: "The Ultra-Lightweight Gi"

Since your vision is a high-performance PWA with no user accounts, we want tools that prioritize speed and low overhead.

| Layer | Recommendation | Why? |
| --- | --- | --- |
| **Frontend** | **Next.js (React)** | Best-in-class for PWAs. Excellent for SEO (if you want gyms to show up in search) and has built-in API routes. |
| **Styling** | **Tailwind CSS** | Perfect for "Thumb-Reach" design. Mobile-first styling is trivial with Tailwind. |
| **Map Engine** | **Google Maps JS API** | Since your data strategy relies on **Google Place IDs**, staying in the Google ecosystem prevents "ID mismatch" headaches. |
| **Database** | **Supabase (PostgreSQL)** | It provides **PostGIS** (for geographic queries) out of the box and has a generous free tier. |
| **ORM** | Drizzle ORM | Extremely fast, TypeScript-ready, and works beautifully with Supabase. |
| **Deployment** | **Vercel** | One-click deployment for Next.js. It handles your frontend and your backend (API routes) as serverless functions. |

---

## 2. Local Development Setup

To run this on your machine, follow these steps:

1. **Initialize the Project:**
```bash
npx create-next-app@latest open-mat-radar --typescript --tailwind --eslint

```


2. **Install Map & DB Dependencies:**
```bash
   npm install @vis.gl/react-google-maps drizzle-orm @supabase/supabase-js
```


3. **Get Your Keys:**
* **Google Maps:** Go to [Google Cloud Console](https://console.cloud.google.com/), enable "Maps JavaScript API" and "Places API," and get an API Key.
* **Supabase:** Create a project at [supabase.com](https://supabase.com) and grab your `URL` and `Anon Key`.


4. **The `.env.local` file:** Store these keys here (and never commit them to GitHub).

---

## 3. The "First Week of Training" Roadmap

Don't try to build the whole PRD at once. Start with the "North Star" functionality.

### **Phase 1: The "Skeleton" (Week 1)**

* **Database Init:** Set up your `gyms` and `open_mats` tables in Supabase. Enable the **PostGIS** extension to allow for `ST_DWithin` queries (finding things within X miles).
* **The Map:** Render a basic Google Map centered on the user's location.
* **Hardcoded Test:** Manually add one gym to your DB with a Google `place_id`. Write a function that fetches this from your DB and displays a custom pin on the map.

### **Phase 2: The "Merge" Logic (Week 2)**

This is the most critical part of your technical strategy.

* **The Search Hook:** When a user searches a city, query the **Google Places API** for "BJJ Gyms."
* **The Hydration Step:** Take the list of `place_id`s from Google and check your Supabase DB for matches.
* **The UI:** If a match exists, show the "Active Open Mat" pin. If not, show a "grayed out" pin that invites users to "Add Open Mat Info."

### **Phase 3: The "Time Selector" (Week 3)**

* Build the "Time Selector Pill."
* Update your API to filter results based on the `day_of_week` and `start_time` columns in your `open_mats` table.

---

## 4. Deployment Strategy

Once it works locally:

1. **Push to GitHub:** Create a private repository.
2. **Connect to Vercel:** Import the repo. Vercel will automatically detect it’s a Next.js app.
3. **Environment Variables:** Copy your Google and Supabase keys into the Vercel Dashboard settings.
4. **Deploy:** Every time you `git push`, your app updates.

> **Note on PostGIS:** While Google handles the *initial* search for gyms, your local PostGIS database will be essential for filtering gyms by "Distance from me" for the pins you actually "own" in your database.

