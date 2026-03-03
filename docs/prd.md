This Product Requirements Document (PRD) outlines the development of a specialized "open mat radar" application designed for Brazilian Jiu-Jitsu (BJJ) practitioners. The system acts as a temporal and logistical layer on top of Google Maps.

### **1. Product Vision & North Star**
*   **Vision:** To be the definitive index for finding open mats globally, removing the friction of traveling and the uncertainty of training at a new gym.
*   **North Star Metric:** "I’m in city **X** this weekend. Show me **open mats** near me between **Saturday 10am–2pm**".

---

### **2. Target Audience**
1.  **Travelers:** BJJ practitioners looking for a place to train without the hassle of deep-diving into outdated websites or Instagram pages.
2.  **Gym Owners:** Looking to manage their visitor flow and ensure accurate scheduling without managing another complex social platform.

---

### **3. Core Functional Requirements (MVP)**

#### **3.1 Map-First Discovery**
*   **Search:** Users search by city name or GPS location.
*   **Temporal Filtering:** A custom "Time Selector" pill with options for "Now," "Today," "Tomorrow," and "Custom range".
*   **Pin Visualization:** Map pins display gyms with active open mats within the selected window.

#### **3.2 Gym Card (Decision Engine)**
Upon tapping a pin, a bottom sheet provides:
*   **Time & Style:** Open mat hours and Gi/No-gi/Both status.
*   **Logistics:** Drop-in fees (Free, $, $$, etc.), waiver requirements, and advance notice needs.
*   **Facilities:** Binary icons (🚿 Showers, 🔒 Lockers, 🚗 Parking).
*   **External Links:** Direct buttons for **Google Reviews**, **Gym Website**, **Instagram DM**, and **Directions**.

#### **3.3 Data Maintenance & Trust**
*   **No User Accounts:** Browsing and basic reporting require no login.
*   **Community Signals:** Users can tap "Confirm this is still happening" (updates `last_confirmed_at`) or "Report incorrect info".
*   **Trust Hierarchy:** Owner-verified data > recently confirmed by community > stale/reported data.

#### **3.4 Gym Submission & Owner Claims**
*   **Low-Friction Submission:** Add a gym by searching Google Places and filling a 60-second form (facilities + schedule).
*   **Owner Verification (v2):** Owners claim gyms via **Instagram DM**, **SMS to Google-listed number**, or **Website token** to gain editing rights.

---

### **4. Technical Requirements**

#### **4.1 Architecture**
*   **Frontend:** Web-first, mobile-friendly PWA (Progressive Web App) using Google Maps or Mapbox.
*   **Backend:** Simple API (Node/Python) with Postgres and **PostGIS** for geographic queries.
*   **Data Strategy:** Use **Google Place IDs** as the primary key. Fetch static info (address, name) from Google and merge it with the local "open mat layer" database.

#### **4.2 Core Data Schema**
*   **`gyms`:** Stores `place_id`, drop-in fees, facilities (showers, etc.), and owner status.
*   **`open_mats`:** Stores day of week, start/end times, style (Gi/No-gi), and one-off holiday exceptions.
*   **`community_signals`:** Tracks reports and "still happening" confirmations with timestamps.

---

### **5. UX Principles (The "Anti-Friction" Guide)**
*   **Map-First:** Spatial discovery over list-based searching.
*   **Decision Friction Reducers:** Answer "Can I train here comfortably?" via binary facility icons instead of long reviews.
*   **Thumb-Reach Design:** All primary controls (filters, card actions) must be reachable with one hand.
*   **Zero Nonsense:** No internal ads, no internal reviews, and no mandatory signup wall.

---

### **6. Abuse Prevention**
*   **Rate Limiting:** IP-based and cookie-based cooldowns for community reporting.
*   **Soft Warnings:** Display "Likely stale" badges if multiple reports occur or if the schedule hasn't been confirmed in several months.
*   **Owner Override:** Verified owner actions immediately clear community reports.