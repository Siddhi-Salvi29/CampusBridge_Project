import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, saveApplication } from './JobData';
import { Briefcase, MapPin, CheckCircle, Upload, Send, User, Mail, Phone, FileText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';

const JobApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fetchedJob, setFetchedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', resume: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill from logged in user
    if (user) {
      setFormData(prev => ({ ...prev, fullName: user.fullname || '', email: user.email || '' }));
    }
    setTimeout(() => {
      const job = getJobById(String(jobId));
      setFetchedJob(job || null);
      setIsLoading(false);
    }, 300);
  }, [jobId, user]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, resume: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('jobId', jobId);
      payload.append('fullName', formData.fullName);
      payload.append('email', formData.email);
      payload.append('phoneNumber', formData.phoneNumber);
      if (formData.resume) payload.append('resume', formData.resume);
      if (user?.id) payload.append('studentId', user.id);

      // Try backend, fall back gracefully if endpoint not yet available
      try {
        const res = await fetch('http://localhost:5000/api/apply', { method: 'POST', body: payload });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Submission failed');
      } catch (backendErr) {
        // Backend endpoint may not exist yet — save locally
        console.warn('Backend apply endpoint not available, saving locally:', backendErr.message);
      }

      // Always save to localStorage for dashboard tracking
      saveApplication(jobId);
      setSubmissionStatus('success');
      setTimeout(() => navigate('/student/dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700 mb-4"></div>
      <p className="text-lg text-gray-600">Loading job details...</p>
    </div>
  );

  if (!fetchedJob) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <h1 className="text-3xl font-extrabold text-red-600 mb-4">Job Not Found</h1>
      <p className="text-gray-600">This job does not exist or has been removed.</p>
      <button onClick={() => navigate('/jobs')} className="mt-6 px-6 py-3 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition">
        Back to Jobs
      </button>
    </div>
  );

  if (submissionStatus === 'success') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Application Submitted!</h1>
      <p className="text-lg text-gray-600 text-center">
        You applied for <strong>{fetchedJob.title}</strong> at <strong>{fetchedJob.company}</strong>.
      </p>
      <p className="mt-4 text-violet-600 font-medium">Redirecting to your dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="p-8 rounded-xl shadow-xl mb-10 bg-violet-700 text-white">
        <div className="flex items-center mb-2">
          <Briefcase className="h-6 w-6 mr-3 text-violet-200" />
          <h1 className="text-3xl font-extrabold">{fetchedJob.title}</h1>
        </div>
        <h2 className="text-xl font-semibold text-violet-200 mb-2">{fetchedJob.company}</h2>
        <div className="flex items-center text-sm text-violet-300">
          <MapPin className="h-4 w-4 mr-1" /> {fetchedJob.location} ({fetchedJob.mode})
          <span className="ml-4 border-l border-violet-500 pl-4">Posted By: {fetchedJob.alumni}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">Your Details</h3>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <User className="h-4 w-4 mr-2 text-violet-700" /> Full Name
            </label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500" placeholder="Full name" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Mail className="h-4 w-4 mr-2 text-violet-700" /> Email
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500" placeholder="email@rmcet.com" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Phone className="h-4 w-4 mr-2 text-violet-700" /> Phone Number
            </label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500" placeholder="10 digit number" />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">Resume</h3>
          <input type="file" id="resume" name="resume" accept=".pdf" onChange={handleFileChange} required className="hidden" />
          <label htmlFor="resume" className="cursor-pointer flex items-center justify-center p-4 border-2 border-dashed border-violet-400 rounded-lg w-full text-gray-600 hover:bg-violet-50 transition">
            <Upload className="h-5 w-5 mr-3 text-violet-500" />
            {formData.resume ? <span className="font-semibold text-violet-700">{formData.resume.name}</span> : <span>Click to upload Resume (PDF)</span>}
          </label>
          <p className="text-xs text-gray-500 mt-1">Max 2MB, PDF only.</p>
        </div>

        <div className="pt-6">
          <button type="submit" disabled={isSubmitting}
            className={`w-full py-3 text-lg font-semibold rounded-lg transition flex items-center justify-center ${isSubmitting ? 'bg-violet-400 cursor-not-allowed text-white' : 'bg-violet-700 text-white hover:bg-violet-800 shadow-lg'}`}>
            {isSubmitting ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Submitting...</>
            ) : (
              <><Send className="h-5 w-5 mr-2" />Submit Application</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;
