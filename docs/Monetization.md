Expanding into monetization for Phase 2 or 3 requires balancing revenue with the "zero nonsense" and "anti-friction" principles established in the initial design. Your ideas align well with the core mission of reducing anxiety for travelers and helping gym owners manage their culture.

Here is a breakdown of how your monetization ideas could be integrated, along with additional strategies derived from the source material.

### **1. Featured Gyms (Verified "Premium" Status)**
Rather than standard banner ads, which the sources suggest avoiding to maintain a clean UX, you can offer a **"Featured" or "Verified Premium" status**.
*   **Boosted Visibility:** Featured gyms could appear with a distinct pin color on the map or stay visible at higher zoom levels. 
*   **Decision-Maker Highlights:** Since the app focuses on "decision friction reducers," a paid featured status could allow gyms to highlight their best amenities—like **showers, lockers, or free parking**—more prominently in the search results.
*   **Trust Signal Integration:** Featured status should be tied to the **Owner-Claimed model**. Only verified owners can pay to be featured, ensuring that the "Featured" badge also implies the highest level of data accuracy.

### **2. Integrated Payment & QR Code Check-in**
This moves the app from a "temporal index" to a transactional platform, directly addressing the "Drop-in logistics" anxiety.
*   **Reducing "Surprise" Friction:** By handling the fee in-app, you solve the "Cash only?" or "Price unknown" issues that stress travelers.
*   **The "Traveler’s Pass":** The user pays the drop-in fee through your app; you generate a **QR code** that the gym owner scans to verify the waiver and payment. You take a small percentage (e.g., 5-10%) as a convenience fee for "keeping the lights on."
*   **Gym Owner Benefit:** This provides owners with a "heads up" on visitor flow and mat space requirements, fulfilling the goal of giving owners more control. It also automates the "Advance notice required" step.

### **3. Contextual BJJ Product Placements**
While the sources warn against copying the "overloaded categories" and ads of Google Maps, you can implement **contextual commerce** that serves the traveler.
*   **"Forget Your Gear?" Partnerships:** If a gym indicates they do *not* provide towel service or gi rentals in their "Facilities" checklist, you could show a highly relevant ad for a partner BJJ brand’s travel gi or a high-quality travel towel.
*   **Affiliate "Travel Essentials":** In the "Travel convenience" section, you could include affiliate links for products that help BJJ travelers, such as finger tape, antibacterial soap for those using the gym's **showers**, or compact gear bags.

### **4. Advanced Analytics for Gym Owners (Phase 3)**
The sources highlight that owners want "culture control" and to know who is coming to their mats.
*   **The "Radar Insights" Dashboard:** You can charge a small monthly subscription for a "Pro" owner dashboard. This would provide data on how many people are searching for open mats in their city and how often their gym card is being viewed.
*   **Holiday & Event Promotion:** Paid members could get the ability to promote "One-off events," such as a high-level seminar or a special holiday open mat, which would otherwise be buried in the recurring schedule.

### **5. "Drop-in Ready" Certification**
This is an idea from outside the sources that builds on the "soft trust system" mentioned in the text.
*   **Certification:** You could charge a small annual fee for a "Drop-in Ready" certification. To earn it, a gym must have **verified owner status**, at least 90% "still happening" community confirmations, and provide "clutch" amenities like **towels or showers**. This creates a "gold standard" that travelers will actively look for on the map.

**Note:** If you choose to implement internal payments or ads, you will need to expand the **Data Model** to include a `transactions` table and a `promotions` table, which are not currently in the MVP schema. You should also consider how this might impact the "No account required" philosophy for users.