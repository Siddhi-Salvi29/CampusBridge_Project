import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const primaryBlue = "bg-[#1E40AF]";
  const textBlue = "text-[#1E3A8A]";

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs/all')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const found = d.jobs.find(j => j.id === id || j._id === id);
          if (found) setJob(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-gray-400">Loading...</div>;
  if (!job) return <p className="text-center mt-10 text-gray-500">Job not found</p>;

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-lg shadow-2xl border border-gray-100">
      <button onClick={() => navigate(-1)} className={`mb-6 ${textBlue} font-semibold hover:underline flex items-center gap-1 transition`}>
        <ArrowLeft className="h-4 w-4" /> Back to Job Listings
      </button>

      <h1 className="text-3xl font-extrabold mb-3 text-gray-900">{job.title}</h1>
      <div className="border-b pb-3 mb-4">
        <p className="text-xl font-bold text-gray-700">{job.company}</p>
        <p className="text-lg text-gray-600 font-medium">{job.location}</p>
      </div>

      {job.description && <p className="mb-6 text-gray-700 leading-relaxed border-b pb-4">{job.description}</p>}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(`/apply/${job.id}`, { state: { job } })}
          className={`${primaryBlue} text-white py-3 px-8 rounded-lg hover:bg-[#1D4ED8] transition font-extrabold shadow-lg shadow-blue-500/40`}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobDetail;
