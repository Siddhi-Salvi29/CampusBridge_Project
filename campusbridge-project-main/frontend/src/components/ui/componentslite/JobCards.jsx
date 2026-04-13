import React from "react";

const JobCards = ({ job }) => {
    return (
        <div className="text-left">
            {/* Job Title: Bold and Primary Focus (तुमच्या कार्ड UI प्रमाणे) */}
            <h2 className="font-extrabold text-xl text-gray-900 leading-tight mb-2">
                {job.title}
            </h2>
            {/* Company Name (Thinner text) */}
            <p className="text-sm text-gray-600">{job.company}</p>
            {/* Location (Subtle text) */}
            <p className="text-sm text-gray-500 mt-1">{job.location}</p>
        </div>
    );
};

export default JobCards;