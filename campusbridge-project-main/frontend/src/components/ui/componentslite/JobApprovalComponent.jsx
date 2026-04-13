import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const statusBadge = (status) => {
  const s = status?.toLowerCase();
  if (s === 'approved') return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Approved</span>;
  if (s === 'rejected') return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Rejected</span>;
  return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
};

const PostJobForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const res = await fetch('http://localhost:5000/api/jobs/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, alumniId: user?.id, alumniName: user?.fullname || 'Admin' }),
      });
      const data = await res.json();
      if (res.ok) { setMsg({ type: 'success', text: 'Job posted!' }); setForm({ title: '', company: '', location: '', description: '' }); onSuccess(); }
      else setMsg({ type: 'error', text: data.message });
    } catch { setMsg({ type: 'error', text: 'Server error' }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 space-y-3">
      <h3 className="font-bold text-blue-800 text-lg">Post a New Job</h3>
      {msg && <p className={`text-sm font-medium ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
      <div className="grid grid-cols-2 gap-3">
        <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Job Title" className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company" className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
      </div>
      <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Job description..." rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
      <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
        {loading ? 'Posting...' : 'Post Job'}
      </button>
    </form>
  );
};

const JobApprovalComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs/all');
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/jobs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setJobs(prev => prev.map(j => (j.id === id || j._id === id) ? { ...j, status } : j));
    } catch { }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) setJobs(prev => prev.filter(j => j.id !== id));
    } catch {}
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${editJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setJobs(prev => prev.map(j => j.id === editJob.id ? { ...j, ...editForm } : j));
        setEditJob(null);
      }
    } catch {}
    setSaving(false);
  };

  const filtered = filter === 'all' ? jobs : jobs.filter(j => {
    const s = j.status?.toLowerCase();
    if (filter === 'pending') return s === 'pending' || s === 'pending admin approval';
    if (filter === 'approved') return s === 'approved';
    if (filter === 'rejected') return s === 'rejected';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Edit Modal */}
      {editJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-800">Edit Job</h3>
              <button onClick={() => setEditJob(null)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {[['title','Job Title'],['company','Company'],['location','Location']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveEdit} disabled={saving}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditJob(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Job Management</h2>
          <p className="text-sm text-gray-500">Approve, reject, or post jobs.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchJobs} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowPostForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Post Job
          </button>
        </div>
      </div>

      {/* Post form */}
      {showPostForm && <PostJobForm onSuccess={() => { setShowPostForm(false); fetchJobs(); }} />}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${filter === key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading jobs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No jobs found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(job => (
              <div key={job.id} className="p-5 flex items-start justify-between hover:bg-gray-50 transition gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{job.title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {job.company} · {job.location} · {job.alumni_name || 'Admin'} · {new Date(job.created_at).toLocaleDateString('en-IN')}
                  </p>
                  {job.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{job.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusBadge(job.status)}
                  {(job.status === 'Pending Admin Approval' || job.status?.toLowerCase() === 'pending') && (
                    <>
                      <button onClick={() => updateStatus(job.id, 'approved')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition" title="Approve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => updateStatus(job.id, 'rejected')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition" title="Reject">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button onClick={() => { setEditJob({ ...job }); setEditForm({ title: job.title, company: job.company, location: job.location, description: job.description || '' }); }}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApprovalComponent;
