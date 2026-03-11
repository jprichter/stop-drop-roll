# Project Implementation Plan: Open Mat Radar

## 1. Project Overview

The "Open Mat Radar" application aims to be the go-to resource for BJJ practitioners to find open mats globally. It acts as a temporal and logistical layer on top of Google Maps, providing real-time, verified information about open mat schedules, gym facilities, and drop-in policies. The core experience is a map-first, mobile-friendly Progressive Web App (PWA) with a strong emphasis on reducing friction for both travelers and gym owners, without requiring user accounts for basic browsing.

## 2. Technical Stack

Based on the `TechStack.md` and `prd.md`, the recommended technical stack is:

*   **Frontend:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **Mapping:** Google Maps JS API
*   **Database:** Supabase (PostgreSQL with PostGIS extension)
*   **ORM:** Drizzle ORM
*   **Deployment:** Vercel (Frontend & Next.js API Routes), Supabase (Database)

## 3. Core Features (MVP Roadmap)

The implementation will follow a phased approach, prioritizing the "North Star" functionality.

### Phase 1: Infrastructure & Basic Map (The "Skeleton")

**Objective:** Set up the core development environment, database, and display a basic interactive map.

1.  **Database Initialization:**
    *   Set up a Supabase project.
    *   Create the `gyms`, `open_mats`, `owner_claims`, `community_reports`, and `community_confirmations` tables as defined in `datamodel.md` and `Overview.md`.
    *   Enable the `PostGIS` extension in Supabase for geographic queries.
2.  **Next.js Project Setup:** (Already initialized with `create-next-app`)
    *   Install required packages: `@vis.gl/react-google-maps`, `drizzle-orm`, `@supabase/supabase-js`.
    *   Configure `.env.local` for Google Maps API Key and Supabase credentials.
3.  **Basic Map Display:**
    *   Integrate the Google Maps JS API into `src/app/page.tsx` or a dedicated map component.
    *   Render a map centered on the user's current (or default) location.
4.  **Hardcoded Gym Pin:**
    *   Manually insert one test gym and one test open mat into the Supabase database.
    *   Fetch this data and display a custom pin on the map.

### Phase 2: Google Places Integration & Data Merge (The "Merge" Logic)

**Objective:** Integrate with Google Places API to find gyms and merge with our local open mat data.

1.  **Google Places Search:**
    *   Implement a search functionality (e.g., a search bar) that queries the Google Places API for BJJ gyms based on a city or GPS location.
    *   Display these raw Google Places results on the map.
2.  **Data Hydration/Merge:**
    *   For each `place_id` returned by Google Places, query the Supabase `gyms` table to see if we have associated open mat data.
    *   If open mat data exists, display a distinct "Active Open Mat" pin.
    *   If no open mat data exists, display a "grayed out" pin or a different icon, inviting users to "Add Open Mat Info."
3.  **Basic Gym Card Display:**
    *   When a pin (either active or grayed out) is tapped, display a bottom sheet (as described in `screens.md`) showing the gym's name and address (from Google) and any available open mat times (from Supabase).

### Phase 3: Temporal Filtering (The "Time Selector")

**Objective:** Implement the core "Time Selector" functionality to filter open mats by time.

1.  **Time Selector UI Component:**
    *   Develop the "Time Selector Pill" UI component with "Now," "Today," "Tomorrow," and "Custom Range" options (as detailed in `screens.md`).
2.  **API Endpoint for Filtered Open Mats:**
    *   Create a Next.js API route that accepts location and time parameters.
    *   This API route will query the Supabase `open_mats` table, filtering by `day_of_week`, `start_time`, and `end_time` (and eventually `one_off_date`).
3.  **Dynamic Map Updates:**
    *   When the user selects a time filter, update the map to display only the open mats that are active within the chosen time window.

## 4. Development & Testing Approach

*   **Mobile-First Design:** All UI components will be developed with a mobile-first approach using Tailwind CSS.
*   **TypeScript:** Leverage TypeScript for strong typing and improved code quality.
*   **Testing:** Implement unit and integration tests for database interactions, API routes, and key UI components.

## 5. Next Steps for Discussion

Once Phase 1 is complete, we can discuss:

*   Detailed design of the "Add Gym Flow" (Step 5 in `screens.md`).
*   Implementation details for the "Filter Panel" (Step 3 in `screens.md`).
*   Strategies for implementing the "Community Signals" (`community_reports` and `community_confirmations`).
*   The "Owner Claim & Management" flow (Phase 6 in `screens.md`), which will be a v2 feature.

This plan focuses on getting a functional core application live. We will iterate on features based on user feedback and further product discussions.

