# Requirements Document

## Introduction

This feature migrates the backend database layer from MySQL (mysql2 driver) to MongoDB (Mongoose ODM). The Node.js/Express backend currently uses raw SQL queries against a MySQL database. The migration replaces all MySQL-specific code with Mongoose models and MongoDB queries while keeping every existing REST API endpoint and its request/response contract identical, so the frontend requires zero changes. The `.env` configuration is updated from MySQL connection variables to a single `MONGODB_URI`.

## Glossary

- **Server**: The Node.js/Express application defined in `backend/server.js`
- **Mongoose**: The MongoDB ODM library used to define schemas and interact with MongoDB
- **Model**: A Mongoose model that maps to a MongoDB collection
- **MONGODB_URI**: The MongoDB connection string stored in the `.env` file
- **API_Contract**: The set of HTTP method, path, request body/params, and JSON response shape for each endpoint
- **User**: A registered person with role Student, Alumni, or Admin
- **StudentProfile**: Extended profile data for a User with role Student
- **AlumniProfile**: Extended profile data for a User with role Alumni
- **Job**: A job posting created by an Alumni and subject to Admin approval
- **Post**: A user-created content item (text and/or image)
- **Follow**: A directional relationship where one User follows another User
- **StudentResume**: A file upload record linking a resume file path to a Student User
- **OTP**: A one-time password used for email-based login verification

## Requirements

### Requirement 1: MongoDB Connection Setup

**User Story:** As a developer, I want the Server to connect to MongoDB using a URI from environment variables, so that the database connection is configurable without code changes.

#### Acceptance Criteria

1. THE Server SHALL connect to MongoDB using the value of the `MONGODB_URI` environment variable via Mongoose on startup.
2. WHEN the MongoDB connection is established successfully, THE Server SHALL log a confirmation message to the console.
3. IF the MongoDB connection fails during startup, THEN THE Server SHALL log the error details to the console.
4. THE Server SHALL remove all MySQL connection pool configuration and the `mysql2` import.
5. THE Server SHALL replace the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables with `MONGODB_URI` in the `.env` file.

---

### Requirement 2: Mongoose Schema and Model Definitions

**User Story:** As a developer, I want Mongoose models that represent all existing data entities, so that all data operations use a consistent, schema-validated interface.

#### Acceptance Criteria

1. THE Server SHALL define a Mongoose model named `User` with fields: `fullname` (String), `email` (String, unique), `password` (String), `role` (String), `profile_photo` (String).
2. THE Server SHALL define a Mongoose model named `StudentProfile` with fields: `user_id` (ObjectId ref User), `bio`, `degree`, `branch`, `year`, `cgpa`, `skills` (String), `projects` (Array), `internships` (Array), `achievements` (Array).
3. THE Server SHALL define a Mongoose model named `AlumniProfile` with fields: `user_id` (ObjectId ref User), `bio`, `designation`, `company`, `experience`, `linkedin`, `github`, `skills` (String), `achievements` (Array).
4. THE Server SHALL define a Mongoose model named `Job` with fields: `title`, `description`, `location`, `company`, `alumni_id` (ObjectId ref User), `alumni_name`, `status` (String, default `'Pending Admin Approval'`), `created_at` (Date, default now).
5. THE Server SHALL define a Mongoose model named `Post` with fields: `author_id` (ObjectId ref User), `author_name`, `author_role`, `caption`, `image_path`, `created_at` (Date, default now).
6. THE Server SHALL define a Mongoose model named `Follow` with fields: `follower_id` (ObjectId ref User), `following_id` (ObjectId ref User), and a unique compound index on `[follower_id, following_id]`.
7. THE Server SHALL define a Mongoose model named `StudentResume` with fields: `student_id` (ObjectId ref User), `resume_path` (String), `uploaded_at` (Date, default now).
8. THE Server SHALL remove the `getTableColumns`, `getUserSchemaConfig`, and `buildUserSelectFields` helper functions and the `tableColumnsCache` Map, as dynamic schema detection is no longer needed with Mongoose.

---

### Requirement 3: User Registration Endpoint

**User Story:** As a new user, I want to register an account, so that I can access the platform.

#### Acceptance Criteria

