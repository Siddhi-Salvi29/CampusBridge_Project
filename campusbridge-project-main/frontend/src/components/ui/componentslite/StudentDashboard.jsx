// StudentDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, Clock, Bell, UploadCloud, FileText, MapPin, Building2, User, X, GraduationCap, Code2, FolderGit2, Star, Plus, Trash2, Save, Edit } from 'lucide-react';
import JobCards from './JobCards';
import { subscribeToNotifications, getPersistentNotifications, getAppliedJobs, getJobData } from "./JobData.js";
import { useAuth } from '../../../context/AuthContext.jsx';

// =========================================================================
// DUMMY DATA FOR DEMONSTRATION (For Pending and Active)
// =========================================================================
const getPendingApplications = (allJobs, appliedJobIds) => {
    // Simulate that 2 of the applied jobs are in 'Pending' status
    const pendingIds = appliedJobIds.slice(0, 2); 
    return allJobs
        .filter(job => pendingIds.includes(String(job.id)))
        .map(job => ({ ...job, status: 'Reviewing' }));
};

const getActiveInternships = () => {
    // Dummy Data for Active Internships (IDs 5 and 6)
    return [
        { id: 105, company: 'Innovatech Solutions', title: 'Data Analyst Intern', type: 'Internship', location: 'Remote', duration: '6 Months', status: 'Active' },
        { id: 106, company: 'Green Earth Inc.', title: 'Marketing Intern', type: 'Internship', location: 'Mumbai', duration: '3 Months', status: 'Active' },
    ];
};

// =========================================================================
// Notification Card Component (As Is)
// =========================================================================
const NewJobAlertsCard = ({ notificationCount, latestAlert }) => {
    return (
        <div className="p-6 rounded-xl shadow-lg border-t-4 border-red-500 bg-white">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-500 uppercase">NEW JOB ALERTS</h4>
                <Bell className="w-6 h-6 text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-800">{notificationCount}</p>
            
            <div className="mt-4 pt-2 border-t border-gray-100">
                {latestAlert ? (
                    <div className="text-xs text-red-700 bg-red-100 p-2 rounded-md border border-red-200">
                        <p className="font-semibold">{latestAlert.title} <span className="text-gray-500">({latestAlert.time})</span></p>
                        <p className="mt-1 text-gray-700 font-medium truncate">{latestAlert.message}</p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-600">View latest job alerts</p>
                )}
            </div>
        </div>
    );
};

