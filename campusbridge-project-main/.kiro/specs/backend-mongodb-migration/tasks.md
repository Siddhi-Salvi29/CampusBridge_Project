# Implementation Plan: Backend MongoDB Migration

## Overview

Replace the MySQL/mysql2 database layer in `backend/server.js` with MongoDB via Mongoose. All 25 existing API endpoints keep their HTTP method, path, and JSON response contract unchanged. Mongoose models are defined inline at the top of the file. The `mysql2` import and connection pool are removed, along with the three dynamic schema helpers and `tableColumnsCache`.

## Tasks

- [x] 1. Install dependencies and update environment configuration
  - Add `mongoose` and `mongodb-memory-server` to `backend/package.json` (mongoose as dependency, mongodb-memory-server + fast-check as devDependencies)
  - Remove `mysql2` from dependencies
  - Replace `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` with `MONGODB_URI` in `backend/.env`
  - _Requirements: 1.4, 1.5_

- [x] 2. Replace MySQL connection with Mongoose and define all models
  - [x] 2.1 Remove mysql2 import, pool creation, `tableColumnsCache`, `getTableColumns`, `getUserSchemaConfig`, and `buildUserSelectFields` from `backend/server.js`
    - _Requirements: 1.4, 2.8_
  - [x] 2.2 Add `mongoose` import and `mongoose.connect(process.env.MONGODB_URI)` bootstrap with success/error logging
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.3 Define all seven Mongoose schemas and models inline: `User`, `StudentProfile`, `AlumniProfile`, `Job`, `Post`, `Follow` (with unique compound index), `StudentResume`
    - Add `toId` helper: `const toId = (doc) => ({ ...doc.toObject(), id: doc._id.toString() })`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3. Migrate authentication endpoints
  - [x] 3.1 Rewrite `POST /register` using `User.findOne` for duplicate check and `User.create` for insertion; preserve file upload logic and all response shapes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 3.2 Write property tests for registration (P1, P2, P3) in `backend/__tests__/unit/auth.test.js`
    - **Property 1: Registration creates a User document**
    - **Validates: Requirements 3.1, 3.3**
    - **Property 2: Duplicate email registration is rejected**
    - **Validates: Requirements 3.2**
    - **Property 3: Missing required registration fields are rejected**
    - **Validates: Requirements 3.4**
  - [x] 3.3 Rewrite `POST /login` using `User.findOne({ email })`; preserve admin bypass, role alias handling, and response shape with `id: user._id.toString()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 11.3, 11.4_
  - [ ]* 3.4 Write property tests for login (P4, P5, P6) and unit test for admin bypass in `backend/__tests__/unit/auth.test.js`
    - **Property 4: Login with unknown email returns invalid credentials**
    - **Validates: Requirements 4.2**
    - **Property 5: Login role mismatch returns invalid credentials**
    - **Validates: Requirements 4.3, 11.4**
    - **Property 6: Successful login returns id as a string**
    - **Validates: Requirements 4.4, 11.3**

- [x] 4. Migrate resume endpoints
  - [x] 4.1 Rewrite `POST /api/student/upload-resume` using `StudentResume.create`; preserve file validation and response shape
    - _Requirements: 5.1, 5.4_
  - [x] 4.2 Rewrite `GET /api/student/resume/:studentId` using `StudentResume.findOne({ student_id }).sort({ uploaded_at: -1 })`; preserve "no resume" response
    - _Requirements: 5.2, 5.3_
  - [ ]* 4.3 Write property tests for resume (P7, P8) in `backend/__tests__/unit/resume.test.js`
    - **Property 7: Resume upload creates a StudentResume document**
    - **Validates: Requirements 5.1, 5.4**
    - **Property 8: Resume retrieval returns the most recent upload**
    - **Validates: Requirements 5.2**

- [x] 5. Migrate profile endpoints
  - [x] 5.1 Rewrite `PUT /api/profile/:userId` using `StudentProfile.findOneAndUpdate({ user_id }, data, { upsert: true, new: true })`
    - _Requirements: 6.1_
  - [x] 5.2 Rewrite `GET /api/profile/:userId` using `StudentProfile.findOne({ user_id })`; ensure `projects`, `internships`, `achievements` are always returned as arrays
    - _Requirements: 6.2, 6.5_
  - [x] 5.3 Rewrite `PUT /api/alumni-profile/:userId` using `AlumniProfile.findOneAndUpdate` with upsert
    - _Requirements: 6.3_
  - [x] 5.4 Rewrite `GET /api/alumni-profile/:userId` using `AlumniProfile.findOne`; ensure `achievements` is always an array
    - _Requirements: 6.4, 6.5_
  - [x] 5.5 Rewrite `POST /api/profile/:userId/photo` using `User.findByIdAndUpdate`
    - _Requirements: 6.6_
  - [ ]* 5.6 Write property tests for profiles (P9, P10) and unit tests for photo upload and null profile in `backend/__tests__/unit/profile.test.js`
    - **Property 9: Profile upsert is idempotent**
    - **Validates: Requirements 6.1, 6.3**
    - **Property 10: Profile array fields are always arrays in responses**
    - **Validates: Requirements 6.2, 6.4**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Migrate posts endpoints
  - [x] 7.1 Rewrite `POST /api/posts` using `Post.create`; map `_id` to `id` in response using `toId`
    - _Requirements: 7.1, 11.3_
  - [x] 7.2 Rewrite `GET /api/posts` using `Post.find().sort({ created_at: -1 })`; map each doc with `toId` and rename `image_path` to `image`
    - _Requirements: 7.2, 11.2_
  - [x] 7.3 Rewrite `DELETE /api/posts/:postId` using `Post.findById` for auth check then `Post.deleteOne`; preserve 403 response and file deletion logic
    - _Requirements: 7.3, 7.4, 7.5_
  - [ ]* 7.4 Write property tests for posts (P11, P12, P13 posts portion) in `backend/__tests__/unit/posts.test.js`
    - **Property 11: Post deletion is authorized by author only**
    - **Validates: Requirements 7.3, 7.4**
    - **Property 12: Post creation returns _id as id string**
    - **Validates: Requirements 7.1, 11.3**
    - **Property 13: GET /api/posts returns documents sorted by created_at descending**
    - **Validates: Requirements 7.2**

- [x] 8. Migrate jobs endpoints
  - [x] 8.1 Rewrite `POST /api/jobs/post` using `Job.create`; return `jobId: doc._id.toString()`
    - _Requirements: 8.1, 11.3_
  - [x] 8.2 Rewrite `GET /api/jobs/all` using `Job.find().sort({ created_at: -1 })`
    - _Requirements: 8.2_
  - [x] 8.3 Rewrite `PUT /api/jobs/:jobId/status` using `Job.findByIdAndUpdate`; preserve status validation
    - _Requirements: 8.3, 8.5_
  - [x] 8.4 Rewrite `GET /api/jobs/my/:alumniId` using `Job.find({ alumni_id }).sort({ created_at: -1 })`; cast `alumniId` with `new mongoose.Types.ObjectId(alumniId)`
    - _Requirements: 8.4_
  - [ ]* 8.5 Write property tests for jobs (P12 jobs portion, P13 jobs portion, P14, P20) in `backend/__tests__/unit/jobs.test.js`
    - **Property 12: Job creation returns _id as id string and status is 'Pending Admin Approval'**
    - **Validates: Requirements 8.1, 11.3**
    - **Property 13: GET /api/jobs/all and GET /api/jobs/my/:alumniId return documents sorted descending**
    - **Validates: Requirements 8.2, 8.4**
    - **Property 14: Job filtering by alumniId returns only matching jobs**
    - **Validates: Requirements 8.4**
    - **Property 20: Invalid status values are rejected**
    - **Validates: Requirements 8.5**

- [x] 9. Migrate networking and follow endpoints
  - [x] 9.1 Rewrite `GET /api/network/users` using `User.find({ role: ... }).select('-password')`; enrich with `StudentProfile` or `AlumniProfile` lookups; apply `search`, `role`, `skills`, `company`, `branch` filters; map `_id` to `id`
    - _Requirements: 9.1, 9.2, 11.2, 11.3_
  - [x] 9.2 Rewrite `GET /api/network/users/:userId` using `User.findById`; enrich with profile; add follower/following counts via `Follow.countDocuments`; map `_id` to `id`
    - _Requirements: 9.3, 11.3_
  - [x] 9.3 Rewrite `POST /api/network/follow` using `Follow.create` with duplicate key error catch (code 11000); preserve self-follow check
    - _Requirements: 9.4, 9.9_
  - [x] 9.4 Rewrite `DELETE /api/network/follow` using `Follow.deleteOne({ follower_id, following_id })`
    - _Requirements: 9.5_
  - [x] 9.5 Rewrite `GET /api/network/follow/check` using `Follow.findOne`; return `{ success: true, isFollowing: boolean }`
    - _Requirements: 9.6_
  - [x] 9.6 Rewrite `GET /api/network/follow/:userId/followers` and `GET /api/network/follow/:userId/following` using `Follow.find` + `User.find`; map `_id` to `id`
    - _Requirements: 9.7, 9.8_
  - [ ]* 9.7 Write property tests for networking (P15, P16, P17, P18) in `backend/__tests__/unit/network.test.js`
    - **Property 15: Network user list never exposes password field**
    - **Validates: Requirements 9.1**
    - **Property 16: Follow state is consistent with Follow collection**
    - **Validates: Requirements 9.4, 9.5, 9.6**
    - **Property 17: Follower and following counts match Follow collection**
    - **Validates: Requirements 9.3**
    - **Property 18: Self-follow is rejected for any userId**
    - **Validates: Requirements 9.9**

- [x] 10. Migrate OTP login endpoints
  - [x] 10.1 Rewrite `POST /api/login-otp/send` to use `User.findOne({ email })` instead of `db.execute`; preserve admin bypass, OTP generation, `loginOtpStore`, and email sending logic
    - _Requirements: 10.1, 10.5_
  - [x] 10.2 Confirm `POST /api/login-otp/verify` requires no DB changes (in-memory only); verify OTP expiry and mismatch responses are intact
    - _Requirements: 10.2, 10.3, 10.4_
  - [ ]* 10.3 Write property test for OTP (P19) and unit tests for expiry/mismatch in `backend/__tests__/unit/auth.test.js`
    - **Property 19: OTP is a 6-digit string with a 10-minute expiry**
    - **Validates: Requirements 10.1**

- [x] 11. Migrate admin users endpoint
  - [x] 11.1 Rewrite `GET /api/admin/users` using `User.find({ role: { $in: [...] } }).select('-password')`; map `_id` to `id`
    - _Requirements: 9.1, 11.1, 11.2, 11.3_

- [x] 12. Add ObjectId CastError handling
  - Add a catch for Mongoose `CastError` in all route handlers that accept `:userId`, `:studentId`, `:postId`, `:jobId` params; return HTTP 400 with `{ success: false, message: "Invalid ID format" }`
  - _Requirements: 11.5_

- [ ] 13. Write integration tests
  - [ ]* 13.1 Write smoke test for MongoDB connection in `backend/__tests__/integration/connection.test.js`
    - Verify server connects using `MONGODB_URI`
    - _Requirements: 1.1_
  - [ ]* 13.2 Write API contract preservation test in `backend/__tests__/integration/routes.test.js`
    - Enumerate all 25 registered Express routes and assert HTTP method + path match the original contract
    - _Requirements: 11.1_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `toId` helper must be applied consistently across all endpoints that return documents to the frontend
- `alumni_id` in Job queries must be cast with `new mongoose.Types.ObjectId(alumniId)` when filtering
- `mongodb-memory-server` is used in all unit/integration tests to avoid external DB dependencies
- Property tests use `fast-check` with a minimum of 100 iterations per property
