import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobCards from "./JobCards";
import { Bookmark, Briefcase, MapPin, Building2, User } from "lucide-react";

const LatestsJob = ({ searchTerm = "" }) => {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs/all')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAllJobs(d.jobs
            .filter(j => j.status === 'approved')
            .map(j => ({
              id: j.id,
              title: j.title,
              company: j.company,
              location: j.location,
              description: j.description,
              alumni: j.alumni_name || 'Alumni',
              type: 'Full-Time',
            })));
        }
      })
      .catch(() => {});
  }, []);
  const [showAll, setShowAll] = useState(false);

  // 🎨 CampusBridge Brand Colors (Dark Professional Blue)
  const primaryBlue = "bg-[#1E40AF]";
  const hoverBlue = "hover:bg-[#1D4ED8]";
  const textBlue = "text-[#1E3A8A]";
  const textDark = "text-[#111827]";

  const filteredJobs = allJobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    job.alumni.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const jobsToShow = showAll ? filteredJobs : filteredJobs.slice(0, 9);

  const handleApplyClick = (job) => navigate(`/apply/${job.id}`, { state: { job } });

  return (
    <section className="max-w-7xl mx-auto my-24 px-4 md:px-8 bg-gray-50/70 py-16">
      <h2 className={`text-5xl font-extrabold text-center mb-16 ${textDark} tracking-tight`}>
        Latest & <span className={textBlue}>Top Job Openings</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobsToShow.length > 0 ? (
          jobsToShow.map((job) => (
            <div
              key={job.id}
              onClick={() => handleApplyClick(job)}
              className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col cursor-pointer border border-gray-100"
            >
              {/* Job Type Tag and Bookmark */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest flex items-center gap-1 bg-blue-100/50 px-3 py-1 rounded">
                  <Briefcase className={`h-3 w-3 ${textBlue}`} /> {job.type}
                </div>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1 rounded-full text-gray-400 hover:${textBlue} transition`}
                >
                  <Bookmark className="h-6 w-6" />
                </button>
              </div>

              {/* Company Logo & Alumni */}
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className={`w-12 h-12 ${primaryBlue} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-grow">
                  <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{job.company}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-gray-400" /> Posted By: {job.alumni}
                  </p>
                </div>
              </div>

              <div className="flex-grow min-h-[50px] mb-4">
                <JobCards job={job} />
              </div>

              {/* LOCATION & CTA BUTTON */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <p className="text-base font-semibold text-gray-600 flex items-center gap-1">
                  <MapPin className={`h-4 w-4 ${textBlue}`} /> {job.location}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyClick(job);
                  }}
                  className={`px-5 py-2 rounded-lg ${primaryBlue} text-white font-semibold ${hoverBlue} transition-all duration-300 text-sm shadow-md shadow-blue-500/30`}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-xl py-10 border-t border-b border-gray-200">
            No jobs found matching “{searchTerm.trim()}”
          </p>
        )}
      </div>

      {filteredJobs.length > 9 && (
        <div className="mt-16 text-center">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className={`text-white ${primaryBlue} px-10 py-4 rounded-full font-semibold text-lg ${hoverBlue} transition-all duration-300 shadow-xl shadow-blue-500/40`}
            >
              View All Jobs ({filteredJobs.length})
            </button>
          ) : (
            <button
              onClick={() => setShowAll(false)}
              className="text-gray-700 border border-gray-300 bg-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-md"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default LatestsJob;
