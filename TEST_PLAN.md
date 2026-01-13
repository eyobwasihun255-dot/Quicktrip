# Quicktrip Project — Comprehensive Test Plan

## Executive Summary

Quicktrip is a Django (DRF) + React application providing branch/station, user/driver, vehicle, ticketing, queueing, payment, and reporting capabilities. This plan defines structured API, UI, and end-to-end test coverage with happy paths, edge cases, validation, and permissions. It is designed to be executed in stages over a few days, aligned with your incremental backend commits.

## Scope

- In-scope
  - Backend API (Django REST Framework) covering authentication, user/role flows, branches, drivers, vehicles, routes, queueing, tickets, payments, notifications, location updates, and PDF reports.
  - Frontend UI (React + Vite) covering login, sub-admin management, driver registration, vehicles, stations, passengers, notifications, receipts, and protected routing.
  - E2E flows integrating API and UI.
- Out-of-scope
  - Non-functional security audits, deep performance benchmarking, real SMS/Twilio delivery validation (mocked), and third-party availability.

## Assumptions and Test Data

- Fresh local environment (clean DB or consistent seed).
- Media/uploads stored locally and ignored in VCS.
- JWT-based endpoints available as in code; some endpoints allow AllowAny per current settings.
- Known base URL for local testing (default):
  - Backend:https://quicktrip-e761.onrender.com/
  - Frontend: https://quicktrip-1.onrender.com/
- Test data
  - Branch: at least one branch exists (id=1) or created during test.
  - Users: admin superuser for Django admin, sub-admin for UI, sample passengers.
  - Files: sample image/PDF for uploads (<= 5MB).

## Quality Gates

- Build: PASS (can start Django server; frontend dev server compiles)
- Lint/Typecheck: PASS (or noted warnings)
- Tests: PASS (API unit tests and selected UI E2E smoke tests)

## Test Types Matrix

- Unit tests: serializers, validators, utility methods.
- API integration: endpoint contracts, status codes, auth/permissions, data shape.
- UI functional: form validations, navigation, role-based visibility.
- E2E workflows: critical user journeys across API + UI.
- Negative testing: invalid inputs, missing auth, permissions.

---

## Backend API Test Scenarios

### 1. Authentication & Authorization

1.1 Obtain JWT

- Steps:
  1. POST /api/token/ with valid credentials.
- Expected: 200 with access and refresh tokens.
- Failure: 401 with error on bad credentials.

  1.2 Protected endpoint access

- Steps:
  1. Call GET /api/staffs/ with Authorization: Bearer token.
- Expected: 200 when permissions allow; 401/403 otherwise.

### 2. Branches

2.1 List branches

- Steps: GET /api/branch/
- Expected: 200 array of branches with id, name, address, location if present.

  2.2 Create branch (with/without location)

- Steps: POST /api/branch/ JSON {name, address, type, status, optional location{latitude,longitude}}
- Expected: 201; location attached or created appropriately.
- Edge: invalid location id → 400.

  2.3 Update branch

- Steps: PUT/PATCH /api/branch/{id}/
- Expected: 200; fields updated; cannot change location id incorrectly.

  2.4 Delete branch

- Steps: DELETE /api/branch/{id}/ (if allowed)
- Expected: 204 or 200; referential integrity maintained.

### 3. Users & Staff

3.1 Register user

- Steps: POST /api/register (if exposed) or via RegisterUserView with phone + password.
- Expected: 201; user_type default to 'u' unless overridden.

  3.2 Staff listing

- Steps: GET /api/staffs/
- Expected: 200; only user_type='s'.

  3.3 User detail/update (branch/employee update)

- Steps: GET & PUT/PATCH /api/users/{id}/
- Expected: 200; nested employee position can update.
- Edge: invalid branch id → 400.

  3.4 Activate/Deactivate user

- Steps: PATCH /api/users/{id}/ {is_active: false/true}
- Expected: 200; is_active toggles.
- Permission: ensure only authorized roles can change.

  3.5 Password change

- Steps: PUT /api/password-change/{id}/ with old_password/new_password.
- Expected: 200; password changed; validations enforced.

### 4. Drivers

4.1 Add driver (multipart/form-data)

- Steps: POST /api/add_driver/ form-data with dotted keys:
  - employee.Fname, employee.Lname, phone_number, branch (JSON string or id by current serializer),
  - credentials.did, credentials.type, credentials.expiry_date, credentials.doc (File)