// =========================================================================
// Main Student Dashboard Component
// =========================================================================
const StudentDashboard = () => {
    const navigate = useNavigate();

    // Stats and List Visibility States
    const [appliedJobsCount, setAppliedJobsCount] = useState(0);
    const [pendingAppsCount, setPendingAppsCount] = useState(0);
    const [activeInternCount, setActiveInternCount] = useState(0);

    const [notifications, setNotifications] = useState([]);
    
    // Visibility states for the lists
    const [showAppliedJobs, setShowAppliedJobs] = useState(false);
    const [showPendingApps, setShowPendingApps] = useState(false);
    const [showActiveInterns, setShowActiveInterns] = useState(false);

    // Resume state (As Is)
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(localStorage.getItem('resumeStatus') || 'No file chosen');
    const [uploading, setUploading] = useState(false);

    // =========================================================================
    // Handlers
    // =========================================================================
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setResumeFile(file);
            setUploadStatus(file.name);
        } else {
            setResumeFile(null);
            setUploadStatus('No file chosen');
        }
    };

    const handleUpload = async () => {
        if (!resumeFile) {
            alert("Please select a file to upload.");
            return;
        }
        setUploading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const formData = new FormData();
            formData.append('resume', resumeFile);
            if (user?.id) formData.append('studentId', user.id);

            const res = await fetch('http://localhost:5000/api/student/upload-resume', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                const newStatus = `Uploaded: ${resumeFile.name}`;
                setUploadStatus(newStatus);
                localStorage.setItem('resumeStatus', newStatus);
                alert(`Resume uploaded successfully!`);
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            setUploadStatus('Upload failed');
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            setResumeFile(null);
        }
    };

    const handleCheckResume = () => {
        if (uploadStatus.startsWith('Uploaded:')) {
            alert(`Current Resume: ${uploadStatus}. This resume is ready for applications.`);
        } else {
            alert(`Current Status: ${uploadStatus}. Please upload your resume.`);
        }
    };

    // Unified function to toggle list visibility and manage no-data alerts
    const handleCardClick = (listName, count, toggleFunction) => {
        if (count > 0) {
            // Close other open lists to ensure only one is visible at a time
            if (listName !== 'applied') setShowAppliedJobs(false);
            if (listName !== 'pending') setShowPendingApps(false);
            if (listName !== 'active') setShowActiveInterns(false);

            // Toggle the clicked list's visibility
            toggleFunction(prev => !prev);
        } else {
            alert(`You have no ${listName} items to display yet.`);
            toggleFunction(false);
        }
    };

    // =========================================================================
    // Data Load & Fetching
    // =========================================================================
    const allJobs = getJobData();
    const appliedJobIds = getAppliedJobs();
    
    // Filtered data for lists
    const appliedJobs = allJobs.filter(job => appliedJobIds.includes(String(job.id)));
    const pendingApplications = getPendingApplications(allJobs, appliedJobIds);
    const activeInternships = getActiveInternships();

    useEffect(() => {
        const loadDashboardData = () => {
            setAppliedJobsCount(appliedJobs.length);
            setPendingAppsCount(pendingApplications.length);
            setActiveInternCount(activeInternships.length);
            setNotifications(getPersistentNotifications());
        };

        loadDashboardData();

        const unsubscribe = subscribeToNotifications((newNotification) => {
            setNotifications(prevNotifs => [newNotification, ...prevNotifs]);
            loadDashboardData();
        });

        const handleStorageChange = (event) => {
            if (event.key === 'studentNotifications' || event.key === 'studentJobApplications') {
                loadDashboardData();
                // Close all lists on data change
                setShowAppliedJobs(false);
                setShowPendingApps(false);
                setShowActiveInterns(false);
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [appliedJobs.length, pendingApplications.length, activeInternships.length]); // Dependencies added

    const latestAlert = notifications.length > 0 ? notifications[0] : null;
    const [activeTab, setActiveTab] = useState('overview');
    const { user, login } = useAuth();

    // =========================================================================
    // Generic List Component for Reusability (As Is)
    // =========================================================================
    const StatusList = ({ title, jobs, statusColor, statusIcon: Icon, closeHandler }) => (
        <div className="mt-10 p-6 bg-white shadow-xl rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className={`text-2xl font-bold ${statusColor} flex items-center gap-2`}>
                    <Icon className="w-6 h-6" /> {title} ({jobs.length})
                </h2>
                <button 
                    onClick={closeHandler} 
                    className="p-1 text-gray-500 hover:text-red-600 transition"
                    title="Close List"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {jobs.length === 0 ? (
                <p className="text-gray-600 text-lg">You have no {title.toLowerCase()} items yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => navigate(`/job-detail/${job.id}`)} 
                            className={`relative bg-gray-50 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.015] transition-all duration-300 p-5 flex flex-col cursor-pointer border-l-4 ${statusColor === 'text-green-700' ? 'border-green-500' : statusColor === 'text-blue-700' ? 'border-blue-500' : 'border-purple-500'}`}
                        >
                            <div className="flex items-center gap-3 mb-3 border-b border-gray-200 pb-3">
                                <div className="w-11 h-11 bg-[#1E40AF] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left flex-grow">
                                    <h3 className="font-bold text-[16px] text-gray-900 leading-snug">{job.company}</h3>
                                    <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                                        <User className="h-3 w-3 text-gray-400" /> {job.alumni ? `Posted By: ${job.alumni}` : 'Unknown Alumnus'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex-grow min-h-[45px] mb-3">
                                <h4 className="text-lg font-semibold text-gray-800 mb-1">{job.title}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-gray-400" /> {job.location}
                                </p>
                            </div>

                            <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200">
                                <p className="text-[13.5px] font-semibold text-gray-600 flex items-center gap-1">
                                    <Briefcase className="h-4 w-4 text-gray-500" /> {job.type}
                                </p>
                                <span className={`px-4 py-2 text-white rounded-lg text-sm font-semibold cursor-default ${statusColor === 'text-green-700' ? 'bg-green-600' : statusColor === 'text-blue-700' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                    {job.status || title.split(' ')[0]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );


    // =========================================================================
    // JSX
    // =========================================================================
    // Determine which list to display
    let displayedList = null;

    if (showAppliedJobs) {
        displayedList = (
            <StatusList
                title="Your Applied Jobs"
                jobs={appliedJobs}
                statusColor="text-green-700"
                statusIcon={Briefcase}
                closeHandler={() => setShowAppliedJobs(false)}
            />
        );
    } else if (showPendingApps) {
        displayedList = (
            <StatusList
                title="Pending Applications"
                jobs={pendingApplications}
                statusColor="text-blue-700"
                statusIcon={Clock}
                closeHandler={() => setShowPendingApps(false)}
            />
        );
    } else if (showActiveInterns) {
        displayedList = (
            <StatusList
                title="Active Internships"
                jobs={activeInternships}
                statusColor="text-purple-700"
                statusIcon={UserCheck}
                closeHandler={() => setShowActiveInterns(false)}
            />
        );
    }


    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
                Student Dashboard
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
                {[['overview', 'Overview'], ['profile', 'My Profile']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition ${activeTab === key ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && <ProfileTab user={user} login={login} />}

            {activeTab === 'overview' && (<>

            {/* ── Profile Summary Card ── */}
            <ProfileSummaryCard user={user} login={login} onEditProfile={() => setActiveTab('profile')} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 1. Applied Jobs Card (Clickable) */}
                <div 
                    className={`p-6 rounded-xl shadow-lg border-t-4 border-green-500 bg-white cursor-pointer transition duration-300 ${appliedJobsCount > 0 ? 'hover:shadow-xl hover:scale-[1.02]' : 'cursor-default opacity-80'}`}
                    onClick={() => handleCardClick('applied', appliedJobsCount, setShowAppliedJobs)}
                    title={appliedJobsCount > 0 ? "Click to view applied jobs list" : "No jobs applied yet"}
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">APPLIED JOBS (TOTAL)</h4>
                        <Briefcase className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{appliedJobsCount}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2 font-semibold">
                        {appliedJobsCount > 0 ? (showAppliedJobs ? 'Click to Hide List' : 'Click to View List') : 'No jobs applied yet'}
                    </p>
                </div>

                {/* 2. Pending Applications Card (Clickable) */}
                <div 
                    className={`p-6 rounded-xl shadow-lg border-t-4 border-blue-500 bg-white cursor-pointer transition duration-300 ${pendingAppsCount > 0 ? 'hover:shadow-xl hover:scale-[1.02]' : 'cursor-default opacity-80'}`}
                    onClick={() => handleCardClick('pending', pendingAppsCount, setShowPendingApps)}
                    title={pendingAppsCount > 0 ? "Click to view pending applications" : "No pending applications"}
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">PENDING APPLICATIONS</h4>
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{pendingAppsCount}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2 font-semibold">
                        {pendingAppsCount > 0 ? (showPendingApps ? 'Click to Hide List' : 'Click to View List') : 'All applications processed'}
                    </p>
                </div>

                {/* 3. Active Internships Card (Clickable) */}
                <div 
                    className={`p-6 rounded-xl shadow-lg border-t-4 border-purple-500 bg-white cursor-pointer transition duration-300 ${activeInternCount > 0 ? 'hover:shadow-xl hover:scale-[1.02]' : 'cursor-default opacity-80'}`}
                    onClick={() => handleCardClick('active', activeInternCount, setShowActiveInterns)}
                    title={activeInternCount > 0 ? "Click to view active internships" : "No active internships"}
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">ACTIVE INTERNSHIPS</h4>
                        <UserCheck className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{activeInternCount}</p>
                    <p className="mt-4 text-xs text-gray-600 border-t pt-2 font-semibold">
                        {activeInternCount > 0 ? (showActiveInterns ? 'Click to Hide List' : 'Click to View List') : 'No active internships'}
                    </p>
                </div>

                {/* 4. New Job Alerts Card (As Is) */}
                <NewJobAlertsCard 
                    notificationCount={notifications.length} 
                    latestAlert={latestAlert}
                />
            </div>
            
            {/* Conditional List Display Section (Removed the fallback message section) */}
            {displayedList}


            {/* Resume Management Section and Latest Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Resume Management Section (As Is) */}
                <div className="lg:col-span-2 p-6 bg-white shadow-xl rounded-xl border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <UploadCloud className="w-5 h-5 text-purple-600" /> Resume Management
                    </h2>
                    
                    <p className="text-sm text-gray-600 mb-6">
                        Upload your latest **PDF/DOCX resume**. Only the most recent version will be used for applications.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <label htmlFor="resume-upload" className="px-6 py-2 border border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition w-full sm:w-auto text-center cursor-pointer">
                            Choose File
                        </label>
                        <input type="file" id="resume-upload" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                        <span className={`text-sm ${uploadStatus.startsWith('Uploaded:') ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                            <FileText className="w-4 h-4 inline mr-1" /> {uploadStatus}
                        </span>
                        <button 
                            onClick={handleUpload}
                            disabled={uploading || !resumeFile} 
                            className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md transition w-full sm:w-auto flex items-center justify-center ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {uploading ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                            {uploading ? 'Uploading...' : 'Upload Resume'}
                        </button>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <button 
                            onClick={handleCheckResume}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            Check Uploaded Resume Status
                        </button>
                    </div>
                </div>

                {/* Latest Alerts Section (As Is) */}
                <div className="lg:col-span-1 p-6 bg-white shadow-xl rounded-xl border border-gray-100">
                    <h2 className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2 border-b pb-2">
                        <Bell className="w-5 h-5" /> Latest Alerts ({notifications.length})
                    </h2>
                    
                    {notifications.length === 0 ? (
                        <p className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">No new job alerts. Check back later!</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.slice(0, 4).map((alert) => (
                                <div key={alert.id} className="p-3 bg-red-50 border-l-4 border-red-400 rounded-md shadow-sm">
                                    <p className="font-bold text-red-700 text-sm truncate">{alert.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                                </div>
                            ))}
                            {notifications.length > 4 && (
                                <p className="text-xs text-gray-500 mt-2">+{notifications.length - 4} more alerts...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </>)}
        </div>
    );
};

// ── Profile Summary Card (Resume-style) ─────────────────────────────────────
const ProfileSummaryCard = ({ user, login, onEditProfile }) => {
    const [uploading, setUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    const skills = Array.isArray(user?.skills) ? user.skills
        : (user?.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profile_photo', file);
            const res = await fetch(`http://localhost:5000/api/profile/${user.id}/photo`, { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                login({ ...user, profile_photo: `http://localhost:5000${data.profile_photo}` });
            }
        } catch (e) {
            // fallback: keep blob preview
            login({ ...user, profile_photo: URL.createObjectURL(file) });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-6">
            {/* Left: Photo + basic info */}
            <div className="flex flex-col items-center md:items-start gap-3 md:w-48 flex-shrink-0">
                <div className="relative">
                    <img
                        src={photoPreview || user?.profile_photo || '/default-avatar.png'}
                        alt={user?.fullname}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 shadow"
                        onError={e => { e.target.src = '/default-avatar.png'; }}
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition shadow" title="Change photo">
                        {uploading
                            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        }
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                </div>
                <div className="text-center md:text-left">
                    <p className="font-bold text-gray-900 text-lg leading-tight">{user?.fullname || 'Student'}</p>
                    <p className="text-sm text-blue-600 font-medium capitalize">{user?.role || 'Student'}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    {user?.phoneNumber && <p className="text-xs text-gray-500">{user.phoneNumber}</p>}
                </div>
                <button onClick={onEditProfile}
                    className="mt-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-50 transition flex items-center gap-1">
                    <Edit className="w-3 h-3" /> Edit Profile
                </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-100" />

            {/* Right: Resume summary */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Academics */}
                {(user?.degree || user?.branch || user?.cgpa) && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" /> Academics
                        </p>
                        <p className="text-sm text-gray-700">{[user.degree, user.branch].filter(Boolean).join(' — ')}</p>
                        {user.year && <p className="text-xs text-gray-500">{user.year}</p>}
                        {user.cgpa && <p className="text-xs text-gray-500">CGPA: <span className="font-semibold text-gray-700">{user.cgpa}</span></p>}
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

                {/* Projects */}
                {(user?.projects || []).length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <FolderGit2 className="w-3.5 h-3.5" /> Projects
                        </p>
                        <ul className="space-y-1">
                            {(user.projects || []).slice(0, 3).map((p, i) => (
                                <li key={i} className="text-sm text-gray-700">
                                    <span className="font-medium">{p.name}</span>
                                    {p.tech && <span className="text-xs text-gray-400 ml-1">({p.tech})</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Internships */}
                {(user?.internships || []).length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" /> Internships
                        </p>
                        <ul className="space-y-1">
                            {(user.internships || []).slice(0, 3).map((p, i) => (
                                <li key={i} className="text-sm text-gray-700">
                                    <span className="font-medium">{p.role}</span>
                                    {p.company && <span className="text-gray-500"> @ {p.company}</span>}
                                    {p.duration && <span className="text-xs text-gray-400 ml-1">· {p.duration}</span>}
                                </li>
                            ))}
                        </ul>
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
                {!user?.degree && !user?.bio && skills.length === 0 && (user?.projects || []).length === 0 && (
                    <div className="sm:col-span-2 text-center py-4">
                        <p className="text-sm text-gray-400">Your profile is empty. <button onClick={onEditProfile} className="text-blue-600 hover:underline">Fill in your details</button> to build your resume summary.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Profile Tab ─────────────────────────────────────────────────────────────
const ProfileTab = ({ user, login }) => {
    const buildForm = (u) => ({
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

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(() => buildForm(user));

    // Re-sync form when profile data loads from API
    useEffect(() => {
        if (!editing) setForm(buildForm(user));
    }, [user?.bio, user?.degree, user?.branch, user?.year, user?.cgpa, user?.skills, user?.projects, user?.internships, user?.achievements]);

    const addItem = (key, tpl) => setForm(f => ({ ...f, [key]: [...f[key], tpl] }));
    const removeItem = (key, i) => setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));
    const updateItem = (key, i, field, val) => setForm(f => { const arr = [...f[key]]; arr[i] = { ...arr[i], [field]: val }; return { ...f, [key]: arr }; });

    const handleSave = async () => {
        setSaving(true);
        const updated = { ...user, ...form };
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) console.error('Profile save failed:', data.message);
        } catch (e) { console.warn('Backend save failed:', e.message); }
        login(updated);
        setSaving(false);
        setEditing(false);
    };

    const skillsDisplay = Array.isArray(user?.skills) ? user.skills : (user?.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => { setEditing(false); setForm(buildForm(user)); }}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                                <X className="w-4 h-4" />Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { setForm(buildForm(user)); setEditing(true); }}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                            <Edit className="w-4 h-4" />Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-3">Bio</h3>
                {editing ? (
                    <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                        placeholder="Write a short bio about yourself..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300 resize-none" />
                ) : (
                    <p className="text-sm text-gray-600">{user?.bio || <span className="italic text-gray-400">No bio added yet.</span>}</p>
                )}
            </div>

            {/* Academics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-blue-700 flex items-center gap-2 mb-4"><GraduationCap className="w-5 h-5" />Academics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[['degree','Degree','B.E / B.Tech'],['year','Year','3rd Year'],['cgpa','CGPA','8.5']].map(([key, label, ph]) => (
                        <div key={key}>
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            {editing ? (
                                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                                    className="w-full border-b border-blue-300 outline-none bg-transparent text-sm pb-1" />
                            ) : (
                                <p className="text-sm text-gray-800">{user?.[key] || <span className="text-gray-400 italic">Not set</span>}</p>
                            )}
                        </div>
                    ))}
                    {/* Branch Dropdown */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Branch</p>
                        {editing ? (
                            <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                                className="w-full border-b border-blue-300 outline-none bg-transparent text-sm pb-1 cursor-pointer">
                                <option value="">Select Branch</option>
                                {['CSE','IT','MECH','CIVIL','ECE'].map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-gray-800">{user?.branch || <span className="text-gray-400 italic">Not set</span>}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2"><Code2 className="w-5 h-5" />Skills</h3>
                </div>
                {editing ? (
                    <div>
                        <p className="text-xs text-gray-400 mb-3">Select all that apply:</p>
                        <div className="flex flex-wrap gap-2">
                            {['Java','Spring Boot','React','Node.js','MongoDB','MySQL','HTML','CSS','JavaScript'].map(skill => {
                                const selected = form.skills.includes(skill);
                                return (
                                    <button key={skill} type="button"
                                        onClick={() => setForm(f => ({
                                            ...f,
                                            skills: selected
                                                ? f.skills.filter(s => s !== skill)
                                                : [...f.skills, skill]
                                        }))}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                                            selected
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:text-purple-600'
                                        }`}>
                                        {selected ? '✓ ' : ''}{skill}
                                    </button>
                                );
                            })}
                            {/* Custom skills (not in predefined list) */}
                            {form.skills.filter(s => !['Java','Spring Boot','React','Node.js','MongoDB','MySQL','HTML','CSS','JavaScript'].includes(s)).map((s, i) => (
                                <span key={`custom-${i}`} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium border border-purple-600">
                                    ✓ {s}
                                    <button type="button" onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== s) }))}
                                        className="ml-1 hover:text-red-200 transition">×</button>
                                </span>
                            ))}
                        </div>
                        {/* Add custom skill */}
                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                placeholder="Add custom skill..."
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        const val = e.target.value.trim();
                                        if (!form.skills.includes(val)) setForm(f => ({ ...f, skills: [...f.skills, val] }));
                                        e.target.value = '';
                                        e.preventDefault();
                                    }
                                }}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-purple-400"
                            />
                            <button type="button"
                                onClick={e => {
                                    const input = e.currentTarget.previousSibling;
                                    const val = input.value.trim();
                                    if (val && !form.skills.includes(val)) {
                                        setForm(f => ({ ...f, skills: [...f.skills, val] }));
                                        input.value = '';
                                    }
                                }}
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition">
                                + Add
                            </button>
                        </div>
                        {form.skills.length > 0 && (
                            <p className="text-xs text-purple-600 mt-2">{form.skills.length} skill{form.skills.length > 1 ? 's' : ''} selected</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {skillsDisplay.length > 0 ? skillsDisplay.map((s, i) => <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{s}</span>)
                            : <p className="text-sm text-gray-400 italic">No skills added yet.</p>}
                    </div>
                )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2"><FolderGit2 className="w-5 h-5" />Projects</h3>
                    {editing && <button onClick={() => addItem('projects', { name: '', tech: '', description: '', link: '' })}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-2 py-1 hover:text-blue-800 transition"><Plus className="w-3 h-3" />Add</button>}
                </div>
                <div className="space-y-3">
                    {(editing ? form.projects : (user?.projects || [])).map((p, i) => editing ? (
                        <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 relative">
                            <button onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            <input value={p.name} onChange={e => updateItem('projects', i, 'name', e.target.value)} placeholder="Project name" className="w-full border-b border-green-300 outline-none bg-transparent text-sm font-semibold" />
                            <input value={p.tech} onChange={e => updateItem('projects', i, 'tech', e.target.value)} placeholder="Technologies" className="w-full border-b border-green-200 outline-none bg-transparent text-xs text-green-700" />
                            <textarea value={p.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full border border-green-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
                            <input value={p.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} placeholder="GitHub / Live link" className="w-full border-b border-green-200 outline-none bg-transparent text-xs text-blue-500" />
                        </div>
                    ) : (
                        <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="font-semibold text-gray-800">{p.name}</p>
                            {p.tech && <p className="text-xs text-green-600 mt-1">Tech: {p.tech}</p>}
                            {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                            {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">{p.link}</a>}
                        </div>
                    ))}
                    {!editing && (user?.projects || []).length === 0 && <p className="text-sm text-gray-400 italic">No projects added yet.</p>}
                </div>
            </div>

            {/* Internships */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-orange-600 flex items-center gap-2"><Building2 className="w-5 h-5" />Internships</h3>
                    {editing && <button onClick={() => addItem('internships', { company: '', role: '', duration: '', description: '' })}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-2 py-1 hover:text-blue-800 transition"><Plus className="w-3 h-3" />Add</button>}
                </div>
                <div className="space-y-3">
                    {(editing ? form.internships : (user?.internships || [])).map((p, i) => editing ? (
                        <div key={i} className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2 relative">
                            <button onClick={() => removeItem('internships', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-2 gap-2">
                                <input value={p.role} onChange={e => updateItem('internships', i, 'role', e.target.value)} placeholder="Role" className="border-b border-orange-300 outline-none bg-transparent text-sm font-semibold" />
                                <input value={p.company} onChange={e => updateItem('internships', i, 'company', e.target.value)} placeholder="Company" className="border-b border-orange-300 outline-none bg-transparent text-sm text-orange-600" />
                            </div>
                            <input value={p.duration} onChange={e => updateItem('internships', i, 'duration', e.target.value)} placeholder="Duration (e.g. Jun–Aug 2024)" className="w-full border-b border-orange-200 outline-none bg-transparent text-xs text-gray-500" />
                            <textarea value={p.description} onChange={e => updateItem('internships', i, 'description', e.target.value)} placeholder="What you worked on..." rows={2} className="w-full border border-orange-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
                        </div>
                    ) : (
                        <div key={i} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                            <p className="font-semibold text-gray-800">{p.role} <span className="text-orange-600">@ {p.company}</span></p>
                            {p.duration && <p className="text-xs text-gray-500 mt-1">{p.duration}</p>}
                            {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                        </div>
                    ))}
                    {!editing && (user?.internships || []).length === 0 && <p className="text-sm text-gray-400 italic">No internships added yet.</p>}
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-yellow-600 flex items-center gap-2"><Star className="w-5 h-5" />Achievements</h3>
                    {editing && <button onClick={() => addItem('achievements', { title: '', description: '' })}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded-lg px-2 py-1 hover:text-blue-800 transition"><Plus className="w-3 h-3" />Add</button>}
                </div>
                <div className="space-y-3">
                    {(editing ? form.achievements : (user?.achievements || [])).map((p, i) => editing ? (
                        <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2 relative">
                            <button onClick={() => removeItem('achievements', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            <input value={p.title} onChange={e => updateItem('achievements', i, 'title', e.target.value)} placeholder="Achievement title" className="w-full border-b border-yellow-300 outline-none bg-transparent text-sm font-semibold" />
                            <textarea value={p.description} onChange={e => updateItem('achievements', i, 'description', e.target.value)} placeholder="Describe your achievement..." rows={2} className="w-full border border-yellow-200 rounded-lg px-2 py-1 outline-none bg-white text-sm resize-none" />
                        </div>
                    ) : (
                        <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                            <p className="font-semibold text-gray-800">🏆 {p.title}</p>
                            {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                        </div>
                    ))}
                    {!editing && (user?.achievements || []).length === 0 && <p className="text-sm text-gray-400 italic">No achievements added yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;