1. WHEN a `POST /register` request is received with `fullname`, `email`, `password`, and optional `role`, `phoneNumber`, and `profile_photo` file, THE Server SHALL create a new User document in MongoDB.
2. IF a User document with the same `email` already exists, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Email already exists" }`.
3. WHEN registration succeeds, THE Server SHALL return HTTP 200 with `{ success: true, message: "User registered successfully" }`.
4. IF `fullname`, `email`, or `password` are missing from the request, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Fullname, email, and password are required" }`.
5. WHEN a `profile_photo` file is uploaded during registration, THE Server SHALL save the file to the uploads directory and store the path in the User document's `profile_photo` field.

---

### Requirement 4: User Login Endpoint

**User Story:** As a registered user, I want to log in with my email, password, and role, so that I can access my account.

#### Acceptance Criteria

1. WHEN a `POST /login` request is received with `email`, `password`, and `role`, THE Server SHALL query the `User` collection by email using Mongoose.
2. IF no User document matches the provided email, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Invalid credentials" }`.
3. IF the User's stored role does not match the provided role (accounting for the `alumni`/`alumini` alias), THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Invalid credentials" }`.
4. WHEN login succeeds, THE Server SHALL return HTTP 200 with `{ success: true, user: { id, fullname, email, role, profile_photo } }` where `id` is the MongoDB `_id` serialized as a string.
5. WHEN the fixed admin credentials (`admin123@rmcet.com` / `admin@123` / role `admin`) are provided, THE Server SHALL return HTTP 200 with the hardcoded admin user object without querying MongoDB.

---

### Requirement 5: Resume Upload and Retrieval Endpoints

**User Story:** As a student, I want to upload and retrieve my resume, so that alumni and admins can view my qualifications.

#### Acceptance Criteria

1. WHEN a `POST /api/student/upload-resume` request is received with a valid `studentId` and a PDF/DOC/DOCX file, THE Server SHALL save the file and create a `StudentResume` document in MongoDB.
2. WHEN a `GET /api/student/resume/:studentId` request is received, THE Server SHALL query the `StudentResume` collection for the most recently uploaded resume for that student and return its path.
3. IF no resume exists for the given `studentId`, THEN THE Server SHALL return HTTP 200 with `{ success: false, message: "No resume uploaded yet!" }`.
4. THE Server SHALL use the MongoDB `_id` string representation of the User as the `studentId` for all resume operations.

---

### Requirement 6: Profile Update and Retrieval Endpoints

**User Story:** As a user, I want to update and view my profile, so that others can learn about my background.

#### Acceptance Criteria

1. WHEN a `PUT /api/profile/:userId` request is received, THE Server SHALL upsert a `StudentProfile` document matching `user_id` equal to `userId` using Mongoose's `findOneAndUpdate` with `upsert: true`.
2. WHEN a `GET /api/profile/:userId` request is received, THE Server SHALL return the `StudentProfile` document for that user with `projects`, `internships`, and `achievements` as arrays.
3. WHEN a `PUT /api/alumni-profile/:userId` request is received, THE Server SHALL upsert an `AlumniProfile` document matching `user_id` equal to `userId`.
4. WHEN a `GET /api/alumni-profile/:userId` request is received, THE Server SHALL return the `AlumniProfile` document for that user with `achievements` as an array.
5. IF no profile document exists for the given `userId`, THEN THE Server SHALL return HTTP 200 with `{ success: true, profile: null }`.
6. WHEN a `POST /api/profile/:userId/photo` request is received with an image file, THE Server SHALL save the file and update the `profile_photo` field on the corresponding `User` document.

---

### Requirement 7: Posts Endpoints

**User Story:** As a user, I want to create, view, and delete posts, so that I can share updates with the community.

#### Acceptance Criteria

1. WHEN a `POST /api/posts` request is received, THE Server SHALL create a `Post` document in MongoDB and return the created post with its MongoDB `_id` as `id`.
2. WHEN a `GET /api/posts` request is received, THE Server SHALL return all `Post` documents sorted by `created_at` descending, with each document's `_id` mapped to `id` and `image_path` mapped to `image`.
3. WHEN a `DELETE /api/posts/:postId` request is received, THE Server SHALL verify the requesting `authorId` matches the post's `author_id` before deleting the `Post` document.
4. IF the `authorId` does not match the post's `author_id`, THEN THE Server SHALL return HTTP 403 with `{ success: false, message: "Not authorized" }`.
5. WHEN a post with an associated image file is deleted, THE Server SHALL also delete the image file from the uploads directory.

