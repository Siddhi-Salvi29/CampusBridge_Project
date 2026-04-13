import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const statusBadge = (status) => {
    if (status === 'selected') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Selected</span>;
    if (status === 'rejected') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Rejected</span>;
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />Pending</span>;
};

const ApplicationRow = ({ app, onSelect, onReject }) => {
    const [expanded, setExpanded] = useState(false);
    const [acting, setActing] = useState(false);

    const handleSelect = async () => {
        if (!window.confirm(`Select ${app.student_name} and send them a congratulations email?`)) return;
        setActing(true);
        try {
            const res = await fetch(`http://localhost:5000/api/applications/${app.id}/select`, { method: 'PUT' });
            const data = await res.json();
            if (res.ok && data.success) onSelect(app.id);
            else alert(data.message || 'Failed to select');
        } catch { alert('Server error'); }
        setActing(false);
    };

    const handleReject = async () => {
        if (!window.confirm(`Reject ${app.student_name}'s application?`)) return;
        setActing(true);
        try {
            const res = await fetch(`http://localhost:5000/api/applications/${app.id}/reject`, { method: 'PUT' });
            const data = await res.json();
            if (res.ok && data.success) onReject(app.id);
        } catch {}
        setActing(false);
    };

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition cursor-pointer"
                onClick={() => setExpanded(v => !v)}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-sm">{app.student_name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{app.student_name}</p>
                        <p className="text-xs text-gray-500 truncate">{app.student_email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {statusBadge(app.status)}
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div><p className="text-xs text-gray-400">Branch</p><p className="font-medium text-gray-700">{app.branch || '—'}</p></div>
                        <div><p className="text-xs text-gray-400">CGPA</p><p className="font-medium text-gray-700">{app.cgpa || '—'}</p></div>
                        <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium text-gray-700">{app.phone || '—'}</p></div>
                        <div><p className="text-xs text-gray-400">Applied</p><p className="font-medium text-gray-700">{new Date(app.applied_at).toLocaleDateString('en-IN')}</p></div>
                    </div>
                    {app.cover_letter && (
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Cover Letter</p>
                            <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">{app.cover_letter}</p>
                        </div>
                    )}
                    {app.resume_path && (
                        <a href={`http://localhost:5000${app.resume_path}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
                            <FileText className="w-3.5 h-3.5" /> View Resume <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                    {app.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                            <button onClick={handleSelect} disabled={acting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-60">
                                <CheckCircle className="w-3.5 h-3.5" /> Select & Email
                            </button>
                            <button onClick={handleReject} disabled={acting}
                                className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition disabled:opacity-60">
                                <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AlumniApplications = ({ jobs }) => {
    const [selectedJobId, setSelectedJobId] = useState('');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedJobId) return;
        setLoading(true);
        fetch(`http://localhost:5000/api/jobs/${selectedJobId}/applications`)
            .then(r => r.json())
            .then(d => { if (d.success) setApplications(d.applications); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [selectedJobId]);

    const handleSelect = (appId) => setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'selected' } : a));
    const handleReject = (appId) => setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));

    const pending = applications.filter(a => a.status === 'pending').length;
    const selected = applications.filter(a => a.status === 'selected').length;

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-gray-800">Job Applications</h2>
            </div>

            {/* Job selector */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Select a Job to View Applications</label>
                <select value={selectedJobId} onChange={e => { setSelectedJobId(e.target.value); setApplications([]); }}
                    className="w-full sm:w-80 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-300 bg-white">
                    <option value="">-- Choose a job --</option>
                    {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title} ({j.status})</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            {selectedJobId && applications.length > 0 && (
                <div className="flex gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
                        <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{pending}</p>
                        <p className="text-xs text-gray-400">Pending</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{selected}</p>
                        <p className="text-xs text-gray-400">Selected</p>
                    </div>
                </div>
            )}

            {/* Applications list */}
            {loading && <p className="text-sm text-gray-400 py-4">Loading applications...</p>}
            {!loading && selectedJobId && applications.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No applications yet for this job.</p>
                </div>
            )}
            {!loading && applications.length > 0 && (
                <div className="space-y-2">
                    {applications.map(app => (
                        <ApplicationRow key={app.id} app={app} onSelect={handleSelect} onReject={handleReject} />
                    ))}
                </div>
            )}
            {!selectedJobId && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-sm">Select a job above to see its applicants.</p>
                </div>
            )}
        </div>
    );
};

export default AlumniApplications;
