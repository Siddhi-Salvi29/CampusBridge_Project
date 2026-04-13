# Implementation Plan: Mail OTP Registration

## Overview

Implement email OTP verification for the CampusBridge registration flow. Registration data is held in memory until the user verifies their OTP, at which point the user account is created. Touches backend services, two new API endpoints, a new frontend component, and updates to existing Register.jsx and App.jsx.

## Tasks

- [x] 1. Create backend OTP service module
  - Create `backend/services/otpService.js` with an in-memory `Map` (`pendingRegistrations`)
  - Implement `generateAndStore(email, registrationData)` — generates a 6-digit zero-padded OTP using `crypto.randomInt`, stores `{ otp, registrationData, createdAt: Date.now(), attemptsLeft: 5 }` keyed by lowercase email, returns the OTP string
  - Implement `verify(email, submittedOtp)` — checks expiry (10 min), attempt count, and OTP match; decrements `attemptsLeft` on mismatch; removes record on success or exhaustion; returns `{ valid, error?, registrationData? }`
  - Implement `invalidate(email)` — deletes the Map entry
  - Implement `replace(email, registrationData)` — calls `generateAndStore` after deleting any existing entry, resets expiry and attempts; returns new OTP
  - _Requirements: 1.2, 1.4, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 5.1, 5.2, 5.3_

- [ ]* 1.1 Write property test for OTP format invariant (Property 1)
  - Use **fast-check** (`fc.string()` as arbitrary email input) to assert every OTP returned by `generateAndStore` matches `/^\d{6}$/`
  - `// Feature: mail-otp-registration, Property 1: OTP format invariant`
  - Minimum 100 iterations
  - _Requirements: 1.2_

- [ ]* 1.2 Write property test for pending registration round-trip (Property 2)
  - Use `fc.record({ fullname: fc.string(), email: fc.emailAddress(), password: fc.string(), role: fc.constantFrom('Student','Alumini','Admin') })` to generate payloads
  - After `generateAndStore`, assert Map entry has correct shape: valid OTP, original `registrationData`, numeric `createdAt`, `attemptsLeft === 5`
  - `// Feature: mail-otp-registration, Property 2: Pending registration round-trip`
  - _Requirements: 1.4_

- [ ]* 1.3 Write property test for wrong OTP decrements attempt count (Property 4)
  - Seed pending records with `attemptsLeft` in [2..5] via `fc.integer({ min: 2, max: 5 })`
  - Submit a wrong OTP, assert `attemptsLeft` is exactly N-1 and `verify` returns an error
  - `// Feature: mail-otp-registration, Property 4: Wrong OTP decrements attempt count`
  - _Requirements: 2.3_

- [ ]* 1.4 Write property test for resend replaces pending registration (Property 7)
  - Generate two sequential registration payloads for the same email via `fc.record(...)`
  - Call `replace` with the second payload, assert Map has exactly one entry with fresh OTP, `attemptsLeft === 5`, and updated `createdAt`
  - `// Feature: mail-otp-registration, Property 7: Resend replaces pending registration`
  - _Requirements: 3.1, 5.3_

- [ ]* 1.5 Write property test for correct OTP verification succeeds (Property 3)
  - Generate valid pending records, call `verify` with the matching OTP before expiry, assert `{ valid: true }` and Map entry removed
  - `// Feature: mail-otp-registration, Property 3: Correct OTP verification succeeds`
  - _Requirements: 2.2_

- [x] 2. Create backend email service module
  - Create `backend/services/emailService.js`
  - Instantiate a Nodemailer transporter using `process.env.GMAIL_USER` and `process.env.GMAIL_APP_PASS` (same credentials already used in `server.js`)
  - Implement `sendOtpEmail(toEmail, otp)` — sends an email with subject "Your CampusBridge Registration OTP" and a plain-text body containing the OTP and a note that it is valid for 10 minutes
  - Export `sendOtpEmail`
  - _Requirements: 1.3_

- [x] 3. Add POST /api/send-otp endpoint to server.js
  - Import `otpService` and `emailService` at the top of `backend/server.js`
  - Add `POST /api/send-otp` handler that accepts `multipart/form-data` (reuse existing `express-fileupload` middleware)
  - Validate that `fullname`, `email`, and `password` are present; return 400 with field-level message if missing
  - Check `User.findOne({ email })` — if found, return 400 `"Email already registered"` without sending OTP
  - Handle optional `profile_photo` file upload (same logic as existing `/register`): validate mime type, move to `uploadDir`, store path
  - Call `otpService.generateAndStore(email.toLowerCase(), { fullname, email, password, phoneNumber, role, profilePhotoPath })`
  - Call `emailService.sendOtpEmail(email, otp)`; on SMTP failure return 500 `"Failed to send OTP email"` and call `otpService.invalidate(email)`
  - On success return 200 `{ success: true, message: "OTP sent to <email>" }`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 5.2, 5.3_

