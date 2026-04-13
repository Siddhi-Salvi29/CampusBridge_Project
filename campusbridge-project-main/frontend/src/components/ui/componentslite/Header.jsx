import React from "react";
import { Button } from "../button";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import rmcetImg from "../../../assets/rmcet.png";

const Header = ({ searchTerm, setSearchTerm, onSearch }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch?.();
  };

  return (
    <div className="bg-white w-full overflow-hidden">

      {/* Text + Search section */}
      <div className="text-center pt-16 pb-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
            Find Your <span className="text-blue-600">Dream Job</span>
          </h1>
          <h2 className="mt-2 text-2xl md:text-4xl font-black text-gray-900">
            Shape Your Future With Our <span className="text-cyan-500">Alumni Network</span>
          </h2>
        </motion.div>

        <motion.p
          className="mt-5 text-base text-gray-500 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Start your journey towards career success — discover new roles, connect with alumni, and unlock your professional future.
        </motion.p>

        {/* Search bar */}
        <motion.div
          className="mt-8 flex items-center w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-full shadow-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center flex-1 px-5 py-3">
            <Search className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search job title, skills, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full ml-3 text-gray-700 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
          </div>
          <Button
            onClick={onSearch}
            className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-3 m-1 text-white font-semibold text-sm transition-all"
          >
            Search
          </Button>
        </motion.div>
      </div>

      {/* College image — full width, no gap, no overlay */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <img
          src={rmcetImg}
          alt="RMCET Campus"
          className="w-full object-cover object-center"
          style={{ maxHeight: '420px' }}
        />
      </motion.div>

    </div>
  );
};

export default Header;