---

### Requirement 8: Jobs Endpoints

**User Story:** As an alumni, I want to post jobs, and as an admin, I want to approve or reject them, so that students see only vetted opportunities.

#### Acceptance Criteria

1. WHEN a `POST /api/jobs/post` request is received, THE Server SHALL create a `Job` document with `status` set to `'Pending Admin Approval'` and return the new document's `_id` as `jobId`.
2. WHEN a `GET /api/jobs/all` request is received, THE Server SHALL return all `Job` documents sorted by `created_at` descending.
3. WHEN a `PUT /api/jobs/:jobId/status` request is received with a valid status value, THE Server SHALL update the `status` field of the matching `Job` document.
4. WHEN a `GET /api/jobs/my/:alumniId` request is received, THE Server SHALL return all `Job` documents where `alumni_id` equals `alumniId`, sorted by `created_at` descending.
5. IF an invalid status value is provided to `PUT /api/jobs/:jobId/status`, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Invalid status" }`.

---

### Requirement 9: Networking and Follow System Endpoints

**User Story:** As a user, I want to discover other users and follow them, so that I can build my professional network.

#### Acceptance Criteria

1. WHEN a `GET /api/network/users` request is received, THE Server SHALL query the `User` collection (excluding password) and enrich each result with the corresponding `StudentProfile` or `AlumniProfile` document.
2. WHEN `search`, `role`, `skills`, `company`, or `branch` query parameters are provided, THE Server SHALL filter the results accordingly using MongoDB queries or in-memory filtering after enrichment.
3. WHEN a `GET /api/network/users/:userId` request is received, THE Server SHALL return the User document enriched with profile data and follower/following counts derived from the `Follow` collection.
4. WHEN a `POST /api/network/follow` request is received with `followerId` and `followingId`, THE Server SHALL create a `Follow` document, ignoring duplicate follow attempts.
5. WHEN a `DELETE /api/network/follow` request is received, THE Server SHALL delete the matching `Follow` document.
6. WHEN a `GET /api/network/follow/check` request is received, THE Server SHALL return `{ success: true, isFollowing: boolean }` based on whether a matching `Follow` document exists.
7. WHEN a `GET /api/network/follow/:userId/followers` request is received, THE Server SHALL return all User documents that follow the specified user.
8. WHEN a `GET /api/network/follow/:userId/following` request is received, THE Server SHALL return all User documents that the specified user follows.
9. IF a user attempts to follow themselves, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Cannot follow yourself" }`.

---

### Requirement 10: OTP Login Endpoints

**User Story:** As a user, I want to log in using an email OTP, so that I have a passwordless login option.

#### Acceptance Criteria

1. WHEN a `POST /api/login-otp/send` request is received with a valid `email` and `role`, THE Server SHALL look up the user in MongoDB, generate a 6-digit OTP, store it in memory with a 10-minute expiry, and send it via email.
2. WHEN a `POST /api/login-otp/verify` request is received with a matching, non-expired OTP, THE Server SHALL return HTTP 200 with `{ success: true, user: { id, fullname, email, role, profile_photo } }`.
3. IF the OTP has expired, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "OTP expired" }`.
4. IF the OTP does not match, THEN THE Server SHALL return HTTP 400 with `{ success: false, message: "Invalid OTP" }`.
5. THE Server SHALL preserve the in-memory `loginOtpStore` Map for OTP state; no MongoDB persistence is required for OTPs.

---

### Requirement 11: API Contract Preservation

**User Story:** As a frontend developer, I want all existing API endpoints to behave identically after the migration, so that no frontend code changes are required.

#### Acceptance Criteria

1. THE Server SHALL preserve all existing HTTP methods and URL paths for every endpoint after the migration.
2. THE Server SHALL return JSON response bodies with the same field names and shapes as before the migration for every endpoint.
3. WHEN MongoDB documents are returned to the frontend, THE Server SHALL map the `_id` field to `id` (as a string) so the frontend receives the same `id` field it currently expects.
4. THE Server SHALL preserve the `alumni`/`alumini` role alias handling in all endpoints that perform role comparisons.
5. THE Server SHALL preserve all existing HTTP status codes for success and error responses.
