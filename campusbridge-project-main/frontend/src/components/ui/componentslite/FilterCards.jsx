import React from "react";

const filterData = [
  {
    filterType: "Location",
    array: ["Delhi","Mumbai","Bengaluru","Kolkata","Chennai","Hyderabad","Pune","Jaipur","Ahmedabad","Lucknow","Chandigarh","Surat","Remote"]
  },
  {
    filterType: "Industry",
    array: ["IT","Finance","Marketing","Healthcare","Education","Manufacturing"]
  },
  {
    filterType: "Experience",
    array: ["0-3 years","3-5 years","5-7 years","7+ years"]
  },
  {
    filterType: "Salary",
    array: ["0-50k","50-100k","100-200k","200k+"]
  }
];

const FilterCards = ({ selectedFilters, setSelectedFilters }) => {
  return (
    <div className="w-full bg-white rounded-lg p-4 shadow">
      <h1 className="font-bold text-lg mb-2">Filter Jobs</h1>
      <hr className="mb-4" />
      {filterData.map((data) => (
        <div key={data.filterType} className="mb-4">
          <h2 className="font-semibold mb-2">{data.filterType}</h2>
          {data.array.map((item) => (
            <div key={item} className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                name={data.filterType}
                value={item}
                checked={selectedFilters[data.filterType.toLowerCase()] === item}
                onChange={() =>
                  setSelectedFilters({
                    ...selectedFilters,
                    [data.filterType.toLowerCase()]: item,
                  })
                }
              />
              <label>{item}</label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FilterCards;
