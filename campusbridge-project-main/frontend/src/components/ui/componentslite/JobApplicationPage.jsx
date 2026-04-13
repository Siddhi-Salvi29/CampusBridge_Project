import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Briefcase, MapPin, Building2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';

const JobApplicationPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { jobId } = useParams();

    const job = location.state?.job || null;

    const [form, setForm] = useState({
        fullName: user?.fullname || '',
        email: user?.email || '',
        phone: '',
        branch: user?.branch || '',
        cgpa: user?.cgpa || '',
        coverLetter: '',
    });
    const [resume, setResume] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate it's a MongoDB ObjectId (24 hex chars)
        if (!jobId || !/^[a-f\d]{24}$/i.test(jobId)) {
            setError('This job cannot be applied to — it may be from old static data. Please browse jobs from the Jobs page.');
            return;
        }

        if (!resume) { setError('Please upload your resume.'); return; }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('studentId', user?.id);
            formData.append('studentName', form.fullName);
            formData.append('studentEmail', form.email);
            formData.append('phone', form.phone);
            formData.append('branch', form.branch);
            formData.append('cgpa', form.cgpa);
            formData.append('coverLetter', form.coverLetter);
            formData.append('resume', resume);

            const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Submission failed.');
            }
        } catch {
            setError('Server error. Please try again.');
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                    <p className="text-gray-500 mb-6">Your application for <span className="font-semibold text-blue-600">{job?.title || 'this job'}</span> has been submitted successfully.</p>
                    <button onClick={() => navigate('/jobs')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                        Browse More Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
            <div className="max-w-2xl mx-auto px-4">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Jobs
                </button>

                {/* Job summary card */}
                {job && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 truncate">{job.title}</h2>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <MapPin className="w-3 h-3" /> {job.location}
                            </div>
                        </div>
                        <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {job.type || 'Full-Time'}
                        </span>
                    </div>
                )}

                {/* Application form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                        <Send className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Job Application Form</h3>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name *</label>
                                <input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email *</label>
                                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number *</label>
                                <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="10-digit number"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Branch *</label>
                                <select required value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white">
                                    <option value="">Select Branch</option>
                                    {['CSE','IT','MECH','CIVIL','ECE'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">CGPA</label>
                                <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
                                    placeholder="e.g. 8.5"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Cover Letter</label>
                            <textarea value={form.coverLetter} onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                                rows={4} placeholder="Tell us why you're a great fit for this role..."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Resume (PDF/DOC/DOCX) *</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 transition">
                                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])}
                                    className="hidden" id="resume-upload" />
                                <label htmlFor="resume-upload" className="cursor-pointer">
                                    {resume ? (
                                        <p className="text-sm text-green-600 font-medium">✓ {resume.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-500">Click to upload your resume</p>
                                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                            ) : (
                                <><Send className="w-4 h-4" /> Submit Application</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JobApplicationPage;
