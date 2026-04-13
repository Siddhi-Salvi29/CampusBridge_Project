import "dotenv/config";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import * as otpService from './services/otpService.js';
import { sendOtpEmail } from './services/emailService.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ── Mongoose Models ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  fullname:      { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  password:      { type: String, required: true },
  role:          { type: String, default: 'Student' },
  profile_photo: { type: String, default: null },
});
const User = mongoose.model('User', userSchema);

const studentProfileSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio:          String,
  degree:       String,
  branch:       String,
  year:         String,
  cgpa:         String,
  skills:       String,
  projects:     { type: Array, default: [] },
  internships:  { type: Array, default: [] },
  achievements: { type: Array, default: [] },
});
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

const alumniProfileSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio:          String,
  designation:  String,
  company:      String,
  experience:   String,
  linkedin:     String,
  github:       String,
  skills:       String,
  achievements: { type: Array, default: [] },
});
const AlumniProfile = mongoose.model('AlumniProfile', alumniProfileSchema);

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  location:    { type: String, required: true },
  company:     { type: String, required: true },
  alumni_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  alumni_name: String,
  status:      { type: String, default: 'Pending Admin Approval' },
  created_at:  { type: Date, default: Date.now },
});
const Job = mongoose.model('Job', jobSchema);

const postSchema = new mongoose.Schema({
  author_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  author_name: String,
  author_role: String,
  caption:     String,
  image_path:  String,
  created_at:  { type: Date, default: Date.now },
});
const Post = mongoose.model('Post', postSchema);

const followSchema = new mongoose.Schema({
  follower_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  following_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });
const Follow = mongoose.model('Follow', followSchema);

const studentResumeSchema = new mongoose.Schema({
  student_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume_path: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
});
const StudentResume = mongoose.model('StudentResume', studentResumeSchema);

// ── Job Application Model ─────────────────────────────────────────────────
const jobApplicationSchema = new mongoose.Schema({
  job_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student_name: String,
  student_email:String,
  phone:        String,
  branch:       String,
  cgpa:         String,
  cover_letter: String,
  resume_path:  String,
  status:       { type: String, default: 'pending' }, // pending | selected | rejected
  applied_at:   { type: Date, default: Date.now },
});
const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// Helper: map _id to id string for frontend compatibility
const toId = (doc) => ({ ...doc.toObject(), id: doc._id.toString() });

const app = express();
const PORT = 5000;

const rootDir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const uploadDir = path.join(rootDir, "uploads");
const tmpDir = path.join(rootDir, "tmp");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

console.log("Folders ready");

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178"],
  credentials: true,
}));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: tmpDir,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

const isAdmin = (_req, _res, next) => {
  next();
};

