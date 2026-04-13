import React from "react";
// useNavigate import करा, कारण आता बटण क्लिक केल्यावर नेव्हिगेट करायचे आहे.
import { useNavigate } from "react-router-dom"; 
import { Button } from "../button";
import { Bookmark, MapPin, Briefcase, User, Building2 } from "lucide-react"; 
import JobCards from "./JobCards"; 
// 💡 तुम्ही जर JobData मधून data घेत असाल तर ते import करा
import { getJobData } from "./JobData.js"; 

const Job = () => {
    
    const jobData = getJobData(); // लोकल डेटा Load करा
    const navigate = useNavigate(); // useNavigate hook वापरा

    const primaryViolet = "bg-[#6A38C2]";
    const hoverViolet = "hover:bg-violet-700";
    const textViolet = "text-[#6A38C2]";
    
    // 'Apply Now' किंवा कार्ड क्लिक झाल्यावर नेव्हिगेट करण्यासाठी फंक्शन
    const handleApplyClick = (jobId) => {
        navigate(`/apply/${jobId}`); 
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobData.map((job) => (
                <div
                    key={job.id}
                    // ⭐ संपूर्ण कार्ड क्लिकेबल करा
                    onClick={() => handleApplyClick(job.id)}
                    className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col cursor-pointer"
                >
                    
                    {/* 🎧 TOP METADATA & BOOKMARK */}
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                        {/* Job Type Tag */}
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest flex items-center gap-1 bg-violet-50 px-3 py-1 rounded-full">
                            <Briefcase className={`h-3 w-3 ${textViolet}`} /> Full-time
                        </div>
                        {/* Bookmark Button */}
                        <button 
                            onClick={(e) => e.stopPropagation()} // ⭐ Stop propagation
                            className={`p-2 rounded-full text-gray-400 hover:${textViolet} transition`}
                            aria-label="Bookmark Job"
                        >
                            <Bookmark className="h-6 w-6" /> 
                        </button>
                    </div>

                    {/* 2. Company & Alumni Info */}
                    <div className="flex items-start gap-4 mb-4">
                        {/* Logo Placeholder */}
                        <div className={`w-12 h-12 ${primaryViolet} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="font-extrabold text-xl text-gray-900 leading-snug">{job.company}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <User className="h-4 w-4 text-gray-400" /> Posted By: {job.alumni}
                            </p>
                        </div>
                    </div>
                    
                    {/* 3. Job Details (from JobCards) */}
                    <div className="flex-grow min-h-[50px] mb-4">
                        <JobCards job={job} />
                    </div>

                    {/* 4. Location & Apply Now Button (Details button Removed) */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        {/* Location - Violet accent */}
                        <p className={`text-base font-semibold ${textViolet} flex items-center gap-1`}>
                            <MapPin className="h-4 w-4" /> {job.location}
                        </p>
                        
                        {/* Primary Button: Apply Now */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleApplyClick(job.id);
                            }}
                            className={`px-5 py-2 rounded-lg ${primaryViolet} text-white font-semibold ${hoverViolet} transition-all duration-300 text-sm shadow-md shadow-violet-500/30`}
                        >
                            Apply Now
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Job;