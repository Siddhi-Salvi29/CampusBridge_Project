// AlumniDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Briefcase, Users, MessageSquare, Newspaper, TrendingUp, DollarSign, Loader2, X, MapPin, Camera, Save, Edit, Plus, Trash2, Code2, Star, Linkedin, Github } from 'lucide-react';
import { addJobToData } from "./JobData.js";
import { useAuth } from '../../../context/AuthContext.jsx';
import AlumniApplications from './AlumniApplications.jsx';

// ── Alumni Summary Card ─────────────────────────────────────────────────────
const AlumniSummaryCard = ({ user, onEditProfile, stats }) => {
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);

    useEffect(() => {
        if (!user?.id) return;
        fetch(`http://localhost:5000/api/network/users/${user.id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setFollowers(d.user.followers || 0);
                    setFollowing(d.user.following || 0);
                }
            })
            .catch(() => {});
    }, [user?.id]);

    const skills = Array.isArray(user?.skills) ? user.skills
        : (user?.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-6">
            {/* Left: Photo + basic info */}
            <div className="flex flex-col items-center md:items-start gap-3 md:w-52 flex-shrink-0">
                <div className="relative">
                    <img
                        src={user?.profile_photo || '/default-avatar.png'}
                        alt={user?.fullname}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-red-100 shadow"
                        onError={e => { e.target.src = '/default-avatar.png'; }}
                    />
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                </div>
                <div className="text-center md:text-left">
                    <p className="font-bold text-gray-900 text-lg leading-tight">{user?.fullname || 'Alumni'}</p>
                    <p className="text-sm text-red-600 font-medium capitalize">{user?.role || 'Alumni'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                {/* Follower stats */}
                <div className="flex gap-4 text-center">
                    <div>
                        <p className="text-lg font-bold text-gray-800">{followers}</p>
                        <p className="text-xs text-gray-400">Followers</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div>
                        <p className="text-lg font-bold text-gray-800">{following}</p>
                        <p className="text-xs text-gray-400">Following</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div>
                        <p className="text-lg font-bold text-gray-800">{stats?.jobsPostedByMe || 0}</p>
                        <p className="text-xs text-gray-400">Jobs</p>
                    </div>
                </div>
                <button onClick={onEditProfile}
                    className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1 hover:bg-red-50 transition flex items-center gap-1">
                    <Edit className="w-3 h-3" /> Edit Profile
                </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-100" />

            {/* Right: Summary */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Experience */}
                {(user?.designation || user?.company || user?.experience) && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" /> Experience
                        </p>
                        {user?.designation && <p className="text-sm font-semibold text-gray-800">{user.designation}</p>}
                        {user?.company && <p className="text-sm text-gray-600">{user.company}</p>}
                        {user?.experience && <p className="text-xs text-gray-400">{user.experience}</p>}
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5" /> Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.slice(0, 8).map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{s}</span>
                            ))}
                            {skills.length > 8 && <span className="text-xs text-gray-400">+{skills.length - 8} more</span>}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {(user?.achievements || []).length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" /> Achievements
                        </p>
                        <ul className="space-y-1">
                            {(user.achievements || []).slice(0, 3).map((a, i) => (
                                <li key={i} className="text-sm text-gray-700">🏆 {typeof a === 'string' ? a : a.title}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Links */}
                {(user?.linkedin || user?.github) && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Links</p>
                        <div className="flex flex-col gap-1">
                            {user?.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn</a>}
                            {user?.github && <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 hover:underline flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</a>}
                        </div>
                    </div>
                )}

                {/* Bio */}
                {user?.bio && (
                    <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">About</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                    </div>
                )}

                {/* Empty state */}
                {!user?.designation && !user?.bio && skills.length === 0 && (
                    <div className="sm:col-span-2 text-center py-4">
                        <p className="text-sm text-gray-400">Your profile is empty. <button onClick={onEditProfile} className="text-red-600 hover:underline">Fill in your details</button> to complete your profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Alumni Profile Tab ──────────────────────────────────────────────────────
const AlumniProfileTab = ({ user, login }) => {
    const buildForm = (u) => ({
        bio: u?.bio || '',
        designation: u?.designation || '',
        company: u?.company || '',
        experience: u?.experience || '',
        linkedin: u?.linkedin || '',
        github: u?.github || '',
        skills: u?.skills ? (Array.isArray(u.skills) ? u.skills : u.skills.split(',').map(s => s.trim()).filter(Boolean)) : [],
        achievements: u?.achievements || [],
    });

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(() => buildForm(user));
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Re-sync form when profile data loads from API
    useEffect(() => {
        if (!editing) setForm(buildForm(user));
    }, [user?.bio, user?.designation, user?.company, user?.experience, user?.linkedin, user?.github, user?.skills, user?.achievements]);

    useEffect(() => {
        if (!user?.id || loaded) return;
        fetch(`http://localhost:5000/api/alumni-profile/${user.id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success && d.profile) {
                    const merged = { ...user, ...d.profile };
                    login(merged);
                }
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, [user?.id]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoUploading(true);
        try {
            const fd = new FormData();
            fd.append('profile_photo', file);
            const res = await fetch(`http://localhost:5000/api/profile/${user.id}/photo`, { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok && data.success) login({ ...user, profile_photo: `http://localhost:5000${data.profile_photo}` });
        } catch { login({ ...user, profile_photo: URL.createObjectURL(file) }); }
        finally { setPhotoUploading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        const updated = { ...user, ...form };
        try {
            await fetch(`http://localhost:5000/api/alumni-profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
        } catch (e) { console.warn('Save failed:', e.message); }
        login(updated);
        setSaving(false);
        setEditing(false);
        setPhotoPreview(null);
    };

    const addAchievement = () => setForm(f => ({ ...f, achievements: [...f.achievements, { title: '', description: '' }] }));
    const removeAchievement = (i) => setForm(f => ({ ...f, achievements: f.achievements.filter((_, idx) => idx !== i) }));
    const updateAchievement = (i, field, val) => setForm(f => { const arr = [...f.achievements]; arr[i] = { ...arr[i], [field]: val }; return { ...f, achievements: arr }; });

    const skillsDisplay = Array.isArray(user?.skills) ? user.skills : (user?.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60">
                                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => { setEditing(false); setForm(buildForm(user)); setPhotoPreview(null); }} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                                <X className="w-4 h-4" />Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { setForm(buildForm(user)); setEditing(true); }} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                            <Edit className="w-4 h-4" />Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Photo + Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
                <div className="relative flex-shrink-0">
                    <img src={photoPreview || user?.profile_photo || '/default-avatar.png'} alt={user?.fullname}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-red-100 shadow"
                        onError={e => { e.target.src = '/default-avatar.png'; }} />
                    {editing && (
                        <label className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-red-700 transition shadow">
                            {photoUploading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{user?.fullname}</h3>
                    <p className="text-sm text-red-600 font-medium capitalize">{user?.role}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {!editing && user?.designation && <p className="text-sm text-gray-700 mt-1 font-medium">{user.designation} {user.company ? `@ ${user.company}` : ''}</p>}
                    {!editing && user?.experience && <p className="text-xs text-gray-500">{user.experience} experience</p>}
                </div>
            </div>

            {/* Bio + Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        ['bio', 'Bio', 'textarea'],
                        ['designation', 'Designation', 'text', 'e.g. Software Engineer'],
                        ['company', 'Current Company', 'text', 'e.g. TCS, Google'],
                        ['experience', 'Experience', 'text', 'e.g. 3 years'],
                        ['linkedin', 'LinkedIn URL', 'text', 'https://linkedin.com/in/...'],
                        ['github', 'GitHub URL', 'text', 'https://github.com/...'],
                    ].map(([key, label, type, ph]) => (
                        <div key={key} className={key === 'bio' ? 'sm:col-span-2' : ''}>
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            {editing ? (
                                type === 'textarea'
                                    ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph || label} rows={3}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-300 resize-none" />
                                    : <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph || label}
                                        className="w-full border-b border-red-200 outline-none bg-transparent text-sm pb-1" />
                            ) : (
                                key === 'linkedin' || key === 'github'
                                    ? user?.[key] ? <a href={user[key]} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{user[key]}</a> : <span className="text-sm text-gray-400 italic">Not set</span>
                                    : <p className="text-sm text-gray-800">{user?.[key] || <span className="text-gray-400 italic">Not set</span>}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2"><Code2 className="w-5 h-5" />Skills</h3>
                    {editing && <button onClick={() => setForm(f => ({ ...f, skills: [...f.skills, ''] }))}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-2 py-1 hover:text-blue-800 transition"><Plus className="w-3 h-3" />Add</button>}
                </div>
                {editing ? (
                    <div className="flex flex-wrap gap-2">
                        {form.skills.map((s, i) => (
                            <div key={i} className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
                                <input value={s} onChange={e => { const arr = [...form.skills]; arr[i] = e.target.value; setForm(f => ({ ...f, skills: arr })); }}
                                    className="bg-transparent outline-none text-sm text-purple-700 w-24" placeholder="Skill" />
                                <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }))} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {skillsDisplay.length > 0 ? skillsDisplay.map((s, i) => <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{s}</span>)
                            : <p className="text-sm text-gray-400 italic">No skills added yet.</p>}
                    </div>
                )}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-yellow-600 flex items-center gap-2"><Star className="w-5 h-5" />Achievements</h3>
                    {editing && <button onClick={addAchievement} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-2 py-1 hover:text-blue-800 transition"><Plus className="w-3 h-3" />Add</button>}
                </div>
                <div className="space-y-3">
                    {(editing ? form.achievements : (user?.achievements || [])).map((a, i) => editing ? (
                        <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2 relative">
                            <button onClick={() => removeAchievement(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            <input value={a.title} onChange={e => updateAchievement(i, 'title', e.target.value)} placeholder="Achievement title"
                                className="w-full border-b border-yellow-300 outline-none bg-transparent text-sm font-semibold" />
                            <textarea value={a.description} onChange={e => updateAchievement(i, 'description', e.target.value)} placeholder="Description..." rows={2}
                                className="w-full border border-yellow-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
                        </div>
                    ) : (
                        <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                            <p className="font-semibold text-gray-800">🏆 {a.title}</p>
                            {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                        </div>
                    ))}
                    {!editing && (user?.achievements || []).length === 0 && <p className="text-sm text-gray-400 italic">No achievements added yet.</p>}
                </div>
            </div>
        </div>
    );
};
const JobCard = ({ job, onUpdate, onDelete }) => {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: job.title, company: job.company || '', location: job.location, description: job.description || '' });

    const statusColor = job.status?.includes('Pending') ? 'bg-yellow-100 text-yellow-700' : job.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5000/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                onUpdate?.({ ...job, ...form });
                setEditing(false);
                setShowModal(false);
            }
        } catch {}
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this job posting?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/jobs/${job.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data.success) { onDelete?.(job.id); setShowModal(false); }
        } catch {}
    };

    return (
        <>
            <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-md">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-bold text-red-600 truncate flex-1 mr-2">{job.title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${statusColor}`}>{job.status}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>
                <p className="text-xs text-gray-500 border-t pt-2 mt-3">Posted on: {job.datePosted}</p>
                <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditing(false); setShowModal(true); }}
                        className="flex-1 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                        View
                    </button>
                    <button onClick={() => { setEditing(true); setShowModal(true); }}
                        className="flex-1 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
                        Edit
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{editing ? 'Edit Job' : 'Job Details'}</h3>
                            <div className="flex gap-2">
                                {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"><Edit className="w-3 h-3" />Edit</button>}
                                <button onClick={() => { setShowModal(false); setEditing(false); }} className="p-1.5 text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {editing ? (
                                <>
                                    {[['title','Job Title'],['company','Company'],['location','Location']].map(([key, label]) => (
                                        <div key={key}>
                                            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                            <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-300" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-300 resize-none" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={handleSave} disabled={saving}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button onClick={() => setEditing(false)}
                                            className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div><p className="text-xs text-gray-400">Title</p><p className="text-sm font-semibold text-gray-800">{job.title}</p></div>
                                        <div><p className="text-xs text-gray-400">Company</p><p className="text-sm text-gray-800">{job.company || '—'}</p></div>
                                        <div><p className="text-xs text-gray-400">Location</p><p className="text-sm text-gray-800">{job.location}</p></div>
                                        <div><p className="text-xs text-gray-400">Status</p><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}>{job.status}</span></div>
                                        {job.description && <div><p className="text-xs text-gray-400">Description</p><p className="text-sm text-gray-700 mt-1">{job.description}</p></div>}
                                        <div><p className="text-xs text-gray-400">Posted on</p><p className="text-sm text-gray-800">{job.datePosted}</p></div>
                                    </div>
                                    <button onClick={handleDelete}
                                        className="w-full mt-2 py-2 border border-red-300 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Delete Job
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};;

// =========================================================================
// Alumni Job Post Form Component (Updated with Company Name)
// =========================================================================
const AlumniJobPostForm = ({ onPostSuccess, onCancel, alumniName, alumniId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [companyName, setCompanyName] = useState(''); // ✅ कंपनीचे नाव
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!title || !description || !location || !companyName) {
            setMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const res = await fetch('http://localhost:5000/api/jobs/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, description, location,
                    company: companyName,
                    alumniId: alumniId || user?.id,
                    alumniName: alumniName || user?.fullname || 'Alumni',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to post job');

            const postedJobData = { title, location, description, company: companyName };
            setMessage({ type: 'success', text: 'Job posted successfully!' });
            setTimeout(() => { onPostSuccess(postedJobData); }, 800);
        } catch (error) {
            // Fallback: save locally if backend not available
            const postedJobData = { title, location, description, company: companyName };
            setMessage({ type: 'success', text: 'Job saved locally (backend unavailable).' });
            setTimeout(() => { onPostSuccess(postedJobData); }, 800);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 border border-red-300 bg-red-50 rounded-xl shadow-xl mb-8 relative">
            
            <button onClick={onCancel} className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-red-100 transition" title="Close Form">
                <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-red-700 mb-5 border-b border-red-200 pb-2 flex items-center gap-2">
                <Briefcase className="w-6 h-6" /> Create New Job Posting
            </h3>
            
            {message && (
                <div className={`p-3 text-sm rounded-lg mb-4 font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-200 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required 
                                   placeholder="e.g., Software Engineer"
                                   className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-red-500 focus:ring-red-500 transition" />
                        </div>
                    </div>
                    {/* ✅ Company Name Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                                   placeholder="e.g., Google, TCS"
                                   className="pl-3 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-red-500 focus:ring-red-500 transition" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required
                                   placeholder="e.g., Pune, Remote, Mumbai"
                                   className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-red-500 focus:ring-red-500 transition" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Job Description <span className="text-red-500">*</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required
                                   placeholder="Provide detailed description, responsibilities, and company details..."
                                   className="block w-full rounded-md border border-gray-300 shadow-sm p-3 text-sm focus:border-red-500 focus:ring-red-500 transition"></textarea>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={loading} className={`w-full py-3 px-6 rounded-lg text-white font-bold flex items-center justify-center shadow-lg transition duration-200 ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}>
                        {loading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Posting Job...</> : 'Post Job for Admin Approval'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// =========================================================================
// Main Alumni Dashboard Component
// =========================================================================
const AlumniDashboard = () => {
    const { user, login } = useAuth();
    const alumniName = user?.fullname || 'Alumni';

    const [stats, setStats] = useState({ openJobs: 0, mentorshipRequests: 7, networkConnections: 540, jobsPostedByMe: 0 });
    const [showJobPostForm, setShowJobPostForm] = useState(false);
    const [myPostedJobs, setMyPostedJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Load jobs from DB
    useEffect(() => {
        if (!user?.id) return;
        fetch(`http://localhost:5000/api/jobs/my/${user.id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setMyPostedJobs(d.jobs.map(j => ({
                        id: j.id,
                        title: j.title,
                        company: j.company,
                        location: j.location,
                        description: j.description,
                        status: j.status,
                        datePosted: new Date(j.created_at).toLocaleDateString('en-IN'),
                    })));
                    setStats(s => ({ ...s, jobsPostedByMe: d.jobs.length }));
                }
            })
            .catch(() => {});
    }, [user?.id]);

    const handlePostJob = () => setShowJobPostForm(true);

    const handlePostSuccess = (postedJobData) => {
        setShowJobPostForm(false);
        setStats(s => ({ ...s, jobsPostedByMe: s.jobsPostedByMe + 1 }));

        // Add to local job feed for notifications
        const newJobId = Date.now();
        addJobToData({
            id: newJobId,
            alumni: alumniName,
            company: postedJobData.company,
            location: postedJobData.location,
            industry: "Alumni Posted",
            experience: "Not Specified",
            title: postedJobData.title,
            description: postedJobData.description,
            positions: "1 Position",
            salary: "Negotiable",
            mode: "Full-Time",
            type: "Full-Time",
            status: "Pending Admin Approval",
        });

        setMyPostedJobs(prev => [{
            id: newJobId,
            title: postedJobData.title,
            location: postedJobData.location,
            status: "Pending Admin Approval",
            datePosted: new Date().toLocaleDateString('en-IN'),
        }, ...prev]);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
                Alumni Connect Dashboard
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
                {[['overview', 'Overview'], ['applications', 'Applications'], ['profile', 'My Profile']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition ${activeTab === key ? 'bg-red-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && <AlumniProfileTab user={user} login={login} />}
            {activeTab === 'applications' && <AlumniApplications jobs={myPostedJobs} />}

            {activeTab === 'overview' && (<>

            {/* ── Alumni Profile Summary Card ───────────────────────────── */}
            <AlumniSummaryCard user={user} onEditProfile={() => setActiveTab('profile')} stats={stats} />
            {/* ─────────────────────────────────────────────────────────── */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className={`p-6 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl border-blue-500 hover:border-blue-600 bg-white border-t-4 border-b-2`}>
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">Open Job Postings</h4>
                        <Briefcase className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{stats.openJobs}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2">Total jobs available for current students</p>
                </div>
                 <div className={`p-6 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl border-purple-500 hover:border-purple-600 bg-white border-t-4 border-b-2`}>
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">Mentorship Requests</h4>
                        <MessageSquare className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{stats.mentorshipRequests}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2">New students seeking your guidance</p>
                </div>
                 <div className={`p-6 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl border-green-500 hover:border-green-600 bg-white border-t-4 border-b-2`}>
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">Network Connections</h4>
                        <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{stats.networkConnections}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2">View alumni directory</p>
                </div>
                 <div className={`p-6 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl border-red-500 hover:border-red-600 bg-white border-t-4 border-b-2`}>
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">Your Jobs Posted</h4>
                        <TrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{stats.jobsPostedByMe}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2">Total jobs offered to the campus</p>
                </div>
            </div>
            
            {/* 💡 Job Post Form Display Area */}
            {showJobPostForm && (
                <AlumniJobPostForm
                    onPostSuccess={handlePostSuccess}
                    onCancel={() => setShowJobPostForm(false)}
                    alumniName={alumniName}
                    alumniId={user?.id}
                />
            )}
            
            {/* 📝 Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Job Posting Action Card */}
                <div className="lg:col-span-2 p-8 bg-white shadow-xl rounded-xl border border-gray-100">
                    <div className="flex items-center mb-6 border-b pb-3">
                        <DollarSign className="w-6 h-6 mr-3 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-800">Contribute & Connect</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                        Support your institution by offering jobs to students.
                    </p>

                    <div className="max-w-xs">
                        <button
                            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition duration-200 flex items-center justify-center shadow-md ${showJobPostForm ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                            onClick={handlePostJob}
                            disabled={showJobPostForm} 
                        >
                            <Briefcase className="w-5 h-5 mr-2" />
                            {showJobPostForm ? 'Form Open' : 'Post a Job'}
                        </button>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-bold text-gray-700 mb-3">Your Contributions Summary</h4>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li className="flex justify-between">Jobs Posted: <span className="font-semibold text-blue-600">{stats.jobsPostedByMe}</span></li>
                            <li className="flex justify-between">Students Mentored: <span className="font-semibold text-blue-600">5</span> (Placeholder)</li>
                        </ul>
                    </div>
                </div>

                {/* 2. Campus News Card (Same as before) */}
                <div className="p-8 bg-white shadow-xl rounded-xl border border-gray-100">
                    <div className="flex items-center mb-6 border-b pb-3">
                        <Newspaper className="w-6 h-6 mr-3 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Campus News</h3>
                    </div>
                    <ul className="space-y-4 text-sm">
                        <li className="p-3 border-l-4 border-blue-500 bg-blue-50/50 rounded cursor-pointer transition hover:bg-blue-100">
                           <p className="font-semibold text-gray-800">Alumni Meetup in Mumbai</p>
                           <p className="text-xs text-gray-600">Details and registration link.</p>
                        </li>
                        <li className="p-3 border-l-4 border-green-500 bg-green-50/50 rounded cursor-pointer transition hover:bg-green-100">
                           <p className="font-semibold text-gray-800">New Research Center Inaugurated</p>
                           <p className="text-xs text-gray-600">See how your donations help.</p>
                        </li>
                        <li className="p-3 border-l-4 border-yellow-500 bg-yellow-50/50 rounded cursor-pointer transition hover:bg-yellow-100">
                           <p className="font-semibold text-gray-800">Career Fair Success</p>
                           <p className="text-xs text-gray-600">Over 50 companies participated.</p>
                        </li>
                    </ul>
                </div>
            </div>
            
            {/* 💡 My Posted Jobs Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-red-600" /> My Posted Jobs
                </h2>
                
                {myPostedJobs.length === 0 ? ( 
                    <p className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">You haven't posted any jobs yet. Click "Post a Job" to contribute!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myPostedJobs.map(job => (
                            <JobCard key={job.id} job={job}
                                onUpdate={updated => setMyPostedJobs(prev => prev.map(j => j.id === updated.id ? { ...j, ...updated } : j))}
                                onDelete={id => setMyPostedJobs(prev => prev.filter(j => j.id !== id))}
                            />
                        ))}
                    </div>
                )}
            </div>
            </>)}
        </div>
    );
};

export default AlumniDashboard;