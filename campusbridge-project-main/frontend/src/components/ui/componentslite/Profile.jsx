import React, { useState, useEffect } from 'react';
import {
  Mail, Phone, Edit, FileText, Briefcase, MessageSquare,
  X, Save, Plus, Trash2, GraduationCap, Code2, FolderGit2,
  Building2, Star, Camera
} from 'lucide-react';
import { Avatar, AvatarImage } from '../avatar';
import { useAuth } from '../../../context/AuthContext.jsx';

const ROLE_MAP = { alumni: 'Alumni', alumini: 'Alumni', student: 'Student', admin: 'Administrator' };

// ── Reusable editable field ─────────────────────────────────────────────────
const Field = ({ label, value, editing, onChange, placeholder, type = 'text' }) => (
  <div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    {editing ? (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || label}
        className="w-full border-b border-blue-300 outline-none bg-transparent text-sm text-gray-800 pb-1" />
    ) : (
      <p className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">Not set</span>}</p>
    )}
  </div>
);

// ── List section (skills, projects, internships) ────────────────────────────
const ListSection = ({ title, icon: Icon, color, items, editing, onAdd, onRemove, onUpdate, renderItem, renderEditItem }) => (
  <div className="border-t pt-6 mt-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className={`text-lg font-bold flex items-center gap-2 ${color}`}>
        <Icon className="w-5 h-5" /> {title}
      </h2>
      {editing && (
        <button onClick={onAdd} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg px-2 py-1 transition">
          <Plus className="w-3 h-3" /> Add
        </button>
      )}
    </div>
    {items.length === 0 && !editing && <p className="text-sm text-gray-400 italic">Nothing added yet.</p>}
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative">
          {editing ? renderEditItem(item, i) : renderItem(item, i)}
          {editing && (
            <button onClick={() => onRemove(i)} className="absolute top-1 right-1 text-red-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ── Main Profile ────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load extended profile from backend on mount — merge into user once
  useEffect(() => {
    if (user?.id == null || profileLoaded) return;
    fetch(`http://localhost:5000/api/profile/${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.profile) {
          const merged = { ...user, ...d.profile };
          login(merged);
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, [user?.id]);

  const buildForm = (u) => ({
    fullname: u?.fullname || '',
    phoneNumber: u?.phoneNumber || '',
    bio: u?.bio || '',
    degree: u?.degree || '',
    branch: u?.branch || '',
    year: u?.year || '',
    cgpa: u?.cgpa || '',
    skills: u?.skills ? (Array.isArray(u.skills) ? u.skills : u.skills.split(',').map(s => s.trim()).filter(Boolean)) : [],
    projects: u?.projects || [],
    internships: u?.internships || [],
    achievements: u?.achievements || [],
  });

  const [form, setForm] = useState(() => buildForm(user));

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Please log in to view your profile.</p>
    </div>
  );

  const role = user.role?.toLowerCase() || 'unknown';
  const roleDisplay = ROLE_MAP[role] || 'User';
  const isStudent = role === 'student';

  const handleEdit = () => { setForm(buildForm(user)); setEditing(true); };
  const handleCancel = () => { setEditing(false); setPhotoPreview(null); };

  const handleSave = async () => {
    setSaving(true);
    const updated = {
      ...user,
      fullname: form.fullname,
      phoneNumber: form.phoneNumber,
      bio: form.bio,
      degree: form.degree,
      branch: form.branch,
      year: form.year,
      cgpa: form.cgpa,
      skills: form.skills,
      projects: form.projects,
      internships: form.internships,
      achievements: form.achievements,
    };
    if (photoPreview) updated.profile_photo = photoPreview;

    // Save to backend
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: form.bio,
          degree: form.degree,
          branch: form.branch,
          year: form.year,
          cgpa: form.cgpa,
          skills: form.skills,
          projects: form.projects,
          internships: form.internships,
          achievements: form.achievements,
        }),
      });
      const data = await res.json();
      if (!res.ok) console.error('Profile save failed:', data.message);
    } catch (e) {
      console.warn('Backend save failed, saving locally only:', e.message);
    }

    login(updated);
    setSaving(false);
    setEditing(false);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  // List helpers
  const addItem = (key, template) => setForm(f => ({ ...f, [key]: [...f[key], template] }));
  const removeItem = (key, i) => setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));
  const updateItem = (key, i, field, val) => setForm(f => {
    const arr = [...f[key]];
    arr[i] = { ...arr[i], [field]: val };
    return { ...f, [key]: arr };
  });

  const skillsDisplay = Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen px-4 py-24">
      <div className="max-w-3xl mx-auto">

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mb-4">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-10 overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />

          {/* ── Header ── */}
          <div className="flex items-center gap-6 mb-8 border-b pb-6 relative z-10">
            <div className="relative">
              <Avatar className="w-24 h-24 shadow-lg ring-2 ring-blue-400/30">
                <AvatarImage src={photoPreview || user.profile_photo || '/default-avatar.png'} alt={user.fullname} />
              </Avatar>
              {editing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition shadow">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <input value={form.fullname} onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                  className="text-2xl font-bold text-gray-900 border-b border-blue-300 outline-none bg-transparent w-full mb-1" />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{user.fullname || 'NA'}</h1>
              )}
              <p className="text-gray-500 font-medium">{roleDisplay}</p>
              {editing ? (
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Write a short bio..." rows={2}
                  className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 resize-none" />
              ) : (
                user.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
              )}
            </div>
          </div>

          {/* ── Contact ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 relative z-10">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm">{user.email || 'NA'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {editing ? (
                <input value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="Phone number" className="border-b border-blue-300 outline-none bg-transparent text-sm flex-1" />
              ) : (
                <span className="text-sm">{user.phoneNumber || 'Not set'}</span>
              )}
            </div>
          </div>

          {/* ── Academics (student only) ── */}
          {isStudent && (
            <div className="border-t pt-6 mt-2 relative z-10">
              <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5" /> Academics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Degree" value={editing ? form.degree : user.degree} editing={editing} onChange={v => setForm(f => ({ ...f, degree: v }))} placeholder="B.E / B.Tech" />
                <Field label="Branch" value={editing ? form.branch : user.branch} editing={editing} onChange={v => setForm(f => ({ ...f, branch: v }))} placeholder="Computer Science" />
                <Field label="Year" value={editing ? form.year : user.year} editing={editing} onChange={v => setForm(f => ({ ...f, year: v }))} placeholder="3rd Year" />
                <Field label="CGPA" value={editing ? form.cgpa : user.cgpa} editing={editing} onChange={v => setForm(f => ({ ...f, cgpa: v }))} placeholder="8.5" />
              </div>
            </div>
          )}

          {/* ── Skills ── */}
          <div className="border-t pt-6 mt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                <Code2 className="w-5 h-5" /> Skills
              </h2>
              {editing && (
                <button onClick={() => setForm(f => ({ ...f, skills: [...f.skills, ''] }))}
                  className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-2 py-1 hover:text-blue-800 transition">
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
                    <input value={s} onChange={e => { const arr = [...form.skills]; arr[i] = e.target.value; setForm(f => ({ ...f, skills: arr })); }}
                      className="bg-transparent outline-none text-sm text-purple-700 w-24" placeholder="Skill" />
                    <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }))} className="text-red-400 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillsDisplay.length > 0
                  ? skillsDisplay.map((s, i) => <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{s}</span>)
                  : <p className="text-sm text-gray-400 italic">No skills added yet.</p>}
              </div>
            )}
          </div>

          {/* ── Projects ── */}
          <ListSection
            title="Projects" icon={FolderGit2} color="text-green-700"
            items={editing ? form.projects : (user.projects || [])}
            editing={editing}
            onAdd={() => addItem('projects', { name: '', description: '', tech: '', link: '' })}
            onRemove={i => removeItem('projects', i)}
            onUpdate={(i, f, v) => updateItem('projects', i, f, v)}
            renderItem={(p, i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800">{p.name}</p>
                {p.tech && <p className="text-xs text-green-600 mt-1">Tech: {p.tech}</p>}
                {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">{p.link}</a>}
              </div>
            )}
            renderEditItem={(p, i) => (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 pr-8 space-y-2">
                <input value={p.name} onChange={e => updateItem('projects', i, 'name', e.target.value)} placeholder="Project name"
                  className="w-full border-b border-green-300 outline-none bg-transparent text-sm font-semibold" />
                <input value={p.tech} onChange={e => updateItem('projects', i, 'tech', e.target.value)} placeholder="Technologies used"
                  className="w-full border-b border-green-200 outline-none bg-transparent text-xs text-green-700" />
                <textarea value={p.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} placeholder="Description" rows={2}
                  className="w-full border border-green-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
                <input value={p.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} placeholder="GitHub / Live link"
                  className="w-full border-b border-green-200 outline-none bg-transparent text-xs text-blue-500" />
              </div>
            )}
          />

          {/* ── Internships ── */}
          <ListSection
            title="Internships" icon={Building2} color="text-orange-600"
            items={editing ? form.internships : (user.internships || [])}
            editing={editing}
            onAdd={() => addItem('internships', { company: '', role: '', duration: '', description: '' })}
            onRemove={i => removeItem('internships', i)}
            onUpdate={(i, f, v) => updateItem('internships', i, f, v)}
            renderItem={(p, i) => (
              <div key={i} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800">{p.role} <span className="text-orange-600">@ {p.company}</span></p>
                {p.duration && <p className="text-xs text-gray-500 mt-1">{p.duration}</p>}
                {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
              </div>
            )}
            renderEditItem={(p, i) => (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 pr-8 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={p.role} onChange={e => updateItem('internships', i, 'role', e.target.value)} placeholder="Role / Position"
                    className="border-b border-orange-300 outline-none bg-transparent text-sm font-semibold" />
                  <input value={p.company} onChange={e => updateItem('internships', i, 'company', e.target.value)} placeholder="Company name"
                    className="border-b border-orange-300 outline-none bg-transparent text-sm text-orange-600" />
                </div>
                <input value={p.duration} onChange={e => updateItem('internships', i, 'duration', e.target.value)} placeholder="Duration (e.g. Jun 2024 – Aug 2024)"
                  className="w-full border-b border-orange-200 outline-none bg-transparent text-xs text-gray-500" />
                <textarea value={p.description} onChange={e => updateItem('internships', i, 'description', e.target.value)} placeholder="What you worked on..." rows={2}
                  className="w-full border border-orange-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
              </div>
            )}
          />

          {/* ── Achievements ── */}
          <ListSection
            title="Achievements" icon={Star} color="text-yellow-600"
            items={editing ? form.achievements : (user.achievements || [])}
            editing={editing}
            onAdd={() => addItem('achievements', { title: '', description: '' })}
            onRemove={i => removeItem('achievements', i)}
            onUpdate={(i, f, v) => updateItem('achievements', i, f, v)}
            renderItem={(p, i) => (
              <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800">🏆 {p.title}</p>
                {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
              </div>
            )}
            renderEditItem={(p, i) => (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 pr-8 space-y-2">
                <input value={p.title} onChange={e => updateItem('achievements', i, 'title', e.target.value)} placeholder="Achievement title"
                  className="w-full border-b border-yellow-300 outline-none bg-transparent text-sm font-semibold" />
                <textarea value={p.description} onChange={e => updateItem('achievements', i, 'description', e.target.value)} placeholder="Describe your achievement..." rows={2}
                  className="w-full border border-yellow-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
              </div>
            )}
          />

          {/* ── Role-based links ── */}
          <div className="border-t pt-6 mt-6 relative z-10">
            {isStudent && (
              <a href="/student/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
                <FileText className="w-4 h-4" /> Manage Resume in Dashboard
              </a>
            )}
            {(role === 'alumni' || role === 'alumini') && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-gray-700"><Briefcase className="w-4 h-4 text-red-500" /> Jobs Posted: <strong>{user.jobsPosted || 0}</strong></p>
                <p className="flex items-center gap-2 text-sm text-gray-700"><MessageSquare className="w-4 h-4 text-purple-500" /> Mentorship Sessions: <strong>{user.mentorshipSessions || 0}</strong></p>
                <a href="/alumni/dashboard" className="text-sm text-blue-600 hover:underline">View full dashboard →</a>
              </div>
            )}
            {role === 'admin' && (
              <a href="/admin/dashboard" className="text-blue-600 hover:underline text-sm">Go to Admin Dashboard →</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
