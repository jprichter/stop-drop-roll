# 🥋 Stop, Drop and Roll

**Stop** searching Instagram DMs. **Drop** by a local gym. **Roll** with the community.

**Stop, Drop and Roll** is the ultimate radar for Brazilian Jiu-Jitsu (BJJ) practitioners. It acts as a temporal and logistical layer on top of Google Maps, allowing travelers and locals alike to find open mats, verify schedules, and check gym facilities in real-time.

---

## ✨ Key Features

*   📍 **Location-Aware Discovery:** Automatically find BJJ gyms near you using browser geolocation.
*   🕒 **Temporal Filtering:** Filter by "Today", "Anytime", or a specific custom time range to find exactly when you can train.
*   🔍 **Advanced Search:** Filter gyms by facilities (Showers, Parking, Lockers), Gi/No-Gi styles, and maximum drop-in fees.
*   🗺️ **Hybrid Mapping:** High-performance mapping using Google Maps API with intelligent search caching to keep performance high and costs low.
*   ✅ **Community Verified:** Crowdsourced "Confirm" and "Report" signals ensure data freshness and reliability.
*   🚀 **Add Gym Wizard:** A seamless three-step flow for users to contribute new gyms and schedules to the platform.
*   📱 **Mobile-First PWA:** Designed to feel like a native app on your phone with "Add to Home Screen" support.

---

## 🛠️ Tech Stack

*   **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS.
*   **Maps:** [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/) (Google Maps JavaScript API).
*   **Database:** [Supabase](https://supabase.com/) (PostgreSQL + PostGIS) for gym data and spatial queries.
*   **Rate Limiting:** [Upstash Redis](https://upstash.com/) for API protection and cost control.
*   **Testing:** [Vitest](https://vitest.dev/) (Unit/Component) & [Playwright](https://playwright.dev/) (E2E).

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/stop-drop-roll.git
cd stop-drop-roll
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```text
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_public_key
GOOGLE_PLACES_API_KEY=your_server_side_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_map_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis (Optional for Dev, Required for Prod)
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

### 4. Database Setup
Run the SQL migrations located in `supabase/migrations/` in your Supabase SQL Editor in the following order:
1. `init_schema.sql`
2. `add_search_cache.sql`
3. `set_rls_policies.sql`

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 🧪 Testing

The project uses a tiered testing strategy:

*   **Unit/Integration Tests:** Run `npm test`
*   **E2E Tests:** Run `npx playwright test`

---

## 📦 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). 

1. Connect your GitHub repository to Vercel.
2. Ensure all environment variables from `.env.local` are added to the Vercel project settings.
3. Deploy!

---

## 🤝 Contributing

Contributions are what make the BJJ community great. If you're interested in improving the radar, feel free to fork the repo and submit a PR!

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
