# Requirements Document

## Introduction

This feature adds email OTP (One-Time Password) verification to the CampusBridge registration flow. When a user submits the registration form, the system sends a 6-digit OTP to their email address. The user must enter the correct OTP within a time window to complete account creation. This prevents fake or mistyped email addresses from being registered and ensures each account is tied to a real, accessible inbox.

## Glossary

- **OTP**: A 6-digit numeric One-Time Password generated randomly and sent to the user's email address.
- **OTP_Service**: The backend module responsible for generating, storing, and validating OTPs.
- **Registration_Form**: The frontend React component (`Register.jsx`) that collects user details.
- **OTP_Verification_Screen**: The frontend component that prompts the user to enter the OTP received by email.
- **Pending_Registration**: A temporary server-side record holding unverified registration data until OTP is confirmed.
- **Email_Service**: The backend module that sends transactional emails via Nodemailer using Gmail with an App Password.
- **Expiry_Window**: The time period (10 minutes) during which an OTP remains valid.
- **Attempt_Limit**: The maximum number of incorrect OTP submissions allowed (5 attempts) before the OTP is invalidated.

---

## Requirements

### Requirement 1: OTP Generation and Email Dispatch

**User Story:** As a new user, I want to receive an OTP on my email after submitting the registration form, so that I can verify my email address before my account is created.

#### Acceptance Criteria

1. WHEN a user submits the registration form with valid inputs, THE Registration_Form SHALL send the registration data to the backend and display the OTP_Verification_Screen.
2. WHEN the backend receives a valid registration request, THE OTP_Service SHALL generate a cryptographically random 6-digit numeric OTP.
3. WHEN the OTP is generated, THE Email_Service SHALL send an email containing the OTP to the submitted email address within 10 seconds.
4. WHEN the OTP is generated, THE OTP_Service SHALL store the OTP alongside the Pending_Registration data with a timestamp for expiry tracking.
5. IF the email address already exists in the users table, THEN THE backend SHALL return an error response with the message "Email already registered" without sending an OTP.

---

### Requirement 2: OTP Verification

**User Story:** As a new user, I want to submit the OTP I received, so that my email is verified and my account is activated.

#### Acceptance Criteria

1. WHEN a user submits a 6-digit OTP on the OTP_Verification_Screen, THE OTP_Verification_Screen SHALL send the OTP and the associated email to the backend for validation.
2. WHEN the submitted OTP matches the stored OTP and the Expiry_Window has not elapsed, THE OTP_Service SHALL mark the email as verified and THE backend SHALL create the user account in the database and return a success response.
3. IF the submitted OTP does not match the stored OTP, THEN THE OTP_Service SHALL decrement the remaining attempt count and return an error response indicating the OTP is incorrect.
4. IF the number of incorrect OTP submissions reaches the Attempt_Limit, THEN THE OTP_Service SHALL invalidate the Pending_Registration and return an error response instructing the user to restart registration.
5. IF the Expiry_Window has elapsed when the OTP is submitted, THEN THE OTP_Service SHALL invalidate the Pending_Registration and return an error response indicating the OTP has expired.

---

### Requirement 3: OTP Resend

**User Story:** As a new user, I want to request a new OTP if I did not receive the first one or if it expired, so that I can still complete registration.

#### Acceptance Criteria

1. WHEN a user clicks the resend button on the OTP_Verification_Screen, THE OTP_Service SHALL generate a new OTP, invalidate the previous OTP for that email, and send the new OTP via the Email_Service.
2. WHEN a resend is requested, THE OTP_Service SHALL reset the Expiry_Window and the attempt count for that email.
3. THE OTP_Verification_Screen SHALL display a cooldown of 60 seconds after a resend, during which the resend button SHALL be disabled.

---

### Requirement 4: Input Validation

**User Story:** As a system, I want to validate all registration inputs before sending an OTP, so that only well-formed data enters the system.

#### Acceptance Criteria

1. IF the fullname, email, or password fields are empty, THEN THE Registration_Form SHALL prevent form submission and display a field-level validation message.
2. IF the email field does not contain a valid email format, THEN THE Registration_Form SHALL prevent form submission and display a validation message.
3. IF the email does not end with the required college domain (`@rmcet.com`), THEN THE Registration_Form SHALL prevent form submission and display a domain restriction message, regardless of the selected role.
4. WHEN the OTP input field is submitted, THE OTP_Verification_Screen SHALL accept only 6-digit numeric values and reject any other input format.

---

### Requirement 5: Pending Registration Cleanup

**User Story:** As a system operator, I want unverified registration data to be cleaned up automatically, so that the database does not accumulate stale pending records.

#### Acceptance Criteria

1. WHEN the Expiry_Window elapses for a Pending_Registration, THE OTP_Service SHALL mark the record as expired so it cannot be used for verification.
2. THE OTP_Service SHALL store Pending_Registration data in memory (server-side Map) rather than the users table until verification is complete.
3. IF a new OTP request arrives for an email that already has a Pending_Registration, THEN THE OTP_Service SHALL replace the existing Pending_Registration with the new one.
