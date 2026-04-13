// CompaniesSection.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// companies array
const companies = [
  { name: "Google", logo: "/logo.jpg", link: "https://careers.google.com" },
  { name: "Microsoft", logo: "/OIP.jpg", link: "https://careers.microsoft.com" },
  { name: "TCS", logo: "/logos/tcs.png", link: "https://www.tcs.com/careers" },
  { name: "Infosys", logo: "/logos/infosys.png", link: "https://www.infosys.com/careers" },
  { name: "Amazon", logo: "/logos/amazon.png", link: "https://www.amazon.jobs" },
  { name: "IBM", logo: "/logos/ibm.png", link: "https://www.ibm.com/careers" },
  { name: "Capgemini", logo: "/logos/capgemini.png", link: "https://www.capgemini.com/careers" },
];

const CompaniesSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
          Our Partner Companies
        </h2>

        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
          {companies.map((company) => (
            <a
              key={company.name}
              href={company.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-4 bg-white shadow-md rounded-lg hover:shadow-xl transition transform hover:-translate-y-1 duration-300"
            >
              <img src={company.logo} alt={company.name} className="h-12 object-contain" />
            </a>
          ))}
        </div>

        <div className="md:hidden">
          <Swiper spaceBetween={20} slidesPerView={2} breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
          }}>
            {companies.map((company) => (
              <SwiperSlide key={company.name}>
                <a
                  href={company.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-4 bg-white shadow-md rounded-lg hover:shadow-xl transition transform hover:-translate-y-1 duration-300"
                >
                  <img src={company.logo} alt={company.name} className="h-12 object-contain" />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
