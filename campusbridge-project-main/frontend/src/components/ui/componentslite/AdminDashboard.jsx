import React, { useEffect, useState } from 'react';
import { Users, BriefcaseBusiness, FileText, Settings, Activity, ChevronRight, Edit, Save, X, Camera, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import UserListComponent from './UserListComponent.jsx';
import SettingsComponent from './SettingsComponent.jsx';
import JobApprovalComponent from './JobApprovalComponent.jsx';

const navItems = [
    { key: 'overview',  label: 'Overview',      icon: LayoutDashboard },
    { key: 'users',     label: 'Users',          icon: Users },
    { key: 'jobs',      label: 'Job Approvals',  icon: BriefcaseBusiness },
    { key: 'profile',   label: 'Profile',        icon: FileText },
    { key: 'settings',  label: 'Settings',       icon: Settings },
];

const statsData = [
    { label: 'Pending Jobs',     value: '15',    icon: BriefcaseBusiness, color: 'text-violet-600', border: 'border-violet-500' },
    { label: 'Total Users',      value: '1,250', icon: Users,             color: 'text-blue-600',   border: 'border-blue-400'   },
    { label: 'Resumes Uploaded', value: '42',    icon: FileText,          color: 'text-green-600',  border: 'border-green-400'  },
];

// ── Admin Profile Tab ────────────────────────────────────────────────────────
const AdminProfileTab = () => {
    const { user, login } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [form, setForm] = useState({
        bio: user?.bio || '',
        designation: user?.designation || 'System Administrator',
        department: user?.department || '',
        phone: user?.phone || '',
    });

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
        } catch {}
        finally { setPhotoUploading(false); }
    };

    const handleSave = () => {
        setSaving(true);
        login({ ...user, ...form });
        setTimeout(() => { setSaving(false); setEditing(false); setPhotoPreview(null); }, 500);
    };

    return (
        <div className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Admin Profile</h2>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-3 py-2 bg-[#6A38C2] text-white rounded-lg text-sm font-semibold hover:bg-[#5A28A2] transition disabled:opacity-60">
                                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => { setEditing(false); setPhotoPreview(null); }}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                                <X className="w-4 h-4" />Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                            <Edit className="w-4 h-4" />Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative flex-shrink-0">
                    <img src={photoPreview || user?.profile_photo || '/default-avatar.png'}
                        alt={user?.fullname} onError={e => { e.target.src = '/default-avatar.png'; }}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-violet-100 shadow" />
                    {editing && (
                        <label className="absolute bottom-0 right-0 bg-[#6A38C2] text-white rounded-full p-1.5 cursor-pointer hover:bg-[#5A28A2] transition shadow">
                            {photoUploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    )}
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{user?.fullname}</h3>
                    <p className="text-sm text-[#6A38C2] font-medium">Administrator</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {!editing && form.designation && <p className="text-sm text-gray-700 mt-1">{form.designation}</p>}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['bio','Bio','textarea'],['designation','Designation','text'],['department','Department','text'],['phone','Phone','text']].map(([key, label, type]) => (
                        <div key={key} className={key === 'bio' ? 'sm:col-span-2' : ''}>
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            {editing ? (
                                type === 'textarea'
                                    ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={3}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-300 resize-none" />
                                    : <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full border-b border-violet-200 outline-none bg-transparent text-sm pb-1" />
                            ) : (
                                <p className="text-sm text-gray-800">{form[key] || <span className="text-gray-400 italic">Not set</span>}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const adminName = user?.fullname || 'Admin';

    // Close sidebar on tab change (mobile)
    const handleTabChange = (key) => {
        setActiveTab(key);
        setSidebarOpen(false);
    };

    const recentActivities = [
        { id: 1, action: 'Approved job: Software Engineer @ TCS', time: '5 mins ago', color: 'text-green-500' },
        { id: 2, action: 'New user registered: Rohan D.', time: '1 hour ago', color: 'text-blue-500' },
        { id: 3, action: 'Job posting deleted: Marketing Intern', time: '3 hours ago', color: 'text-red-500' },
    ];

    const OverviewContent = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsData.map(stat => (
                    <div key={stat.label} className={`bg-white p-5 rounded-xl border-l-4 shadow hover:shadow-md transition ${stat.border}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                            <stat.icon className={`w-7 h-7 ${stat.color} opacity-80`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100">
                    <h2 className="text-base font-bold text-gray-800 p-4 border-b">Recent Activity Log</h2>
                    <ul className="divide-y divide-gray-100">
                        {recentActivities.map(a => (
                            <li key={a.id} className="p-4 flex justify-between items-start sm:items-center gap-2 hover:bg-gray-50 transition">
                                <div className="flex items-start sm:items-center gap-3">
                                    <Activity className={`w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0 ${a.color}`} />
                                    <p className="text-sm font-medium text-gray-800">{a.action}</p>
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full py-2.5 bg-[#6A38C2] text-white rounded-lg font-medium hover:bg-[#5A28A2] transition text-sm">
                            + Add New Admin
                        </button>
                        <button className="w-full py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition text-sm">
                            Force System Backup
                        </button>
                        <button className="w-full py-2.5 border border-red-400 text-red-500 rounded-lg font-medium hover:bg-red-50 transition text-sm">
                            Clear Cache
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Admin info */}
            <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <img src={user?.profile_photo || '/default-avatar.png'}
                        alt={adminName} onError={e => { e.target.src = '/default-avatar.png'; }}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-400 flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{adminName}</p>
                        <p className="text-xs text-violet-300">Administrator</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <p className="text-xs text-violet-400 uppercase tracking-widest px-5 mb-2">Menu</p>
                {navItems.map(item => (
                    <button key={item.key} onClick={() => handleTabChange(item.key)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                            activeTab === item.key
                                ? 'bg-violet-600 text-white border-r-4 border-violet-300'
                                : 'text-violet-200 hover:bg-white/10 hover:text-white'
                        }`}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button onClick={() => { logout?.(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/20 rounded-lg transition">
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-100 pt-16">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar (desktop: fixed, mobile: slide-in) ── */}
            <aside className={`
                fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#1e1b4b] text-white z-40 shadow-xl
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <SidebarContent />
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

                {/* Mobile top bar */}
                <div className="lg:hidden fixed top-16 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                    <button onClick={() => setSidebarOpen(v => !v)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-gray-800">
                        {navItems.find(n => n.key === activeTab)?.label}
                    </h1>
                </div>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0 overflow-y-auto">
                    {/* Desktop page header */}
                    <div className="hidden lg:block mb-6">
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            {navItems.find(n => n.key === activeTab)?.label}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Welcome back, <span className="font-semibold text-gray-700">{adminName}</span></p>
                    </div>

                    {activeTab === 'overview' && <OverviewContent />}
                    {activeTab === 'users'    && <UserListComponent />}
                    {activeTab === 'jobs'     && <JobApprovalComponent />}
                    {activeTab === 'profile'  && <AdminProfileTab />}
                    {activeTab === 'settings' && <SettingsComponent />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
