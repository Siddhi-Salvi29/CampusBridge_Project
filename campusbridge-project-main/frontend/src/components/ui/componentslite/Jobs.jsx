// Jobs.jsx — fetches live jobs from API
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilterCards from "./FilterCards.jsx";
import JobCards from "./JobCards.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { SlidersHorizontal, Bookmark, Briefcase, MapPin, Building2, User } from "lucide-react";

const Jobs = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🌟 Theme Colors
    const primaryBlue = "bg-[#1E40AF]";
    const hoverBlue = "hover:bg-[#1D4ED8]";
    const textBlue = "text-[#1E3A8A]";
    const textDark = "text-[#111827]";

    // Filters
    const [selectedFilters, setSelectedFilters] = useState({
        location: "",
        industry: "",
        experience: "",
        salary: "",
    });
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:5000/api/jobs/all')
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    // Only show approved jobs to students
                    const approved = d.jobs.filter(j => j.status === 'approved');
                    setAllJobs(approved.map(j => ({
                        id: j.id,
                        title: j.title,
                        company: j.company,
                        location: j.location,
                        description: j.description,
                        type: 'Full-Time',
                        alumni: j.alumni_name || 'Alumni',
                        status: j.status,
                    })));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filteredJobs = allJobs.filter((job) => {
        const locationMatch = selectedFilters.location ? job.location === selectedFilters.location : true;
        const industryMatch = selectedFilters.industry ? job.industry === selectedFilters.industry : true;
        const experienceMatch = selectedFilters.experience ? job.experience === selectedFilters.experience : true;
        const salaryMatch = selectedFilters.salary ? job.salary === selectedFilters.salary : true;
        return locationMatch && industryMatch && experienceMatch && salaryMatch;
    });

    const totalJobs = filteredJobs.length;

    const handleApplyClick = (job) => {
        navigate(`/apply/${job.id}`, { state: { job } });
    };

    return (
        <div className="max-w-7xl mx-auto my-8 px-4 md:px-8 py-8">
            {loading && (
                <div className="text-center py-20 text-gray-400">Loading jobs...</div>
            )}
            {!loading && (
            <>
            <div className="flex items-center justify-between mb-4 md:hidden">
                <h3 className="text-lg font-bold text-gray-700">
                    <span className={`font-extrabold ${textBlue}`}>{totalJobs}</span> job(s)
                </h3>
                <button onClick={() => setShowMobileFilter(v => !v)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${showMobileFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}>
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
            </div>

            <div className="flex gap-6">
                {/* Filter Sidebar */}
                <div className={`${showMobileFilter ? 'block' : 'hidden'} md:block w-full md:w-1/4 flex-shrink-0`}>
                    <div className="sticky top-20 bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <SlidersHorizontal className={`h-4 w-4 ${textBlue}`} /> Filters
                            </h2>
                            <button className={`text-sm ${textBlue} hover:underline`}
                                onClick={() => setSelectedFilters({ location: "", industry: "", experience: "", salary: "" })}>
                                Clear All
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto pr-1">
                            <FilterCards selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
                        </div>
                    </div>
                </div>

                {/* Job Cards */}
                <div className="flex-1 min-w-0">
                    <h3 className="hidden md:block text-xl font-bold text-gray-700 mb-5">
                        Showing <span className={`font-extrabold ${textBlue}`}>{totalJobs}</span> matching job(s)
                    </h3>

                    <div className="md:h-[80vh] md:overflow-y-auto pr-1 pb-5">
                        {filteredJobs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredJobs.map((job) => (
                                    <div key={job.id}
                                        className="relative bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.015] transition-all duration-300 p-5 flex flex-col cursor-pointer border border-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest flex items-center gap-1 bg-blue-100/60 px-3 py-1 rounded">
                                                <Briefcase className={`h-3.5 w-3.5 ${textBlue}`} /> {job.type}
                                            </div>
                                            <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-full text-gray-400 hover:text-blue-600 transition">
                                                <Bookmark className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                                            <div className={`w-10 h-10 ${primaryBlue} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-bold text-sm text-gray-900 truncate">{job.company}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                    <User className="h-3 w-3 text-gray-400 flex-shrink-0" /> {job.alumni}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-grow min-h-[40px] mb-3">
                                            <JobCards job={job} />
                                        </div>
                                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                <MapPin className={`h-3.5 w-3.5 ${textBlue}`} /> {job.location}
                                            </p>
                                            <button onClick={(e) => { e.stopPropagation(); handleApplyClick(job); }}
                                                className={`px-4 py-1.5 rounded-lg ${primaryBlue} text-white font-semibold ${hoverBlue} transition text-xs shadow-md`}>
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm">
                                <p className="text-base font-medium">No jobs found matching your criteria.</p>
                                <p className="text-sm mt-1">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

export default Jobs;
