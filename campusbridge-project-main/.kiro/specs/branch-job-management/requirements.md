# Requirements Document

## Introduction

This feature extends CampusBridge with branch-based job filtering and full admin CRUD capabilities for jobs and users. Students are shown only jobs where their branch (e.g., CSE, IT, MECH, CIVIL) is listed in the job's eligible branches. Admins gain the ability to edit and delete jobs and users directly from the dashboard. The backend Job schema is extended with `eligibleBranches`, `salary`, and `deadline` fields. The frontend Jobs page migrates from static data to live API data filtered by the logged-in student's branch.

## Glossary

- **System**: The CampusBridge web application (Node.js/Express backend + React frontend)
- **Admin**: A user with the "Admin" role who manages jobs and users via the Admin Dashboard
- **Student**: A registered user with the "Student" role who views and applies to jobs
- **Alumni**: A registered user with the "Alumni" role who posts jobs
- **Job**: A job posting stored in MongoDB with fields including title, company, location, description, status, eligibleBranches, salary, and deadline
- **Branch**: An academic department identifier (e.g., CSE, IT, MECH, CIVIL, ECE) stored in the StudentProfile collection
- **EligibleBranches**: An array of branch strings on a Job document indicating which student branches may view and apply to that job
- **Job_API**: The backend REST endpoints under `/api/jobs`
- **User_API**: The backend REST endpoints under `/api/users`
- **Admin_Dashboard**: The React AdminDashboard component with tabs for job and user management
- **Jobs_Page**: The React Jobs component that displays job listings to students
- **StudentProfile**: The MongoDB collection storing per-student academic data including branch

---

## Requirements

### Requirement 1: Job Schema Extension

**User Story:** As a developer, I want the Job schema to include eligibleBranches, salary, and deadline fields, so that branch-based filtering and richer job details are supported.

#### Acceptance Criteria

1. THE System SHALL store `eligibleBranches` as an array of strings on each Job document, defaulting to an empty array.
2. THE System SHALL store `salary` as a string on each Job document, defaulting to an empty string.
3. THE System SHALL store `deadline` as a Date on each Job document, defaulting to null.
4. WHEN a job is created via `POST /api/jobs/post`, THE Job_API SHALL accept `eligibleBranches`, `salary`, and `deadline` in the request body and persist them to the Job document.

---

### Requirement 2: Branch-Filtered Job Listing API

**User Story:** As a student, I want the jobs API to return only jobs relevant to my branch, so that I don't see irrelevant postings.

#### Acceptance Criteria

1. WHEN a `GET /api/jobs` request is received with a `branch` query parameter, THE Job_API SHALL return only jobs where the job's `eligibleBranches` array contains the provided branch value (case-insensitive match).
2. WHEN a `GET /api/jobs` request is received without a `branch` query parameter, THE Job_API SHALL return all jobs regardless of eligibleBranches.
3. WHEN a `GET /api/jobs` request is received, THE Job_API SHALL return only jobs with status `approved`.
4. IF the `branch` query parameter is provided but no matching jobs exist, THEN THE Job_API SHALL return an empty array with HTTP 200.
5. THE Job_API SHALL return each job with fields: id, title, company, location, description, salary, deadline, eligibleBranches, alumni_name, status, created_at.

---

### Requirement 3: Admin Job Edit API

**User Story:** As an admin, I want to edit job details via the API, so that I can correct or update job postings.

#### Acceptance Criteria

1. WHEN a `PUT /api/jobs/:id` request is received, THE Job_API SHALL update the job's title, company, location, description, salary, deadline, and eligibleBranches fields with the values provided in the request body.
2. WHEN a `PUT /api/jobs/:id` request is received with a valid job ID, THE Job_API SHALL return HTTP 200 with `{ success: true }`.
3. IF the job ID in `PUT /api/jobs/:id` does not correspond to an existing job, THEN THE Job_API SHALL return HTTP 404 with `{ success: false, message: "Job not found" }`.
4. IF the job ID in `PUT /api/jobs/:id` is not a valid MongoDB ObjectId, THEN THE Job_API SHALL return HTTP 400 with `{ success: false, message: "Invalid ID format" }`.

---

### Requirement 4: Admin Job Delete API

**User Story:** As an admin, I want to delete job postings via the API, so that I can remove outdated or inappropriate listings.

#### Acceptance Criteria

1. WHEN a `DELETE /api/jobs/:id` request is received with a valid job ID, THE Job_API SHALL permanently remove the job document from the database and return HTTP 200 with `{ success: true }`.
2. IF the job ID in `DELETE /api/jobs/:id` does not correspond to an existing job, THEN THE Job_API SHALL return HTTP 404 with `{ success: false, message: "Job not found" }`.
3. IF the job ID in `DELETE /api/jobs/:id` is not a valid MongoDB ObjectId, THEN THE Job_API SHALL return HTTP 400 with `{ success: false, message: "Invalid ID format" }`.

---

### Requirement 5: Admin User List API

**User Story:** As an admin, I want to retrieve all registered students and alumni via the API, so that I can manage user accounts.

#### Acceptance Criteria

1. WHEN a `GET /api/users` request is received, THE User_API SHALL return all users with roles Student, Alumni, or Alumini (case-insensitive), excluding the password field.
2. THE User_API SHALL return each user with fields: id, fullname, email, role, profile_photo, and branch (sourced from the associated StudentProfile where available).
3. WHEN a `GET /api/users` request is received, THE User_API SHALL return HTTP 200 with `{ success: true, users: [...] }`.

---

### Requirement 6: Admin User Edit API