// ── Task 3.1: POST /register ──────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: "Fullname, email, and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

    let profilePhotoPath = null;
    if (req.files && req.files.profile_photo) {
      const file = req.files.profile_photo;
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ success: false, message: "Invalid file type. Only PNG, JPG, JPEG allowed." });
      }
      const fileName = `${Date.now()}-${file.name}`;
      await file.mv(path.join(uploadDir, fileName));
      profilePhotoPath = `/uploads/${fileName}`;
    }

    await User.create({ fullname, email, password, role: role || 'Student', profile_photo: profilePhotoPath });
    res.status(200).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ── Task 3.3: POST /login ─────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (email === "admin123@rmcet.com" && password === "admin@123" && role?.toLowerCase() === "admin") {
      return res.status(200).json({ success: true, user: { id: "admin", fullname: "Admin", email, role: "Admin", profile_photo: null } });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const dbRole = user.role?.toLowerCase();
    const inputRole = role?.toLowerCase();
    if (dbRole !== inputRole && !(inputRole === "alumni" && dbRole === "alumini")) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    if (user.password !== password) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.status(200).json({ success: true, user: { id: user._id.toString(), fullname: user.fullname, email: user.email, role: user.role, profile_photo: user.profile_photo } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ── Task 4.1: POST /api/student/upload-resume ─────────────────────────────
app.post("/api/student/upload-resume", async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      console.error("Missing student ID in request body");
      return res.status(400).json({ success: false, message: "Missing student ID" });
    }

    if (!req.files || !req.files.resume) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.resume;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Invalid file type. Only PDF or DOC/DOCX allowed." });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);

    await StudentResume.create({ student_id: studentId, resume_path: `/uploads/${fileName}` });

    console.log("New resume stored in student_resumes:", filePath);
    res.status(200).json({ success: true, message: "Resume uploaded successfully", filename: fileName, path: `/uploads/${fileName}` });
  } catch (err) {
    console.error("Resume Upload Error:", err);
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ── Task 4.2: GET /api/student/resume/:studentId ──────────────────────────
app.get("/api/student/resume/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const resume = await StudentResume.findOne({ student_id: studentId }).sort({ uploaded_at: -1 });
    if (!resume) return res.status(200).json({ success: false, message: "No resume uploaded yet!" });
    res.status(200).json({ success: true, message: "Resume path fetched successfully", resume: resume.resume_path });
  } catch (err) {
    console.error("Resume Check Error:", err);
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ── Task 11.1: GET /api/admin/users ──────────────────────────────────────
app.get("/api/admin/users", isAdmin, async (_req, res) => {
  try {
    const users = await User.find({ role: { $in: ['Student','Alumni','Alumini','student','alumni','alumini'] } }).select('-password');
    res.status(200).json({ success: true, users: users.map(toId) });
  } catch (err) {
    console.error("Error fetching Admin users list:", err);
    res.status(500).json({ success: false, message: "Server error while fetching users." });
  }
});

// ── Task 5.5: POST /api/profile/:userId/photo ─────────────────────────────
app.post("/api/profile/:userId/photo", async (req, res) => {
  try {
    if (!req.files || !req.files.profile_photo) {
      return res.status(400).json({ success: false, message: "No photo uploaded" });
    }
    const file = req.files.profile_photo;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Only image files allowed" });
    }
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);
    const photoPath = `/uploads/${fileName}`;

    await User.findByIdAndUpdate(req.params.userId, { profile_photo: photoPath });
    res.status(200).json({ success: true, profile_photo: photoPath });
  } catch (err) {
    console.error("Photo upload error:", err);
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Task 5.3: PUT /api/alumni-profile/:userId ─────────────────────────────
app.put("/api/alumni-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined') return res.status(400).json({ success: false, message: "Invalid user ID" });
    const { bio, designation, company, experience, linkedin, github, skills, achievements } = req.body;
    const skillsVal = Array.isArray(skills) ? skills.join(',') : (skills || '');
    const achievementsArr = Array.isArray(achievements) ? achievements : [];
    await AlumniProfile.findOneAndUpdate(
      { user_id: userId },
      { user_id: userId, bio: bio||'', designation: designation||'', company: company||'', experience: experience||'', linkedin: linkedin||'', github: github||'', skills: skillsVal, achievements: achievementsArr },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, message: "Alumni profile updated" });
  } catch (err) {
    console.error("Alumni profile update error:", err);
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 5.4: GET /api/alumni-profile/:userId ─────────────────────────────
app.get("/api/alumni-profile/:userId", async (req, res) => {
  try {
    const profile = await AlumniProfile.findOne({ user_id: req.params.userId });
    if (!profile) return res.status(200).json({ success: true, profile: null });
    const p = profile.toObject();
    if (!Array.isArray(p.achievements)) p.achievements = [];
    res.status(200).json({ success: true, profile: p });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 5.1: PUT /api/profile/:userId ───────────────────────────────────
app.put("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined') return res.status(400).json({ success: false, message: "Invalid user ID" });
    const { bio, degree, branch, year, cgpa, skills, projects, internships, achievements } = req.body;
    const skillsVal = Array.isArray(skills) ? skills.join(',') : (skills || '');
    await StudentProfile.findOneAndUpdate(
      { user_id: userId },
      { user_id: userId, bio: bio||'', degree: degree||'', branch: branch||'', year: year||'', cgpa: cgpa||'', skills: skillsVal,
        projects: Array.isArray(projects) ? projects : [],
        internships: Array.isArray(internships) ? internships : [],
        achievements: Array.isArray(achievements) ? achievements : [] },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("Profile update error:", err);
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 5.2: GET /api/profile/:userId ───────────────────────────────────
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.params.userId });
    if (!profile) return res.status(200).json({ success: true, profile: null });
    const p = profile.toObject();
    ['projects','internships','achievements'].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
    res.status(200).json({ success: true, profile: p });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 7.1: POST /api/posts ─────────────────────────────────────────────
app.post("/api/posts", async (req, res) => {
  try {
    const { caption, authorName, authorRole, authorId } = req.body;
    let imagePath = null;
    if (req.files && req.files.image) {
      const file = req.files.image;
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowed.includes(file.mimetype)) return res.status(400).json({ success: false, message: "Only image files allowed" });
      const fileName = `${Date.now()}-${file.name}`;
      await file.mv(path.join(uploadDir, fileName));
      imagePath = `/uploads/${fileName}`;
    }
    if (!caption && !imagePath) return res.status(400).json({ success: false, message: "Post must have text or an image" });
    const doc = await Post.create({ author_id: authorId || null, author_name: authorName || 'Anonymous', author_role: authorRole || '', caption: caption || '', image_path: imagePath });
    const post = toId(doc);
    post.image = post.image_path;
    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("Post create error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Task 7.2: GET /api/posts ──────────────────────────────────────────────
app.get("/api/posts", async (_req, res) => {
  try {
    const docs = await Post.find().sort({ created_at: -1 });
    const posts = docs.map(d => { const p = toId(d); p.image = p.image_path; return p; });
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Task 7.3: DELETE /api/posts/:postId ───────────────────────────────────
app.delete("/api/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorId } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    if (String(post.author_id) !== String(authorId)) return res.status(403).json({ success: false, message: "Not authorized" });
    if (post.image_path) {
      const filePath = path.join(uploadDir, path.basename(post.image_path));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Post.deleteOne({ _id: postId });
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Task 8.1: POST /api/jobs/post ─────────────────────────────────────────
app.post("/api/jobs/post", async (req, res) => {
  try {
    const { title, description, location, company, alumniId, alumniName } = req.body;
    if (!title || !company || !location) return res.status(400).json({ success: false, message: "Title, company and location are required" });
    const doc = await Job.create({ title, description: description||'', location, company, alumni_id: alumniId||null, alumni_name: alumniName||'' });
    res.status(200).json({ success: true, message: "Job posted successfully", jobId: doc._id.toString() });
  } catch (err) {
    console.error("Job post error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 8.2: GET /api/jobs/all ───────────────────────────────────────────
app.get("/api/jobs/all", async (_req, res) => {
  try {
    const jobs = await Job.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, jobs: jobs.map(toId) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 8.3: PUT /api/jobs/:jobId/status ────────────────────────────────
app.put("/api/jobs/:jobId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['approved', 'rejected', 'Pending Admin Approval'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
    await Job.findByIdAndUpdate(req.params.jobId, { status });
    res.status(200).json({ success: true, message: "Status updated" });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/jobs/:id — update job details ────────────────────────────────
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { title, company, location, description, salary, deadline, eligibleBranches } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...(title && { title }), ...(company && { company }), ...(location && { location }),
        ...(description !== undefined && { description }), ...(salary !== undefined && { salary }),
        ...(deadline !== undefined && { deadline }), ...(eligibleBranches !== undefined && { eligibleBranches }) },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, job: toId(job) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/jobs/:id ──────────────────────────────────────────────────
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Task 8.4: GET /api/jobs/my/:alumniId ─────────────────────────────────
app.get("/api/jobs/my/:alumniId", async (req, res) => {
  try {
    const jobs = await Job.find({ alumni_id: new mongoose.Types.ObjectId(req.params.alumniId) }).sort({ created_at: -1 });
    res.status(200).json({ success: true, jobs: jobs.map(toId) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Login OTP ──────────────────────────────────────────────────────────────
const loginOtpStore = new Map(); // email -> { otp, expiresAt, user }

const loginMailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// ── Task 10.1: POST /api/login-otp/send ──────────────────────────────────
app.post("/api/login-otp/send", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ success: false, message: "Email and role are required" });

    let userObj;
    if (email === "admin123@rmcet.com" && role?.toLowerCase() === "admin") {
      userObj = { id: "admin", fullname: "Admin", email, role: "Admin", profile_photo: null };
    } else {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: "No account found with this email" });
      const dbRole = user.role?.toLowerCase();
      const inputRole = role?.toLowerCase();
      if (dbRole !== inputRole && !(inputRole === "alumni" && dbRole === "alumini")) {
        return res.status(400).json({ success: false, message: "Role does not match" });
      }
      userObj = { id: user._id.toString(), fullname: user.fullname, email: user.email, role: user.role, profile_photo: user.profile_photo };
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    loginOtpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, user: userObj });

    await loginMailTransporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your CampusBridge Login OTP",
      text: `Your login OTP is: ${otp}\n\nValid for 10 minutes.`,
    });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Login OTP send error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/api/login-otp/verify", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

  const record = loginOtpStore.get(email);
  if (!record) return res.status(400).json({ success: false, message: "No OTP requested for this email" });
  if (Date.now() > record.expiresAt) {
    loginOtpStore.delete(email);
    return res.status(400).json({ success: false, message: "OTP expired" });
  }
  if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

  loginOtpStore.delete(email);
  res.status(200).json({ success: true, user: record.user });
});

// ── Tasks 9.1-9.6: Networking / Follow System ─────────────────────────────

// Task 9.1: GET /api/network/users
app.get("/api/network/users", async (req, res) => {
  try {
    const { search, skills, company, branch, role } = req.query;

    const filter = { role: { $in: ['Student','Alumni','Alumini','student','alumni','alumini'] } };
    if (role) filter.role = { $regex: new RegExp(`^${role}$`, 'i') };
    if (search) filter.$or = [
      { fullname: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(filter).select('-password');

    // Enrich with profile data
    const enriched = await Promise.all(users.map(async (u) => {
      const base = toId(u);
      try {
        const isStudent = u.role?.toLowerCase() === 'student';
        const profile = isStudent
          ? await StudentProfile.findOne({ user_id: u._id })
          : await AlumniProfile.findOne({ user_id: u._id });
        if (profile) {
          const p = profile.toObject();
          delete p._id;
          delete p.__v;
          delete p.user_id;
          return { ...base, ...p };
        }
      } catch {}
      return base;
    }));

    // Post-enrichment filters
    let result = enriched;
    if (skills) result = result.filter(u => u.skills && u.skills.toLowerCase().includes(skills.toLowerCase()));
    if (company) result = result.filter(u => u.company && u.company.toLowerCase().includes(company.toLowerCase()));
    if (branch) result = result.filter(u => u.branch && u.branch.toLowerCase().includes(branch.toLowerCase()));

    res.status(200).json({ success: true, users: result });
  } catch (err) {
    console.error("Network users error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Task 9.2: GET /api/network/users/:userId
app.get("/api/network/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await User.findById(userId).select('-password');
    if (!userDoc) return res.status(404).json({ success: false, message: "User not found" });

    const u = toId(userDoc);
    try {
      const isStudent = userDoc.role?.toLowerCase() === 'student';
      const profile = isStudent
        ? await StudentProfile.findOne({ user_id: userDoc._id })
        : await AlumniProfile.findOne({ user_id: userDoc._id });
      if (profile) {
        const p = profile.toObject();
        delete p._id;
        delete p.__v;
        delete p.user_id;
        Object.assign(u, p);
      }
    } catch {}

    // Follow counts
    u.followers = await Follow.countDocuments({ following_id: userDoc._id });
    u.following = await Follow.countDocuments({ follower_id: userDoc._id });

    res.status(200).json({ success: true, user: u });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Task 9.3: POST /api/network/follow
app.post("/api/network/follow", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (String(followerId) === String(followingId)) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }
    await Follow.create({ follower_id: followerId, following_id: followingId });
    res.status(200).json({ success: true, message: "Followed" });
  } catch (err) {
    if (err.code === 11000) return res.status(200).json({ success: true, message: "Already following" });
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Task 9.4: DELETE /api/network/follow
app.delete("/api/network/follow", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    await Follow.deleteOne({ follower_id: followerId, following_id: followingId });
    res.status(200).json({ success: true, message: "Unfollowed" });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Task 9.5: GET /api/network/follow/check
app.get("/api/network/follow/check", async (req, res) => {
  try {
    const { followerId, followingId } = req.query;
    const doc = await Follow.findOne({ follower_id: followerId, following_id: followingId });
    res.status(200).json({ success: true, isFollowing: !!doc });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Task 9.6: GET /api/network/follow/:userId/followers
app.get("/api/network/follow/:userId/followers", async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following_id: userId });
    const followerIds = follows.map(f => f.follower_id);
    const users = await User.find({ _id: { $in: followerIds } }).select('-password');
    res.status(200).json({ success: true, users: users.map(toId) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// Task 9.7: GET /api/network/follow/:userId/following
app.get("/api/network/follow/:userId/following", async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower_id: userId });
    const followingIds = follows.map(f => f.following_id);
    const users = await User.find({ _id: { $in: followingIds } }).select('-password');
    res.status(200).json({ success: true, users: users.map(toId) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: "Invalid ID format" });
    res.status(500).json({ success: false, message: err.message });
  }
});
// ───────────────────────────────────────────────────────────────────────────

// ── OTP Registration: Send OTP ────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  try {
    const { fullname, email, password, phoneNumber, role } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: 'Fullname, email, and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    let profilePhotoPath = null;
    if (req.files && req.files.profile_photo) {
      const file = req.files.profile_photo;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type. Only PNG, JPG, JPEG allowed.' });
      }
      const fileName = `${Date.now()}-${file.name}`;
      await file.mv(path.join(uploadDir, fileName));
      profilePhotoPath = `/uploads/${fileName}`;
    }

    const otp = otpService.generateAndStore(email.toLowerCase(), { fullname, email, password, phoneNumber: phoneNumber || null, role: role || 'Student', profilePhotoPath });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error('OTP email send error:', emailErr);
      otpService.invalidate(email);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── OTP Registration: Verify Email OTP ───────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const result = otpService.verify(email.toLowerCase(), otp);
    if (!result.valid) return res.status(400).json({ success: false, message: result.error });

    // Email verified — now send phone OTP (sent to email since no SMS provider)
    const { phoneNumber } = result.registrationData;
    const phoneOtp = otpService.generateAndStore(`phone:${email.toLowerCase()}`, result.registrationData);

    try {
      await sendOtpEmail(email, phoneOtp, 'phone');
    } catch (emailErr) {
      console.error('Phone OTP email send error:', emailErr);
      otpService.invalidate(`phone:${email.toLowerCase()}`);
      return res.status(500).json({ success: false, message: 'Failed to send phone OTP' });
    }

    res.status(200).json({ success: true, message: 'Email verified. Phone OTP sent.', phoneNumber });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── OTP Registration: Resend Phone OTP ───────────────────────────────────
app.post('/api/resend-phone-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const key = `phone:${email.toLowerCase()}`;
    const existing = otpService.getPending(key);
    if (!existing) return res.status(400).json({ success: false, message: 'No pending phone verification. Please restart registration.' });
    const newOtp = otpService.replace(key, existing.registrationData);
    try {
      await sendOtpEmail(email, newOtp, 'phone');
    } catch (err) {
      otpService.invalidate(key);
      return res.status(500).json({ success: false, message: 'Failed to send phone OTP' });
    }
    res.status(200).json({ success: true, message: 'Phone OTP resent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ── OTP Registration: Verify Phone OTP & Complete Registration ────────────
app.post('/api/verify-phone-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const result = otpService.verify(`phone:${email.toLowerCase()}`, otp);
    if (!result.valid) return res.status(400).json({ success: false, message: result.error });

    const { fullname, password, phoneNumber, role, profilePhotoPath } = result.registrationData;
    const user = await User.create({ fullname, email: email.toLowerCase(), password, role: role || 'Student', profile_photo: profilePhotoPath || null });

    res.status(200).json({
      success: true,
      message: 'Registration successful',
      user: { id: user._id.toString(), fullname: user.fullname, email: user.email, role: user.role, profile_photo: user.profile_photo },
    });
  } catch (err) {
    console.error('Verify phone OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});
// ─────────────────────────────────────────────────────────────────────────

// ── Job Applications ──────────────────────────────────────────────────────

app.post('/api/jobs/:jobId/apply', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentId, studentName, studentEmail, phone, branch, cgpa, coverLetter } = req.body;
    if (!studentId || !studentEmail) return res.status(400).json({ success: false, message: 'Student info required' });
    const existing = await JobApplication.findOne({ job_id: jobId, student_id: studentId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    let resumePath = null;
    if (req.files && req.files.resume) {
      const file = req.files.resume;
      const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.mimetype)) return res.status(400).json({ success: false, message: 'Only PDF/DOC/DOCX allowed' });
      const fileName = `${Date.now()}-${file.name}`;
      await file.mv(path.join(uploadDir, fileName));
      resumePath = `/uploads/${fileName}`;
    }
    const newApp = await JobApplication.create({ job_id: jobId, student_id: studentId, student_name: studentName, student_email: studentEmail, phone, branch, cgpa, cover_letter: coverLetter, resume_path: resumePath });
    res.status(200).json({ success: true, message: 'Application submitted', application: toId(newApp) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/jobs/:jobId/applications', async (req, res) => {
  try {
    const apps = await JobApplication.find({ job_id: req.params.jobId }).sort({ applied_at: -1 });
    res.status(200).json({ success: true, applications: apps.map(toId) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/applications/:appId/select', async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.appId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    const job = await Job.findById(application.job_id);
    const jobTitle = job?.title || 'the position';
    const company = job?.company || '';
    application.status = 'selected';
    await application.save();
    try {
      const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS } });
      await transporter.sendMail({
        from: `"CampusBridge" <${process.env.GMAIL_USER}>`,
        to: application.student_email,
        subject: `Congratulations! You have been selected for ${jobTitle}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:8px;"><div style="background:#1e3a8a;padding:20px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;">CampusBridge</h1></div><div style="background:#fff;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p style="color:#374151;font-size:15px;">Dear <strong>${application.student_name}</strong>,</p><p style="color:#374151;font-size:15px;line-height:1.6;">Congratulations! You have been <strong style="color:#16a34a;">selected</strong> for <strong>${jobTitle}</strong>${company ? ` at <strong>${company}</strong>` : ''}.</p><div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:20px 0;text-align:center;"><p style="color:#15803d;font-size:18px;font-weight:bold;margin:0;">You are Selected!</p></div><p style="color:#374151;font-size:14px;">The recruiter will contact you shortly with further details.</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/><p style="color:#6b7280;font-size:13px;">Best regards,<br/><strong>The CampusBridge Team</strong></p></div></div>`,
      });
    } catch (emailErr) { console.error('Selection email error:', emailErr.message); }
    res.status(200).json({ success: true, message: 'Student selected and email sent' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/applications/:appId/reject', async (req, res) => {
  try {
    await JobApplication.findByIdAndUpdate(req.params.appId, { status: 'rejected' });
    res.status(200).json({ success: true, message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
