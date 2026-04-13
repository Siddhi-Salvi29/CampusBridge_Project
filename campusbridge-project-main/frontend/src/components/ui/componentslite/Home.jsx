import React, { useState } from "react";
import Header from "./Header";
import Categories from "./Categories";
import LatestsJob from "./LatestsJob";
import Footer from "./Footer";
import CompaniesSection from "./CompaniesSection";



const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-gray-50">
      {/* Pass searchTerm and setter to Header */}
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Categories />
      {/* Pass searchTerm to LatestsJob for filtering */}
      <LatestsJob searchTerm={searchTerm} />
      <Footer />
    </div>
  );
};

export default Home;