**User Story:** As an admin, I want to edit user details via the API, so that I can correct account information.

#### Acceptance Criteria

1. WHEN a `PUT /api/users/:id` request is received, THE User_API SHALL update the user's fullname, email, and role fields on the User document with the values provided in the request body.
2. WHEN a `PUT /api/users/:id` request is received and the user has a StudentProfile, THE User_API SHALL update the branch field on the StudentProfile document.
3. WHEN a `PUT /api/users/:id` request is received with a valid user ID, THE User_API SHALL return HTTP 200 with `{ success: true }`.
4. IF the user ID in `PUT /api/users/:id` does not correspond to an existing user, THEN THE User_API SHALL return HTTP 404 with `{ success: false, message: "User not found" }`.
5. IF the user ID in `PUT /api/users/:id` is not a valid MongoDB ObjectId, THEN THE User_API SHALL return HTTP 400 with `{ success: false, message: "Invalid ID format" }`.

---

### Requirement 7: Admin User Delete API

**User Story:** As an admin, I want to delete user accounts via the API, so that I can remove inactive or invalid accounts.

#### Acceptance Criteria

1. WHEN a `DELETE /api/users/:id` request is received with a valid user ID, THE User_API SHALL permanently remove the User document and any associated StudentProfile or AlumniProfile documents, then return HTTP 200 with `{ success: true }`.
2. IF the user ID in `DELETE /api/users/:id` does not correspond to an existing user, THEN THE User_API SHALL return HTTP 404 with `{ success: false, message: "User not found" }`.
3. IF the user ID in `DELETE /api/users/:id` is not a valid MongoDB ObjectId, THEN THE User_API SHALL return HTTP 400 with `{ success: false, message: "Invalid ID format" }`.

---

### Requirement 8: Admin Dashboard — Job Management UI

**User Story:** As an admin, I want a job management table in the Admin Dashboard with edit and delete actions, so that I can manage job postings without using external tools.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard "Job Approvals" tab is active, THE Admin_Dashboard SHALL display all jobs in a table showing title, company, location, salary, deadline, eligibleBranches, and status columns.
2. WHEN the admin clicks the Edit button on a job row, THE Admin_Dashboard SHALL open a modal pre-populated with the job's current title, company, location, description, salary, deadline, and eligibleBranches values.
3. WHEN the admin submits the edit modal, THE Admin_Dashboard SHALL call `PUT /api/jobs/:id` with the updated values and refresh the job list on success.
4. WHEN the admin clicks the Delete button on a job row, THE Admin_Dashboard SHALL display a confirmation prompt before calling `DELETE /api/jobs/:id`.
5. WHEN a delete is confirmed and `DELETE /api/jobs/:id` returns success, THE Admin_Dashboard SHALL remove the job from the displayed list without a full page reload.
6. IF a job edit or delete API call fails, THEN THE Admin_Dashboard SHALL display an error message to the admin.

---

### Requirement 9: Admin Dashboard — User Management UI

**User Story:** As an admin, I want a user management table in the Admin Dashboard with edit and delete actions, so that I can manage student and alumni accounts.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard "Users" tab is active, THE Admin_Dashboard SHALL display all students and alumni in a table showing fullname, email, role, and branch columns.
2. WHEN the admin clicks the Edit button on a user row, THE Admin_Dashboard SHALL open a modal pre-populated with the user's current fullname, email, role, and branch values.
3. WHEN the admin submits the user edit modal, THE Admin_Dashboard SHALL call `PUT /api/users/:id` with the updated values and refresh the user list on success.
4. WHEN the admin clicks the Delete button on a user row, THE Admin_Dashboard SHALL display a confirmation prompt before calling `DELETE /api/users/:id`.
5. WHEN a delete is confirmed and `DELETE /api/users/:id` returns success, THE Admin_Dashboard SHALL remove the user from the displayed list without a full page reload.
6. IF a user edit or delete API call fails, THEN THE Admin_Dashboard SHALL display an error message to the admin.

---

### Requirement 10: Student Jobs Page — Live API Integration

**User Story:** As a student, I want the Jobs page to fetch real job data from the API filtered by my branch, so that I only see jobs I am eligible for.

#### Acceptance Criteria

1. WHEN the Jobs_Page mounts, THE Jobs_Page SHALL read the logged-in student's branch from localStorage and call `GET /api/jobs?branch={branch}` to fetch eligible jobs.
2. WHEN the API returns a non-empty list of jobs, THE Jobs_Page SHALL render each job using the existing job card layout.
3. WHEN the API returns an empty list, THE Jobs_Page SHALL display the message "No jobs available for your branch."
4. IF the API call fails, THEN THE Jobs_Page SHALL display an error message and not render any job cards.
5. WHILE the API call is in progress, THE Jobs_Page SHALL display a loading indicator.

---

### Requirement 11: Branch Dropdown Filter on Jobs Page

**User Story:** As a student, I want a branch dropdown filter on the Jobs page, so that I can manually browse jobs for other branches if needed.

#### Acceptance Criteria

1. THE Jobs_Page SHALL display a branch dropdown filter containing the options: All, CSE, IT, MECH, CIVIL, ECE.
2. WHEN the student selects a branch from the dropdown, THE Jobs_Page SHALL re-fetch jobs from `GET /api/jobs?branch={selectedBranch}` and update the displayed list.
3. WHEN the student selects "All" from the dropdown, THE Jobs_Page SHALL fetch all approved jobs from `GET /api/jobs` without a branch filter and display them.
4. THE Jobs_Page SHALL initialize the branch dropdown to the logged-in student's own branch on first load.
