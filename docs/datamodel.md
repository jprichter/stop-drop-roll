The data model for this application is designed as a "temporal and logistical layer" that sits on top of the Google Places API. Rather than duplicating Google's database (which covers names, addresses, and reviews), this model focuses exclusively on **open mat schedules, facilities, and trust signals**.

The following tables and columns represent the core schema required for the MVP:

### **1. `gyms` (The Logistics Layer)**
This table stores the "decision friction reducers" that Google Maps lacks.
*   **`place_id`** (Primary Key, String): The unique identifier from the Google Places API.
*   **`has_shower`** (Boolean): Indicates if showers are available.
*   **`has_lockers`** (Enum: `none`, `free`, `bring_lock`): Locker availability and requirements.
*   **`parking_type`** (Enum: `none`, `free`, `paid`, `street`): Parking situation.
*   **`drop_in_fee`** (Decimal or Enum: `free`, `under_15`, `standard`, `contact_gym`): Cost to train.
*   **`cash_only`** (Boolean): Payment method restriction.
*   **`waiver_type`** (Enum: `none`, `online`, `in_person`): Requirements for visiting.
*   **`advance_notice_required`** (Boolean): Whether the gym requires a call/text ahead of time.
*   **`typical_attendance`** (Enum: `<10`, `10-50`, `50+`): General vibe/crowd size.
*   **`last_verified_at`** (Timestamp): When the gym info was last confirmed.

### **2. `open_mats` (The Temporal Layer)**
This table is the heart of the "radar" functionality, storing both recurring and one-off events.
*   **`id`** (Primary Key, UUID): Unique identifier for the event.
*   **`gym_id`** (Foreign Key, String): References `gyms.place_id`.
*   **`day_of_week`** (Integer: 0–6): Used for recurring weekly schedules.
*   **`start_time`** (Time): Start of the open mat.
*   **`end_time`** (Time): End of the open mat.
*   **`is_recurring`** (Boolean): Differentiates between a weekly class and a special event.
*   **`one_off_date`** (Date, Nullable): Stores specific dates for holiday or one-time events.
*   **`is_cancelled`** (Boolean): A flag for "cancelled today" or holiday closures.
*   **`style`** (Enum: `gi`, `no_gi`, `both`): The required attire for the session.

### **3. `owner_claims` (The Trust Layer)**
Tracks gym ownership to allow verified edits without requiring standard user accounts.
*   **`gym_id`** (Foreign Key, String): References `gyms.place_id`.
*   **`is_verified`** (Boolean): Whether an owner has successfully claimed the gym.
*   **`verified_via`** (Enum: `instagram`, `sms`, `web_token`): The method used for verification.
*   **`verification_handle`** (String): The IG handle or phone number used for the claim.
*   **`verified_at`** (Timestamp): When the claim was approved.

### **4. `community_reports` (The Integrity Layer)**
Captures anonymous user feedback to identify "stale" or incorrect data.
*   **`gym_id`** (Foreign Key, String): References `gyms.place_id`.
*   **`reason`** (Enum: `closed`, `wrong_time`, `wrong_fee`, `does_not_exist`): Categorization of the report.
*   **`note`** (Text, Nullable): Optional user details.
*   **`ip_hash`** (String): Anonymized IP for rate-limiting and abuse prevention.
*   **`created_at`** (Timestamp): Date and time of the report.

### **5. `community_confirmations` (The Freshness Signal)**
A lightweight way for users to validate that a schedule is still accurate with one tap.
*   **`gym_id`** (Foreign Key, String): References `gyms.place_id`.
*   **`ip_hash`** (String): Used to prevent multiple confirmations from the same user.
*   **`created_at`** (Timestamp): Used to compute the "Last confirmed" badge (e.g., "Confirmed 2 days ago").

### **Technical Strategy: Derived Data**
The system does not store full addresses or gym names. Instead, when a user searches:
1.  **Query Google Places API** for gyms in a specific location.
2.  **Merge** those results with the local `open_mats` and `gyms` tables using the `place_id`.
3.  **Apply Trust Hierarchy**: Prioritize owner-verified data, then recently confirmed data, and flag or hide "stale" data with high report counts.