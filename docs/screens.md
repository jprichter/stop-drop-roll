The following wireframes outline a mobile-first Progressive Web App (PWA) designed to be a "time-based index" for Brazilian Jiu-Jitsu open mats. The UI prioritizes **spatial discovery** and **decision friction reducers** to answer the traveler's core question: "Can I train there comfortably and without surprises?".

### **Screen 1: Home Screen (Map View)**
This is the default view, designed for one-handed, thumb-reachable use.
*   **Top Bar:** A simple search input field labeled "City or address".
*   **Map Area:** Interactive map (Google Maps or Mapbox style) showing the user’s location and gym pins.
    *   **Pins:** Display icons or small badges indicating **Gi, No-gi, or Both** status.
*   **Bottom Section:** 
    *   **Time Selector Pill:** A prominent, centered button showing the current filter (e.g., "Now" or "Sat 10am–2pm").
    *   **Filter Icon:** A floating action button to open the advanced filters.
    *   **List Toggle:** A small button to switch to a list-based view.

### **Screen 2: Time Selector (Killer Control Overlay)**
Triggered by tapping the time pill, this overlay allows for rapid temporal filtering.
*   **Quick Options:** A list of buttons for "Now," "Today," and "Tomorrow".
*   **Custom Range:** A date/time picker that allows users to select a specific window (e.g., "This Saturday between 10am and 2pm").
*   **Apply Button:** A large, high-contrast button to update the map.

### **Screen 3: Filter Panel (Slide-in)**
A slide-up or slide-in panel containing binary or enum fields to refine the search.
*   **Essentials:**
    *   **Distance Slider:** 5mi to 25mi.
    *   **Style:** Checkboxes for Gi and No-gi.
    *   **Max Drop-in Fee:** A slider or price range (e.g., "Free / under $15").
*   **Facility Icons (Binary):** Checkboxes for **Shower** (🚿), **Parking** (🚗), and **Lockers** (🔒).
*   **Advanced (Collapsible):** Options for typical attendance, online waivers, and owner-verified status.

### **Screen 4: Gym Card (Bottom Sheet)**
Triggered by tapping a map pin, this card slides up to provide decision-making data without hosting internal reviews.
*   **Header:** Gym name and a "Verified" badge if applicable.
*   **Primary Info:** Large text showing the **Open Mat Time** and **Drop-in Fee**.
*   **Facility Row:** A row of icons (🚿 🔒 🚗) showing availability.
*   **Details List:** Simple rows for "Lockers: Bring lock," "Parking: Street," and "Style: Both".
*   **Action Buttons:** Large tap targets for **Google Reviews**, **Website**, and **Directions**.
*   **Trust Footer:** 
    *   **"Confirm this is still happening"** button (one-tap validation).
    *   **"Report incorrect info"** link.
    *   **Last Verified Date:** (e.g., "Last confirmed: 2 weeks ago").

### **Screen 5: Add Gym Flow (Wizard)**
A low-friction, three-step process designed to take under 60 seconds.
*   **Step 1:** Search bar to find the gym via **Google Places API** to auto-populate address and name.
*   **Step 2:** Checklist for facilities (Showers, Lockers, Water) and drop-in logistics (Fee, Waiver).
*   **Step 3:** Schedule entry (Day of week, start/end times, and Gi/No-gi status).

### **Screen 6: Owner Claim & Management (v2)**
A "no-password" flow for gym owners to take control of their data.
*   **Verification Method Selection:** Choice between **Instagram DM** (matching handle to gym link), **SMS** (texting the Google-listed number), or **Website Token**.
*   **Owner Dashboard:** A simplified view to **Edit Schedule**, **Add Holiday Exceptions**, or toggle a **"Cancelled Today"** flag.

### **Screen 7: Community Feedback Modal**
A lightweight way for travelers to keep information fresh without creating accounts.
*   **Quick Reports:** Buttons for "This open mat no longer exists," "Wrong time," or "Wrong fee".
*   **Optional Note:** A small text area for specific corrections.
*   **Submission:** One-click submission that triggers a "Soft Warning" or "Stale" badge if multiple reports accumulate.