# Security Specification — Rodrigo Cutsss Firestore Rules (Zero-Trust ABAC)

## 1. Data Invariants

1. **Global Default-Deny Safety Net**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Verified Admin Governance (`isAdmin()`)**: Only authenticated users whose token has `email_verified == true` and whose email is the bootstrapped studio owner (`hz.mdiego@gmail.com`) or whose UID exists in `/admins/{uid}` have administrative privileges.
3. **PII Isolation (`/studio_users/{userId}` & `/studio_crm_notes/{noteId}`)**:
   - `/studio_users/{userId}` can only be read (`get`) or written by the profile owner (`request.auth.uid == userId`) or a verified admin (`isAdmin()`). `list` is restricted to `isAdmin()`.
   - `/studio_crm_notes/{noteId}` contains private client phone numbers and technical haircut formulas; both `read` and `write` are strictly restricted to `isAdmin()`.
4. **Public Showcase & Controlled Booking (`/studio_appointments`, `/studio_transformations`, `/studio_gallery`)**:
   - Public visitors can read `/studio_transformations` and `/studio_gallery` to view the portfolio. Only `isAdmin()` can create, update, or delete portfolio items, and every write must pass `isValidTransformationCase` / `isValidGalleryItem` schema and size validation.
   - Public visitors can create a valid appointment in `/studio_appointments/{appointmentId}` only if it strictly satisfies `isValidAppointment(incoming())` (bounded strings, valid `YYYY-MM-DD` date, `HH:MM` time, status `'confirmed'`, bounded `serviceNames` array `<= 6`). Terminal appointments (`status == 'completed'`) are locked against non-admin updates.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Shadow Field Injection on Appointment Creation**:
   `{ id: "TK-100", date: "2026-11-10", startTime: "16:00", serviceMinutes: 45, bufferMinutes: 10, clientName: "Juan", whatsapp: "5493462554421", serviceNames: ["Corte"], paymentOption: "deposit", status: "confirmed", isAdminOverride: true }` -> **REJECTED** (`hasOnly` key guard).
2. **Oversized Image / Resource Exhaustion ("Denial of Wallet")**:
   `{ id: "gal-1", title: "Fade", category: "Cortes", imageUrl: "<600KB string>" }` -> **REJECTED** (`imageUrl.size() <= 450000`).
3. **ID Poisoning Attack**:
   Path `/studio_appointments/invalid..id$$$` -> **REJECTED** (`isValidId` regex `^[a-zA-Z0-9_\-]+$`).
4. **Unverified Admin Email Spoofing**:
   Token `{ email: "hz.mdiego@gmail.com", email_verified: false }` attempting to read `/studio_crm_notes/note-1` -> **REJECTED** (`email_verified == true` required).
5. **Self-Assigned Admin Role Escalation in `/studio_users/{uid}`**:
   Non-admin user creating `/studio_users/user123` with `{ role: "admin" }` -> **REJECTED** (`incoming().role == 'client' || isAdmin()`).
6. **Cross-User Profile PII Read**:
   Authenticated `userA` calling `get(/studio_users/userB)` -> **REJECTED** (`isOwner(userId) || isAdmin()`).
7. **Unauthorized CRM Read by Anonymous/Standard Client**:
   Client calling `get` or `list` on `/studio_crm_notes` -> **REJECTED** (`isAdmin()` only).
8. **Terminal State Bypass on Completed Appointment**:
   Non-admin attempting to update an appointment where `existing().status == 'completed'` -> **REJECTED** (terminal state lock).
9. **Unbounded Array Injection in `serviceNames`**:
   Appointment payload with 25 elements in `serviceNames` -> **REJECTED** (`serviceNames.size() >= 1 && serviceNames.size() <= 6`).
10. **Invalid Date/Time Format in Appointment**:
    Appointment payload with `date: "tomorrow"`, `startTime: "99:99"` -> **REJECTED** (`matches('^\\d{4}-\\d{2}-\\d{2}$')`).
11. **Unauthorized Portfolio Deletion**:
    Non-admin attempting `delete` on `/studio_transformations/tr-01` -> **REJECTED** (`isAdmin()` required).
12. **Value Poisoning on Update**:
    Admin or user attempting to update `clientName` with an integer `12345` or 500-char string -> **REJECTED** (`isValidAppointment(incoming())` wraps all updates).