- Expected: 201 with user, employee, credentials, media URL.
- Edge: missing required fields → 400; invalid branch id → 400; duplicate DID → 400/409.

  4.2 List drivers

- Steps: GET /api/driver/
- Expected: 200; drivers only (user_type='d').

### 5. Vehicles

5.1 Create vehicle (multipart accepted per parser)

- Steps: POST /api/vehicles/ with branch, user, route, plate_number, picture, etc.
- Expected: 201; file stored; relations set.

  5.2 Edit vehicle

- Steps: PUT/PATCH /api/vehicles/{id}/
- Expected: 200; fields updated; constraints validated.

  5.3 Vehicle location

- Steps: GET /api/vehicle-location/ (as defined) or UpdateLocationView POST
- Expected: 200; returns/accepts lat/long and last_updated.

### 6. Routes

6.1 List routes

- Steps: GET /api/routes/
- Expected: 200; includes first_destination/last_destination objects.

  6.2 Create route

- Steps: POST /api/routes/ with destinations and prize/distance.
- Expected: 201; notification created.

  6.3 CRUD route

- Steps: GET/PUT/PATCH/DELETE /api/routes/{id}/
- Expected: standard REST semantics.

### 7. Tickets & Travels

7.1 Buy ticket

- Steps: POST /api/buyticket/ with route, level, quantity, takeoff_date/time, user.
- Expected: 201; total_prize computed (if applicable), travelhistory created later.

  7.2 List tickets

- Steps: GET /api/tickets/
- Expected: 200 array with nested route/level/user.

  7.3 User travel history

- Steps: GET /api/user-travel/
- Expected: 200 users with nested travel_history.

### 8. Queue Management

8.1 Join queue

- Steps: POST /api/queue/add with branch_id, user_id
- Expected: 201; Queues entry created; position assigned.

  8.2 Leave queue

- Steps: POST /api/queue/leave with vehicle_id
- Expected: 200; status updated.

  8.3 Retrieve queue

- Steps: GET /api/queue/retrieve?branch=...
- Expected: 200; positions, current_passengers, status.

### 9. Payments

9.1 Add payment

- Steps: POST /api/payments/add/ with status, branch, amount, transaction_id, types, user/vehicle
- Expected: 201; linked to correct entities.

  9.2 List payments

- Steps: GET /api/payments/
- Expected: 200; filterable by date/status/type (if provided).

### 10. Notifications

10.1 List notifications

- Steps: GET /api/notifications/
- Expected: 200; format date/time; unread/read.

  10.2 Mark read

- Steps: PATCH /api/notifications/{id}/read
- Expected: 200; read=true.

  10.3 Mark all read

- Steps: POST /api/notifications/mark-all
- Expected: 200; all read.

### 11. Reports (PDF)

11.1 Monthly revenue report

- Steps: GET /api/reports/monthly-revenue
- Expected: 200 PDF; sums match expected.

  11.2 Monthly tax/expenses report

- Steps: GET /api/reports/monthly-tax
- Expected: 200 PDF; sums match expected.

### 12. Location Update

12.1 Update location

- Steps: POST /api/location/update {user_id, latitude, longitude}
- Expected: 201/200; user location updated; types validated.

---

## Frontend UI Test Scenarios

### A. Authentication & Routing

A.1 Login/Logout

- Steps: open /login, submit valid credentials; then logout.
- Expected: redirected to dashboard; token stored; logout clears token.
- Edge: invalid creds → error message.

A.2 Protected routes

- Steps: attempt to open protected page without token.
- Expected: redirected to login/unauthorized.

### B. Sub-Admin Management Page (`src/pages/sub_admins.jsx`)

B.1 List and search

- Steps: page loads, search by First/Last/Branch.
- Expected: filtered table updates as you type.

B.2 Add sub-admin

- Steps: open modal, fill fields, submit.
- Expected: list prepends new sub-admin or refreshes; validations enforced.

B.3 Edit sub-admin

- Steps: open edit modal, change position/branch.
- Expected: updated values reflected after save.

B.4 Activate/Deactivate

- Steps: click Deactivate/Activate.
- Expected: spinners show; state toggles; errors surfaced if API fails.

### C. Driver Registration (`DriverRegistrationModal.jsx`)

C.1 Valid submission

- Steps: fill required fields, choose image/pdf, submit.
- Expected: success message; driver appears in drivers list; form reset.