- [x] 4. Add POST /api/verify-otp endpoint to server.js
  - Add `POST /api/verify-otp` handler accepting JSON body `{ email, otp }`
  - Validate `email` and `otp` present; return 400 if missing
  - Call `otpService.verify(email.toLowerCase(), otp)`
  - On `valid: false`, return 400 with the error message from the service (covers expired, too many attempts, no record, wrong OTP)
  - On `valid: true`, use `registrationData` to create the user via `User.create(...)` and optionally create a profile photo record (same as existing `/register` logic)
  - Return 200 `{ success: true, message: "Registration successful", user: { id, fullname, email, role, profile_photo } }`
  - On DB error return 500 `"Server error"`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Checkpoint — verify backend endpoints
  - Ensure all property tests pass, ask the user if questions arise.

- [x] 6. Create OtpVerification.jsx frontend component
  - Create `frontend/src/components/ui/authentication/OtpVerification.jsx`
  - Read `email` from `useLocation().state.email`; if missing, redirect to `/register`
  - Local state: `otp` (string, default `""`), `error` (string), `loading` (bool), `cooldown` (number, default 0)
  - Render a 6-digit OTP input field; on submit validate that value matches `/^\d{6}$/` — if not, set error and block submission
  - On valid submit, call `POST /api/verify-otp` with `{ email, otp }`; on success navigate to `/login`; on error display the message from the response
  - If response message includes "Please register again", navigate back to `/register` after showing the error
  - Implement resend: call `POST /api/send-otp` with the original registration data — since only `email` is available in state, display a message directing the user back to `/register` to resend (or pass full form data via router state — follow whichever approach is consistent with the router state passed from Register.jsx in task 7)
  - Implement 60-second cooldown after resend: use `setInterval` to decrement `cooldown` each second; disable resend button while `cooldown > 0`
  - _Requirements: 2.1, 3.1, 3.2, 3.3, 4.4_

- [ ]* 6.1 Write property test for OTP input validation (Property 6)
  - Use `fc.string()` filtered to exclude exactly-6-digit numeric strings, assert the component's validation function rejects them
  - `// Feature: mail-otp-registration, Property 6: OTP input validation rejects non-6-digit-numeric strings`
  - _Requirements: 4.4_

- [x] 7. Update Register.jsx to use POST /api/send-otp
  - Remove the direct `POST /register` fetch call from `submitHandler`
  - Replace with `POST /api/send-otp` using `FormData` (same fields: `fullname`, `email`, `password`, `phoneNumber`, `role`, `profile_photo`)
  - Pass `{ state: { email, fullname, password, phoneNumber, role, profilePhoto } }` to `navigate('/otp-verification', ...)` on success so OtpVerification.jsx can resend if needed
  - Ensure domain validation (`@rmcet.com`) applies to ALL roles (Student, Alumini, Admin) — it already does in the current code; confirm and keep
  - Display backend error messages inline (e.g., "Email already registered")
  - _Requirements: 1.1, 4.1, 4.2, 4.3_

- [ ]* 7.1 Write property test for domain restriction across all roles (Property 5)
  - Use `fc.emailAddress()` filtered to exclude `@rmcet.com` suffix, combined with `fc.constantFrom('Student','Alumini','Admin')`
  - Assert the domain-check function in Register.jsx returns false / blocks submission for every combination
  - `// Feature: mail-otp-registration, Property 5: Domain restriction applies to all roles`
  - _Requirements: 4.3_

- [x] 8. Add /otp-verification route to App.jsx
  - Import `OtpVerification` from `./components/ui/authentication/OtpVerification.jsx`
  - Add `<Route path="/otp-verification" element={<OtpVerification />} />` as a public route (no `ProtectedRoute` wrapper — user is not yet authenticated)
  - Place it alongside the existing `/login` and `/register` routes
  - _Requirements: 1.1_

- [x] 9. Final checkpoint — end-to-end flow
  - Ensure all tests pass, ask the user if questions arise.
  - Verify the full flow manually: fill Register form → OTP email received → enter OTP → redirected to /login

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use **fast-check** — install with `npm install --save-dev fast-check` in the relevant package
- The existing `/register` endpoint in server.js is kept as-is for backward compatibility; the new OTP flow uses `/api/send-otp` + `/api/verify-otp`
- OTP state is in-memory only; a server restart clears all pending registrations