C.2 Validation errors

- Steps: missing Fname or doc; invalid file type/size.
- Expected: field-level error messages; no request sent if client-side blocked.

### D. Vehicles

D.1 Vehicle registration

- Steps: open registration modal, fill, upload picture, submit.
- Expected: 201; appears in table; preview shows.

D.2 Edit vehicle

- Steps: open edit modal, change plate number or route.
- Expected: updates visible; API success toast.

### E. Stations & Map

E.1 Station listing and counts

- Steps: view stations page; counts by branch.
- Expected: counts match API; optional chaining prevents crashes with missing data.

E.2 Manager assignment

- Steps: assign/update manager for station.
- Expected: rendered names; Not Assigned fallback.

### F. Passengers

F.1 List passengers

- Steps: open passengers page.
- Expected: renders even if nested nid fields are null; uses safe defaults.

### G. Notifications & Receipts

G.1 Notifications UI

- Steps: bell icon shows unread; items listed; mark read.
- Expected: counters update.

G.2 Receipt/Payment generators

- Steps: open generators; print/download.
- Expected: PDFs/images render; file saved via FileSaver.

### H. Theme & Misc

H.1 Theme toggle

- Steps: switch theme.
- Expected: persists during session; styles apply.

H.2 Routing

- Steps: navigate between pages; 404 and unauthorized pages render appropriately.

---

## End-to-End Journeys

E2E.1 Register driver → assign vehicle → take trip → collect payment → revenue report

- Steps:
  1. Create branch (if needed).
  2. Add driver (multipart).
  3. Register vehicle and link to branch/driver.
  4. Buy ticket(s) for passenger.
  5. Mark queue/boarding; complete trip (as per app flow).
  6. Add payment record (types='i', status='c').
  7. Generate monthly revenue report; validate totals include the transaction.
- Expected: Each step succeeds; aggregates match itemized payments.

E2E.2 Sub-admin lifecycle

- Steps: create sub-admin; edit role/branch; deactivate; reactivate.
- Expected: table updates correctly; permissions enforced on backend.

---

## Negative and Edge Cases

- Multipart with wrong Content-Type (axios forcing header) → 415: ensure client does not set it manually.
- Dotted keys missing normalization → 400: serializer handles merging keys.
- Null nested fields in UI → no crash; optional chaining covers.
- Duplicate license DID → handled with unique constraint error.
- Invalid branch/location IDs → 400.
- Large files (>5MB) or wrong types → client blocks; backend returns 400 if reached.
- Unauthorized access → 401/403; verify roles: IsAdmin/IsSub/IsBranch.

---

## Execution Plan (Few Days)

Day 1: Backend core

- Run: auth, branches, users CRUD, password change tests.
- Deliver: Postman collection for these endpoints + API assertions.

Day 2: Drivers, vehicles, routes, tickets

- Run: add_driver multipart, vehicles CRUD, routes CRUD, buyticket.
- Deliver: E2E driver-vehicle flow; sample uploads.

Day 3: Queue, payments, notifications, reports

- Run: queue add/leave/retrieve, addpayments, list payments, notifications, PDFs.
- Deliver: monthly revenue/tax report verification; notification flows.

Frontend smoke each day

- Validate affected UI pages after API tests; ensure no console errors and forms behave.

---

## Tooling & Artifacts

- Postman Collection:
  - Include requests for: branches, add_driver, drivers, users, vehicles, routes, tickets, payments, notifications, reports, queues.
  - Add test scripts (status code checks, schema shape spot checks).
- Python requests scripts for CI smoke.
- DRF APITestCase: critical serializers/flows (add_driver, payments aggregation).
- UI: minimal Playwright/Cypress smoke (login, sub-admin list, driver registration modal open/submit).

---

## Acceptance Criteria

- All priority endpoints return expected status codes and schemas.
- Core journeys (driver lifecycle, payments → revenue) pass end-to-end.
- UI critical flows run without runtime errors and with visible confirmations.
- No secrets/media in repo; uploads function locally.

---

## Troubleshooting Notes

- If 400 on add_driver: inspect DRF errors to see which field failed (branch JSON vs id, missing doc).
- If 415: ensure multipart FormData is used and Content-Type not set manually by client.
- If migrations fail: review circular dependencies — commit minimal dependent models first.
- If UI crashes on null data: confirm optional chaining in relevant components.
